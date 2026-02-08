import React, { useState } from "react";
import "./App.css";
import { CREDIT_CARDS, GLOSSARY_TERMS, QUIZ_QUESTIONS } from "./data.js";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="app">
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
        <p>
          Built with 💙 for financial literacy • Unbiased • Educational • Open
          Source
        </p>
        <p className="disclaimer">
          Not financial advice. Always do your own research. Card terms subject
          to change.
        </p>
      </footer>
    </div>
  );
}

// HOME PAGE
function HomePage({ setActiveTab }) {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Choose your credit card with clarity</h2>
        <p className="hero-subtitle">
          Unbiased tools and transparent comparisons for young Canadians
        </p>
      </section>

      <section className="action-cards">
        <div className="action-card primary" onClick={() => setActiveTab("quiz")}>
          <div className="card-icon">→</div>
          <h3>Find My Card</h3>
          <p>Answer 5 questions, get personalized recommendations</p>
        </div>

        <div className="action-card" onClick={() => setActiveTab("compare")}>
          <div className="card-icon">⊞</div>
          <h3>Compare All Cards</h3>
          <p>Browse and filter our complete database</p>
        </div>

        <div className="action-card" onClick={() => setActiveTab("calculator")}>
          <div className="card-icon">∑</div>
          <h3>Calculate Value</h3>
          <p>Find the true worth of your rewards points</p>
        </div>
      </section>

      <section className="value-prop">
        <p>No affiliate links • No hidden agendas • Built for transparency</p>
      </section>
    </div>
  );
}

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
            <p className={`value-rating ${getValueRating(parseFloat(cpp)).class}`}>
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
          <h4>Example:</h4>
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
          <h4>CPP Benchmarks:</h4>
          <ul>
            <li>
              <strong>2.0+ CPP:</strong> Excellent - This is a great redemption
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
    const spending = answers[1];
    const category = answers[2];
    const balance = answers[3];
    const travel = answers[4];
    const income = answers[5];

    let recommendations = CREDIT_CARDS.map((card) => {
      let score = 0;
      let reasons = [];

      // Income match
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

      // No annual fee preference for lower spending
      if (spending === "low" && card.annualFee === 0) {
        score += 8;
        reasons.push("No annual fee - great for starter cards");
      }

      // Travel category match
      if (
        (travel === "multiple" || travel === "frequent") &&
        card.category === "travel"
      ) {
        score += 7;
        reasons.push("Travel rewards aligned with your spending");
      }

      // Foreign fee for travelers
      if (
        (travel === "multiple" || travel === "frequent") &&
        card.foreignFee === 0
      ) {
        score += 5;
        reasons.push("No foreign transaction fees");
      }

      // Student friendly
      if (income === "student" && card.studentFriendly) {
        score += 6;
        reasons.push("Student-friendly requirements");
      }

      // High CPP value
      if (card.typicalCPP >= 1.8) {
        score += 4;
        reasons.push("High points value (CPP)");
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
        <p className="subtitle">Based on your answers, here are your best matches:</p>

        {recommendations.map((rec, idx) => (
          <div key={rec.card.id} className="recommendation-card">
            <div className="rec-header">
              <span className="rec-rank">#{idx + 1}</span>
              <h3>{rec.card.name}</h3>
              <span className={`tier-badge tier-${rec.card.tier.toLowerCase()}`}>
                {rec.card.tier}
              </span>
            </div>

            <div className="rec-reasons">
              <h4>Why this card:</h4>
              <ul>
                {rec.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="rec-details">
              <div>
                <strong>Annual Fee:</strong> ${rec.card.annualFee}
              </div>
              <div>
                <strong>Earn Rate:</strong> {rec.card.earnRate}
              </div>
              <div>
                <strong>Welcome Bonus:</strong> {rec.card.welcomeBonus}
              </div>
              <div>
                <strong>Typical CPP:</strong> {rec.card.typicalCPP}¢
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
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("tier");

  const filteredCards = CREDIT_CARDS.filter((card) => {
    if (filter === "all") return true;
    if (filter === "no-fee") return card.annualFee === 0;
    if (filter === "student") return card.studentFriendly;
    if (filter === "travel") return card.category === "travel";
    if (filter === "cashback") return card.category === "cashback";
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === "tier") {
      const tierOrder = { S: 0, A: 1, B: 2, C: 3 };
      return tierOrder[a.tier] - tierOrder[b.tier];
    }
    if (sortBy === "fee") return a.annualFee - b.annualFee;
    if (sortBy === "cpp") return b.typicalCPP - a.typicalCPP;
    return 0;
  });

  return (
    <div className="compare-page">
      <h2>Compare Credit Cards</h2>
      <p className="subtitle">
        Unbiased comparison of popular Canadian cards for young adults
      </p>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Cards</option>
            <option value="no-fee">No Annual Fee</option>
            <option value="student">Student-Friendly</option>
            <option value="travel">Travel Rewards</option>
            <option value="cashback">Cashback</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="tier">Tier Rating</option>
            <option value="fee">Annual Fee</option>
            <option value="cpp">CPP Value</option>
          </select>
        </div>
      </div>

      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Card</th>
              <th>Tier</th>
              <th>Annual Fee</th>
              <th>Earn Rate</th>
              <th>Welcome Bonus</th>
              <th>Typical CPP</th>
              <th>Min Income</th>
              <th>Foreign Fee</th>
            </tr>
          </thead>
          <tbody>
            {sortedCards.map((card) => (
              <tr key={card.id}>
                <td>
                  <strong>{card.name}</strong>
                  <br />
                  <small>{card.issuer}</small>
                </td>
                <td>
                  <span
                    className={`tier-badge tier-${card.tier.toLowerCase()}`}
                  >
                    {card.tier}
                  </span>
                </td>
                <td>${card.annualFee}</td>
                <td>{card.earnRate}</td>
                <td>{card.welcomeBonus}</td>
                <td>
                  <strong>{card.typicalCPP}¢</strong>
                </td>
                <td>${card.minIncome.toLocaleString()}</td>
                <td>{card.foreignFee}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tier-legend">
        <h3>Tier System Explained</h3>
        <div className="tier-grid">
          <div className="tier-item">
            <span className="tier-badge tier-s">S</span>
            <p>
              <strong>Elite:</strong> Best overall value, premium benefits, high
              earn potential
            </p>
          </div>
          <div className="tier-item">
            <span className="tier-badge tier-a">A</span>
            <p>
              <strong>Excellent:</strong> Strong rewards, good for specific
              spending categories
            </p>
          </div>
          <div className="tier-item">
            <span className="tier-badge tier-b">B</span>
            <p>
              <strong>Good:</strong> Solid starter cards, no frills but reliable
            </p>
          </div>
          <div className="tier-item">
            <span className="tier-badge tier-c">C</span>
            <p>
              <strong>Basic:</strong> Simple options, limited rewards but easy
              approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// LEARN PAGE
function LearnPage() {
  const [expandedTerm, setExpandedTerm] = useState(null);

  return (
    <div className="learn-page">
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
                  <strong>💡 Why This Matters:</strong>
                  <p>{item.whyMatters}</p>
                </div>
                <div className="example">
                  <strong>📌 Example:</strong>
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
