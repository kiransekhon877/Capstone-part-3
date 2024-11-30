// quizApp.js (modular approach)
export const quizApp = (() => {
    let quizData = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let timer;

    const init = () => {
        document.getElementById('quiz-form').addEventListener('submit', handleQuizStart);
        document.getElementById('next-question').addEventListener('click', handleNextQuestion);
        document.getElementById('reset-score').addEventListener('click', resetScore);
        loadPreviousScore();
    };

    const fetchQuizQuestions = async (difficulty) => {
        const apiUrl = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple`;
        const response = await fetch(apiUrl);
        return (await response.json()).results;
    };

    const handleQuizStart = async (e) => {
        e.preventDefault();
        const difficulty = document.getElementById('difficulty').value;
        quizData = await fetchQuizQuestions(difficulty);
        startQuiz();
    };

    const startQuiz = () => {
        showElement('question-container');
        hideElement('quiz-form');
        loadQuestion();
    };

    const loadQuestion = () => {
        clearInterval(timer); // Reset timer for each question
        startTimer(30); // Set a 30-second timer for questions
        const question = quizData[currentQuestionIndex];
        document.getElementById('question').innerHTML = decodeHTML(question.question);
        loadAnswers(question);
    };

    const loadAnswers = (question) => {
        const answersElement = document.getElementById('answers');
        answersElement.innerHTML = '';
        const allAnswers = shuffleArray([...question.incorrect_answers, question.correct_answer]);
        allAnswers.forEach((answer) => {
            const button = document.createElement('button');
            button.innerHTML = decodeHTML(answer);
            button.className = 'answer-btn';
            button.onclick = () => handleAnswer(answer === question.correct_answer);
            answersElement.appendChild(button);
        });
    };

    const handleAnswer = (isCorrect) => {
        stopTimer();
        isCorrect ? correctAnswers++ : incorrectAnswers++;
        showResult(isCorrect);
    };

    const showResult = (isCorrect) => {
        document.getElementById('result-message').textContent = isCorrect ? 'Correct!' : 'Incorrect!';
        showElement('result');
        hideElement('question-container');
        updateScore();
    };

    const handleNextQuestion = () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
            hideElement('result');
            showElement('question-container');
        } else {
            showFinalResult();
        }
    };

    const resetScore = () => {
        correctAnswers = 0;
        incorrectAnswers = 0;
        localStorage.removeItem('quizScore');
        restartQuiz();
    };

    const showFinalResult = () => {
        document.getElementById('result-message').textContent = `Quiz Completed! Final Score: ${correctAnswers}`;
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Quiz';
        restartButton.id = 'restart-quiz';
        restartButton.onclick = restartQuiz;
        document.getElementById('result').appendChild(restartButton);
    };

    const restartQuiz = () => {
        currentQuestionIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        hideElement('result');
        showElement('quiz-form');
    };

    const updateScore = () => {
        localStorage.setItem('quizScore', JSON.stringify({ correctAnswers, incorrectAnswers }));
    };

    const loadPreviousScore = () => {
        const storedScore = JSON.parse(localStorage.getItem('quizScore'));
        if (storedScore) {
            correctAnswers = storedScore.correctAnswers;
            incorrectAnswers = storedScore.incorrectAnswers;
            showFinalResult();
        }
    };

    // Timer
    const startTimer = (seconds) => {
        const timerDisplay = document.getElementById('timer');
        timer = setInterval(() => {
            timerDisplay.textContent = `Time left: ${seconds}s`;
            if (seconds-- <= 0) handleAnswer(false);
        }, 1000);
    };

    const stopTimer = () => clearInterval(timer);

    // Utility Functions
    const showElement = (id) => document.getElementById(id).classList.remove('hidden');
    const hideElement = (id) => document.getElementById(id).classList.add('hidden');

    const decodeHTML = (html) => new DOMParser().parseFromString(html, 'text/html').body.textContent;

    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    return { init };
})();

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', quizApp.init);
