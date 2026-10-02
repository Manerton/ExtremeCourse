export const EventStatus = {
    Register: 1,
    Approval: 2,
    Finished: 3 

}

export const GetEventStatusLabel = (num: number) => {
    switch(num) {
        case EventStatus.Register: 
            return "Приём заявок"
        case EventStatus.Approval:
            return "Проверка заявок"
        case EventStatus.Finished:
            return "Завершена"
        default:
            return "Другое"
    }
} 