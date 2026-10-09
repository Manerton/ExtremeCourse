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

export interface UserDetailsDTO {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    birth_date: string;
    class: number;
}

export interface SchoolDetailsDTO {
    id: string;
    full_name: string;
    name: string;
    district_id: string;
    district_name?: string;
}

export interface EventDetailsDTO {
    id: string;
    name: string;
    subject: string;
    class: number;
    status: number;
}

export interface PortfolioResponseDTO {
    id: string;
    application_id: string;
    description: string;
    score: number;
    code_achievement: string[];
    file_path: string;
}

export interface FullApplicationDetailsDTO {
    id: string;
    status: number;
    class_participation: number;
    submitted_at: string;
    updated_at: string;
    user: UserDetailsDTO;
    school: SchoolDetailsDTO;
    event: EventDetailsDTO;
    portfolio?: PortfolioResponseDTO | null;
}