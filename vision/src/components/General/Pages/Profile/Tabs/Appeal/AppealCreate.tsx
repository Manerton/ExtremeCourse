import type React from "react";
import { useEffect, useState } from "react";
import AppealForm from "./AppealForm";
import type { Task } from "../../../../../types/task";
import { useAuth } from "../../../../../Helpers/AuthContext";
import { axiosCreateAppeal, axiosResultGetByEventUser } from "../../../../../../requests/ResultRequests";
import { useParams } from "react-router-dom";
import type { Result } from "../../../../../types/result";
import type { CreateAppealRequest } from "../../../../../types/appeal";


const AppealCreate: React.FC = () => {

    const { accessToken, user } = useAuth();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const appealData: CreateAppealRequest = {
            reason: reasonAppeal,
            task_id: selectTask as number,
            user_id: user?.id as string,
        };

        try {
            console.log("Отправка апелляции с данными:", appealData);
            await axiosCreateAppeal(accessToken!, appealData);
            alert("Апелляция отправлена");

            // сброс формы
            setSelectType("");
            setSelectTask("");
            setTaskScore(0);
            setReasonAppeal("");
        } catch (err) {
            console.error("Ошибка отправки апелляции", err);
        } finally {
            console.log("Отправленные данные:", appealData);
        }
    };


    const [allTasks, setAllTasks] = useState<Result[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectType, setSelectType] = useState<number | "">("");
    const [selectTask, setSelectTask] = useState<number | "">("");
    const [taskScore, setTaskScore] = useState<number>(0);
    const [reasonAppeal, setReasonAppeal] = useState<string>("");

    const { eventId } = useParams();
    useEffect(() => {
        async function fetchResult() {
            try {
                const result = await axiosResultGetByEventUser(
                    accessToken!,
                    eventId!,
                    user?.id!
                );
                console.log("Ответ от сервера (result):", result);

                setAllTasks(result); // обновляем состояние
            } catch (err) {
                console.error("Ошибка загрузки задач", err);
            }
        }

        fetchResult();
    }, [accessToken, user, eventId]);

    // 👇 этот эффект сработает каждый раз, когда allTasks обновится
    useEffect(() => {
        if (allTasks.length > 0) {
            console.log("Обновлённое состояние allTasks:", allTasks);
        }
    }, [allTasks]);


    // когда выбран тип — фильтруем список заданий
    useEffect(() => {
        if (selectType !== "") {
            const filtered = allTasks
                .filter(t => t.type === selectType)
                .map(t => ({ id: t.task_id, name: `Задание ${t.task_number}` }));
            setTasks(filtered);
            setSelectTask(""); // сбрасываем выбранное задание
            setTaskScore(0);   // сбрасываем балл
        }
    }, [selectType, allTasks]);

    // когда выбрано задание — подставляем баллы
    useEffect(() => {
        if (selectTask !== "") {
            const found = allTasks.find(t => t.task_id === selectTask);
            if (found) setTaskScore(found.points);
        }
    }, [selectTask, allTasks]);

    return (
        <div>
            <form onSubmit={handleSubmit} className="p-3">
                <AppealForm
                    selectTask={selectTask}
                    tasks={tasks}
                    setSelectTask={setSelectTask}
                    selectType={selectType}
                    setSelectType={setSelectType}
                    taskScore={taskScore}
                    reasonAppeal={reasonAppeal}
                    setReasonAppeal={setReasonAppeal}
                />
                <button className="btn btn-primary" type="submit">
                    Отправить
                </button>
            </form>
        </div>
    );
};

export default AppealCreate;
