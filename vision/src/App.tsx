import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserIndex from './components/olymp-admin/user/index';
import UserShow from './components/olymp-admin/user/show';
import UserCreate from './components/olymp-admin/user/create';
import UserEdit from './components/olymp-admin/user/edit';
import ParticipantIndex from './components/olymp-admin/participant/index';
import ParticipantShow from './components/olymp-admin/participant/show';
import ParticipantCreate from './components/olymp-admin/participant/create';
import ParticipantEdit from './components/olymp-admin/participant/edit';
import SchoolIndex from './components/olymp-admin/school/index';
import SchoolCreate from './components/olymp-admin/school/create';
import SchoolShow from './components/olymp-admin/school/show';
import SchoolEdit from './components/olymp-admin/school/edit';
import ReportIndex from './components/olymp-admin/report/index';
import ApplicationIndex from './components/olymp-admin/application/index';
import ApplicationCreate from './components/olymp-admin/application/create';
import ApplicationShow from './components/olymp-admin/application/show';
import ApplicationEdit from './components/olymp-admin/application/edit';
import EventIndex from './components/olymp-admin/event/index';
import EventShow from './components/olymp-admin/event/show';
import EventAttendance from './components/olymp-admin/event/attendance';
import EventPrizeScore from './components/olymp-admin/event/prize-score'
import EventPoint from './components/olymp-admin/event/point'
import EventTask from './components/olymp-admin/event/task'
import Header from './components/General/Layouts/header'
import MainPage from './components/General/Pages/MainPage'
import AttendancePage from './components/General/Pages/AttendaceList'
import AdminPanel from './components/Admin/Pages/AdminPanel'
import Layout from './components/General/Layouts/Layout'
import AdminLayout from './components/General/Layouts/AdminLayout'
import AuthPage from './components/General/Pages/AuthForm'
import RegionalStagesPage from './components/General/Pages/Events/RegionalStages'
import OlympiadsPage from './components/General/Pages/Events/OlympiadsPage'
import RequireAuth from './components/Helpers/RequireAuth';
import ProfileLayout from './components/General/Layouts/Profile';
import AppealTab from './components/General/Pages/Profile/Tabs/Appeal/Appeal';
import ApplicationEventTab from './components/General/Pages/Profile/Tabs/ApplicationEvents';
import ResultByEvent from './components/General/Pages/Profile/Tabs/History/Result';
import AppealCreate from './components/General/Pages/Profile/Tabs/Appeal/AppealCreate';
import AppealView from './components/General/Pages/Profile/Tabs/Appeal/AppealView';
import EditProfile from './components/General/Pages/Profile/EditProfile';
import AppealList from './components/General/Pages/Profile/Tabs/Appeal/AppealList';
import HistoryTab from './components/General/Pages/Profile/Tabs/History/History';
import AchievementTab from './components/General/Pages/Profile/Tabs/Achievement';
import MailIndex from './components/olymp-admin/mail/index';
import OlympiadDetails from './components/General/Pages/Events/OlympiadDetails';
import { ToastContainer } from "react-toastify";
import { NotificationProvider } from "./components/General/Helpers/NotificationProvider";
import StagesListPage from './components/General/Pages/Events/StagesListPage';
import EditEventPage from './components/General/Pages/Events/EditEvent';
import { UserRole } from './dictionary/role';
import ProtectedRoute from './components/Helpers/ProtectionGuard';
import NotFoundPage from './components/General/Pages/ServicePages/NotFoundPage';
import ForbiddenPage from './components/General/Pages/ServicePages/ForbiddenPage';
import ForgotPasswordPage from './components/General/Helpers/RecoverPassword';
import ChangePasswordBlock from './components/General/Pages/Profile/ChangePasswordPage';
import JuryAssignPage from './components/General/Pages/Events/JuryAssignPage';
import SchoolConfirmPage from "./components/General/Pages/VerifyApplicationsPage";
import ParticipantDashboard from './components/General/PersonalAccount/PersonalAccountPage';
import RegisterPage from "./components/General/Pages/Register";
import VerifyApplicationsPage from "./components/General/Pages/VerifyApplicationsPage";
import LinkAcces from './components/Admin/Pages/LinkAccess';
import LinkAccess from './components/Admin/Pages/LinkAccess';
import RegisterLayout from './components/General/Layouts/RegisterLayout';
import OlympiadsAdminTable from './components/Admin/Pages/Olympiads';
import ApplicationsPage from "./components/Admin/Pages/ApplicationsAll";
import ApplicationsPageBySubject from './components/General/Pages/AppliedListBySubject';
import ApprovalApplicationsPageBySubject from './components/General/Pages/ApprovalApplicationBySubject';

