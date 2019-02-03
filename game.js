//GAME Elements
const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const scoreText = document.getElementById("score");
const questionCounterText = document.getElementById("questionCounter");
const loader = document.getElementById("loader");
const gameScreen = document.getElementById("game");
const progressText = document.getElementById("progressText");
const progressBarFull = document.querySelector(
  "#progress-bar > .progress-bar-full"
);
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 5;

let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

//questions hard coded

//questions loaded from js into script tag - global questions variable

//load questions from json file
let questions = [];
fetch("questions.json")
  .then(function(response) {
    return response.json();
  })
  .then(function(loadedQuestions) {
    // questions = loadedQuestions;
    // startGame();
  })
  .catch(err => {
    console.error("Something bad happened", err);
  });

//load questions via api call - https://opentdb.com/api_config.php
fetch(
  "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple"
)
  .then(function(response) {
    return response.json();
  })
  .then(function(loadedQuestions) {
    questions = loadedQuestions.results.map(loadedQuestion => {
      const formattedQuestion = {
        question: loadedQuestion.question
      };
      const answerChoices = [...loadedQuestion.incorrect_answers];
      //inject correct answer into random position
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );
      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });
      return formattedQuestion;
    });
    console.log(questions);
    //questions = loadedQuestions;
    startGame();
  })
  .catch(err => {
    console.error("Something bad happened, getting backup questions", err);
    fetch("questions.json")
      .then(function(response) {
        return response.json();
      })
      .then(function(loadedQuestions) {
        questions = loadedQuestions;
        startGame();
      })
      .catch(err => {
        console.error("Something bad happened", err);
      });
  });

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  //hide loader and show the game
  loader.classList.add("hidden");
  gameScreen.classList.remove("hidden");
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    //THE GAME IS OVER - save score in localstorage for end screen to use
    localStorage.setItem("mostRecentScore", score);
    //Go to the end page
    return window.location.assign("/end.html");
  }

  //Increment question counter, question number text, and progress bar
  questionCounter++;
  progressText.innerText = `Question: ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  //questionCounterText.innerText = `${questionCounter}/${MAX_QUESTIONS}`;
  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach(choice => {
    const number = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];
  });

  //Remove question from available questions
  availableQuestions.splice(questionIndex, 1);

  //let users answer now that question is ready
  acceptingAnswers = true;
};

choices.forEach(choice => {
  choice.addEventListener("click", e => {
    //dont let the user attempt to answer until the new question is ready
    if (!acceptingAnswers) return;
    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    //Add the correct/incorrect animation

    selectedChoice.parentElement.classList.add(classToApply);

    //Increase the score
    incrementScore(classToApply === "correct" ? CORRECT_BONUS : 0);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      //Load New Question
      getNewQuestion();
    }, 1000);
  });
});

incrementScore = num => {
  score += num;
  scoreText.innerHTML = `${score}`;
};
