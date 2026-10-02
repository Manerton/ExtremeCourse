import { useEffect, useState } from "react";
import { useAuth } from "../../../Helpers/AuthContext";
import { useNavigate } from "react-router-dom";
import UserInfoBlock from "../../../Common/UserInfo";
import { axiosSSOUserInfo, axiosSSOUserParticipantInfo } from "../../../../requests/SSORequests";
import { UserRole } from "../../../../dictionary/role";
import type { Profile, User, UserParticipant } from "../../../types/user";
import formatDateForInput from "../../../Helpers/DateFormater";
import ChangePasswordBlock from "./ChangePasswordPage";

const EditProfile: React.FC = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!accessToken || !user) return;

        if (user.role === UserRole.Participant) {
          const data: UserParticipant = await axiosSSOUserParticipantInfo(accessToken, user.id);

          setProfile({
            surname: data.User.surname,
            firstname: data.User.firstname,
            patronymic: data.User.patronymic,
            phone_number: data.User.phone_number,
            birthdate: formatDateForInput(data.User.birthdate),
            gender: data.User.gender,
            school: data.school,
            classnumber: data.classnumber,
            email: data.User.email,
            citezenship: data.citezenship,
          });
        } else {
          const data: User = await axiosSSOUserInfo(accessToken, user.id);

          setProfile({
            surname: data.surname,
            firstname: data.firstname,
            patronymic: data.patronymic,
            phone_number: data.phone_number,
            birthdate: formatDateForInput(data.birthdate),
            gender: data.gender,
            school: "",
            classnumber: 0,
            email: data.email,
            citezenship: 0,
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      }
    };

    fetchUser();
  }, [accessToken, user]);

  const actions = (
    <button className="btn btn-secondary" onClick={() => navigate("/profile")}>
      Назад
    </button>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container">
        <UserInfoBlock email={user?.Email} actions={actions} firstname={profile?.firstname} surname={profile?.surname} patronymic={profile?.patronymic}/>

        {/* Карточки профиля */}
        <div className="row g-3 mt-3">
              <h5>Информация о вас</h5>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Фамилия</h6>
              <p className="fs-5 fw-semibold mb-0">{profile?.surname}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Имя</h6>
              <p className="fs-5 fw-semibold mb-0">{profile?.firstname}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Отчество</h6>
              <p className="fs-5 fw-semibold mb-0">{profile?.patronymic}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Телефон</h6>
              <p className="fs-5 fw-semibold mb-0">{profile?.phone_number}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Дата рождения</h6>
              <p className="fs-5 fw-semibold mb-0">{profile?.birthdate}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100 shadow-sm">
              <h6 className="text-muted">Пол</h6>
              <p className="fs-5 fw-semibold mb-0">
                {profile?.gender === 1 ? "Мужской" : profile?.gender === 2 ? "Женский" : ""}
              </p>
            </div>
          </div>

          {user?.role === UserRole.Participant && (
            <>
              <div className="col-md-6">
                <div className="card p-3 h-100 shadow-sm">
                  <h6 className="text-muted">Школа</h6>
                  <p className="fs-5 fw-semibold mb-0">{profile?.school}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card p-3 h-100 shadow-sm">
                  <h6 className="text-muted">Класс</h6>
                  <p className="fs-5 fw-semibold mb-0">{profile?.classnumber}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card p-3 h-100 shadow-sm">
                  <h6 className="text-muted">Гражданство</h6>
                  <p className="fs-5 fw-semibold mb-0">{profile?.citezenship}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Блок смены пароля */}
        <div className="mt-5">
          <ChangePasswordBlock />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
