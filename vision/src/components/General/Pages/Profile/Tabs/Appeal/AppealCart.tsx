import React from "react";
import type { Appeal } from "../../../../../types/appeal";
import { taskTypeLabels } from "../../../../../../dictionary/taskType";
import { StatusIcon } from "../../../../../Helpers/StatusBlock";

interface AppealCartProps {
    appeal: Appeal;
}


const AppealCart: React.FC<AppealCartProps> = ({ appeal }) => {
    return (
        <div className="card mb-3">
            <div className="row card-body">
                <div className="col-auto">
                    <h5 className="card-title">Аппеляция по задаче #{appeal.TaskID}</h5>
                    <p className="card-text">
                        <strong>Тип задачи:</strong> {taskTypeLabels[appeal.TaskType]}
                    </p>
                    <p className="card-text">
                        <strong>Статус заявки:</strong><StatusIcon status={appeal.Status} />
                    </p>
                </div>
                <div className="col">
                    <p className="card-text">
                        <strong>Причина:</strong> {appeal.Reason}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AppealCart;