import axios from "axios";
import { FILES } from "../config/api";

/**
 * Скачивает Excel-файл со списком заявок.
 * Возвращает Blob + имя файла из Content-Disposition (если есть).
 */
export async function axiosDownloadApplicationsExcel(token: string): Promise<{
    blob: Blob;
    fileName: string;
}> {
    const res = await axios.get(FILES.FILES_DOWNLOAD_EXCEL, {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
    });

    // Пытаемся достать имя файла из заголовка
    const contentDisposition = res.headers["content-disposition"] as string | undefined;
    let fileName = "applications.xlsx";
    if (contentDisposition) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(contentDisposition);
        if (match?.[1]) fileName = decodeURIComponent(match[1]);
    }

    return { blob: res.data as Blob, fileName };
}


// Функция сборки абсолютного пути к файлу для просмотра/скачивания
export const buildFileDownloadUrl = (filePath?: string): string | null => {
    if (!filePath) return null;

    // Если вдруг бэк уже отдаёт полный URL — не трогаем
    if (/^https?:\/\//i.test(filePath)) return filePath;

    return `${FILES.FILES_DOWNLOAD}?path=${encodeURIComponent(filePath)}`;
};