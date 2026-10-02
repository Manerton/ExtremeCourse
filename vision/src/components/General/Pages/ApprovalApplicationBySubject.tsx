import React, { useEffect, useState } from "react";
import { Table, Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";
import { APPLICATION, USER, SCHOOLS, API_CONFIG, AUTH } from "../../../config/api";
import { useAuth } from "../../Helpers/AuthContext";
import { subjectsMap } from "../../../dictionary/subjectDictionary";
import { axiosGetAllOlympiads } from "../../../requests/EventsRequests";
import { MyEvent } from "../../types/event";
import { axiosUpdateApplicationStatus } from "./VerifyApplicationsPage";
import { UpdateApplicationDTO } from "../../types/application";

// ===== Константы отображения =====
const CITIZENSHIP_TEXT: Record<number, string> = { 1: "РФ", 2: "Другое" };
const DISABILITY_TEXT: Record<number, string> = { 1: "Нет", 2: "Есть" };
const STATUS_TEXT: Record<number, string> = { 1: "Не обработано", 2: "Одобрено", 3: "Отклонено" };
const GENDER_TEXT: Record<number, string> = { 1: "М", 2: "Ж" };

// ===== Типы =====
interface RawApplication {
    id: string;
    userId: string;
    schoolId: string;
    eventId: string;
    profile: string;
    class_participation: number;
    status: number;
    code: string;
    submittedAt: string;
}

interface District {
    id: string;
    name: string;
    region: number;
}

interface AggregatedApplication {
    id: string;
    firstname: string;
    surname: string;
    patronymic: string;
    email: string;
    phone: string;
    birthdate: string;
    gender: string;
    classNumber: number;
    citizenship: string;
    disability: string;
    schoolName: string;
    districtName: string;
    olympiadName: string;
    profile?: string | null;
    category: number;
    status: number;
    code: string;
    submittedAt: string;
}

// ===== API helpers =====
async function axiosGetApplicationsByEvent(
    token: string,
    eventId: string
): Promise<RawApplication[]> {
    const res = await axios.get(APPLICATION.getByEvent + eventId, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return res.data.data as RawApplication[];
}
async function axiosGetUser(token: string, id: string) {
    const res = await axios.get(`${USER.infoParticipant}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return res.data.data;
}

async function axiosGetSchool(token: string, id: string) {
    const res = await axios.get(`${SCHOOLS.byId}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return res.data.data;
}

async function axiosGetEvent(token: string, id: string) {
    const res = await axios.get(`${API_CONFIG.EVENT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
    return res.data.data;
}

async function axiosGetAllDistricts(
    token: string,
    regionId: number = 30
): Promise<Map<string, string>> {
    try {
        const res = await axios.get(`${AUTH.district}/${regionId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
        });

        const districts: District[] = res.data.data;
        const districtMap = new Map<string, string>();

        districts.forEach(d => districtMap.set(d.id, d.name));
        return districtMap;
    } catch (error) {
        console.error("Ошибка при получении районов:", error);
        return new Map();
    }
}






// ===== Компонент =====
const ApprovalApplicationsPageBySubject: React.FC = () => {
    const { accessToken } = useAuth();
    const [data, setData] = useState<AggregatedApplication[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [olympiads, setOlympiads] = useState<MyEvent[]>([]);


    useEffect(() => {
        axiosGetAllOlympiads()
            .then((res) => {
                setOlympiads(res.data)

                const map: Record<string, number> = {}
                res.data.forEach((o: MyEvent) => {
                    map[o.id!] = o.status
                })
            })
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (app: AggregatedApplication, newStatus: number) => {

        setUpdatingStatus(app.id);
        setError(null);
        setSuccessMessage(null);

        try {
            // Подготовка данных для обновления
            const updateData: UpdateApplicationDTO = {
                status: newStatus,
                profile: app.profile || "",
                class_participation: app.category
                // reason и code опциональны, можно не передавать
            };

            // Вызов API для обновления статуса
            await axiosUpdateApplicationStatus(accessToken!, app.id, updateData);

            // Локально обновляем статус
            setData(prev =>
                prev.map(item =>
                    item.id === app.id ? { ...item, status: newStatus } : item
                )
            );

            // Показываем сообщение об успехе
            setSuccessMessage(`Статус заявки для ${app.surname} ${app.firstname} успешно изменен на "${STATUS_TEXT[newStatus]}"`);

            // Автоматически скрываем сообщение через 3 секунды
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err: any) {
            console.error("Ошибка при обновлении статуса:", err);
            setError(`Ошибка при обновлении статуса: ${err.response?.data?.message || err.message}`);
        } finally {
            setUpdatingStatus(null);
        }
    };


    const fetchData = async (eventId: string) => {
        if (!accessToken) {
            setError("Отсутствует токен авторизации");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setData([]);

            const districts = await axiosGetAllDistricts(accessToken);
            const raw = await axiosGetApplicationsByEvent(accessToken, eventId);

            const aggregated = await Promise.all(
                raw.map(async (app) => {
                    try {
                        const user = await axiosGetUser(accessToken, app.userId);
                        const school = await axiosGetSchool(accessToken, user.school_id);
                        const event = await axiosGetEvent(accessToken, app.eventId);

                        const districtName =
                            school.district_id && districts.has(school.district_id)
                                ? districts.get(school.district_id)!
                                : "Не указан";

                        const birthdate = user.birthdate
                            ? new Date(user.birthdate).toLocaleDateString("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })
                            : "—";

                        return {
                            id: app.id,
                            surname: user.surname,
                            firstname: user.firstname,
                            patronymic: user.patronymic,
                            email: user.email ?? "—",
                            phone: user.phone_number ?? "—",
                            birthdate: birthdate,
                            gender: GENDER_TEXT[user.gender] ?? user.gender,
                            classNumber: user.class_number,
                            citizenship: CITIZENSHIP_TEXT[user.citizenship],
                            disability: DISABILITY_TEXT[user.disability],
                            schoolName: school.full_name,
                            districtName,
                            olympiadName: event.name,
                            profile: app.profile,
                            category: app.class_participation,
                            status: app.status,
                            code: app.code,
                            submittedAt: app.submittedAt
                        };
                    } catch {
                        return null;
                    }
                })
            );

            setData(aggregated.filter(Boolean) as AggregatedApplication[]);
        } catch (e: any) {
            setError(e.response?.data?.message || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    };


    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const eventId = e.target.value;

        if (!eventId) {
            setSelectedEventId(null);
            setData([]);
            return;
        }

        setSelectedEventId(eventId);
        fetchData(eventId);
    };

    { loading && <div className="text-center p-4">Загрузка заявок…</div> }

    {
        !selectedEventId && !loading && (
            <Alert variant="info">
                Выберите олимпиаду, чтобы загрузить заявки
            </Alert>
        )
    }



    if (error) return <Alert variant="danger">{error}</Alert>;

    return (

        <div className="container py-4">
            <div className="mb-4">
                <label className="form-label fw-semibold">Олимпиада</label>
                <select
                    className="form-select"
                    value={selectedEventId ?? ""}
                    onChange={handleEventChange}
                >
                    <option value="">— Выберите олимпиаду —</option>
                    {olympiads.map(o => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
            </div>

            <h3 className="mb-3">Все заявки</h3>

            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Код</th>
                        <th>Фамилия</th>
                        <th>Имя</th>
                        <th>Отчество</th>
                        <th>Пол</th>
                        <th>Дата рождения</th>
                        <th>Email</th>
                        <th>Телефон</th>
                        <th>Школа</th>
                        <th>Муниципалитет</th>
                        <th>Олимпиада</th>
                        <th>Профиль</th>
                        <th>Класс обучения</th>
                        <th>Класс участия</th>
                        <th>Гражданство</th>
                        <th>ОВЗ</th>
                        <th>Статус</th>
                        <th>Дата подачи</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((a, i) => (
                        <tr key={a.id}>
                            <td>{i + 1}</td>
                            <td>{a.code}</td>
                            <td>{a.surname}</td>
                            <td>{a.firstname}</td>
                            <td>{a.patronymic}</td>
                            <td>{a.gender}</td>
                            <td>{a.birthdate}</td>
                            <td>{a.email}</td>
                            <td>{a.phone}</td>
                            <td>{a.schoolName}</td>
                            <td>{a.districtName}</td>
                            <td>{a.olympiadName}</td>
                            <td>{a.profile ?? "—"}</td>
                            <td className="text-center">
                                {/*класс*/}
                                {a.classNumber}
                            </td>
                            <td className="text-center">
                                {/*класс*/}
                                {a.category}
                            </td>
                            <td>{a.citizenship}</td>
                            <td>{a.disability}</td>
                            <td>
                                <Badge>{STATUS_TEXT[a.status]}</Badge>
                            </td>

                            <td>{new Date(a.submittedAt).toLocaleDateString()}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => updateStatus(a, 2)}
                                        disabled={updatingStatus === a.id || a.status === 2}
                                    >
                                        Одобрить
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => updateStatus(a, 3)}
                                        disabled={updatingStatus === a.id || a.status === 3}
                                    >
                                        Отклонить
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className="mt-3 text-muted small">
                Всего заявок: {data.length}
            </div>
        </div>
    );
};

export default ApprovalApplicationsPageBySubject;
