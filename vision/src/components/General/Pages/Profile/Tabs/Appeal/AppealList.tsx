import AppealCart from "./AppealCart";
import type { Appeal } from "../../../../../types/appeal";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../Helpers/AuthContext";
import { axiosGetAppealsByEventUser } from "../../../../../../requests/ResultRequests";
import { useParams } from "react-router-dom";

const AppealList: React.FC = () => {

    const [appeals, setAppeals] = useState<Appeal[]>([])

    const { accessToken, user } = useAuth()

    const { eventId } = useParams();

    useEffect(() => {
        async function fetchAppeal() {
            try {
                const result = await axiosGetAppealsByEventUser(accessToken!, eventId!, user?.id!);
                console.log("Events with APPEAL", result)
                setAppeals(result);
                console.log("Appeals",appeals)

            } catch (err) {
                console.error(err)
            } finally {
            }
        }

        fetchAppeal()
    }, [])

    return (
        <div>
            {appeals.map((appeal) => (
                <AppealCart key={appeal.TaskID} appeal={appeal} />
            ))}
        </div>
    )
}

export default AppealList