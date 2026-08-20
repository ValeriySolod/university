// Fixed NMT-2026 mathematics test bank: exactly 15 single-choice (1 point
// each) + 3 matching (up to 3 points each) + 4 short-answer (2 points each),
// for the official 32-point maximum. Pure data module: no React or browser
// APIs. Validated against lib/questionTypes.js at import time so an invalid
// bank fails fast, before any session can start.

import { QUESTION_TYPES, validateQuestions } from "./questionTypes";

export const NMT_SINGLE_CHOICE_COUNT = 15;
export const NMT_MATCHING_COUNT = 3;
export const NMT_SHORT_ANSWER_COUNT = 4;
export const NMT_TASK_COUNT = NMT_SINGLE_CHOICE_COUNT + NMT_MATCHING_COUNT + NMT_SHORT_ANSWER_COUNT;

const singleChoiceQuestions = [
  {
    id: "nmt-sc-1",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Обчисли: 18 − 24 ÷ 4 × 2.",
    answers: ["6", "9", "3", "12"],
    correctIndex: 0,
    pointValue: 1,
    explanation: "За порядком дій: 24 ÷ 4 = 6, 6 × 2 = 12. Тоді 18 − 12 = 6.",
  },
  {
    id: "nmt-sc-2",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Яке число становить 40% від 65?",
    answers: ["24", "26", "28", "30"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "40% від 65 дорівнює 65 × 0,4 = 26.",
  },
  {
    id: "nmt-sc-3",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Розв’яжи рівняння: 3x − 7 = 2x + 5.",
    answers: ["x = −2", "x = 2", "x = 12", "x = 5"],
    correctIndex: 2,
    pointValue: 1,
    explanation: "3x − 2x = 5 + 7, отже x = 12.",
  },
  {
    id: "nmt-sc-4",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Спрости вираз: (2a + 3b) − (a − b).",
    answers: ["a + 4b", "a + 2b", "3a + 2b", "a − 4b"],
    correctIndex: 0,
    pointValue: 1,
    explanation: "(2a + 3b) − (a − b) = 2a + 3b − a + b = a + 4b.",
  },
  {
    id: "nmt-sc-5",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Периметр прямокутника дорівнює 28 см, а одна зі сторін — 8 см. Яка довжина суміжної сторони?",
    answers: ["6 см", "8 см", "10 см", "12 см"],
    correctIndex: 0,
    pointValue: 1,
    explanation: "Півпериметр 28 ÷ 2 = 14 см, тому суміжна сторона 14 − 8 = 6 см.",
  },
  {
    id: "nmt-sc-6",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Знайди значення виразу: 2³ − 3².",
    answers: ["−1", "1", "17", "−17"],
    correctIndex: 0,
    pointValue: 1,
    explanation: "2³ = 8, 3² = 9, а 8 − 9 = −1.",
  },
  {
    id: "nmt-sc-7",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Функцію задано формулою f(x) = 2x − 5. Чому дорівнює f(4)?",
    answers: ["1", "2", "3", "13"],
    correctIndex: 2,
    pointValue: 1,
    explanation: "f(4) = 2 × 4 − 5 = 8 − 5 = 3.",
  },
  {
    id: "nmt-sc-8",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "У класі 24 учні, з них 9 — хлопці. Яка частка дівчат у класі?",
    answers: ["3/8", "5/8", "9/24", "1/3"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "Дівчат 24 − 9 = 15, а частка 15/24 скорочується до 5/8.",
  },
  {
    id: "nmt-sc-9",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Яке з чисел є коренем рівняння x² − 5x + 6 = 0?",
    answers: ["1", "2", "4", "5"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "x² − 5x + 6 = (x − 2)(x − 3), тому корені 2 і 3; серед варіантів це 2.",
  },
  {
    id: "nmt-sc-10",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Автобус проїхав 210 км за 3,5 години. Яка його середня швидкість?",
    answers: ["50 км/год", "55 км/год", "60 км/год", "65 км/год"],
    correctIndex: 2,
    pointValue: 1,
    explanation: "Швидкість = відстань ÷ час = 210 ÷ 3,5 = 60 км/год.",
  },
  {
    id: "nmt-sc-11",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Площа круга дорівнює 16π см². Чому дорівнює його радіус?",
    answers: ["2 см", "4 см", "8 см", "16 см"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "S = πr², тому r² = 16, а r = 4 см.",
  },
  {
    id: "nmt-sc-12",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Яке число є наступним членом арифметичної прогресії: 4, 10, 16, 22, …?",
    answers: ["26", "27", "28", "30"],
    correctIndex: 2,
    pointValue: 1,
    explanation: "Різниця прогресії дорівнює 6, тому наступний член 22 + 6 = 28.",
  },
  {
    id: "nmt-sc-13",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Ціну товару спочатку знизили на 20%, а потім підвищили на 20% від нової ціни. Як змінилася початкова ціна?",
    answers: ["не змінилася", "зменшилася на 4%", "збільшилася на 4%", "зменшилася на 20%"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "0,8 × 1,2 = 0,96 від початкової ціни, тобто ціна зменшилася на 4%.",
  },
  {
    id: "nmt-sc-14",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "У прямокутному трикутнику катети дорівнюють 6 см і 8 см. Яка довжина гіпотенузи?",
    answers: ["9 см", "10 см", "12 см", "14 см"],
    correctIndex: 1,
    pointValue: 1,
    explanation: "За теоремою Піфагора: √(6² + 8²) = √(36 + 64) = √100 = 10 см.",
  },
  {
    id: "nmt-sc-15",
    type: QUESTION_TYPES.SINGLE_CHOICE,
    text: "Розв’яжи нерівність: 2x + 3 > 11.",
    answers: ["x > 4", "x > 7", "x < 4", "x > 5,5"],
    correctIndex: 0,
    pointValue: 1,
    explanation: "2x > 8, отже x > 4.",
  },
];

const matchingQuestions = [
  {
    id: "nmt-match-1",
    type: QUESTION_TYPES.MATCHING,
    text: "Встанови відповідність між функцією та її похідною.",
    leftOptions: [
      { id: "nmt-match-1-left-1", text: "f(x) = x³" },
      { id: "nmt-match-1-left-2", text: "f(x) = sin(x)" },
      { id: "nmt-match-1-left-3", text: "f(x) = 5x" },
    ],
    rightOptions: [
      { id: "nmt-match-1-right-1", text: "3x²" },
      { id: "nmt-match-1-right-2", text: "cos(x)" },
      { id: "nmt-match-1-right-3", text: "5" },
      { id: "nmt-match-1-right-4", text: "x²" },
    ],
    mapping: {
      "nmt-match-1-left-1": "nmt-match-1-right-1",
      "nmt-match-1-left-2": "nmt-match-1-right-2",
      "nmt-match-1-left-3": "nmt-match-1-right-3",
    },
    pointValue: 3,
    explanation: "(x³)′ = 3x², (sin x)′ = cos x, (5x)′ = 5.",
  },
  {
    id: "nmt-match-2",
    type: QUESTION_TYPES.MATCHING,
    text: "Встанови відповідність між геометричною фігурою та формулою обчислення її площі.",
    leftOptions: [
      { id: "nmt-match-2-left-1", text: "квадрат зі стороною a" },
      { id: "nmt-match-2-left-2", text: "трикутник з основою a і висотою h" },
      { id: "nmt-match-2-left-3", text: "коло радіуса r" },
    ],
    rightOptions: [
      { id: "nmt-match-2-right-1", text: "a²" },
      { id: "nmt-match-2-right-2", text: "½ a h" },
      { id: "nmt-match-2-right-3", text: "π r²" },
      { id: "nmt-match-2-right-4", text: "2π r" },
    ],
    mapping: {
      "nmt-match-2-left-1": "nmt-match-2-right-1",
      "nmt-match-2-left-2": "nmt-match-2-right-2",
      "nmt-match-2-left-3": "nmt-match-2-right-3",
    },
    pointValue: 3,
    explanation: "Площа квадрата a², площа трикутника ½ a h, площа круга π r².",
  },
  {
    id: "nmt-match-3",
    type: QUESTION_TYPES.MATCHING,
    text: "Встанови відповідність між рівнянням та кількістю його коренів на множині дійсних чисел.",
    leftOptions: [
      { id: "nmt-match-3-left-1", text: "x² − 4 = 0" },
      { id: "nmt-match-3-left-2", text: "x² + 4 = 0" },
      { id: "nmt-match-3-left-3", text: "x² − 4x + 4 = 0" },
    ],
    rightOptions: [
      { id: "nmt-match-3-right-1", text: "два корені" },
      { id: "nmt-match-3-right-2", text: "коренів немає" },
      { id: "nmt-match-3-right-3", text: "один корінь" },
      { id: "nmt-match-3-right-4", text: "нескінченно багато коренів" },
    ],
    mapping: {
      "nmt-match-3-left-1": "nmt-match-3-right-1",
      "nmt-match-3-left-2": "nmt-match-3-right-2",
      "nmt-match-3-left-3": "nmt-match-3-right-3",
    },
    pointValue: 3,
    explanation:
      "x² − 4 = 0 має два корені (±2), x² + 4 = 0 не має дійсних коренів, а x² − 4x + 4 = (x − 2)² має один корінь.",
  },
];

const shortAnswerQuestions = [
  {
    id: "nmt-short-1",
    type: QUESTION_TYPES.SHORT_ANSWER,
    text: "Обчисли: √144 + √25.",
    acceptedAnswers: ["17"],
    pointValue: 2,
    explanation: "√144 = 12, √25 = 5, а їх сума 12 + 5 = 17.",
  },
  {
    id: "nmt-short-2",
    type: QUESTION_TYPES.SHORT_ANSWER,
    text: "Знайди більший корінь рівняння x² − x − 6 = 0.",
    acceptedAnswers: ["3"],
    pointValue: 2,
    explanation: "x² − x − 6 = (x − 3)(x + 2), корені 3 і −2, більший з них — 3.",
  },
  {
    id: "nmt-short-3",
    type: QUESTION_TYPES.SHORT_ANSWER,
    text: "Знайди суму перших п’яти членів арифметичної прогресії, якщо перший член дорівнює 2, а різниця — 3.",
    acceptedAnswers: ["40"],
    pointValue: 2,
    explanation: "Члени: 2, 5, 8, 11, 14. Їх сума 2 + 5 + 8 + 11 + 14 = 40.",
  },
  {
    id: "nmt-short-4",
    type: QUESTION_TYPES.SHORT_ANSWER,
    text: "Периметр рівностороннього трикутника дорівнює 27 см. Яка довжина його сторони в сантиметрах?",
    acceptedAnswers: ["9"],
    pointValue: 2,
    explanation: "Усі три сторони рівні, тому 27 ÷ 3 = 9 см.",
  },
];

export const nmtQuestions = [...singleChoiceQuestions, ...matchingQuestions, ...shortAnswerQuestions];

const validation = validateQuestions(nmtQuestions);
if (!validation.valid) {
  throw new Error(`Invalid NMT test bank: ${validation.errors.join(" ")}`);
}
