import React, { useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";

// Интерфейс данных
interface Attendance {
  id: number;
  eventID: number;
  userID: number;
  role: "participant" | "jury";
  present: boolean;
  timestamp: string; // ISO строка для отображения времени отметки
}

// Mock данные
const mockAttendance: Attendance[] = [
  { id: 1, eventID: 101, userID: 1, role: "participant", present: false, timestamp: "" },
  { id: 2, eventID: 101, userID: 2, role: "participant", present: false, timestamp: "" },
  { id: 3, eventID: 101, userID: 3, role: "jury", present: false, timestamp: "" },
  { id: 4, eventID: 101, userID: 4, role: "jury", present: false, timestamp: "" },
];

const AttendancePage: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>(mockAttendance);

  // Обработчик для отметки присутствия
  const togglePresence = (id: number) => {
    setAttendanceList((prev) =>
      prev.map((record) =>
        record.id === id
          ? {
              ...record,
              present: !record.present,
              timestamp: !record.present ? new Date().toISOString() : "", // Устанавливаем или сбрасываем время
            }
          : record
      )
    );
  };

  // Обработчик для отправки данных
  const handleSubmit = () => {
    const updatedRecords = attendanceList.filter((record) => record.present);
    console.log("Обновленные данные для отправки:", updatedRecords);
    alert("Данные успешно отправлены (mock)");
  };

  return (
    <div className="container mt-4">
      {/* Заголовок */}
      <h1>Событие: Олимпиада по математике</h1>
      <p>Отметьте присутствующих участников и жюри.</p>

      {/* Таблица */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Имя (ID)</th>
            <th>Роль</th>
            <th>Присутствие</th>
            <th>Время отметки</th>
          </tr>
        </thead>
        <tbody>
          {attendanceList.map((record, index) => (
            <tr key={record.id}>
              <td>{index + 1}</td>
              <td>User {record.userID}</td> {/* Имя пользователя можно заменить реальными данными */}
              <td>
                <Badge bg={record.role === "jury" ? "success" : "primary"}>
                  {record.role === "jury" ? "Жюри" : "Участник"}
                </Badge>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={record.present}
                  onChange={() => togglePresence(record.id)}
                />
              </td>
              <td>{record.timestamp ? new Date(record.timestamp).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Кнопка отправки */}
      <Button variant="primary" onClick={handleSubmit}>
        Отправить
      </Button>
    </div>
  );
};

export default AttendancePage;
