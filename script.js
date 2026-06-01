const startScreen = document.getElementById("start-screen");
const optionsScreen = document.getElementById("options-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const startOptionsBtn = document.getElementById("start-options-btn"); 
const numQuestionsSelect = document.getElementById("num-questions");  
const difficultySelect = document.getElementById("difficulty");  
const categorySelect = document.getElementById("category");  


let quizQuestions = [];

// Quiz state vars
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

// Event listeners
startButton.addEventListener("click", function () {
  startScreen.classList.add("hidden");
  optionsScreen.classList.remove("hidden");
});

startOptionsBtn.addEventListener("click", function () {
  optionsScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  
  // Build API URL from selected options
  const numQuestions = numQuestionsSelect.value;
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  
  let apiUrl = "https://opentdb.com/api.php?amount=" + numQuestions + "&type=multiple";
  
  if (difficulty !== "") {
    apiUrl = apiUrl + "&difficulty=" + difficulty;
  }
  
  if (category !== "") {
    apiUrl = apiUrl + "&category=" + category;
  }
  
  fetchQuestions(apiUrl);
});

restartButton.addEventListener("click", restartQuiz);

// fetch questions function
function fetchQuestions(url) {
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      quizQuestions = data.results.map(function (question) {
        const questionText = decodeHTMLEntities(question.question);
        const correctAnswer = decodeHTMLEntities(question.correct_answer);
        
        const allAnswers = question.incorrect_answers.map(function (answer) {
          return decodeHTMLEntities(answer);
        });
        allAnswers.push(correctAnswer);
        
        shuffleArray(allAnswers);
        
        return {
          question: questionText,
          answers: allAnswers.map(function (text) {
            return {
              text: text,
              correct: text === correctAnswer,
            };
          }),
        };
      });

      totalQuestionsSpan.textContent = quizQuestions.length;
      maxScoreSpan.textContent = quizQuestions.length;
      
      displayQuestion();
    })
    .catch(function (error) {
      console.log("Error fetching questions:", error);
    });
}

// ===== HELPER FUNCTIONS =====

function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;
  answersDisabled = false;

  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  displayQuestion();
}

function displayQuestion() {
  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Update question counter and text
  currentQuestionSpan.textContent = currentQuestionIndex + 1;
  questionText.textContent = currentQuestion.question;

  // Clear old answers
  answersContainer.innerHTML = "";

  // Create buttons for each answer
  for (let i = 0; i < currentQuestion.answers.length; i++) {
    const answer = currentQuestion.answers[i];
    const button = document.createElement("button");

    button.textContent = answer.text;
    button.className = "text-left p-2 text-black bg-[#f5efe6] border rounded-sm border-[#d0c0a9]";
    button.addEventListener("click", function () {
      checkAnswer(button, answer.correct, currentQuestion.answers);
    });

    answersContainer.appendChild(button);
  }
}

function checkAnswer(clickedButton, isCorrect, allAnswers) {
  if (answersDisabled) {
    return;
  }

  answersDisabled = true;

  // Color the clicked button
  if (isCorrect) {
    clickedButton.style.backgroundColor = "#22c55e"; // green
    clickedButton.style.color = "white";
    score = score + 1;
    scoreSpan.textContent = score;
  } else {
    clickedButton.style.backgroundColor = "#ef4444"; // red
    clickedButton.style.color = "white";

    // Find and color the correct answer green
    const buttons = answersContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
      if (allAnswers[i].correct) {
        buttons[i].style.backgroundColor = "#22c55e"; // green
        buttons[i].style.color = "white";
      }
    }
  }

  // Disable all buttons so user can't click while colors are showing
  const allButtons = answersContainer.querySelectorAll("button");
  for (let i = 0; i < allButtons.length; i++) {
    allButtons[i].disabled = true;
  }

  // Move to next question after 2 seconds
  setTimeout(function () {
    nextQuestion();
  }, 1000);
}

function nextQuestion() {
  currentQuestionIndex = currentQuestionIndex + 1;

  if (currentQuestionIndex < quizQuestions.length) {
    answersDisabled = false;
    displayQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScoreSpan.textContent = score;

  if (score === quizQuestions.length) {
    resultMessage.textContent = "Perfect! You got them all right!";
  } else if (score >= quizQuestions.length * 0.8) {
    resultMessage.textContent = "Excellent! Great job!";
  } else if (score >= quizQuestions.length * 0.6) {
    resultMessage.textContent = "Good Effort! Keep Learning";
  } else {
    resultMessage.textContent = "Keep Practicing! You'll do better next time";
  }
}

function restartQuiz() {
  resultScreen.classList.add("hidden");
  optionsScreen.classList.remove("hidden");

  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;
  answersDisabled = false;
}
  displayQuestion();

