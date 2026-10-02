export interface Application {
    id: string;
    eventId: string;
    userId: string;
    schoolId: string;
    profile: string;
    class_participation: number;
}

export interface UpdateApplicationDTO {
    status: number;                // 2 = одобрено, 3 = отклонено, 1 = не обработано
    reason?: number;               // 1 по результатам предыдущего года, 2 по результатам текущего
    code?: string;                 // 09_11_25
    profile: string;               // профиль олимпиады
    class_participation: number;   // класс участия (category)
}
