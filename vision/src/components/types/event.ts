export interface MyEvent {
    id?: string;
    name: string;

    dates: string[];
    profiles: string[];

    start_date: string;
    end_date: string;
    previous_event_id?: string;
    event_type: string;
    subject?: number;
    status: number;
    class_number?: number;
    additional_info?: string;
    events?: MyEvent[];
}

export interface MainEvent {
    id: string
    name: string

    dates: string[];
    profile: string;

    start_date: string
    end_date: string
    previous_event_id: string | null   // может быть null
    subject: number
    class_number: number
    additional_info: string
    event_type: string                 // есть в API
    events: MainEvent[] | null         // если внутри может быть список событий
}

export interface ApplicationEvent {
    MainEvent: MainEvent
    id: string
    status: number
    class_participation: number
}

export interface CreateEventDTORequest {
    name: string;

    start_date: string;
    end_date: string;

    dates: string[];
    profiles: string[];

    previous_event_id?: string;

    subject?: string;
    additional_info?: string;
    class_category?: string;
    event_type?: string;
}

export interface UpdateEventDTORequest {
    name?: string;
    start_date?: string;   // ISO string
    end_date?: string;     // ISO string

    dates?: string[];
    profiles?: string[];

    subject?: string;
    class_category?: string;
    additional_info?: string;
    status?: number;
}
