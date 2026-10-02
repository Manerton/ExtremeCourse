// pages/RegionalStagesPage.tsx

import { useEffect, useState } from "react";
import {
    Container,
    Spinner,
    Alert,
    Button,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import RegionalStageList from "./components/RegionalStageList";

import { useAuth } from "../../../Helpers/AuthContext";

import {
    fetchRegionalStages,
} from "../../../../requests/EventsRequests";
import CreateEventModal from "./components/CreateEventModal";
import { UserRole } from "../../../../dictionary/role";


interface MyEvent {
    id?: string;
    name: string;
    start_date: string;
    end_date: string;
    previous_event_id?: string;
    event_type: string;
    subject?: number;
    class_number?: number;
    additional_info?: string;
    events?: MyEvent[];
}

const RegionalStagesPage: React.FC = () => {
    const [stages, setStages] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] =
        useState<string | null>(null);

    const [showModal, setShowModal] =
        useState(false);

    const navigate = useNavigate();

    const { accessToken, user } = useAuth();

    const loadStages = async () => {
    if (!accessToken) return;

    try {
        setLoading(true);

        const data = await fetchRegionalStages(accessToken);

        setStages(data);
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    if (!accessToken) return;

    loadStages();
  }, [accessToken]);

    const handleStageClick = (id: string) => {
        navigate(`/OlympiadsPage/${id}`);
    };

    const canCreate =
        user?.role === UserRole.Admin ||
        user?.role ===UserRole.Organizer;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2>Региональные этапы</h2>

                {canCreate && (
                    <Button
                        onClick={() =>
                            setShowModal(true)
                        }
                    >
                        Создать событие
                    </Button>
                )}
            </div>

            {loading && (
                <Spinner animation="border" />
            )}

            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <RegionalStageList
                    stages={stages}
                    onStageClick={handleStageClick}
                />
            )}

            {accessToken && (
                <CreateEventModal
                    show={showModal}
                    onHide={() =>
                        setShowModal(false)
                    }
                    token={accessToken}
                    onSuccess={loadStages}
                />
            )}
        </Container>
    );
};

export default RegionalStagesPage;