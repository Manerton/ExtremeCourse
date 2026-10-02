import axios from "axios";
import { API_CONFIG } from "../config/api";
import { JuryMember } from "../components/types/jury";


export async function fetchAllJury(token: string, roleId: string) {
  const res = await axios.get(`${API_CONFIG.USERSBYROLE}/${roleId}`, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // приводим к JuryMember
  return res.data.data.map((u: any) => ({
    user_id: u.id, // id пользователя
    name: `${u.surname} ${u.firstname} ${u.patronymic ?? ""}`.trim(),
  })) as JuryMember[];
}

export async function fetchJuryStage(token: string, id: string): Promise<JuryMember[]> {
  try {
    const res = await axios.get(`${API_CONFIG.JURYBYSTAGE}/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Возвращаем массив или пустой, если структура не та
    return res?.data?.data?.data ?? [];
  } catch (error) {
    console.error(`Error fetching jury for stage ${id}:`, error);
    throw error; // Или return [] для fallback
  }
}

// export async function CreateSingleJuryStage(token: string, id: string, eventid: string) {
//   const res = await axios.get(`${API_CONFIG.CREATEJURY}/${id}`, {
//     withCredentials: true,
//     headers: {
//       Authorization: `Bearer ${token}` // добавляем токен
//     }
//   });
// }

// export async function DeleteSingleJuryStage(token: string, id: string, eventid: string) {
//   const res = await axios.get(`${API_CONFIG.DELETEJURY}/${id}`, {
//     withCredentials: true,
//     headers: {
//       Authorization: `Bearer ${token}` // добавляем токен
//     }
//   });
// }

export async function CreateJuryStage(token: string, user_ids: string[], event_id: string) {
  try {
    const res = await axios.post(
      `${API_CONFIG.CREATEMANYJURY}`,
      { event_id, user_ids  }, // тело запроса
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`, // добавляем токен
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("CreateJuryStage error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Ошибка при создании связи жюри и этапа",
    };
  }
}

export async function DeleteJuryStage(
  token: string,
  user_ids: string[],
  event_id: string
) {
  try {
    const res = await axios.post(
      `${API_CONFIG.DELETEMANYJURY}`,
      { event_id, user_ids }, // тело запроса
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`, // заголовки
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("DeleteJuryStage error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Ошибка при удалении связи жюри и этапа",
    };
  }
}


