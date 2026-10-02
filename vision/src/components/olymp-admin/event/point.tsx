import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { HOSTS } from '../../../config/api';
import { useAuth } from "../../Helpers/AuthContext";
interface Task {
    id: string;
    number: string;
    max_points: number;
}

interface TaskAttendance {
    id: string;
    points: string | null;
    task: Task;
}

interface Person {
    surname?: string;
    firstname?: string;
    patronymic?: string;
}

interface Application {
    code: string;
}

interface TableRow {
    person: Person;
    application: Application;
    taskAttendances: TaskAttendance[];
}

const EventPoint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [table, setTable] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const {accessToken} = useAuth()
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                HOSTS['OLYMP_ADMIN'] +`/api/event/point/${id}`,
                {
                    headers: {
                        Authorization: accessToken,
                    },
                    withCredentials: true,
                }
            );

            setTasks(response.data.tasks || []);
            setTable(response.data.table || []);
        } catch (error) {
            console.error("Error fetching event points:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePointsChange = async (
        taskAttendanceId: string,
        points: string,
        rowIndex: number,
        attendanceIndex: number
    ) => {
        // Обновляем локальное состояние
        const updatedTable = [...table];
        updatedTable[rowIndex].taskAttendances[attendanceIndex].points = points;
        setTable(updatedTable);

        // Отправляем на сервер
        const cleanedPoints = points.replace(/[^0-9]/g, "");
        try {
            await axios.post(
                HOSTS['OLYMP_ADMIN'] + "/api/event/change-score",
                {
                    task_attendance_id: taskAttendanceId,
                    points: cleanedPoints,
                },
                {
                    headers: {
                        Authorization: accessToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error("Error updating points:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-4">Загрузка...</div>;
    }

    return (
        <div className="container mt-4">
            <button
                className="btn btn-sm btn-primary mb-3"
                onClick={() => navigate(`/olymp-admin/event/show/${id}`)}
            >
                Перейти в карточку олимпиады
            </button>

            <h1>Выставление баллов</h1>

            <table className="table table-bordered table-striped mt-3">
                <thead>
                    <tr>
                        <th>ФИО участника</th>
                        <th>Код участника</th>
                        {tasks.map((task) => (
                            <th key={task.id}>{task.number}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{`${row.person.surname || ''} ${row.person.firstname || ''} ${row.person.patronymic || ''}`.trim()}</td>
                            <td>{row.application.code}</td>
                            {row.taskAttendances.map((ta, attendanceIndex) => (
                                <td key={ta.id}>
                                    <input
                                        type="text"
                                        value={ta.points || ""}
                                        onChange={(e) =>
                                            handlePointsChange(
                                                ta.id,
                                                e.target.value,
                                                rowIndex,
                                                attendanceIndex
                                            )
                                        }
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            target.value = target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            );
                                        }}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventPoint;