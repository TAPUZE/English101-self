/**
 * quizEngine.js - A reusable quiz module for A1_English_Course
 * 
 * This module provides functionality for rendering questions, checking answers,
 * providing feedback, and tracking scores for multiple question types.
 * 
 * @author Created for A1_English_Course
 * @version 1.0.0
 */

'use strict';

/**
 * QuizEngine - Main quiz functionality module
 */
export class QuizEngine {
  /**
   * Creates a new QuizEngine instance
   * @param {string} containerId - ID of the HTML element to render the quiz in
   * @param {Array} questionsData - Array of question objects
   * @param {Object} options - Configuration options
   */
  constructor(containerId, questionsData, options = {}) {
    // Initialize properties with default values
    this.container = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.options = {
      shuffleQuestions: false,
      shuffleOptions: false,
      showFeedback: true,
      showScore: true,
      allowRetry: false,
      soundFeedback: false,
      ...options
    };
    
    // Initialize the quiz
    this.init(containerId, questionsData, this.options);
  }

  /**
   * Initializes the quiz
   * @param {string} containerId - ID of the HTML element to render the quiz in
   * @param {Array} questionsData - Array of question objects
   * @param {Object} options - Configuration options
   */
  init(containerId, questionsData, options = {}) {
    try {
      // Validate inputs
      if (!containerId) {
        throw new Error('Container ID is required');
      }
      
      if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
        throw new Error('Questions data must be a non-empty array');
      }
      
      // Get container element
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container element with ID "${containerId}" not found`);
      }
      
      // Set questions and options
      this.questions = [...questionsData];
      this.options = { ...this.options, ...options };
      
      // Shuffle questions if needed
      if (this.options.shuffleQuestions) {
        this.shuffleArray(this.questions);
      }
      
      // Create quiz UI structure
      this.createQuizStructure();
      
      // Render first question
      this.renderCurrentQuestion();
      
      // Create event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Quiz initialization error:', error);
      this.showError('Failed to initialize quiz. Please check the console for details.');
    }
  }

  /**
   * Creates the basic quiz UI structure
   */
  createQuizStructure() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create main quiz elements
    const quizWrapper = document.createElement('div');
    quizWrapper.className = 'quiz-wrapper';
    
    // Question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question-container';
    questionContainer.id = 'quiz-question-container';
    
    // Feedback container
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container';
    feedbackContainer.id = 'quiz-feedback';
    
    // Navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'quiz-navigation';
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'quiz-next-btn';
    nextButton.id = 'quiz-next-btn';
    nextButton.textContent = 'Next';
    nextButton.style.display = 'none';
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'quiz-submit-btn';
    submitButton.id = 'quiz-submit-btn';
    submitButton.textContent = 'Submit';
    
    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'quiz-score';
    scoreDisplay.id = 'quiz-score';
    scoreDisplay.style.display = 'none';
    
    // Append elements
    navContainer.appendChild(submitButton);
    navContainer.appendChild(nextButton);
    
    quizWrapper.appendChild(questionContainer);
    quizWrapper.appendChild(feedbackContainer);
    quizWrapper.appendChild(navContainer);
    quizWrapper.appendChild(scoreDisplay);
    
    this.container.appendChild(quizWrapper);
  }

  /**
   * Sets up event listeners for quiz interaction
   */
  setupEventListeners() {
    const submitButton = document.getElementById('quiz-submit-btn');
    const nextButton = document.getElementById('quiz-next-btn');
    
    if (submitButton) {
      submitButton.addEventListener('click', () => this.checkCurrentAnswer());
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => this.nextQuestion());
    }
  }

  /**
   * Renders the current question
   */
  renderCurrentQuestion() {
    try {
      const questionContainer = document.getElementById('quiz-question-container');
      const submitButton = document.getElementById('quiz-submit-btn');
      const nextButton = document.getElementById('quiz-next-btn');
      const feedbackContainer = document.getElementById('quiz-feedback');
      
      if (!questionContainer) {
        throw new Error('Question container not found');
      }
      
      // Clear previous question and feedback
      questionContainer.innerHTML = '';
      if (feedbackContainer) {
        feedbackContainer.innerHTML = '';
        feedbackContainer.className = 'feedback-container';
      }
      
      // Show submit button, hide next button
      if (submitButton) submitButton.style.display = 'block';
      if (nextButton) nextButton.style.display = 'none';
      
      // Get current question
      const question = this.questions[this.currentQuestionIndex];
      if (!question) {
        throw new Error('Question not found');
      }
      
      // Create question element
      const questionElement = document.createElement('div');
      questionElement.className = 'quiz-question';
      
      // Add question text
      const questionText = document.createElement('h3');
      questionText.textContent = question.text || 'Question';
      questionElement.appendChild(questionText);
      
      // Render question based on type
      switch (question.type) {
        case 'multiple-choice':
          this.renderMultipleChoice(questionElement, question);
          break;
        case 'true-false':
          this.renderTrueFalse(questionElement, question);
          break;
        case 'fill-in-the-blank':
          this.renderFillInTheBlank(questionElement, question);
          break;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }
      
      // Add question to container
      questionContainer.appendChild(questionElement);
      
    } catch (error) {
      console.error('Error rendering question:', error);
      this.showError('Failed to render question. Please check the console for details.');
    }
  }

  /**
   * Renders a multiple-choice question
   * @param {HTMLElement} container - Container element
   * @param {Object} question - Question data
   */
  renderMultipleChoice(container, question) {
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    
    // Get options
    let options = [...(question.options || [])];
    
    // Shuffle options if needed
    if (this.options.shuffleOptions) {
      this.shuffleArray(options);
    }
    
    // Create option elements
    options.forEach((option, index) => {
      const optionWrapper = document.createElement('div');
      optionWrapper.className = 'quiz-option';
      
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `quiz-question-${this.currentQuestionIndex}`;
      input.id = `quiz-option-${this.currentQuestionIndex}-${index}`;
      input.value = option.value || option;
      
      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = option.text || option;
      
      optionWrapper.appendChild(input);
      optionWrapper.appendChild(label);
      optionsContainer.appendChild(optionWrapper);
    });
    
    container.appendChild(optionsContainer);
  }

  /**
   * Renders a true/false question
   * @param {HTMLElement} container - Container element
   * @param {Object} question - Question data
   */
  renderTrueFalse(container, question) {
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options true-false';
    
    // Create true option
    const trueWrapper = document.createElement('div');
    trueWrapper.className = 'quiz-option';
    
    const trueInput = document.createElement('input');
    trueInput.type = 'radio';
    trueInput.name = `quiz-question-${this.currentQuestionIndex}`;
    trueInput.id = `quiz-option-${this.currentQuestionIndex}-true`;
    trueInput.value = 'true';
    
    const trueLabel = document.createElement('label');
    trueLabel.htmlFor = trueInput.id;
    trueLabel.textContent = 'True';
    
    trueWrapper.appendChild(trueInput);
    trueWrapper.appendChild(trueLabel);
    
    // Create false option
    const falseWrapper = document.createElement('div');
    falseWrapper.className = 'quiz-option';
    
    const falseInput = document.createElement('input');
    falseInput.type = 'radio';
    falseInput.name = `quiz-question-${this.currentQuestionIndex}`;
    falseInput.id = `quiz-option-${this.currentQuestionIndex}-false`;
    falseInput.value = 'false';
    
    const falseLabel = document.createElement('label');
    falseLabel.htmlFor = falseInput.id;
    falseLabel.textContent = 'False';
    
    falseWrapper.appendChild(falseInput);
    falseWrapper.appendChild(falseLabel);
    
    // Add options to container
    optionsContainer.appendChild(trueWrapper);
    optionsContainer.appendChild(falseWrapper);
    container.appendChild(optionsContainer);
  }

  /**
   * Renders a fill-in-the-blank question
   * @param {HTMLElement} container - Container element
   * @param {Object} question - Question data
   */
  renderFillInTheBlank(container, question) {
    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'quiz-fill-blank';
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quiz-fill-input';
    input.id = `quiz-fill-${this.currentQuestionIndex}`;
    input.placeholder = question.placeholder || 'Type your answer here';
    
    // Add input to container
    inputContainer.appendChild(input);
    container.appendChild(inputContainer);
  }

  /**
   * Checks the current answer
   */
  checkCurrentAnswer() {
    try {
      const question = this.questions[this.currentQuestionIndex];
      const submitButton = document.getElementById('quiz-submit-btn');
      const nextButton = document.getElementById('quiz-next-btn');
      
      if (!question) {
        throw new Error('Question not found');
      }
      
      let userAnswer;
      let isCorrect = false;
      
      // Get user answer based on question type
      switch (question.type) {
        case 'multiple-choice':
          userAnswer = this.getSelectedRadioValue(`quiz-question-${this.currentQuestionIndex}`);
          isCorrect = this.checkMultipleChoiceAnswer(userAnswer, question);
          break;
        case 'true-false':
          userAnswer = this.getSelectedRadioValue(`quiz-question-${this.currentQuestionIndex}`);
          isCorrect = this.checkTrueFalseAnswer(userAnswer, question);
          break;
        case 'fill-in-the-blank':
          userAnswer = document.getElementById(`quiz-fill-${this.currentQuestionIndex}`)?.value || '';
          isCorrect = this.checkFillInTheBlankAnswer(userAnswer, question);
          break;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }
      
      // Update score if answer is correct
      if (isCorrect) {
        this.score++;
      }
      
      // Show feedback if enabled
      if (this.options.showFeedback) {
        this.showFeedback(isCorrect, question, userAnswer);
      }
      
      // Play sound feedback if enabled
      if (this.options.soundFeedback && typeof window.AudioPlayer !== 'undefined') {
        const soundFile = isCorrect ? 'correct.mp3' : 'incorrect.mp3';
        try {
          window.AudioPlayer.play(soundFile);
        } catch (error) {
          console.warn('Failed to play audio feedback:', error);
        }
      }
      
      // Hide submit button, show next button
      if (submitButton) submitButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'block';
      
      // If this is the last question, update next button text
      if (this.currentQuestionIndex === this.questions.length - 1) {
        if (nextButton) nextButton.textContent = 'Finish';
      }
      
    } catch (error) {
      console.error('Error checking answer:', error);
      this.showError('Failed to check answer. Please try again.');
    }
  }

  /**
   * Checks a multiple-choice answer
   * @param {string} userAnswer - User's answer
   * @param {Object} question - Question data
   * @returns {boolean} Whether the answer is correct
   */
  checkMultipleChoiceAnswer(userAnswer, question) {
    if (!userAnswer) return false;
    
    // Handle different correct answer formats
    const correctAnswer = question.correctAnswer || question.answer;
    
    if (Array.isArray(correctAnswer)) {
      // Multiple correct answers
      return correctAnswer.includes(userAnswer);
    } else {
      // Single correct answer
      return userAnswer === correctAnswer;
    }
  }

  /**
   * Checks a true/false answer
   * @param {string} userAnswer - User's answer
   * @param {Object} question - Question data
   * @returns {boolean} Whether the answer is correct
   */
  checkTrueFalseAnswer(userAnswer, question) {
    if (!userAnswer) return false;
    
    const correctAnswer = question.correctAnswer || question.answer;
    
    // Convert string 'true'/'false' to boolean if needed
    const userBool = userAnswer === 'true';
    const correctBool = typeof correctAnswer === 'string' ? correctAnswer === 'true' : Boolean(correctAnswer);
    
    return userBool === correctBool;
  }

  /**
   * Checks a fill-in-the-blank answer
   * @param {string} userAnswer - User's answer
   * @param {Object} question - Question data
   * @returns {boolean} Whether the answer is correct
   */
  checkFillInTheBlankAnswer(userAnswer, question) {
    if (!userAnswer) return false;
    
    const correctAnswer = question.correctAnswer || question.answer;
    
    // Case insensitive comparison by default
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    if (Array.isArray(correctAnswer)) {
      // Multiple possible correct answers
      return correctAnswer.some(answer => {
        const normalizedAnswer = String(answer).trim().toLowerCase();
        return normalizedUserAnswer === normalizedAnswer;
      });
    } else {
      // Single correct answer
      const normalizedCorrectAnswer = String(correctAnswer).trim().toLowerCase();
      return normalizedUserAnswer === normalizedCorrectAnswer;
    }
  }

  /**
   * Shows feedback for the current answer
   * @param {boolean} isCorrect - Whether the answer is correct
   * @param {Object} question - Question data
   * @param {string} userAnswer - User's answer
   */
  showFeedback(isCorrect, question, userAnswer) {
    const feedbackContainer = document.getElementById('quiz-feedback');
    if (!feedbackContainer) return;
    
    // Clear previous feedback
    feedbackContainer.innerHTML = '';
    
    // Set feedback class
    feedbackContainer.className = `feedback-container ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Create feedback message
    const feedbackMessage = document.createElement('p');
    
    if (isCorrect) {
      feedbackMessage.textContent = question.correctFeedback || 'Correct!';
    } else {
      // Get correct answer for display
      let correctAnswerText = '';
      const correctAnswer = question.correctAnswer || question.answer;
      
      if (Array.isArray(correctAnswer)) {
        correctAnswerText = correctAnswer.join(' or ');
      } else {
        correctAnswerText = String(correctAnswer);
      }
      
      feedbackMessage.textContent = question.incorrectFeedback || 
        `Incorrect. The correct answer is: ${correctAnswerText}`;
    }
    
    // Add feedback to container
    feedbackContainer.appendChild(feedbackMessage);
  }

  /**
   * Moves to the next question or finishes the quiz
   */
  nextQuestion() {
    // Increment question index
    this.currentQuestionIndex++;
    
    // Check if quiz is finished
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishQuiz();
    } else {
      // Render next question
      this.renderCurrentQuestion();
    }
  }

  /**
   * Finishes the quiz and shows the final score
   */
  finishQuiz() {
    try {
      // Clear question container
      const questionContainer = document.getElementById('quiz-question-container');
      const feedbackContainer = document.getElementById('quiz-feedback');
      const submitButton = document.getElementById('quiz-submit-btn');
      const nextButton = document.getElementById('quiz-next-btn');
      const scoreDisplay = document.getElementById('quiz-score');
      
      if (questionContainer) questionContainer.innerHTML = '';
      if (feedbackContainer) feedbackContainer.innerHTML = '';
      if (submitButton) submitButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      
      // Show final score if enabled
      if (this.options.showScore && scoreDisplay) {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        scoreDisplay.innerHTML = `
          <h2>Quiz Complete!</h2>
          <p>Your score: ${this.score} out of ${this.questions.length} (${percentage}%)</p>
        `;
        
        // Add retry button if enabled
        if (this.options.allowRetry) {
          const retryButton = document.createElement('button');
          retryButton.className = 'quiz-retry-btn';
          retryButton.textContent = 'Try Again';
          retryButton.addEventListener('click', () => this.resetQuiz());
          
          scoreDisplay.appendChild(retryButton);
        }
        
        scoreDisplay.style.display = 'block';
      }
      
      // Trigger completion event
      this.triggerEvent('quizComplete', {
        score: this.score,
        totalQuestions: this.questions.length,
        percentage: Math.round((this.score / this.questions.length) * 100)
      });
      
    } catch (error) {
      console.error('Error finishing quiz:', error);
      this.showError('Failed to complete quiz. Please check the console for details.');
    }
  }

  /**
   * Resets the quiz to start over
   */
  resetQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    
    // Shuffle questions if needed
    if (this.options.shuffleQuestions) {
      this.shuffleArray(this.questions);
    }
    
    // Render first question
    this.renderCurrentQuestion();
    
    // Reset score display
    const scoreDisplay = document.getElementById('quiz-score');
    if (scoreDisplay) scoreDisplay.style.display = 'none';
  }

  /**
   * Shows an error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'quiz-error';
    errorElement.textContent = message;
    
    // Clear container and show error
    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(errorElement);
    } else {
      console.error('Quiz error:', message);
    }
  }

  /**
   * Gets the value of the selected radio button
   * @param {string} name - Radio button group name
   * @returns {string|null} Selected value or null if none selected
   */
  getSelectedRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        return radios[i].value;
      }
    }
    return null;
  }

  /**
   * Shuffles an array in place
   * @param {Array} array - Array to shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Triggers a custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  triggerEvent(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.container.dispatchEvent(event);
    
    // Also trigger on document for global listeners
    document.dispatchEvent(new CustomEvent(`quiz:${eventName}`, { detail: data }));
  }
}

/**
 * Helper functions for the quiz engine
 */
