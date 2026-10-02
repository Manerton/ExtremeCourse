import { useEffect, useState } from "react";
import { Collapse, Button, Card } from "react-bootstrap";

// Твои компоненты
import PersonalInfo from "./PersonalInfo";
import ApplicationEventPage from "./ApplicationEvent";
import OlympiadsSimpleTable from "./Olympiads";
import { eachWeekOfInterval } from "date-fns";
import { useAuth } from "../../Helpers/AuthContext";
import { Profile, User, UserParticipant } from "../../types/user";
import { UserRole } from "../../../dictionary/role";
import { axiosSSOUserInfo, axiosSSOUserParticipantInfo } from "../../../requests/SSORequests";
import formatDateForInput from "../../Helpers/DateFormater";
import { axiosGetApplicationEvents } from "../../../requests/ApplicationRequests";
import VideoInfoBlock from "../Pages/VideoInfoBlock";

const ParticipantDashboard: React.FC = () => {
    const { accessToken, user } = useAuth();
    const [appliedEventIds, setAppliedEventIds] = useState<string[]>([]);



    const [openInfo, setOpenInfo] = useState(false);
    const [openApps, setOpenApps] = useState(false);
    const [openOlympiads, setOpenOlympiads] = useState(false);

    const [reloadFlag, setReloadFlag] = useState(0);
    const [reloadInfo, setReloadInfo] = useState(0);
    const [profile, setProfile] = useState<Profile>();



    useEffect(() => {
        const fetchApplications = async () => {
            if (!accessToken || !user) return;

            const apps = await axiosGetApplicationEvents(accessToken, user.id);
            const ids = apps.map((a: any) => a.MainEvent.id);
            setAppliedEventIds(ids);
        };

        fetchApplications();
    }, [accessToken, user, reloadFlag]);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!accessToken || !user) return;

                if (user.role === UserRole.Participant) {
                    const data: UserParticipant = await axiosSSOUserParticipantInfo(accessToken, user.id);
                    console.log("data", data)

                    setProfile({
                        participant_id: data.participant_id,
                        user_id: data.User.id,
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
                        user_id: data.id,
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
                        participant_id: ""
                    });
                }
                console.log("profile", profile)
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
            }
        };

        fetchUser();
    }, [accessToken, user, reloadInfo]);


    const reloadAll = () => setReloadFlag((prev) => prev + 1);
    const onReloadInfo = () => setReloadInfo((prev) => prev + 1);


    return (
        <div className="container mt-4">
            <h2 className="mb-3">Личный кабинет участника</h2>

            <Card className="mb-3 shadow-sm">
                <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenInfo(!openInfo)}
                >
                    <h5 className="mb-0">Личная информация</h5>
                    <Button variant="link" className="p-0">
                        {openInfo ? "▲" : "▼"}
                    </Button>
                </Card.Header>

                <Collapse in={openInfo}>
                    <div>
                        <Card.Body>
                            <PersonalInfo profile={profile!} onReloadInfo={onReloadInfo} />
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>

            <Card className="mb-3 shadow-sm">
                <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenApps(!openApps)}
                >
                    <h5 className="mb-0">Мои заявки</h5>
                    <Button variant="link" className="p-0">
                        {openApps ? "▲" : "▼"}
                    </Button>
                </Card.Header>

                <Collapse in={openApps}>
                    <div>
                        <Card.Body>
                            <ApplicationEventPage onApplied={reloadAll} reloadFlag={reloadFlag} />
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>

            <Card className="mb-3 shadow-sm">
                <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenOlympiads(!openOlympiads)}
                >
                    <h5 className="mb-0">Подать новую заявку</h5>
                    <Button variant="link" className="p-0">
                        {openOlympiads ? "▲" : "▼"}
                    </Button>
                </Card.Header>

                <Collapse in={openOlympiads}>
                    <div>
                        <Card.Body>
                            <OlympiadsSimpleTable
                                user_class={profile?.classnumber!}
                                user_school_id={profile?.school ? profile?.school : ""}
                                onApplied={reloadAll}
                                reloadFlag={reloadFlag}
                                appliedEventIds={appliedEventIds}
                            />
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>

            <VideoInfoBlock />


        </div>
    );
};

export default ParticipantDashboard;
