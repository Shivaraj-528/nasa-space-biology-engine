import { useState } from 'react';

function Quiz({ isOpen, onClose, userRole }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateQuestions = (role) => {
    const baseQuestions = [
      {
        id: 1,
        question: "What happens to plant growth in microgravity?",
        options: [
          "Plants grow normally",
          "Plants cannot grow at all",
          "Plants show altered root growth patterns and gene expression",
          "Plants grow faster than on Earth"
        ],
        correct: 2,
        explanation: "In microgravity, plants exhibit fascinating adaptations including altered root growth patterns (roots don't grow downward), changes in gene expression, modified cell wall composition, and different gravitropic responses. This research helps us understand how to grow food during long-duration space missions."
      },
      {
        id: 2,
        question: "Which physiological change is most common in astronauts during spaceflight?",
        options: [
          "Increased bone density",
          "Bone density loss and muscle atrophy",
          "Enhanced immune system",
          "Improved cardiovascular function"
        ],
        correct: 1,
        explanation: "Astronauts experience significant bone density loss (1-2% per month) and muscle atrophy due to the lack of gravitational loading. This is why exercise protocols and countermeasures are crucial for long-duration missions."
      },
      {
        id: 3,
        question: "What is NASA's GeneLab database primarily used for?",
        options: [
          "Storing astronaut personal information",
          "Managing spacecraft data",
          "Storing and analyzing biological data from space experiments",
          "Tracking mission schedules"
        ],
        correct: 2,
        explanation: "GeneLab is NASA's open science data repository that stores omics data (genomics, transcriptomics, proteomics, metabolomics) from spaceflight and ground-based experiments. It enables researchers worldwide to study how spaceflight affects living systems."
      }
    ];

    const advancedQuestions = [
      {
        id: 4,
        question: "Which cellular process is most affected by cosmic radiation in space?",
        options: [
          "Protein synthesis",
          "DNA repair mechanisms",
          "Cellular respiration",
          "Membrane transport"
        ],
        correct: 1,
        explanation: "Cosmic radiation primarily affects DNA repair mechanisms, leading to increased DNA damage and potential mutations. Understanding these effects is crucial for protecting astronauts during long-duration missions and developing appropriate countermeasures."
      },
      {
        id: 5,
        question: "What is the primary challenge for plant cultivation in closed-loop life support systems?",
        options: [
          "Lack of sunlight",
          "Managing atmospheric composition and waste recycling",
          "Plant diseases",
          "Seed storage"
        ],
        correct: 1,
        explanation: "In closed-loop systems, managing atmospheric composition (CO2/O2 balance), nutrient recycling, waste processing, and maintaining proper environmental conditions while maximizing crop yield per unit volume is the primary challenge for sustainable food production in space."
      }
    ];

    if (role === 'scientist') {
      return [...baseQuestions, ...advancedQuestions];
    } else if (role === 'teacher') {
      return [...baseQuestions, advancedQuestions[0]];
    } else {
      return baseQuestions;
    }
  };

  const [questions] = useState(() => generateQuestions(userRole));

  const handleAnswer = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setLoading(true);
    setTimeout(() => {
      setShowResults(true);
      setLoading(false);
    }, 1000);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="quiz-container">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <h2>Analyzing your answers...</h2>
            <p>Generating personalized feedback</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="modal-overlay">
        <div className="quiz-container">
          <div className="quiz-header">
            <h2>🎯 Quiz Results</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="results-summary">
            <div className="score-circle">
              <span className="score-percentage">{score.percentage}%</span>
              <span className="score-text">{score.correct}/{score.total} Correct</span>
            </div>
            <h3>{score.percentage >= 80 ? '🎉 Excellent!' : score.percentage >= 60 ? '👍 Good Job!' : '📚 Keep Learning!'}</h3>
          </div>

          <div className="results-details">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correct;
              
              return (
                <div key={question.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-header">
                    <span className="result-icon">{isCorrect ? '✅' : '❌'}</span>
                    <h4>Question {index + 1}</h4>
                  </div>
                  <p className="result-question">{question.question}</p>
                  
                  {!isCorrect && (
                    <div className="result-feedback">
                      <p><strong>Your answer:</strong> {question.options[userAnswer]}</p>
                      <p><strong>Correct answer:</strong> {question.options[question.correct]}</p>
                      <div className="explanation">
                        <strong>Explanation:</strong>
                        <p>{question.explanation}</p>
                      </div>
                    </div>
                  )}
                  
                  {isCorrect && (
                    <div className="correct-feedback">
                      <p><strong>Correct!</strong> {question.options[question.correct]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button onClick={resetQuiz} className="retake-btn">🔄 Retake Quiz</button>
            <button onClick={onClose} className="close-results-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="modal-overlay">
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>🧠 Space Biology Quiz</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">Question {currentQuestion + 1} of {questions.length}</span>
        </div>

        <div className="quiz-content">
          <h3 className="question-text">{question.question}</h3>
          
          <div className="options-list">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="quiz-actions">
            <button 
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === undefined}
              className="next-btn"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;