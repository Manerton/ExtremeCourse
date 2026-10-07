import axios from "axios";

export const Achievement = {
    SiriusParticipant: "SIRIUS_PARTICIPANT", // <-- Добавлено
    MaxwellWinner: "MAXWELL_WINNER",
    MaxwellPrizeWinner: "MAXWELL_PRIZE_WINNER",
    EulerWinner: "EULER_WINNER",
    EulerPrizeWinner: "EULER_PRIZE_WINNER",
    VsoshMunWinner: "VSOSH_MUN_WINNER",
    VsoshMunPrizeWinner: "VSOSH_MUN_PRIZE_WINNER",
    VsoshRegWinner: "VSOSH_REG_WINNER",
    VsoshRegPrizeWinner: "VSOSH_REG_PRIZE_WINNER",
    MinobrListWinner: "MINOBR_LIST_WINNER",
    MinobrListPrizeWinner: "MINOBR_LIST_PRIZE_WINNER",
    MathMunWinner: "MATH_MUN_WINNER",
    MathMunPrizeWinner: "MATH_MUN_PRIZE_WINNER",
    MathRegWinner: "MATH_REG_WINNER",
    MathRegPrizeWinner: "MATH_REG_PRIZE_WINNER",
} as const;

export type AchievementType = typeof Achievement[keyof typeof Achievement];

export const ACHIEVEMENT_SCORES: Record<AchievementType, number> = {
    [Achievement.SiriusParticipant]: 20, // <-- Добавлено (20 баллов)
    [Achievement.MaxwellWinner]: 20,
    [Achievement.MaxwellPrizeWinner]: 10,
    [Achievement.EulerWinner]: 20,
    [Achievement.EulerPrizeWinner]: 10,
    [Achievement.VsoshMunWinner]: 20,
    [Achievement.VsoshMunPrizeWinner]: 10,
    [Achievement.VsoshRegWinner]: 40,
    [Achievement.VsoshRegPrizeWinner]: 20,
    [Achievement.MinobrListWinner]: 40,
    [Achievement.MinobrListPrizeWinner]: 20,
    [Achievement.MathMunWinner]: 20,
    [Achievement.MathMunPrizeWinner]: 10,
    [Achievement.MathRegWinner]: 40,
    [Achievement.MathRegPrizeWinner]: 20,
};


export interface PortfolioData {
    id?: string;
    application_id: string;
    description: string;
    score?: number;
    code_achievement?: AchievementType[];
    achievements?: AchievementType[]; // для обратной совместимости
    file_path?: string;
    file_url?: string;
}

export type SubjectCode =
    | "MATHEMATICS"
    | "PHYSICS"
    | "BIOLOGY"
    | "ECONOMICS"
    | "CHEMISTRY"
    | "INFORMATICS";

export interface MinobrOlympiadItem {
    id: number;
    name: string;
    winnerCode: AchievementType;
    prizeCode: AchievementType;
    subjects: SubjectCode[];
}

