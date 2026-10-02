import axios from "axios";
import { API_CONFIG } from "../config/api";
import { CreateEventDTORequest, MyEvent, UpdateEventDTORequest } from "../components/types/event";


export async function fetchRegionalStages(token: string) {
  const res = await axios.get(API_CONFIG.REGIONAL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
  return res.data.data;
}

export async function fetchEvent(token: string, id: string): Promise<MyEvent> {
  const res = await axios.get(`${API_CONFIG.EVENT}/${id}`, {
    withCredentials: true,
     headers: {
                Authorization: `Bearer ${token}`,
            },
  });
  return res.data.data;
}

export async function fetchStagesCount(id: string) {
  const res = await axios.get(`${API_CONFIG.CHILD}/${id}`, {
    withCredentials: true,
  });
  return res.data.metadata;
}

export interface FetchOlympiadsParams {
  id: string;
  page: number;
  limit: number;
  order: string;
  search?: string;
  selectedDate?: Date | null;
}

export async function fetchOlympiads(token: string, {
  id,
  page,
  limit,
  order,
  search,
  selectedDate,
}: FetchOlympiadsParams) {
  let url = `${API_CONFIG.CHILD}/${id}?page=${page}&limit=${limit}&order=${order}`;

  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }

  if (selectedDate) {
    const dateStr = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
    url += `&date=${dateStr}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}` 
  };

  const res = await axios.get(url, {
    headers,
    withCredentials: true,

  });

  return res.data; // { data, metadata }
}

export async function fetchSimpleOlympiads(token: string) {
  let url = `${API_CONFIG.REGISTEREVENTS}`;
  const res = await axios.get(url, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}` // добавляем токен
    }
  });

  return res.data; // { data, metadata }

}

export async function axiosGetAllOlympiads() {
  let url = `${API_CONFIG.ALLEVENTS}`;
  const res = await axios.get(url, {
    withCredentials: true,
  });

  return res.data;
}

export async function fetchOlympiadAvailableClassEvents(token: string, id: string) {
  const res = await axios.get(`${API_CONFIG.AVAILABLE}/${id}`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}` // добавляем токен
    }
  });

  return res.data.data.data; // массив событий (с class_number)
}

export async function fetchOlympiadChild(token: string, id: string) {
  const res = await axios.get(`${API_CONFIG.CHILD}/${id}`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}` // добавляем токен
    }
  });

  return res.data.data; // массив событий (с class_number)
}

export async function fetchOlympiadStages(token: string, id: string) {
  const res = await axios.get(`${API_CONFIG.STAGES}/${id}`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}` // добавляем токен
    }
  });
  return res.data.data; // массив событий (с class_number)
}

export async function axiosUpdateEvent(token: string, event: MyEvent) {
  const res = await axios.put(
    `${API_CONFIG.EVENT}${event.id}`,
    event, {
    headers: {
      Authorization: `Bearer ${token}` // добавляем токен
    }
  })

}

export async function axiosStatusUpdate(token: string,
    eventId: string,
    payload: UpdateEventDTORequest
) {
    return axios.put(
        `${API_CONFIG.EVENT}${eventId}`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}

export async function axiosCreateEvent(token: string,
  payload: CreateEventDTORequest
) {
  return axios.post(
        `${API_CONFIG.EVENT}`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}
// requests/EventsRequests.ts

export async function axiosCreateEventFromExcel(
    token: string,
    file: File,
    year: number
) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year.toString());

    return axios.post(
        `${API_CONFIG.EXCELUPLOAD}`, // или другой эндпоинт
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            // Увеличиваем таймаут для больших файлов
            timeout: 30000, // 30 секунд
        }
    );
};