import { createContext, useContext, useEffect, useState } from "react";
import type { RegisterForm, UserAuth } from "../types/user";
import axios from "axios";
import { AUTH } from "../../config/api";
import { jwtDecode } from "jwt-decode";
import { axiosSSOLogin, axiosSSOLogout, axiosSSORefresh, axiosSSORegister } from "../../requests/SSORequests";
import { useNavigate } from "react-router-dom";
interface JwtPayload {
    sub: string;
    email: string;
    role: number;
    // добавь свои поля
}

interface AuthContextType {
    user: UserAuth | null
    accessToken: string | null
    expires?: number
    initialized: boolean
    login: (email: string, password: string) => Promise<boolean>
    register: (data: RegisterForm) => Promise<void>
    logout: () => void
    refresh: () => Promise<UserAuth | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserAuth | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // флаг загрузки авторизации
    const [initialized, setInitialized] = useState(false);
    const [expires, setExpires] = useState<number | undefined>(undefined);


    const register = async (data: RegisterForm) => {
        try {
            await axiosSSORegister(data);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await axiosSSOLogin(email, password);
            setAccessToken(result.access_token);
            setExpires(Date.now() + result.expires_in * 1000);

            const decoded = jwtDecode<JwtPayload>(result.access_token);

            setUser({
                id: decoded.sub,
                Email: decoded.email,
                role: Number(decoded.role),
            });

            return true;   // успешный логин
        } catch (err) {
            console.error("Login failed:", err);
            setUser(null);
            return false;  // ошибка логина
        }
    };



    const logout = async () => {
        try {
            const token = accessToken; // берем текущий accessToken из состояния
            console.log(token)

            setAccessToken(null);
            setUser(null);
            await axiosSSOLogout(token!);
        }
        catch (err) {
            console.error("Logout failed:", err);
        }

    };

    const refresh = async (): Promise<UserAuth | null> => {
        try {

            const result = await axiosSSORefresh()
            setAccessToken(result.access_token);
            setExpires(Date.now() + result.expires_in * 1000)

            const decoded = jwtDecode<JwtPayload>(result.access_token);
            const newUser = { id: decoded.sub, Email: decoded.email, role: Number(decoded.role) };
            setUser(newUser);
            return newUser;
        } catch (err) {
            setUser(null);
            return null;
        } finally {
            setInitialized(true);
        }
    };

    useEffect(() => {
        if (!accessToken || !expires) return;

        const timeout = expires - Date.now() - 60_000; // обновляем за минуту до истечения

        if (timeout > 0) {
            const id = setTimeout(() => refresh(), timeout);
            return () => clearTimeout(id);
        }
    }, [accessToken, expires]);


    // при монтировании вызываем refresh
    useEffect(() => {
        refresh();
    }, []);

    // // пока идет проверка токена показываем "Загрузка..."
    // if (loading) {
    //     return <div>Загрузка...</div>;
    // }

    return (
        <AuthContext.Provider value={{ user, accessToken, login, register, logout, refresh, initialized }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider")
    return ctx
}