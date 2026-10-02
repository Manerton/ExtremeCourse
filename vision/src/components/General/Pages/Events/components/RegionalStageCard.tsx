// components/RegionalStageCard.tsx
import { Card } from "react-bootstrap";
import type { MyEvent } from "../../../../types/event";

interface Props {
  stage: MyEvent;
  onClick?: (id: string) => void;
}

const RegionalStageCard: React.FC<Props> = ({ stage, onClick }) => {
  const startDate = new Date(stage.start_date).toLocaleDateString();
  const endDate = new Date(stage.end_date).toLocaleDateString();

  const handleClick = () => {
    if (onClick && stage.id) {
      onClick(stage.id);
    }
  };

  return (
    <Card
      className="mb-3 text-center p-3 bg-body text-body"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        transition: "transform 0.15s ease-in-out",
        background: "linear-gradient(135deg, var(--bs-body-bg), rgba(0,0,0,0.05))",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "12px"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >

      <Card.Body>
        <Card.Title className="mb-2 fs-4 fw-bold">{stage.name}</Card.Title>
        <Card.Text className="text-muted mb-2 fs-5">
          {startDate} - {endDate}
        </Card.Text>
        {stage.additional_info && (
          <Card.Text className="small text-secondary">
            {stage.additional_info}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default RegionalStageCard;
