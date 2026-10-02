import axios from "axios";
import { APPLICATION } from "../config/api";
import type { ApplicationEvent, MainEvent } from "../components/types/event";
import { Application } from "../components/types/application";

export async function axiosGetApplicationEvents(token: string, userId: string) {
    const res = await axios.get(
        APPLICATION.getByUser + `${userId}`,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const result = res.data.data.data;
    console.log("Raw application events data:", result);

    // Преобразуем result → ApplicationEvent[]
    const wrapped: ApplicationEvent[] = result.map((event: any) => ({
        MainEvent: {
            id: event.id,
            name: event.name,
            profile: event.profile,
            dates: event.dates,
            start_date: event.start_date,
            end_date: event.end_date,
            previous_event_id: event.previous_event_id ?? null,
            subject: event.subject,
            class_number: event.class_number,
            additional_info: event.additional_info,
            event_type: event.event_type ?? "", // если поле есть в API
            events: null                       // пока вложенных событий нет
        },
        id: event.application_id,
        status: event.status ?? 0,
        class_participation: event.class_participation ?? 0
    }));

    return wrapped;
}


export async function axiosGetAllApplication(token: string, userId: string) {
    const res = await axios.get(
        APPLICATION.getALL,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const result = res.data.data.data;
    console.log("Raw application events data:", result);

    // Преобразуем result → ApplicationEvent[]
    const wrapped: ApplicationEvent[] = result.map((event: any) => ({
        MainEvent: {
            id: event.id,
            name: event.name,
            profile: event.profile,
            dates: event.dates,
            start_date: event.start_date,
            end_date: event.end_date,
            previous_event_id: event.previous_event_id ?? null,
            subject: event.subject,
            class_number: event.class_number,
            additional_info: event.additional_info,
            event_type: event.event_type ?? "", // если поле есть в API
            events: null                       // пока вложенных событий нет
        },
        id: event.application_id,
        status: event.status ?? 0,
        class_participation: event.class_participation ?? 0
    }));

    return wrapped;
}

export async function axiosCreateApplication(token: string, application: Application)
{
    const res = await axios.post(
        APPLICATION.create, application,
        {

            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }

    );
}

export async function axiosRevokeApplication(token: string, applicationId: string) 
{
    const res = await axios.delete(
        APPLICATION.delete + `${applicationId}`, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'  
            },
            withCredentials: true
        }
    )
    return res.data;
}

export async function axiosUpdateApplication(token: string, applicationId: string, status: string)
{
    const res = await axios.put(
        APPLICATION.update + `${applicationId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
    )
    return res.data;
}

export async function axiosGenerateCode(token: string, eventId: string) {
  const res = await axios.post(
    APPLICATION.generateCode + eventId,
    null, // body
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    }
  )
  return res.data
}