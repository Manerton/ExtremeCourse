import axios from "axios";

export const Achievement = {
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