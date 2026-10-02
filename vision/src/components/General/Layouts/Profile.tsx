import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import { UserRole } from '../../../dictionary/role';
import { useAuth } from '../../Helpers/AuthContext';
import UserInfoBlock from '../../Common/UserInfo';
import { axiosSSOUserInfo } from '../../../requests/SSORequests';
import { Profile, User } from '../../types/user';
import formatDateForInput from '../../Helpers/DateFormater';

const ProfileLayout: React.FC = () => {

    const judgeLikeTabs = [
        { label: "История", path: "history" },
        { label: "Олимпиады", path: "applications" },
    ];

    const tabsByRole: Record<number, { label: string; path: string }[]> = {
        [UserRole.Participant]: [
            { label: "Достижения", path: "achievements" },
            { label: "Олимпиады", path: "applications" },
            { label: "История", path: "history" },
            { label: "Апелляции", path: "appeals" },
        ],
        [UserRole.Judge]: judgeLikeTabs,
        [UserRole.Admin]: judgeLikeTabs,
        [UserRole.Organizer]: judgeLikeTabs,
    };

    const { user, accessToken } = useAuth();

    const [profile, setProfile] = useState<Profile>();

    const role = user?.role;
    const tabs = role ? tabsByRole[role] : [];

    const navigate = useNavigate()



    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!accessToken || !user) return;

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
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
            }
        };

        fetchUser();
    }, [accessToken, user]);

    const actions = (
        <>
            <button className="btn btn-primary" onClick={() => navigate("/profile/edit")}>Подробнее</button>
        </>
    );

    return (
        <div>
            <Header />

            <div className="d-flex flex-column min-vh-100">
                <div className="container">
                    {/* Информация о пользователе */}
                    <UserInfoBlock email={user?.Email} actions={actions} firstname={profile?.firstname} surname={profile?.surname} patronymic={profile?.patronymic} />

                    {/* Навигационные вкладки */}
                    {user && tabs && (
                        <ul className="nav nav-tabs w-100">
                            {tabs.map((tab) => (
                                <li key={tab.path} className="nav-item flex-fill text-center">
                                    <NavLink
                                        to={tab.path}
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                    >
                                        {tab.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <div className="tab-content mt-3">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
