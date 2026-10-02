import { taskTypes } from "../../../../../../dictionary/taskType";

type Task = {
    id: number;
    name: string;
};

type Props = {
    mode?: boolean;
    tasks: Task[] | "";
    selectType: number | "";
    setSelectType: (val: number | "") => void;
    selectTask: number | "";
    setSelectTask: (val: number | "") => void;
    taskScore: number;
    reasonAppeal: string;
    setReasonAppeal: (val: string) => void;
};

const AppealForm: React.FC<Props> = ({
    mode = false,
    tasks,
    selectType,
    setSelectType,
    selectTask,
    setSelectTask,
    taskScore,
    reasonAppeal,
    setReasonAppeal,
}) => {
    const isView = mode;

    return (
        <>
            {/* тип задания */}
            <div className="mb-2">
                <label className="form-label">Тип задания</label>
                <select
                    className="form-select"
                    id="taskType"
                    value={selectType}
                    onChange={(e) => {
                        if (!isView) {
                            setSelectType(Number(e.target.value));
                            setSelectTask("");
                        }
                    }}
                    disabled={isView}
                >
                    <option value="">Выберите тип</option>
                    {taskTypes.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* задание */}
            <div className="mb-2">
                <label className="form-label">Задание</label>

                {Array.isArray(tasks) ? (
                    // если массив → делаем select
                    <select
                        className="form-select"
                        id="task"
                        value={selectTask}
                        onChange={(e) => !isView && setSelectTask(Number(e.target.value))}
                        disabled={isView || !selectType}
                    >
                        <option value="">Выберите задание</option>
                        {tasks.map((task) => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    // если строка → показываем как readonly
                    <input
                        type="text"
                        className="form-control"
                        value={tasks}
                        readOnly
                    />
                )}
            </div>

            {/* набранный балл */}
            <div className="mb-2">
                <label className="form-label">Набранный балл</label>
                <input
                    type="text"
                    readOnly
                    value={taskScore}
                    className="form-control"
                />
            </div>

            {/* причина несогласия */}
            <div className="mb-2">
                <label className="form-label">Причина несогласия</label>
                <textarea
                    className="form-control"
                    value={reasonAppeal}
                    onChange={(e) => !isView && setReasonAppeal(e.target.value)}
                    readOnly={isView}
                ></textarea>
            </div>
        </>
    );
};

export default AppealForm;
