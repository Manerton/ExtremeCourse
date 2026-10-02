// components/RegionalStageList.tsx

import RegionalStageCard from "./RegionalStageCard";
import type { MyEvent } from "../../../../types/event";


interface Props {
  stages: MyEvent[];
  onStageClick?: (id: string) => void;
}

const RegionalStageList: React.FC<Props> = ({ stages, onStageClick }) => {
  return (
    <>
      {stages.map((stage) => (
        <RegionalStageCard
          key={stage.id}
          stage={stage}
          onClick={onStageClick}
        />
      ))}
    </>
  );
};

export default RegionalStageList;
