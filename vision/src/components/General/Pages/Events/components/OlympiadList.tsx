import { Row, Col } from 'react-bootstrap';
import OlympiadCard from './OlympiadCard';
import type  { MyEvent } from '../../../../types/event.ts'; 

const OlympiadList: React.FC<{ olympiads: MyEvent[]; onOlympiadClick?: (id: string) => void }> = ({ olympiads, onOlympiadClick }) => (
  <Row>
    {olympiads.map((olympiad) => (
      <Col md={4} key={olympiad.id} className="mb-4">
        <OlympiadCard olympiad={olympiad} onClick={onOlympiadClick} />
      </Col>
    ))}
  </Row>
);

export default OlympiadList;