export const MINOBR_OLYMPIADS: MinobrOlympiadItem[] = [
    { id: 1, name: '"Финатлон для старшеклассников"', winnerCode: "FINATLON_WINNER", prizeCode: "FINATLON_PRIZE_WINNER", subjects: ["ECONOMICS"] },
    { id: 2, name: '"Формула Единства" / "Третье тысячелетие"', winnerCode: "FORMULA_EDINSTVA_WINNER", prizeCode: "FORMULA_EDINSTVA_PRIZE_WINNER", subjects: ["MATHEMATICS"] },
    { id: 4, name: "Всероссийская академическая олимпиада имени В.И. Вернадского", winnerCode: "VERNADSKY_WINNER", prizeCode: "VERNADSKY_PRIZE_WINNER", subjects: ["ECONOMICS"] },
    { id: 5, name: 'Всероссийская междисциплинарная олимпиада "Национальная технологическая олимпиада" (НТО)', winnerCode: "NTO_WINNER", prizeCode: "NTO_PRIZE_WINNER", subjects: ["MATHEMATICS", "INFORMATICS", "CHEMISTRY", "BIOLOGY", "ECONOMICS"] },
    { id: 6, name: 'Всероссийская олимпиада по агрогенетике "Иннагрика"', winnerCode: "INNAGRIKA_WINNER", prizeCode: "INNAGRIKA_PRIZE_WINNER", subjects: ["BIOLOGY"] },
    { id: 7, name: "Всероссийская олимпиада по искусственному интеллекту (ВсОШ ИИ)", winnerCode: "VSOSH_AI_WINNER", prizeCode: "VSOSH_AI_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 8, name: 'Всероссийская олимпиада школьников "Высшая проба"', winnerCode: "VYSSHAYA_PROBA_WINNER", prizeCode: "VYSSHAYA_PROBA_PRIZE_WINNER", subjects: ["BIOLOGY", "INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY", "ECONOMICS"] },
    { id: 9, name: 'Всероссийская олимпиада школьников "Миссия выполнима. Твое призвание - финансист!"', winnerCode: "MISSIYA_VYPOLNIMA_WINNER", prizeCode: "MISSIYA_VYPOLNIMA_PRIZE_WINNER", subjects: ["ECONOMICS"] },
    { id: 11, name: "Всероссийская Сеченовская олимпиада школьников", winnerCode: "SECHENOV_WINNER", prizeCode: "SECHENOV_PRIZE_WINNER", subjects: ["BIOLOGY", "CHEMISTRY"] },
    { id: 14, name: "Всесибирская открытая олимпиада школьников", winnerCode: "VSESIBIRSKAYA_WINNER", prizeCode: "VSESIBIRSKAYA_PRIZE_WINNER", subjects: ["BIOLOGY", "INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 15, name: "Вузовско-академическая олимпиада по информатике", winnerCode: "VUZ_AKADEM_INFORMATIKA_WINNER", prizeCode: "VUZ_AKADEM_INFORMATIKA_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 17, name: "Городская открытая олимпиада школьников по физике", winnerCode: "GORODSKAYA_FIZIKA_WINNER", prizeCode: "GORODSKAYA_FIZIKA_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 18, name: "Инженерная олимпиада школьников", winnerCode: "INZHENERNAYA_WINNER", prizeCode: "INZHENERNAYA_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 19, name: "Интернет-олимпиада школьников по физике", winnerCode: "INTERNET_FIZIKA_WINNER", prizeCode: "INTERNET_FIZIKA_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 22, name: 'Международная олимпиада "Innopolis Open"', winnerCode: "INNOPOLIS_OPEN_WINNER", prizeCode: "INNOPOLIS_OPEN_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS"] },
    { id: 23, name: "Международная олимпиада по финансовой безопасности", winnerCode: "FIN_SAFETY_WINNER", prizeCode: "FIN_SAFETY_PRIZE_WINNER", subjects: ["INFORMATICS", "ECONOMICS"] },
    { id: 26, name: 'Международная олимпиада УрФУ "Изумруд"', winnerCode: "IZUMRUD_WINNER", prizeCode: "IZUMRUD_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 29, name: 'Межрегиональная олимпиада "Будущие исследователи - будущее науки" (БИБН)', winnerCode: "BIBN_WINNER", prizeCode: "BIBN_PRIZE_WINNER", subjects: ["BIOLOGY", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 31, name: "Межрегиональная олимпиада школьников имени И.Я. Верченко", winnerCode: "VERCHENKO_WINNER", prizeCode: "VERCHENKO_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS"] },
    { id: 32, name: "Межрегиональная олимпиада школьников на базе ведомственных образовательных организаций", winnerCode: "VEDOMSTVENNYE_WINNER", prizeCode: "VEDOMSTVENNYE_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 33, name: "Межрегиональная химическая олимпиада имени академика П.Д. Саркисова", winnerCode: "SARKISOV_WINNER", prizeCode: "SARKISOV_PRIZE_WINNER", subjects: ["CHEMISTRY"] },
    { id: 34, name: "Межрегиональные предметные олимпиады КФУ", winnerCode: "KFU_PREDMETNYE_WINNER", prizeCode: "KFU_PREDMETNYE_PRIZE_WINNER", subjects: ["INFORMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 35, name: 'Многопредметная олимпиада "Юные таланты"', winnerCode: "YUNYE_TALANTY_WINNER", prizeCode: "YUNYE_TALANTY_PRIZE_WINNER", subjects: ["CHEMISTRY"] },
    { id: 37, name: "Московская олимпиада школьников (МОШ)", winnerCode: "MOSH_WINNER", prizeCode: "MOSH_PRIZE_WINNER", subjects: ["MATHEMATICS", "INFORMATICS", "PHYSICS", "CHEMISTRY", "BIOLOGY", "ECONOMICS"] },
    { id: 41, name: "Объединенная межвузовская олимпиада школьников (ОММО)", winnerCode: "OMMO_WINNER", prizeCode: "OMMO_PRIZE_WINNER", subjects: ["MATHEMATICS", "PHYSICS"] },
    { id: 43, name: "Олимпиада Курчатов", winnerCode: "KURCHATOV_WINNER", prizeCode: "KURCHATOV_PRIZE_WINNER", subjects: ["MATHEMATICS", "PHYSICS"] },
    { id: 46, name: 'Олимпиада по химии и химической технологии "Потомки Менделеева"', winnerCode: "POTOMKI_MENDELEEVA_WINNER", prizeCode: "POTOMKI_MENDELEEVA_PRIZE_WINNER", subjects: ["CHEMISTRY"] },
    { id: 47, name: 'Олимпиада по экономике "Сибириада. Шаг в мечту"', winnerCode: "SIBIRIADA_WINNER", prizeCode: "SIBIRIADA_PRIZE_WINNER", subjects: ["ECONOMICS"] },
    { id: 49, name: 'Олимпиада школьников "Гранит науки"', winnerCode: "GRANIT_NAUKI_WINNER", prizeCode: "GRANIT_NAUKI_PRIZE_WINNER", subjects: ["INFORMATICS", "CHEMISTRY"] },
    { id: 50, name: 'Олимпиада школьников "Ломоносов"', winnerCode: "LOMONOSOV_WINNER", prizeCode: "LOMONOSOV_PRIZE_WINNER", subjects: ["BIOLOGY", "INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 51, name: 'Олимпиада школьников "Надежда энергетики"', winnerCode: "NADEZHDA_ENERGETIKI_WINNER", prizeCode: "NADEZHDA_ENERGETIKI_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 52, name: 'Олимпиада школьников "Покори Воробьевы горы!"', winnerCode: "POKORI_VOROBYOVY_WINNER", prizeCode: "POKORI_VOROBYOVY_PRIZE_WINNER", subjects: ["MATHEMATICS", "PHYSICS"] },
    { id: 53, name: 'Олимпиада школьников "Робофест"', winnerCode: "ROBOFEST_WINNER", prizeCode: "ROBOFEST_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 54, name: 'Олимпиада школьников "Физтех"', winnerCode: "FIZTEKH_WINNER", prizeCode: "FIZTEKH_PRIZE_WINNER", subjects: ["BIOLOGY", "INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 55, name: 'Олимпиада школьников "Шаг в будущее"', winnerCode: "SHAG_V_BUDUSCHEE_WINNER", prizeCode: "SHAG_V_BUDUSCHEE_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 56, name: "Олимпиада школьников по информатике и программированию (ОШИП)", winnerCode: "OSHIP_WINNER", prizeCode: "OSHIP_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 57, name: 'Олимпиада школьников по программированию "ТехноКубок"', winnerCode: "TEHNOKUBOK_WINNER", prizeCode: "TEHNOKUBOK_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 58, name: "Олимпиада школьников РАНХиГС при Президенте РФ", winnerCode: "RANHIGS_WINNER", prizeCode: "RANHIGS_PRIZE_WINNER", subjects: ["ECONOMICS"] },
    { id: 59, name: "Олимпиада школьников Санкт-Петербургского государственного университета (СПбГУ)", winnerCode: "SPBGU_WINNER", prizeCode: "SPBGU_PRIZE_WINNER", subjects: ["BIOLOGY", "INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY", "ECONOMICS"] },
    { id: 61, name: "Олимпиада Юношеской математической школы (ЮМШ)", winnerCode: "YUMSH_WINNER", prizeCode: "YUMSH_PRIZE_WINNER", subjects: ["MATHEMATICS"] },
    { id: 62, name: 'Открытая межвузовская олимпиада СФО "Будущее Сибири"', winnerCode: "BUDUSCHEE_SIBIRI_WINNER", prizeCode: "BUDUSCHEE_SIBIRI_PRIZE_WINNER", subjects: ["PHYSICS", "CHEMISTRY"] },
    { id: 64, name: "Открытая олимпиада школьников (Университет ИТМО)", winnerCode: "OTKRYTAYA_ITMO_WINNER", prizeCode: "OTKRYTAYA_ITMO_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS", "PHYSICS"] },
    { id: 65, name: "Открытая олимпиада школьников по программированию", winnerCode: "OTKRYTAYA_PROG_WINNER", prizeCode: "OTKRYTAYA_PROG_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 66, name: 'Открытая олимпиада по программированию "Когнитивные технологии"', winnerCode: "KOGNITIVNYE_TEH_WINNER", prizeCode: "KOGNITIVNYE_TEH_PRIZE_WINNER", subjects: ["INFORMATICS"] },
    { id: 67, name: "Открытая региональная межвузовская олимпиада школьников (ОРМО)", winnerCode: "ORMO_WINNER", prizeCode: "ORMO_PRIZE_WINNER", subjects: ["PHYSICS", "CHEMISTRY"] },
    { id: 68, name: "Открытая химическая олимпиада", winnerCode: "OTKRYTAYA_HIMICH_WINNER", prizeCode: "OTKRYTAYA_HIMICH_PRIZE_WINNER", subjects: ["CHEMISTRY"] },
    { id: 69, name: 'Отраслевая олимпиада школьников "Газпром"', winnerCode: "GAZPROM_WINNER", prizeCode: "GAZPROM_PRIZE_WINNER", subjects: ["PHYSICS", "INFORMATICS"] },
    { id: 70, name: 'Отраслевая физико-математическая олимпиада "Росатом"', winnerCode: "ROSATOM_WINNER", prizeCode: "ROSATOM_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS", "PHYSICS"] },
    { id: 71, name: "Пироговская олимпиада по химии и биологии", winnerCode: "PIROGOV_WINNER", prizeCode: "PIROGOV_PRIZE_WINNER", subjects: ["BIOLOGY", "CHEMISTRY"] },
    { id: 74, name: "Санкт-Петербургская астрономическая олимпиада", winnerCode: "SPB_ASTRON_WINNER", prizeCode: "SPB_ASTRON_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 75, name: "Санкт-Петербургская олимпиада школьников", winnerCode: "SPB_OLIMPIADA_WINNER", prizeCode: "SPB_OLIMPIADA_PRIZE_WINNER", subjects: ["MATHEMATICS", "CHEMISTRY"] },
    { id: 79, name: "Твой путь в настоящую науку", winnerCode: "TVOY_PUT_V_NAUKU_WINNER", prizeCode: "TVOY_PUT_V_NAUKU_PRIZE_WINNER", subjects: ["PHYSICS"] },
    { id: 81, name: "Турнир городов", winnerCode: "TURNIR_GORODOV_WINNER", prizeCode: "TURNIR_GORODOV_PRIZE_WINNER", subjects: ["MATHEMATICS"] },
    { id: 82, name: "Турнир имени М.В. Ломоносова", winnerCode: "TURNIR_LOMONOSOVA_WINNER", prizeCode: "TURNIR_LOMONOSOVA_PRIZE_WINNER", subjects: ["BIOLOGY", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
    { id: 83, name: 'Университетская олимпиада школьников "Бельчонок"', winnerCode: "BELCHONOK_WINNER", prizeCode: "BELCHONOK_PRIZE_WINNER", subjects: ["INFORMATICS", "MATHEMATICS", "PHYSICS", "CHEMISTRY"] },
];


const API_URL = import.meta.env.VITE_API_URL || "/api";

const PORTFOLIO_API = `${API_URL}/applications`;

// Получение портфолио по ID заявки
export async function axiosGetPortfolioByApplicationId(token: string, applicationId: string): Promise<PortfolioData | null> {
    try {
        const res = await axios.get(`${PORTFOLIO_API}/${applicationId}/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        return res.data?.data ?? res.data ?? null;
    } catch (e: any) {
        const status = e.response?.status;
        const message = e.response?.data?.message;

        // Если портфолио еще не прикреплено (сервер возвращает 404 или 400 "portfolio not found")
        if (status === 404 || (status === 400 && message === "portfolio not found")) {
            return null;
        }

        throw e;
    }
}

// Загрузка нового портфолио (multipart/form-data)
export async function axiosUploadPortfolio(
    token: string,
    applicationId: string,
    description: string,
    achievements: AchievementType[],
    file: File
) {
    const formData = new FormData();
    formData.append("description", description);
    achievements.forEach((ach) => formData.append("achievements", ach));
    formData.append("file", file);

    const res = await axios.post(`${PORTFOLIO_API}/${applicationId}/portfolio`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
    });
    return res.data;
}

// Редактирование существующего портфолио (PATCH JSON)
export async function axiosUpdatePortfolio(
    token: string,
    applicationId: string,
    description: string,
    achievements: AchievementType[],
    file?: File | null
) {
    const formData = new FormData();
    formData.append("description", description);
    achievements.forEach((ach) => formData.append("achievements", ach));

    if (file) {
        formData.append("file", file);
    }

    const res = await axios.patch(
        `${PORTFOLIO_API}/${applicationId}/portfolio`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        }
    );
    return res.data;
}