// TODO!! ПРОСТО ЗАГЛУШКА
const AchievementTab: React.FC = () => {

    interface Achievement {
        icon: string; // URL иконки
        title: string; // Название достижения
        description: string; // Краткое описание
    }

    const mockAchievements: Achievement[] = [
        {
            icon: "🏆",
            title: "Победитель Олимпиады",
            description: "1 место в олимпиаде по математике 2022",
        },
        {
            icon: "⏱️",
            title: "Активный жюри",
            description: "50+ часов проверки работ",
        },
        {
            icon: "🎖️",
            title: "Медаль за участие",
            description: "Участие в 5 олимпиадах",
        },
        {
            icon: "🎖️",
            title: "Медаль за участие",
            description: "Участие в 10 олимпиадах",
        },
    ];

    return (
        <div className="d-flex flex-wrap gap-3">
            {mockAchievements.map((ach, index) => (
                <div key={index} className="p-3 border rounded shadow-sm" style={{ width: "200px" }}>
                    <div className="text-center mb-2" style={{ fontSize: "2rem" }}>{ach.icon}</div>
                    <h5 className="text-center" style={{ fontSize: "1.1rem" }}>{ach.title}</h5>
                    <p className="text-muted text-center" style={{ fontSize: "0.9rem" }}>{ach.description}</p>
                </div>
            ))}
        </div>
    )
}

export default AchievementTab;