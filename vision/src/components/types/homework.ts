export interface HomeworkListItemDTO {
    id: string;
    event_id: string;
    name: string;
    status: number;
    publish_at: string;
    deadline_at: string;
}

// export interface TaskOptionDTO {
//     id: string;
//     answer?: string;
// }

export interface HomeworkTaskDTO {
    id: string;
    name: string;
    description: string;
    max_points: number;
    //options?: TaskOptionDTO[];
}

export interface HomeworkDetailDTO {
    id: string;
    event_id: string;
    name: string;
    status: number;
    publish_at: string;
    deadline_at: string;
    tasks: HomeworkTaskDTO[];
}

export interface SubmitAnswerItem {
    task_id: string;
    answer: string;
}

export interface SubmitHomeworkPayload {
    answers: SubmitAnswerItem[];
}

export interface TaskSubmissionResultDTO {
    task_id: string;
    user_answer: string;
    is_correct: boolean;
    points_awarded: number;
}

export interface UserSubmissionDTO {
    id: string;
    homework_id: string;
    user_id: string;
    total_score: number;
    submitted_at: string;
    results: TaskSubmissionResultDTO[];
}