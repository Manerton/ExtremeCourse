export const ApplicationStatus = {
  Pending: 1,     // Не обработано
  Approved: 2,    // Одобрено
  Rejected: 3,    // Отклонено
} as const;

 
export const getStatusLabel = (status: number) => {
    switch (status) {
        case ApplicationStatus.Approved:
            return { text: "Участвуете", className: "text-success" };
        case ApplicationStatus.Pending:
            return { text: "Заявка на рассмотрении", className: "text-warning" };
        case ApplicationStatus.Rejected:
            return { text: "Отклонено", className: "text-danger" };
        default:
            return { text: "Неизвестно", className: "text-muted" };
    }
};