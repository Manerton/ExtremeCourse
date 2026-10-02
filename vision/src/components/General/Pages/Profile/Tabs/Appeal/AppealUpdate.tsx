import { taskTypes } from "../../../../../../dictionary/taskType"
import { useState } from "react"
import AppealForm from "./AppealForm"
import type { Task } from "../../../../../types/task"

type Props = {

}

const AppealUpdate: React.FC<Props> = () => {

    const handleSubmit = (e: React.FormEvent) => {

    }

    const [selectType, setSelectType] = useState<number | "">("");
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectTask, setSelectTask] = useState<number | "">("");
    const [taskScore, setTaskScore] = useState<number>(0)
    const [reasonAppeal, setReasonAppeal] = useState<string>("")

    return (
        <form onSubmit={handleSubmit} className="p-3">
            <AppealForm selectTask={selectTask} 
            tasks={""}
            setSelectTask={setSelectTask} 
            selectType={selectType} 
            setSelectType={setSelectType}
            taskScore={taskScore}
            reasonAppeal={reasonAppeal}
            setReasonAppeal={setReasonAppeal}
            />
            <button className="btn btn-primary" type="submit">Отправить</button>
        </form>
    )

}

export default AppealUpdate

