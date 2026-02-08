// Updated App.js - Add app header with CREDERE title
import React, { useState } from "react";
import "./App.css";
import { CREDIT_CARDS, GLOSSARY_TERMS, QUIZ_QUESTIONS } from "./data.js";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showLanding, setShowLanding] = useState(true);
  const [selectedBank, setSelectedBank] = useState("");

  // Extract unique banks from CREDIT_CARDS
  const canadianBanks = [
    ...new Set(CREDIT_CARDS.map((card) => card.issuer)),
  ].sort();

  const handleGoClick = () => {
    if (selectedBank) {
      setShowLanding(false);
    }
  };

  // Landing Page Component
  const LandingPage = () => {
    return (
      <div className="landing-page">
        <div className="landing-container">
          <h1 className="landing-title">CREDERE</h1>
          <div className="landing-form">
            <select
              className="bank-dropdown"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="">Select Your Bank</option>
              {canadianBanks.map((bank, idx) => (
                <option key={idx} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            <button
              className="btn-go"
              onClick={handleGoClick}
              disabled={!selectedBank}
            >
              Go
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If landing page should be shown, render only that
  if (showLanding) {
    return (
      <div className="app">
        <LandingPage />
      </div>
    );
  }

  // Otherwise render the main app with header
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">CREDERE</h1>
      </header>

      <nav className="nav-tabs">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button
          className={activeTab === "calculator" ? "active" : ""}
          onClick={() => setActiveTab("calculator")}
        >
          CPP Calculator
        </button>
        <button
          className={activeTab === "quiz" ? "active" : ""}
          onClick={() => setActiveTab("quiz")}
        >
          Find My Card
        </button>
        <button
          className={activeTab === "compare" ? "active" : ""}
          onClick={() => setActiveTab("compare")}
        >
          Compare Cards
        </button>
        <button
          className={activeTab === "learn" ? "active" : ""}
          onClick={() => setActiveTab("learn")}
        >
          Learn
        </button>
      </nav>

      <main className="content">
        {activeTab === "home" && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === "calculator" && <CPPCalculator />}
        {activeTab === "quiz" && <QuizPage />}
        {activeTab === "compare" && <ComparePage />}
        {activeTab === "learn" && <LearnPage />}
      </main>

      <footer className="footer">
        <p>No affiliate links • No hidden agendas • Built for transparency</p>
      </footer>
    </div>
  );
}

// HOME PAGE - with Greek columns background
function HomePage({ setActiveTab }) {
  return (
    <div className="home-page">
      <div className="greek-column left-column"></div>
      <div className="greek-column right-column"></div>

      <section className="hero">
        <h2>Choose your credit card with clarity</h2>
        <p className="hero-subtitle">
          Unbiased tools and transparent comparisons for young Canadians
        </p>

        <section className="action-cards">
          <div className="action-card" onClick={() => setActiveTab("quiz")}>
            <div className="card-icon">⊕</div>
            <h3>Find My Card</h3>
            <p>Answer 5 questions, get personalized recommendations</p>
          </div>

          <div className="action-card" onClick={() => setActiveTab("compare")}>
            <div className="card-icon">⊞</div>
            <h3>Compare All Cards</h3>
            <p>Browse and filter our complete database</p>
          </div>

          <div
            className="action-card"
            onClick={() => setActiveTab("calculator")}
          >
            <div className="card-icon">◈</div>
            <h3>Calculate Value</h3>
            <p>Find the true worth of your rewards points</p>
          </div>
        </section>
      </section>
    </div>
  );
}

// ... rest of the components remain exactly the same ...
// CPP CALCULATOR
function CPPCalculator() {
  const [pointsUsed, setPointsUsed] = useState("");
  const [cashValue, setCashValue] = useState("");
  const [cpp, setCpp] = useState(null);

  const calculateCPP = () => {
    const points = parseFloat(pointsUsed);
    const value = parseFloat(cashValue);
    if (points && value && points > 0) {
      const cppValue = (value / points) * 100;
      setCpp(cppValue.toFixed(2));
    }
  };

  const getValueRating = (cppValue) => {
    if (cppValue >= 2.0) return { text: "Excellent", class: "excellent" };
    if (cppValue >= 1.5) return { text: "Good", class: "good" };
    if (cppValue >= 1.0) return { text: "Fair", class: "fair" };
    return { text: "Poor", class: "poor" };
  };

  return (
    <div className="calculator-page">
      <div className="greek-column left-column"></div>
      <div className="greek-column right-column"></div>
      <h2>CPP (Cents Per Point) Calculator</h2>
      <p className="subtitle">
        Discover the true value of your credit card points or miles
      </p>

      <div className="calculator-card">
        <div className="input-group">
          <label htmlFor="points">Points/Miles Used</label>
          <input
            id="points"
            type="number"
            placeholder="e.g., 25000"
            value={pointsUsed}
            onChange={(e) => setPointsUsed(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="cash">Cash Value Received ($)</label>
          <input
            id="cash"
            type="number"
            placeholder="e.g., 500"
            value={cashValue}
            onChange={(e) => setCashValue(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={calculateCPP}>
          Calculate CPP
        </button>

        {cpp !== null && (
          <div className="result">
            <h3>Your CPP: {cpp}¢</h3>
            <p
              className={`value-rating ${
                getValueRating(parseFloat(cpp)).class
              }`}
            >
              {getValueRating(parseFloat(cpp)).text} Value
            </p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>How to Use This Calculator</h3>
        <ol>
          <li>
            <strong>Find a redemption:</strong> Look up what you can redeem
            points for (flights, hotels, gift cards, cashback, etc.)
          </li>
          <li>
            <strong>Enter the numbers:</strong> Input how many points it costs
            and the equivalent cash value
          </li>
          <li>
            <strong>Calculate:</strong> See your CPP and whether it's a good
            deal
          </li>
        </ol>

        <div className="example-box">
          <h4>Example</h4>
          <p>
            You want to book a flight that costs either 25,000 points OR $500
            cash.
          </p>
          <p>
            → Enter 25,000 points and $500 cash value
            <br />→ Result: 2.0 CPP (Excellent value!)
          </p>
        </div>

        <div className="benchmark-box">
          <h4>CPP Benchmarks</h4>
          <ul>
            <li>
              <strong>≥2.0 CPP:</strong> Excellent - This is a great redemption
            </li>
            <li>
              <strong>1.5-2.0 CPP:</strong> Good - Above average value
            </li>
            <li>
              <strong>1.0-1.5 CPP:</strong> Fair - Decent but not optimal
            </li>
            <li>
              <strong>&lt;1.0 CPP:</strong> Poor - You're losing value
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// QUIZ PAGE
function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value) => {
    const question = QUIZ_QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: value });

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const getRecommendations = () => {
    const spending = answers["1"];
    const category = answers["2"];
    const balance = answers["3"];
    const travel = answers["4"];
    const income = answers["5"];

    let recommendations = CREDIT_CARDS.map((card) => {
      let score = 0;
      let reasons = [];

      const incomeValue = {
        student: 10000,
        entry: 30000,
        mid: 60000,
        high: 100000,
      };
      if (card.minIncome <= incomeValue[income]) {
        score += 10;
        reasons.push("You meet the income requirement");
      }

      if (spending === "low" && card.annualFee === 0) {
        score += 8;
        reasons.push("No annual fee - great for starter cards");
      }

      if (
        (travel === "multiple" || travel === "frequent") &&
        card.category === "travel"
      ) {
        score += 7;
        reasons.push("Travel rewards aligned with your spending");
      }

      if (
        (travel === "multiple" || travel === "frequent") &&
        card.foreignFee === 0
      ) {
        score += 5;
        reasons.push("No foreign transaction fees");
      }

      if (income === "student" && card.studentFriendly) {
        score += 6;
        reasons.push("Student-friendly requirements");
      }

      if (card.typicalCPP >= 1.8) {
        score += 4;
        reasons.push(`High points value (${card.typicalCPP} CPP)`);
      }

      return { card, score, reasons };
    });

    return recommendations
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  if (showResults) {
    const recommendations = getRecommendations();
    return (
      <div className="results-page">
        <h2>Your Personalized Recommendations</h2>
        <p className="subtitle">
          Based on your answers, here are your best matches:
        </p>

        {recommendations.map((rec, idx) => (
          <div key={rec.card.id} className="recommendation-card">
            <div className="rec-header">
              <span className="rec-rank">#{idx + 1}</span>
              <h3>{rec.card.name}</h3>
              <span
                className={`tier-badge tier-${rec.card.tier.toLowerCase()}`}
              >
                {rec.card.tier}
              </span>
            </div>

            <div className="rec-reasons">
              <h4>Why this card?</h4>
              <ul>
                {rec.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="rec-details">
              <div>
                <strong>Annual Fee:</strong> {rec.card.annualFee}
              </div>
              <div>
                <strong>Earn Rate:</strong> {rec.card.earnRate}
              </div>
              <div>
                <strong>Welcome Bonus:</strong> {rec.card.welcomeBonus}
              </div>
              <div>
                <strong>Typical CPP:</strong> {rec.card.typicalCPP}
              </div>
            </div>
          </div>
        ))}

        <button className="btn-secondary" onClick={resetQuiz}>
          Retake Quiz
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="quiz-page">
      <div className="greek-column left-column"></div>
      <div className="greek-column right-column"></div>
      <h2>Find Your Perfect Card</h2>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">
        Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
      </p>

      <div className="question-card">
        <h3>{question.question}</h3>
        <div className="options-grid">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className="option-button"
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {currentQuestion > 0 && (
        <button
          className="btn-back"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          ← Back
        </button>
      )}
    </div>
  );
}

// COMPARE PAGE
function ComparePage() {
  const [leftCard, setLeftCard] = useState(null);
  const [rightCard, setRightCard] = useState(null);

  const ComparisonColumn = ({ card, setCard, side }) => {
    const [isSelecting, setIsSelecting] = useState(false);

    if (!card) {
      return (
        <div className="comparison-column empty">
          <button
            className="select-card-btn"
            onClick={() => setIsSelecting(true)}
          >
            Select a card
          </button>

          {isSelecting && (
            <div
              className="card-selector-overlay"
              onClick={() => setIsSelecting(false)}
            >
              <div
                className="card-selector"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Choose a card</h3>
                <div className="card-list">
                  {CREDIT_CARDS.map((c) => (
                    <button
                      key={c.id}
                      className="card-option"
                      onClick={() => {
                        setCard(c);
                        setIsSelecting(false);
                      }}
                    >
                      <div className="card-option-name">{c.name}</div>
                      <div className="card-option-issuer">{c.issuer}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="comparison-column filled">
        <div className="card-header">
          <h3>{card.name}</h3>
          <button
            className="change-card-btn"
            onClick={() => setIsSelecting(true)}
          >
            Change
          </button>
        </div>

        <div className="card-specs">
          <div className="spec-group">
            <div className="spec-label">Tier</div>
            <div className="spec-value">
              <span className={`tier-badge tier-${card.tier.toLowerCase()}`}>
                {card.tier}
              </span>
            </div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Annual Fee</div>
            <div className="spec-value">{card.annualFee}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Earn Rate</div>
            <div className="spec-value">{card.earnRate}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Welcome Bonus</div>
            <div className="spec-value">{card.welcomeBonus}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Typical CPP</div>
            <div className="spec-value">{card.typicalCPP}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Min Income</div>
            <div className="spec-value">${card.minIncome.toLocaleString()}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Foreign Fee</div>
            <div className="spec-value">{card.foreignFee}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Category</div>
            <div className="spec-value">{card.category}</div>
          </div>

          <div className="spec-group">
            <div className="spec-label">Student Friendly</div>
            <div className="spec-value">
              {card.studentFriendly ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {isSelecting && (
          <div
            className="card-selector-overlay"
            onClick={() => setIsSelecting(false)}
          >
            <div className="card-selector" onClick={(e) => e.stopPropagation()}>
              <h3>Choose a card</h3>
              <div className="card-list">
                {CREDIT_CARDS.map((c) => (
                  <button
                    key={c.id}
                    className="card-option"
                    onClick={() => {
                      setCard(c);
                      setIsSelecting(false);
                    }}
                  >
                    <div className="card-option-name">{c.name}</div>
                    <div className="card-option-issuer">{c.issuer}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="compare-page">
      <div className="greek-column left-column"></div>
      <div className="greek-column right-column"></div>
      <h2>Compare Cards</h2>
      <p className="subtitle">Side-by-side comparison</p>

      <div className="comparison-grid">
        <ComparisonColumn card={leftCard} setCard={setLeftCard} side="left" />
        <ComparisonColumn
          card={rightCard}
          setCard={setRightCard}
          side="right"
        />
      </div>
    </div>
  );
}

// LEARN PAGE
function LearnPage() {
  const [expandedTerm, setExpandedTerm] = useState(null);

  return (
    <div className="learn-page">
      <div className="greek-column left-column"></div>
      <div className="greek-column right-column"></div>
      <h2>Credit Card Glossary</h2>
      <p className="subtitle">
        Understand the terminology that matters for your financial decisions
      </p>

      <div className="glossary-list">
        {GLOSSARY_TERMS.map((item, idx) => (
          <div key={idx} className="glossary-item">
            <div
              className="glossary-header"
              onClick={() => setExpandedTerm(expandedTerm === idx ? null : idx)}
            >
              <h3>{item.term}</h3>
              <span className="expand-icon">
                {expandedTerm === idx ? "−" : "+"}
              </span>
            </div>

            {expandedTerm === idx && (
              <div className="glossary-content">
                <p>
                  <strong>Definition:</strong> {item.definition}
                </p>

                <div className="why-matters">
                  <strong>Why This Matters</strong>
                  <p>{item.whyMatters}</p>
                </div>

                <div className="example">
                  <strong>Example</strong>
                  <p>{item.example}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="research-section">
        <h3>Why Financial Literacy Matters</h3>
        <p>
          Research shows that financial stress affects mental health, career
          decisions, and life satisfaction. Understanding credit cards is a
          foundational step toward financial empowerment.
        </p>
        <ul>
          <li>
            68% of Canadian adults don't fully understand how credit card
            interest compounds
          </li>
          <li>
            Young adults (18-25) are most vulnerable to high-interest debt due
            to lack of education
          </li>
          <li>
            Behavioral economics shows we're biased by large point numbers
            ("50,000 points!") without understanding real value
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
