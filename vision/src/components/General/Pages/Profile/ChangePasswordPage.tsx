import { useState } from "react";
import { useAuth } from "../../../Helpers/AuthContext";
import { axiosSSOChangePassword } from "../../../../requests/SSORequests";
import { ChangePasswordForm } from "../../../types/user";

const ChangePasswordBlock: React.FC = () => {
    const { accessToken, user } = useAuth();

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setMessage("Новый пароль и подтверждение не совпадают");
            return;
        }

        try {
            if (!accessToken || !user) return;

            const ChangePasswordForm: ChangePasswordForm = {
                user_id: user.id,
                old_password: form.oldPassword,
                new_password: form.newPassword
            };

            await axiosSSOChangePassword(accessToken, ChangePasswordForm);

            setMessage("Пароль успешно изменён");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error("Ошибка смены пароля:", err);
            setMessage("Ошибка смены пароля");
        }
    };

    return (
        <div className="mt-5">
            <h5>Изменить пароль</h5>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Старый пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        name="oldPassword"
                        value={form.oldPassword}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Новый пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Повторите новый пароль</label>
                    <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                        Сменить пароль
                    </button>
                </div>
                {message && (
                    <div className="col-12">
                        <div className="alert alert-info mt-2">{message}</div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ChangePasswordBlock;
