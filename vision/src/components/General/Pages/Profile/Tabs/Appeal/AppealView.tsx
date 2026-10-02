import AppealForm from "./AppealForm";
import { useEffect, useState } from "react";
import type { Task } from "../../../../../types/task";

type Props = {

}

const AppealView: React.FC<Props> = () => {

    useEffect(() => {
        async function fetchAppeal(userId: string) {
            try {
                const result = await fetch("");
                if (!result.ok)
                    throw new Error("Ошибка при загрузке олимпиад");
                // const data: ApplicationEvent[] = await result.json();
            } catch (err) {
                console.error(err)
            } finally {
            }
        }

        // fetchAppeal("")
    }, [])


    const [selectType, setSelectType] = useState<number | "">("");
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectTask, setSelectTask] = useState<number | "">("");
    const [taskScore, setTaskScore] = useState<number>(0)
    const [reasonAppeal, setReasonAppeal] = useState<string>("")

    return (
        <AppealForm selectTask={selectTask} 
            tasks={""}
            setSelectTask={setSelectTask} 
            selectType={selectType} 
            setSelectType={setSelectType}
            taskScore={taskScore}
            reasonAppeal={reasonAppeal}
            setReasonAppeal={setReasonAppeal}
        />
    )

   
}

export default AppealView