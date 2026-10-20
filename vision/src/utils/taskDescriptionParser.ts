export interface ParsedTaskDescription {
    questionText: string;
    options?: string[];
    mappingItems?: { key: string; text: string }[];
    mappingTargets?: { key: string; text: string }[];
    placeholder: string;
}

export function parseTaskDescription(raw: string): ParsedTaskDescription {
    if (!raw) return { questionText: "", placeholder: "Введите ответ" };

    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

    // Случай 1: Задание на соответствие (наличие "А)", "Б)" и "1)", "2)")
    const hasLetterMapping = lines.some(l => /^[А-ЯA-Z]\)/i.test(l));
    const hasNumberMapping = lines.some(l => /^\d+\)/.test(l));

    if (hasLetterMapping && hasNumberMapping) {
        const questionLines: string[] = [];
        const mappingItems: { key: string; text: string }[] = [];
        const mappingTargets: { key: string; text: string }[] = [];

        let currentSection: "question" | "items" | "targets" = "question";

        for (const line of lines) {
            if (/^(Форменные элементы|Логические операции|Алгоритмические|Функции|Физические|Формулы|Тепловые|Элементы|Факторы|Классы)/i.test(line)) {
                currentSection = "items";
                continue;
            }
            if (/^(Функции|Названия|Описания|Графики|Единицы|Формулы|Переходы|Факторные|Примеры)/i.test(line)) {
                currentSection = "targets";
                continue;
            }

            const letterMatch = line.match(/^([А-ЯA-Z])\)\s*(.*)/i);
            if (letterMatch) {
                mappingItems.push({ key: letterMatch[1].toUpperCase(), text: letterMatch[2] });
                continue;
            }

            const numberMatch = line.match(/^(\d+)\)\s*(.*)/);
            if (numberMatch && (currentSection === "targets" || mappingItems.length > 0)) {
                mappingTargets.push({ key: numberMatch[1], text: numberMatch[2] });
                continue;
            }

            if (currentSection === "question") {
                questionLines.push(line);
            }
        }

        return {
            questionText: questionLines.join(" "),
            mappingItems,
            mappingTargets,
            placeholder: "Например: А1 Б2 В3",
        };
    }

    // Случай 2: Вопрос с нумерованными вариантами ответов (1), 2), 3)...)
    const questionLines: string[] = [];
    const options: string[] = [];

    for (const line of lines) {
        const optMatch = line.match(/^(\d+)\)\s*(.*)/);
        if (optMatch) {
            options.push(optMatch[2]);
        } else {
            questionLines.push(line);
        }
    }

    const questionText = questionLines.join(" ");
    let placeholder = "Введите ответ";
    if (questionText.toLowerCase().includes("одну цифру")) {
        placeholder = "Например: 1";
    } else if (questionText.toLowerCase().includes("порядке возрастания") || questionText.toLowerCase().includes("последовательность")) {
        placeholder = "Например: 1 2 3";
    }

    return {
        questionText,
        options: options.length > 0 ? options : undefined,
        placeholder,
    };
}