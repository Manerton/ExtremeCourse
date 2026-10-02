import { useEffect, useState } from "react";
import { AccessLinks } from "../../types/links";
import { useAuth } from "../../Helpers/AuthContext";
import { Table } from "react-bootstrap";
import { GetTypeLinkAccess } from "../../../dictionary/linkAccess";
import { axiosSSOGetAccessLinks } from "../../../requests/SSORequests";

const LinkAccess: React.FC = () => {
    const { accessToken } = useAuth();
    const [accessLinks, setAccessLinks] = useState<AccessLinks[]>([]);

    const region = 30;

    const getAccessLinks = async () => {
        try {
            const data: AccessLinks[] = await axiosSSOGetAccessLinks(accessToken!, region);
            setAccessLinks(data);
        } catch (err) {
            console.log("Ошибка загрузки ссылок доступа");
        }
    };

    return (
        <div className="mt-3">
            <h2>Ссылки доступа для муниципалитетов и школ</h2>

            <button className="btn btn-primary mb-3" onClick={getAccessLinks}>
                Создать ссылки
            </button>

            <div className="table-responsive">
                <Table bordered hover size="sm" className="align-middle text-center table-striped">
                    <thead>
                        <tr>
                            <th style={{ width: "2%" }}>№</th>
                            <th style={{ width: "20%" }}>Название</th>
                            <th style={{ width: "13%" }}>Тип</th>
                            <th style={{ width: "65%" }}>Ссылка</th>
                        </tr>
                    </thead>

                    <tbody>
                        {accessLinks.map((accessLink, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{accessLink.name}</td>
                                <td>{GetTypeLinkAccess(accessLink.type)}</td>
                                <td
                                    style={{
                                        maxWidth: "300px",
                                        wordBreak: "break-all",
                                        whiteSpace: "normal",
                                        textAlign: "left",
                                    }}
                                >
                                    {accessLink.link}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default LinkAccess;
