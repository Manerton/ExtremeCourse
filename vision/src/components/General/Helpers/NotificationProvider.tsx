import { createContext, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useAuth} from "../../Helpers/AuthContext";

const WS_URL = "ws://localhost:8095";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        user
    } = useAuth();
    useEffect(() => {
        const socket = new WebSocket(WS_URL);
        socket.onopen = () => console.log("✅ WebSocket connected");
        socket.onmessage = (event) => {
            try {
                if(user != null){
                    const message = JSON.parse(event.data);
                    if(message.to == 'ALL') {
                        toast.info(message.data, { position: "bottom-right" });
                    }
                    else {
                        if(message.to == user.id){
                            toast.info(message.data, { position: "bottom-right" });
                        }
                    }
                }
            } catch (err) {
                console.error("Ошибка разбора WS сообщения", err);
            }
        };
        socket.onclose = () => console.log("❌ WebSocket closed");
        socket.onerror = (err) => console.log("⚠️ WebSocket error", err);

        return () => socket.close();
    }, [user]);

    return <>{children}</>;
};