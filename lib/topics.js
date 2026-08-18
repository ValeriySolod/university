import { questions as elementaryQuestions } from "./questions";
import { generatePowerQuestions } from "./generators/powers";
import { generateRootQuestions } from "./generators/roots";
import { generateLogarithmQuestions } from "./generators/logarithms";

export const DEFAULT_TOPIC_ID = "elementary";

export const topics = [
  { id: "elementary", label: "Елементарна математика", generate: () => elementaryQuestions },
  { id: "powers", label: "Степені", generate: generatePowerQuestions },
  { id: "roots", label: "Корені", generate: generateRootQuestions },
  { id: "logarithms", label: "Логарифми", generate: generateLogarithmQuestions },
];
