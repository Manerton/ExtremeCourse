import type React from "react";
import type { ApplicationEvent } from "../../../../../types/event";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../../Helpers/AuthContext";
import { useEffect, useState } from "react";
import { axiosResultGetByEventUser } from "../../../../../../requests/ResultRequests";
import { Result } from "../../../../../types/result";
import { tr } from "date-fns/locale";



const ResultByEvent: React.FC = () => {
    const { eventId } = useParams();
    const { accessToken, user } = useAuth();

    const [allTasks, setAllTasks] = useState<Result[]>([]);

    useEffect(() => {
        async function fetchResult() {
            try {
                if (!accessToken || !user || !eventId) return;

                const result = await axiosResultGetByEventUser(
                    accessToken, eventId, user.id
                )

                setAllTasks(result)
            } catch (err) {
                console.error("Ошибка загрузки результатов")
            }
        }

        fetchResult()
    }, [accessToken, user, eventId])


    return (
        <div>
            <div className="accordion">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="panelsStayOpen-headingOralPart">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOralPart" aria-expanded="true" aria-controls="panelsStayOpen-collapseOralPart">
                            Устная часть
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapseOralPart" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOralPart">
                        <div className="accordion-body">
                            <table className="table w-100">
                                <thead>
                                    <tr>
                                        <th scope="col" className="col-2">#</th>
                                        <th scope="col" className="col-6">Название</th>
                                        {/* <th scope="col" className="col-2">Макс. Балл</th> */}
                                        <th scope="col" className="col-2">Полученный Балл</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTasks.map((task) => (
                                        <tr>
                                            <td>{task.task_id}</td>
                                            <td>{task.task_number}</td>
                                            <td>{task.points}</td>
                                        </tr>
                                    ))}
                                    <tr className="table-warning">
                                        <td>Сумма</td>
                                        <td>Баллов</td>
                                        <td>{allTasks.reduce((acc, cur) => acc + cur.points, 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="panelsStayOpen-headingPracticalPart">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapsePracticalPart" aria-expanded="true" aria-controls="panelsStayOpen-collapsePracticalPart">
                            Практическая часть
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapsePracticalPart" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingPracticalPart">
                        <div className="accordion-body">

                        </div>
                    </div>
                </div>
                <div className="accordion-item">
                    <h2 className="accordion-header" id="panelsStayOpen-headingTesting">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTesting" aria-expanded="true" aria-controls="panelsStayOpen-collapseTesting">
                            Тестирование
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapseTesting" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingTesting">
                        <div className="accordion-body">

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ResultByEvent