export const quizUtils = {
  /**
   * Creates a multiple-choice question
   * @param {string} text - Question text
   * @param {Array} options - Answer options
   * @param {string|Array} correctAnswer - Correct answer(s)
   * @param {Object} additionalProps - Additional question properties
   * @returns {Object} Question object
   */
  createMultipleChoiceQuestion(text, options, correctAnswer, additionalProps = {}) {
    return {
      type: 'multiple-choice',
      text,
      options,
      correctAnswer,
      ...additionalProps
    };
  },
  
  /**
   * Creates a true/false question
   * @param {string} text - Question text
   * @param {boolean} correctAnswer - Correct answer
   * @param {Object} additionalProps - Additional question properties
   * @returns {Object} Question object
   */
  createTrueFalseQuestion(text, correctAnswer, additionalProps = {}) {
    return {
      type: 'true-false',
      text,
      correctAnswer,
      ...additionalProps
    };
  },
  
  /**
   * Creates a fill-in-the-blank question
   * @param {string} text - Question text
   * @param {string|Array} correctAnswer - Correct answer(s)
   * @param {string} placeholder - Input placeholder text
   * @param {Object} additionalProps - Additional question properties
   * @returns {Object} Question object
   */
  createFillInTheBlankQuestion(text, correctAnswer, placeholder = 'Type your answer', additionalProps = {}) {
    return {
      type: 'fill-in-the-blank',
      text,
      correctAnswer,
      placeholder,
      ...additionalProps
    };
  }
};