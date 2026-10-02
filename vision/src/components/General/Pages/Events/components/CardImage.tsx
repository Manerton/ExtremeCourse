import { Card } from "react-bootstrap";
import { subjectsMap } from "../../../../../dictionary/subjectDictionary";


// Группы цветов
const colorGroups: Record<string, string[]> = {
  "#1197D6": [
    "Математика", "Физика", "Химия", "Информатика и ИКТ",
    "Биология", "География", "Астрономия"
  ],
  "#C657A5": [
    "Русский язык", "Английский", "Немецкий", "Китайский",
    "Французский", "Испанский", "Итальянский", "Литература",
    "Искусство (МХК)", "История", "Обществознание",
    "Право", "Экономика"
  ],
  "#8DCEA8": [
    "Физкультура", "ОБЖ", "Экология", "Технология"
  ]
};

// Определение цвета по названию предмета
function getSubjectColor(subjectName: string): string {
  for (const [color, names] of Object.entries(colorGroups)) {
    if (names.includes(subjectName)) return color;
  }
  return "#CCCCCC"; // fallback
}

interface CardImageProps {
  subjectId: number;
  width?: number;
  height?: number;
}

const CardImage: React.FC<CardImageProps> = ({
  subjectId,
  width = 300,
  height = 200
}) => {
  const subjectName = subjectsMap[subjectId] || "Предмет";
  const color = getSubjectColor(subjectName);

  const src = `https://placehold.co/${width}x${height}/${color.replace("#", "")}/fff?text=${encodeURIComponent(subjectName)}`;

  return <Card.Img variant="top" src={src} />;
};

export default CardImage;
