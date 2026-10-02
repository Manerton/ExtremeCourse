import { useState } from "react";
import axios from "axios";
import { HOSTS } from "../../../config/api";

const MailIndex: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    // простая фронт-валидация
    const newErrors: { email?: string; message?: string } = {};
    if (!email) newErrors.email = "Email обязателен";
    if (!message) newErrors.message = "Сообщение обязательно";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post(
        HOSTS['OLYMP_NOTIFICATION'] + "/index.php?r=email%2Fsend-message",
        { email, message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setStatus("Сообщение успешно отправлено!");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("Ошибка при отправке сообщения.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h1 className="text-xl font-bold mb-4">Сервис отправки почты</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-medium">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="email"
            className="w-full border rounded-md p-2 mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <div className="text-red-600 text-sm">{errors.email}</div>
          )}
        </div>

        {/* Сообщение */}
        <div>
          <label htmlFor="message" className="block font-medium">
            Сообщение <span className="text-red-600">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full border rounded-md p-2 mt-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          {errors.message && (
            <div className="text-red-600 text-sm">{errors.message}</div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Отправить
        </button>
      </form>

      {status && (
        <div className="mt-4 text-center text-sm text-gray-700">{status}</div>
      )}
    </div>
  );
};

export default MailIndex;
