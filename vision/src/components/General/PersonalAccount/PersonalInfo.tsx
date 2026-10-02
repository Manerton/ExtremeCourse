import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Helpers/AuthContext";
import { Profile } from "../../types/user";
import { UserRole } from "../../../dictionary/role";

import ChangePasswordBlock from "../Pages/Profile/ChangePasswordPage";
import { GetCitizenshipLabel } from "../../../dictionary/citizenship";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    axiosSSOSchoolById,
    axiosSSOAllSchools,
    axiosSSOUpdateUser,
    axiosSSOUpdateParticipant
} from "../../../requests/SSORequests";
import { School } from "../../types/schools";

interface Props {
    profile: Profile
    onReloadInfo: () => void
}

const PersonalInfo: React.FC<Props> = ({ onReloadInfo, profile }) => {
    const { accessToken, user } = useAuth();
    const navigate = useNavigate();

    const [schoolName, setSchoolName] = useState<string>("");
    const [schools, setSchools] = useState<School[]>([]);

    // режим редактирования
    const [isEditing, setIsEditing] = useState(false);

    const [editData, setEditData] = useState({
        surname: "",
        firstname: "",
        patronymic: "",
        school: "",
        classnumber: 0,
    });

    useEffect(() => {
        if (!profile) return;
        setEditData({
            surname: profile.surname,
            firstname: profile.firstname,
            patronymic: profile.patronymic || "",
            school: profile.school,
            classnumber: profile.classnumber,
        });
    }, [profile]);


    // загрузка школы пользователя
    useEffect(() => {
        axiosSSOSchoolById(accessToken!, profile?.school).then((data) => {
            setSchoolName(data.name);
        });
    }, [profile?.school]);

    // загрузка списка школ
    useEffect(() => {
        axiosSSOAllSchools().then((data) => {
            setSchools(data);
        });
    }, []);

    const handleSave = async () => {
        const updatesUser: any = {};
        const updatesParticipant: any = {};

        // сравниваем поля с исходными
        if (editData.surname !== profile.surname ||
            editData.firstname !== profile.firstname ||
            editData.patronymic !== profile.patronymic) {
            updatesUser.surname = editData.surname;
            updatesUser.firstname = editData.firstname;
            updatesUser.patronymic = editData.patronymic;
        }

        if (editData.school !== profile.school ||
            editData.classnumber !== profile.classnumber) {
            updatesParticipant.school_id = editData.school;
            updatesParticipant.class_number = editData.classnumber;
        }

        try {
            // отправляем запросы по необходимости
            if (Object.keys(updatesUser).length > 0) {
                await axiosSSOUpdateUser(accessToken!, user!.id, updatesUser);
            }

            if (Object.keys(updatesParticipant).length > 0) {
                await axiosSSOUpdateParticipant(accessToken!, profile?.participant_id, updatesParticipant);
            }

            alert("Данные обновлены!");

            setIsEditing(false);
            onReloadInfo()
        } catch (err) {
            console.error("Ошибка обновления:", err);
            alert("Ошибка при сохранении");
        }
    };

    if (!profile) return <div>Загрузка...</div>;

    return (
        <div className="d-flex flex-column">
            <div className="container">
                <div className="d-flex justify-content-between mt-3">
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Редактировать
                        </button>
                    ) : (
                        <div>
                            <button className="btn btn-success me-2" onClick={handleSave}>
                                Сохранить
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        surname: profile.surname,
                                        firstname: profile.firstname,
                                        patronymic: profile.patronymic || "",
                                        school: profile.school,
                                        classnumber: profile.classnumber,
                                    });
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    )}
                </div>

                <div className="row g-3 mt-3">

                    {/* Фамилия */}
                    <div className="col-md-4">
                        <div className="card p-3 shadow-sm">
                            <h6 className="text-muted">Фамилия</h6>
                            {!isEditing ? (
                                <p className="fs-5 fw-semibold">{profile?.surname}</p>
                            ) : (
                                <input
                                    className="form-control"
                                    value={editData.surname}
                                    onChange={(e) => setEditData({ ...editData, surname: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    {/* Имя */}
                    <div className="col-md-4">
                        <div className="card p-3 shadow-sm">
                            <h6 className="text-muted">Имя</h6>
                            {!isEditing ? (
                                <p className="fs-5 fw-semibold">{profile?.firstname}</p>
                            ) : (
                                <input
                                    className="form-control"
                                    value={editData.firstname}
                                    onChange={(e) => setEditData({ ...editData, firstname: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    {/* Отчество */}
                    <div className="col-md-4">
                        <div className="card p-3 shadow-sm">
                            <h6 className="text-muted">Отчество</h6>
                            {!isEditing ? (
                                <p className="fs-5 fw-semibold">{profile?.patronymic}</p>
                            ) : (
                                <input
                                    className="form-control"
                                    value={editData.patronymic}
                                    onChange={(e) => setEditData({ ...editData, patronymic: e.target.value })}
                                />
                            )}
                        </div>
                    </div>
                    {/* Телефон */}
                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm">
                            <h6 className="text-muted">Телефон</h6>
                            <p className="fs-5 fw-semibold mb-0">{profile?.phone_number}</p>
                        </div>
                    </div>

                    {/* Дата рождения */}
                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm">
                            <h6 className="text-muted">Дата рождения</h6>
                            <p className="fs-5 fw-semibold mb-0">{profile?.birthdate}</p>
                        </div>
                    </div>

                    {/* Пол */}
                    <div className="col-md-4">
                        <div className="card p-3 h-100 shadow-sm">
                            <h6 className="text-muted">Пол</h6>
                            <p className="fs-5 fw-semibold mb-0">
                                {profile?.gender === 1 ? "Мужской" : profile?.gender === 2 ? "Женский" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Гражданство (только для участника) */}
                    {user?.role === UserRole.Participant && (
                        <div className="col-md-3">
                            <div className="card p-3 h-100 shadow-sm">
                                <h6 className="text-muted">Гражданство</h6>
                                <p className="fs-5 fw-semibold mb-0">
                                    {GetCitizenshipLabel(profile?.citezenship)}
                                </p>
                            </div>
                        </div>
                    )}


                    {/* ===== Блок участника ===== */}
                    {user?.role === UserRole.Participant && (
                        <>
                            {/* Школа */}
                            <div className="col-md-6">
                                <div className="card p-3 shadow-sm">
                                    <h6 className="text-muted">Школа</h6>

                                    {!isEditing ? (
                                        <p className="fs-5 fw-semibold">{schoolName}</p>
                                    ) : (
                                        <select
                                            className="form-select"
                                            value={editData.school}
                                            onChange={(e) =>
                                                setEditData({ ...editData, school: e.target.value })
                                            }
                                        >
                                            {schools.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Класс */}
                            <div className="col-md-3">
                                <div className="card p-3 shadow-sm">
                                    <h6 className="text-muted">Класс</h6>

                                    {!isEditing ? (
                                        <p className="fs-5 fw-semibold">{profile?.classnumber}</p>
                                    ) : (
                                        <input
                                            type="number"
                                            className="form-control"
                                            max={11}
                                            min={5}
                                            value={editData.classnumber}
                                            onChange={(e) => {
                                                let value = Number(e.target.value);

                                                if (value < 5) value = 5;
                                                if (value > 11) value = 11;

                                                setEditData({ ...editData, classnumber: value });
                                            }}
                                        />

                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-5">
                    <ChangePasswordBlock />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;
