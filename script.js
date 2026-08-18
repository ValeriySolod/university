const questions = [
  {
    text: "Скільки буде 48 ÷ 6 + 7?",
    answers: ["13", "15", "8", "17"],
    correct: 1,
    explanation: "Спочатку виконуємо ділення: 48 ÷ 6 = 8. Потім додаємо 7 й отримуємо 15.",
  },
  {
    text: "Яке число становить 25% від 80?",
    answers: ["15", "20", "25", "40"],
    correct: 1,
    explanation: "25% — це одна четверта. 80 ÷ 4 = 20.",
  },
  {
    text: "Обчисли: 3² + 4².",
    answers: ["12", "24", "25", "49"],
    correct: 2,
    explanation: "3² = 9, а 4² = 16. Сума 9 + 16 дорівнює 25.",
  },
  {
    text: "Який дріб дорівнює 0,75?",
    answers: ["1/2", "2/3", "3/4", "4/5"],
    correct: 2,
    explanation: "0,75 = 75/100. Скорочуємо чисельник і знаменник на 25 та отримуємо 3/4.",
  },
  {
    text: "Розв’яжи рівняння: 5x = 35.",
    answers: ["x = 5", "x = 6", "x = 7", "x = 8"],
    correct: 2,
    explanation: "Ділимо обидві частини рівняння на 5: x = 35 ÷ 5 = 7.",
  },
  {
    text: "Периметр квадрата дорівнює 36 см. Яка довжина його сторони?",
    answers: ["6 см", "8 см", "9 см", "12 см"],
    correct: 2,
    explanation: "У квадрата чотири рівні сторони. 36 ÷ 4 = 9 см.",
  },
  {
    text: "Яке число наступне у послідовності: 2, 5, 8, 11, …?",
    answers: ["12", "13", "14", "15"],
    correct: 2,
    explanation: "Кожне наступне число збільшується на 3, тому 11 + 3 = 14.",
  },
  {
    text: "Автомобіль проїхав 180 км за 3 години. Якою була середня швидкість?",
    answers: ["45 км/год", "60 км/год", "90 км/год", "120 км/год"],
    correct: 1,
    explanation: "Швидкість дорівнює відстані, поділеній на час: 180 ÷ 3 = 60 км/год.",
  },
  {
    text: "Спрости вираз: 4a + 3a − 2a.",
    answers: ["5a", "6a", "7a", "9a"],
    correct: 0,
    explanation: "Додаємо коефіцієнти подібних доданків: 4 + 3 − 2 = 5, отже маємо 5a.",
  },
  {
    text: "Яка площа прямокутника зі сторонами 7 см і 5 см?",
    answers: ["12 см²", "24 см²", "30 см²", "35 см²"],
    correct: 3,
    explanation: "Площа прямокутника — це добуток його сторін: 7 × 5 = 35 см².",
  },
];

const setup = document.querySelector(".setup-card");
const quiz = document.querySelector("#quiz");
const result = document.querySelector("#result");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const nextButton = document.querySelector("#next-button");
const questionCounter = document.querySelector("#question-counter");
const questionText = document.querySelector("#question-text");
const answersContainer = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const progressTrack = document.querySelector(".progress-track");
const progressBar = document.querySelector("#progress-bar");
const timer = document.querySelector("#timer");
const questionTimer = document.querySelector("#question-timer");

let currentQuestion = 0;
let correctAnswers = 0;
let answerTimes = [];
let questionStartedAt = 0;
let trainingStartedAt = 0;
let timerId;
let autoAdvanceId;
let selectedMode = "classic";
let totalElapsedSeconds = 0;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  totalElapsedSeconds = Math.floor((Date.now() - trainingStartedAt) / 1000);
  timer.textContent = formatTime(totalElapsedSeconds);
  questionTimer.textContent = formatTime(Math.floor((performance.now() - questionStartedAt) / 1000));
}

function startTraining() {
  currentQuestion = 0;
  correctAnswers = 0;
  answerTimes = [];
  selectedMode = document.querySelector('input[name="mode"]:checked').value;
  trainingStartedAt = Date.now();
  setup.hidden = true;
  result.hidden = true;
  quiz.hidden = false;
  clearInterval(timerId);
  clearTimeout(autoAdvanceId);
  timerId = setInterval(updateTimer, 1000);
  updateTimer();
  showQuestion();
}

function showQuestion() {
  const question = questions[currentQuestion];
  const completed = currentQuestion;
  questionCounter.textContent = `Завдання ${currentQuestion + 1} з ${questions.length}`;
  questionText.textContent = question.text;
  progressBar.style.width = `${(completed / questions.length) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", completed.toString());
  feedback.hidden = true;
  nextButton.hidden = true;
  answersContainer.replaceChildren();

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => selectAnswer(index));
    answersContainer.append(button);
  });

  questionStartedAt = performance.now();
  questionTimer.textContent = "00:00";
  answersContainer.querySelector("button")?.focus();
}

function goToNextQuestion() {
  currentQuestion += 1;
  if (currentQuestion < questions.length) showQuestion();
  else showResult();
}

function selectAnswer(selectedIndex) {
  const question = questions[currentQuestion];
  const buttons = [...answersContainer.querySelectorAll("button")];
  const isCorrect = selectedIndex === question.correct;
  answerTimes.push((performance.now() - questionStartedAt) / 1000);

  if (isCorrect) correctAnswers += 1;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add("correct");
    if (index === selectedIndex && !isCorrect) button.classList.add("incorrect");
  });

  feedback.innerHTML = `<strong>${isCorrect ? "Правильно!" : "Майже!"}</strong>${question.explanation}`;
  feedback.hidden = false;
  nextButton.textContent = currentQuestion === questions.length - 1 ? "Переглянути результат" : "Наступне завдання";
  nextButton.hidden = selectedMode === "ultimate";

  if (selectedMode === "ultimate") {
    feedback.insertAdjacentHTML("beforeend", '<span class="auto-advance-note">Наступне завдання відкриється автоматично…</span>');
    autoAdvanceId = setTimeout(goToNextQuestion, 1400);
  } else {
    nextButton.focus();
  }
}

function showResult() {
  clearInterval(timerId);
  clearTimeout(autoAdvanceId);
  updateTimer();
  quiz.hidden = true;
  result.hidden = false;
  progressBar.style.width = "100%";
  progressTrack.setAttribute("aria-valuenow", questions.length.toString());

  const percent = Math.round((correctAnswers / questions.length) * 100);
  const averageTime = answerTimes.reduce((sum, time) => sum + time, 0) / answerTimes.length;
  const title = percent >= 80 ? "Чудовий результат!" : percent >= 60 ? "Гарний старт!" : "Практика творить дива!";
  const copy = percent >= 80
    ? "Ти впевнено працюєш з базовими математичними поняттями. Так тримати!"
    : "Переглянь пояснення та спробуй ще раз — наступний результат буде кращим.";

  document.querySelector("#result-title").textContent = title;
  document.querySelector("#result-copy").textContent = copy;
  document.querySelector("#correct-stat").textContent = `${correctAnswers}/${questions.length}`;
  document.querySelector("#time-stat").textContent = `${averageTime.toFixed(1).replace(".", ",")} с`;
  document.querySelector("#percent-stat").textContent = `${percent}%`;
  document.querySelector("#total-time-stat").textContent = formatTime(totalElapsedSeconds);
  restartButton.focus();
}

nextButton.addEventListener("click", goToNextQuestion);

startButton.addEventListener("click", startTraining);
restartButton.addEventListener("click", startTraining);
