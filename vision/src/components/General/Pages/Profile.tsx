import { useState } from "react";
import { Tabs, Tab, Table, Badge,Button } from "react-bootstrap";
//import { useRole } from "./RoleContext";

// Интерфейсы данных
interface UserInfo {
  fullName: string;
  age: number;
  phone: string;
  organization: string;
  class?: string; // Только для учеников
  position?: string; // Только для жюри
}

interface Achievement {
  icon: string; // URL иконки
  title: string; // Название достижения
  description: string; // Краткое описание
}

// Интерфейсы данных
interface Result {
    id: number;
    eventID: number;
    userID: number;
    score: number;
    maxScore: number;
    status: "approved" | "rejected" | "pending";
    timestamp: string;
  }

// Mock данные
const mockUserInfo: UserInfo = {
  fullName: "Иванов Иван Иванович",
  age: 16,
  phone: "88005253535",
  organization: "Школа № 123",
  class: "10-А",
};

interface JuryWork {
    id: number;
    eventID: number;
    juryID: number;
    tasksChecked: number;
    hoursSpent: number;
    timestamp: string;
  }
  
  const mockJuryWork: JuryWork[] = [
    { id: 1, eventID: 101, juryID: 1, tasksChecked: 10, hoursSpent: 3.5, timestamp: "2024-11-20T10:30:00Z" },
    { id: 2, eventID: 102, juryID: 1, tasksChecked: 7, hoursSpent: 2.0, timestamp: "2024-11-21T12:00:00Z" },
  ];

const mockResults: Result[] = [
    { id: 1, eventID: 101, userID: 1, score: 85, maxScore: 100, status: "approved", timestamp: "2024-11-20T10:30:00Z" },
    { id: 2, eventID: 102, userID: 1, score: 72, maxScore: 90, status: "pending", timestamp: "2024-11-21T12:00:00Z" },
  ];

const mockAchievements: Achievement[] = [
  {
    icon: "🏆",
    title: "Победитель Олимпиады",
    description: "1 место в олимпиаде по математике 2022",
  },
  {
    icon: "⏱️",
    title: "Активный жюри",
    description: "50+ часов проверки работ",
  },
  {
    icon: "🎖️",
    title: "Медаль за участие",
    description: "Участие в 5 олимпиадах",
  },
  {
    icon: "🎖️",
    title: "Медаль за участие",
    description: "Участие в 10 олимпиадах",
  },
];

const ProfilePage: React.FC = () => {
  const [key, setKey] = useState<string>("info");

  return (
    <div className="container mt-4" style={{ maxWidth: "800px", textAlign: "justify"  }}>
      <h1 className="text-center mb-4" style={{ fontWeight: 700, fontSize: "2.4rem", color: "#333" }}>
        Профиль
      </h1>

      <Tabs activeKey={key} onSelect={(k) => setKey(k || "info")} className="mb-3" justify>
        {/* Вкладка информации о пользователе */}
        <Tab eventKey="info" title="Информация">
          <div className="d-flex mb-4" style={{ textAlign: "left" }}>
            {/* Аватар */}
            <div className="me-4">
              <img
                src="/vite.svg"
                alt="Аватар пользователя"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
              />
            </div>

            {/* Информация о пользователе */}
            <div>
              <h3><strong>{mockUserInfo.fullName}</strong> </h3>
              <p><strong>Возраст:</strong> {mockUserInfo.age} лет</p>
              <p><strong>Телефон:</strong> {mockUserInfo.phone}</p>
              <p><strong>Организация:</strong> {mockUserInfo.organization}</p>
              {mockUserInfo.class && <p><strong>Класс:</strong> {mockUserInfo.class}</p>}
              {mockUserInfo.position && <p><strong>Должность:</strong> {mockUserInfo.position}</p>}
            </div>
          </div>
          <hr style={{opacity:"1", width:"100%"}}></hr>
           {/* Секция достижений */}
            <div>
                <h4 className="mt-4 mb-3" style={{ color: "#333", fontWeight: 600 }}>Достижения</h4>
                <div className="d-flex flex-wrap gap-3">
                {mockAchievements.map((ach, index) => (
                    <div key={index} className="p-3 border rounded shadow-sm" style={{ width: "200px" }}>
                    <div className="text-center mb-2" style={{ fontSize: "2rem" }}>{ach.icon}</div>
                    <h5 className="text-center" style={{ fontSize: "1.1rem" }}>{ach.title}</h5>
                    <p className="text-muted text-center" style={{ fontSize: "0.9rem" }}>{ach.description}</p>
                    </div>
                ))}
                </div>
            </div>
        </Tab>

        {/* Вкладка результатов */}
        <Tab eventKey="results" title="Результаты">
          <h5 className="text-center mb-3" style={{ color: "#535bf2", fontWeight: 600 }}>
            Краткие результаты
          </h5>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th>#</th>
                <th>Событие</th>
                <th>Баллы</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockResults.map((result, index) => (
                <tr key={result.id}>
                  <td>{index + 1}</td>
                  <td>Событие {result.eventID}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: result.score >= result.maxScore * 0.7 ? "#28a745" : "#dc3545" }}>
                      {result.score}
                    </span>{" "}
                    / {result.maxScore}
                  </td>
                  <td>{result.status === "approved" ? "Одобрено" : result.status === "rejected" ? "Отклонено" : "В ожидании"}</td>
                  <td>
                    <Button variant="info" size="sm">
                      Подробнее
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

         {/* Вкладка учёта работы жюри */}
        <Tab eventKey="juryWork" title="Работа жюри">
          <h5 className="text-center mb-3" style={{ color: "#535bf2", fontWeight: 600 }}>
            Учёт работы жюри
          </h5>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th>#</th>
                <th>Событие</th>
                <th>Проверенные задания</th>
                <th>Отработанные часы</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {mockJuryWork.map((work, index) => (
                <tr key={work.id}>
                  <td>{index + 1}</td>
                  <td>Событие {work.eventID}</td>
                  <td>{work.tasksChecked}</td>
                  <td>{work.hoursSpent.toFixed(1)} ч.</td>
                  <td>{new Date(work.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

     
    </div>
  );
};

export default ProfilePage;
