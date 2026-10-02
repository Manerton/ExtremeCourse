export interface Appeal {
    TaskType: number;
    TaskID: number;
    Reason: string;
    Status: number;
}

export interface CreateAppealRequest {
    user_id: string;
    task_id: number;
    reason: string;
}