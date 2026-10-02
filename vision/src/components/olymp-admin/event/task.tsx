import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { HOSTS } from '../../../config/api';
import { useAuth } from "../../Helpers/AuthContext";

interface Task {
    id: string;
    number: string;
    max_points: string;
    type: string;
}

interface Event {
    id: string;
    name: string;
}

interface NewTask {
    number: string;
    point: string;
    type: string;
}

interface TaskTypes {
    [key: string]: string;
}

const EventTask: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [taskTypes, setTaskTypes] = useState<TaskTypes>({});
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTasks, setNewTasks] = useState<NewTask[]>([
        { number: "", point: "", type: "" },
    ]);
    const [loading, setLoading] = useState<boolean>(true);

    const {accessToken} = useAuth()
  
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                HOSTS['OLYMP_ADMIN'] + `/api/event/task/${id}`,
                {
                    headers: { Authorization: accessToken },
                    withCredentials: true,
                }
            );
            setEvent(response.data.event);
            setTasks(response.data.tasks || []);
            setTaskTypes(response.data.types || {});
            // const typesResponse = await axios.get(
            //     HOSTS['OLYMP_ADMIN'] + `/api/event/task-types`,
            //     {
            //         headers: { Authorization: accessToken },
            //         withCredentials: true,
            //     }
            // );
            // setTaskTypes(typesResponse.data.types || {});
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddField = () => {
        setNewTasks([...newTasks, { number: "", point: "", type: Object.keys(taskTypes)[0] || "" }]);
    };

    const handleRemoveField = (index: number) => {
        if (newTasks.length > 1) {
            setNewTasks(newTasks.filter((_, i) => i !== index));
        }
    };

    const handleChange = (
        index: number,
        field: keyof NewTask,
        value: string
    ) => {
        const updatedTasks = [...newTasks];
        updatedTasks[index][field] = value.replace(/[^0-9]/g, "");
        setNewTasks(updatedTasks);
    };

    const handleTypeChange = (index: number, value: string) => {
        const updatedTasks = [...newTasks];
        updatedTasks[index].type = value;
        setNewTasks(updatedTasks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const requestData = {
                number: newTasks.map(task => task.number),
                point: newTasks.map(task => task.point),
                type: newTasks.map(task => task.type)
            };

            await axios.post(
                HOSTS['OLYMP_ADMIN'] + `/api/event/add-task/${id}`,
                requestData,
                {
                    headers: {
                        Authorization: accessToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            setNewTasks([{ number: "", point: "", type: Object.keys(taskTypes)[0] || "" }]);
            fetchTasks();
        } catch (error) {
            console.error("Error adding tasks:", error);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!window.confirm("Вы уверены, что хотите удалить этот элемент?")) {
            return;
        }
        try {
            await axios.delete(
                HOSTS['OLYMP_ADMIN'] + `/api/event/delete-task/${taskId}`,
                {
                    headers: { Authorization: accessToken },
                    withCredentials: true,
                }
            );
            fetchTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
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

            <h1>Список заданий</h1>

            {/* Форма добавления */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div id="dynamic-fields-wrapper">
                    {newTasks.map((task, index) => (
                        <div
                            className="row align-items-end mb-2 dynamic-field"
                            key={`new-task-${index}`}
                        >
                            <div className="col-md-4">
                                <label className="form-label">
                                    Номер задания
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={task.number}
                                    onChange={(e) =>
                                        handleChange(index, "number", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">
                                    Количество баллов
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={task.point}
                                    onChange={(e) =>
                                        handleChange(index, "point", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">
                                    Тип задания
                                </label>
                                <select
                                    className="form-select"
                                    value={task.type}
                                    onChange={(e) => handleTypeChange(index, e.target.value)}
                                    required
                                >
                                    {Object.entries(taskTypes).map(([key, value]) => (
                                        <option key={key} value={key}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveField(index)}
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    id="add-field"
                    className="btn btn-primary mb-3"
                    onClick={handleAddField}
                >
                    +
                </button>
                <br />
                <button type="submit" className="btn btn-success">
                    Сохранить
                </button>
            </form>

            {/* Таблица существующих заданий */}
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Номер задания</th>
                        <th>Максимальное количество баллов</th>
                        <th>Тип задания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, index) => (
                        <tr key={task.id}>
                            <td>{index + 1}</td>
                            <td>{task.number}</td>
                            <td>{task.max_points}</td>
                            <td>{taskTypes[task.type] || task.type}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(task.id)}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventTask;