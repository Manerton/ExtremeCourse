import axios from "axios";
import {
    HomeworkListItemDTO,
    HomeworkDetailDTO,
    SubmitHomeworkPayload
} from "../components/types/homework";
import { UserSubmissionDTO } from "../components/types/homework";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// 1. Получить список всех доступных тестов
export async function axiosGetHomeworks(token: string): Promise<HomeworkListItemDTO[]> {
    const res = await axios.get(`${API_URL}/homeworks`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });
    return res.data?.data ?? [];
}

// 2. Получить тест с заданиями по ID
export async function axiosGetHomeworkById(token: string, homeworkId: string): Promise<HomeworkDetailDTO> {
    const res = await axios.get(`${API_URL}/homeworks/${homeworkId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });
    return res.data?.data;
}

// 3. Отправить ответы на тест
export async function axiosSubmitHomework(
    token: string,
    homeworkId: string,
    userId: string,
    payload: SubmitHomeworkPayload
): Promise<any> {
    const res = await axios.post(
        `${API_URL}/homeworks/${homeworkId}/submit`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-ID": userId,
            },
            withCredentials: true,
        }
    );
    return res.data;
}

// 4. Получить результаты по ID
export async function axiosGetResultsById(
    token: string,
    homeworkId: string,
    userId: string
): Promise<UserSubmissionDTO | null> {
    try {
        const res = await axios.get(`${API_URL}/homeworks/${homeworkId}/my-submission`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-User-ID": userId,
            },
            withCredentials: true,
        });
        return res.data?.data ?? null;
    } catch {
        // Если пользователь ещё не сдавал работу (404/400 и т.д.), возвращаем null
        return null;
    }
}