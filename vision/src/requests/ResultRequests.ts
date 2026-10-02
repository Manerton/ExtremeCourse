import axios from "axios";
import { APPEAL, RESULT } from "../config/api";
import type { Appeal, CreateAppealRequest } from "../components/types/appeal";

export async function axiosGetHistoryEventsByUser(token: string, userId: string) {
    const res = await axios.get(
        RESULT.allEventsByUserId + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    const raw = res.data.data.data;

    return raw
}

export async function axiosResultGetByEventUser(token: string, eventId: string, userId: string) {
    const res = await axios.get(
        RESULT.allByEventIdUserId + `${eventId}/` + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data.data;
}

export async function axiosGetEventsWithAppealByUser(token: string, userId: string) {
    const res = await axios.get(
        RESULT.allEventsWithAppealByUserId + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data.data.data;
}

export async function axiosGetAppealsByEventUser(token: string, eventId: string, userId: string) {
     const res = await axios.get(
        APPEAL.getAppealsByEventUser + `${eventId}/` + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );

     const mapped: Appeal[] = res.data.data.map((item: any) => ({
        TaskID: item.task_id,
        TaskType: item.task.type,
        Reason: item.reason,
        Status: item.status,
      }));

    return mapped;
}

export async function axiosCreateAppeal(token: string, data: CreateAppealRequest) {
    const res = await axios.post(
        APPEAL.create,
        data,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data;

}

export async function axiosGetAppeal(token: string, appealId: string) {
    const res = await axios.get(
        APPEAL.get + `${appealId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}` // добавляем токен
            }
        }
    );
    return res.data.data;
}