function App() {
    return (

        <NotificationProvider>
            <Router>
                <div className="App">
                    <Routes>

                        <Route element={<Layout />}>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/PersonalAccount" element={<ParticipantDashboard />} />
                            <Route path="/verifyApplications" element={<VerifyApplicationsPage />} />
                            <Route path="/AllApplications" element={<ApplicationsPage />} />
                            <Route
                            path="/profile"
                            element={
                                <RequireAuth>
                                <ParticipantDashboard />
                                </RequireAuth>
                            }
                            />
                            <Route path="/RegionalStages" element={<RegionalStagesPage />} />
                            <Route path="/SchoolConfirmApplications" element={<SchoolConfirmPage />} />
                            <Route path="OlympiadsPage/:id" element={<OlympiadsPage />} />
                            <Route path="OlympiadDetails/:id" element={<OlympiadDetails />} />
                            <Route path="StagesList/:id" element={<StagesListPage />} />

                            <Route path="/EditEvent/:id" element={
                                <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Organizer]}>
                                    <EditEventPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/JuryAssignPage/:id" element={
                                <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Organizer]}>
                                    <JuryAssignPage />
                                </ProtectedRoute>
                            } />

                        </Route>

                        <Route element={<RegisterLayout />}>
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/recover-password" element={<ForgotPasswordPage/>}/>
                        </Route>

                        <Route
                            element={
                                <RequireAuth allowedRoles={[UserRole.Admin]}>
                                    <AdminLayout />
                                </RequireAuth>
                            }
                        >
                            <Route path="/link-access" element={<LinkAccess />}></Route>
                            <Route path="/list-olympiads" element={<OlympiadsAdminTable />}></Route>
                            <Route path="/applied-list" element={<ApplicationsPageBySubject />}></Route>
                            <Route path="/approval-applied-list" element={<ApprovalApplicationsPageBySubject />}></Route>

                            <Route path="/AdminPanel" element={<AdminPanel />} />
                            <Route path="/olymp-admin/user/index" element={<UserIndex />} />
                            <Route path="/olymp-admin/user/show/:id" element={<UserShow />} />
                            <Route path="/olymp-admin/user/create" element={<UserCreate />} />
                            <Route path="/olymp-admin/user/edit/:id" element={<UserEdit />} />
                            <Route path="/attendance" element={<AttendancePage />} />

                            <Route path="/olymp-admin/participant/index" element={<ParticipantIndex />} />
                            <Route path="/olymp-admin/participant/show/:id" element={<ParticipantShow />} />
                            <Route path="/olymp-admin/participant/create" element={<ParticipantCreate />} />
                            <Route path="/olymp-admin/participant/edit/:id" element={<ParticipantEdit />} />

                            <Route path="/olymp-admin/school/index" element={<SchoolIndex />} />
                            <Route path="/olymp-admin/school/show/:id" element={<SchoolShow />} />
                            <Route path="/olymp-admin/school/create" element={<SchoolCreate />} />
                            <Route path="/olymp-admin/school/edit/:id" element={<SchoolEdit />} />
                            <Route path="/olymp-admin/report/index" element={<ReportIndex />} />

                            <Route path="/olymp-admin/application/index" element={<ApplicationIndex />} />
                            <Route path="/olymp-admin/application/create" element={<ApplicationCreate />} />
                            <Route path="/olymp-admin/application/show/:id" element={<ApplicationShow />} />
                            <Route path="/olymp-admin/application/edit/:id" element={<ApplicationEdit />} />

                            <Route path="/olymp-admin/event/index" element={<EventIndex />} />
                            <Route path="/olymp-admin/event/show/:id" element={<EventShow />} />
                            <Route path="/olymp-admin/event/attendance/:id" element={<EventAttendance />} />
                            <Route path="/olymp-admin/event/prize-score/:id" element={<EventPrizeScore />} />
                            <Route path="/olymp-admin/event/task/:id" element={<EventTask />} />
                            <Route path="/olymp-admin/event/point/:id" element={<EventPoint />} />

                            <Route path="/olymp-admin/mail/index" element={<MailIndex />} />
                        </Route>
                        {/* 
                        <Route path="/profile" element={
                            <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Organizer, UserRole.Judge, UserRole.Participant]}>
                                <ProfileLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="history" />} />

                            <Route path="achievements" element={<AchievementTab />} />

                            <Route path="history" element={<HistoryTab />} />
                            <Route path="history/:eventId/result" element={<ResultByEvent />} />
                            <Route path="history/:eventId/appeal-create" element={<AppealCreate />} />

                            <Route path="applications" element={<ApplicationEventTab />} />



                            <Route path="appeals" element={<AppealTab />} />
                            <Route path="appeals/:appealId/appeal-view" element={<AppealView />} />
                            <Route path="appeals/:eventId/list" element={<AppealList />} />

                        </Route> */}

                        <Route element={<Layout />}>
                            {/* <Route path="/profile/edit" element={<EditProfile />} /> */}

                            <Route path="*" element={<NotFoundPage />} />
                            <Route path="/forbidden" element={<ForbiddenPage />} />
                            <Route path="/recover-password" element={<ForgotPasswordPage />} />
                        </Route>

                    </Routes>
                    <ToastContainer
                        position="bottom-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        pauseOnHover
                        draggable
                    />
                </div>
            </Router>
        </NotificationProvider>
    );
}
export default App;