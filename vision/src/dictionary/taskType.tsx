export const taskTypeDict = {
  Oral: 1,
  Practic: 2,
  Testing: 3
} as const;

export const taskTypes = [
  { label: "Устный", value: taskTypeDict.Oral },
  { label: "Практичекий", value: taskTypeDict.Practic },
  { label: "Тестирование", value: taskTypeDict.Testing }
] as const;

export const taskTypeLabels: Record<number, string> = {
  [taskTypeDict.Oral]: "Устный",
  [taskTypeDict.Practic]: "Практический",
  [taskTypeDict.Testing]: "Тестирование"
};