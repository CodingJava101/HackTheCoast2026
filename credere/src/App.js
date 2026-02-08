import React, { useState } from "react";
import "./App.css";

// Sample data - in production, move to separate JSON files
const CREDIT_CARDS = [
  {
    id: 1,
    name: "Scotiabank Scene+ Visa",
    issuer: "Scotiabank",
    annualFee: 0,
    earnRate: "5% on groceries, dining, entertainment",
    welcomeBonus: "10,000 points",
    minIncome: 12000,
    tier: "A",
    category: "cashback",
    studentFriendly: true,
    typicalCPP: 1.0,
    foreignFee: 2.5,
  },
  {
    id: 2,
    name: "TD Aeroplan Visa Infinite",
    issuer: "TD",
    annualFee: 139,
    earnRate: "1.5x Aeroplan per $1",
    welcomeBonus: "50,000 Aeroplan points",
    minIncome: 60000,
    tier: "S",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 2.0,
    foreignFee: 0,
  },
  {
    id: 3,
    name: "Tangerine Money-Back",
    issuer: "Tangerine",
    annualFee: 0,
    earnRate: "2% on 3 categories, 0.5% other",
    welcomeBonus: "$50 cashback",
    minIncome: 0,
    tier: "B",
    category: "cashback",
    studentFriendly: true,
    typicalCPP: 1.0,
    foreignFee: 2.5,
  },
  {
    id: 4,
    name: "RBC Avion Visa Infinite",
    issuer: "RBC",
    annualFee: 120,
    earnRate: "1 RBC Rewards per $1",
    welcomeBonus: "35,000 points",
    minIncome: 60000,
    tier: "A",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 1.5,
    foreignFee: 2.5,
  },
  {
    id: 5,
    name: "CIBC Dividend Visa",
    issuer: "CIBC",
    annualFee: 0,
    earnRate: "1% on all purchases",
    welcomeBonus: "None",
    minIncome: 15000,
    tier: "C",
    category: "cashback",
    studentFriendly: true,
    typicalCPP: 1.0,
    foreignFee: 2.5,
  },
];

const GLOSSARY_TERMS = [
  {
    term: "CPP (Cents Per Point)",
    definition:
      "The actual cash value of each rewards point. Calculated as (Cash Value ÷ Points Used) × 100.",
    whyMatters:
      "A redemption worth 2 CPP gives you twice the value compared to 1 CPP. This helps you maximize rewards.",
    example:
      "If you redeem 25,000 points for a $500 flight, that's 2 CPP - excellent value!",
  },
  {
    term: "Annual Fee",
    definition:
      "A yearly charge for having the credit card, ranging from $0 to $500+.",
    whyMatters:
      "You need to earn enough rewards to offset this cost. A $120 fee means you need $120+ in rewards to break even.",
    example:
      "If a card has a $95 fee but you earn $300 in rewards yearly, your net benefit is $205.",
  },
  {
    term: "APR (Annual Percentage Rate)",
    definition: "The yearly interest rate charged on unpaid balances.",
    whyMatters:
      "If you carry a balance, high APR (19-29%) can quickly erase any rewards earned. Always pay in full if possible.",
    example: "A $1,000 balance at 20% APR costs you $200 per year in interest.",
  },
  {
    term: "Welcome Bonus",
    definition:
      "A one-time reward for new cardholders who meet minimum spending requirements within 3-6 months.",
    whyMatters:
      "This can provide $300-800+ in value, but only if you can hit the spending requirement naturally.",
    example:
      "Earn 50,000 points after spending $3,000 in 3 months (worth $500-1,000 depending on redemption).",
  },
  {
    term: "Foreign Transaction Fee",
    definition:
      "A fee (typically 2.5%) charged when you make purchases in foreign currency.",
    whyMatters:
      "Adds up quickly when traveling. A $1,000 trip costs an extra $25 with this fee.",
    example:
      "Travel cards often waive this fee, saving frequent travelers hundreds per year.",
  },
  {
    term: "Minimum Spend Requirement",
    definition:
      "The amount you must spend within a set period to earn a welcome bonus.",
    whyMatters:
      "Never overspend just to hit this target - only apply if it matches your natural spending.",
    example: "Spend $3,000 in 90 days to earn the bonus. That's $1,000/month.",
  },
  {
    term: "Grace Period",
    definition:
      "The interest-free period (usually 21 days) between your statement date and payment due date.",
    whyMatters:
      "Pay your full balance by the due date to avoid any interest charges.",
    example:
      "Statement closes Jan 1, payment due Jan 21. Pay in full by Jan 21 = no interest.",
  },
  {
    term: "Credit Utilization",
    definition:
      "The percentage of your available credit that you're using. Keep it below 30% for best credit score.",
    whyMatters:
      "Using $900 of a $1,000 limit (90%) hurts your score. Using $300 (30%) is healthy.",
    example:
      "If your limit is $2,000, keep your balance below $600 to maintain good credit health.",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your average monthly spending?",
    options: [
      { value: "low", label: "Under $500" },
      { value: "medium", label: "$500 - $2,000" },
      { value: "high", label: "$2,000 - $5,000" },
      { value: "very-high", label: "Over $5,000" },
    ],
  },
  {
    id: 2,
    question: "Where do you spend the most?",
    options: [
      { value: "groceries", label: "Groceries & Dining" },
      { value: "gas", label: "Gas & Transportation" },
      { value: "travel", label: "Travel & Hotels" },
      { value: "online", label: "Online Shopping" },
      { value: "mixed", label: "Pretty evenly spread" },
    ],
  },
  {
    id: 3,
    question: "Do you carry a balance month-to-month?",
    options: [
      { value: "never", label: "No, I always pay in full" },
      { value: "sometimes", label: "Sometimes" },
      { value: "usually", label: "Yes, usually" },
    ],
  },
  {
    id: 4,
    question: "How often do you travel internationally?",
    options: [
      { value: "never", label: "Never or rarely" },
      { value: "once", label: "Once a year" },
      { value: "multiple", label: "2-3 times per year" },
      { value: "frequent", label: "4+ times per year" },
    ],
  },
  {
    id: 5,
    question: "What's your current annual income?",
    options: [
      { value: "student", label: "Under $15,000 (student/part-time)" },
      { value: "entry", label: "$15,000 - $40,000" },
      { value: "mid", label: "$40,000 - $80,000" },
      { value: "high", label: "$80,000+" },
    ],
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="app">
      <header className="header">
        <h1>💳 CardSmart</h1>
        <p className="tagline">
          Unbiased credit card transparency for young Canadians
        </p>
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
        <p>
          Built with 💙 for financial literacy • Unbiased • Educational • Open
          Source
        </p>
        <p className="disclaimer">
          Not affiliated with any bank. Always verify terms with card issuers.
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
        <h2>Stop guessing. Start maximizing.</h2>
        <p className="hero-text">
          As a 19-year-old, choosing your first credit card shouldn't feel
          overwhelming. We cut through the marketing noise to show you real
          value, unbiased comparisons, and what those "50,000 points!" actually
          mean in dollars.
        </p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => setActiveTab("quiz")}>
            Find My Perfect Card
          </button>
          <button
            className="btn-secondary"
            onClick={() => setActiveTab("calculator")}
          >
            Calculate Points Value
          </button>
        </div>
      </section>

      <section className="why-section">
        <h3>Why CardSmart?</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="icon">🎯</span>
            <h4>No Affiliate Bias</h4>
            <p>
              We don't get paid by banks. Our recommendations are based purely
              on value.
            </p>
          </div>
          <div className="feature-card">
            <span className="icon">🧮</span>
            <h4>CPP Calculator</h4>
            <p>
              Know exactly what your points are worth - not what marketing
              claims.
            </p>
          </div>
          <div className="feature-card">
            <span className="icon">📚</span>
            <h4>Learn as You Go</h4>
            <p>
              Understand APR, annual fees, and why they matter for your
              finances.
            </p>
          </div>
          <div className="feature-card">
            <span className="icon">⚖️</span>
            <h4>Side-by-Side Compare</h4>
            <p>
              See tier rankings and real value for cards that match your
              spending.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <h3>The Problem We're Solving</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-number">68%</span>
            <p>of adults don't understand credit card interest</p>
          </div>
          <div className="stat">
            <span className="stat-number">$5,700</span>
            <p>average Canadian credit card debt</p>
          </div>
          <div className="stat">
            <span className="stat-number">0.5¢</span>
            <p>value of poorly redeemed points (vs 2¢+ optimal)</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// CPP CALCULATOR
function CPPCalculator() {
  const [cashValue, setCashValue] = useState("");
  const [pointsUsed, setPointsUsed] = useState("");
  const [annualFee, setAnnualFee] = useState("");
  const [cpp, setCpp] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);

  const calculateCPP = () => {
    if (!cashValue || !pointsUsed) return;

    const cppValue = (parseFloat(cashValue) / parseFloat(pointsUsed)) * 100;
    setCpp(cppValue.toFixed(2));
  };

  const getRating = (cppValue) => {
    if (cppValue >= 2.0)
      return { text: "Excellent", color: "#10b981", emoji: "🌟" };
    if (cppValue >= 1.5) return { text: "Good", color: "#3b82f6", emoji: "👍" };
    if (cppValue >= 1.0) return { text: "Fair", color: "#f59e0b", emoji: "👌" };
    return { text: "Poor", color: "#ef4444", emoji: "⚠️" };
  };

  const saveCalculation = () => {
    if (!cpp) return;
    const calc = {
      cashValue: parseFloat(cashValue),
      pointsUsed: parseFloat(pointsUsed),
      cpp: parseFloat(cpp),
      annualFee: annualFee ? parseFloat(annualFee) : 0,
      timestamp: new Date().toLocaleString(),
    };
    setSavedCalculations([...savedCalculations, calc]);
  };

  return (
    <div className="calculator-page">
      <h2>CPP (Cents Per Point) Calculator</h2>
      <p className="subtitle">
        Find out the real cash value of your rewards redemption
      </p>

      <div className="calculator-container">
        <div className="calculator-form">
          <div className="form-group">
            <label>Cash Value of Reward ($)</label>
            <input
              type="number"
              placeholder="e.g., 500"
              value={cashValue}
              onChange={(e) => setCashValue(e.target.value)}
            />
            <small>
              What would this cost in cash? (flight, hotel, product)
            </small>
          </div>

          <div className="form-group">
            <label>Points Required</label>
            <input
              type="number"
              placeholder="e.g., 25000"
              value={pointsUsed}
              onChange={(e) => setPointsUsed(e.target.value)}
            />
            <small>How many points does this redemption cost?</small>
          </div>

          <div className="form-group">
            <label>Annual Fee (Optional)</label>
            <input
              type="number"
              placeholder="e.g., 120"
              value={annualFee}
              onChange={(e) => setAnnualFee(e.target.value)}
            />
            <small>Annual card fee (for net value calculation)</small>
          </div>

          <button className="btn-primary" onClick={calculateCPP}>
            Calculate CPP
          </button>
        </div>

        {cpp && (
          <div className="result-card">
            <h3>Your CPP Result</h3>
            <div className="cpp-result" style={{ color: getRating(cpp).color }}>
              <span className="cpp-value">{cpp}¢</span>
              <span className="cpp-emoji">{getRating(cpp).emoji}</span>
            </div>
            <div
              className="rating-badge"
              style={{ backgroundColor: getRating(cpp).color }}
            >
              {getRating(cpp).text}
            </div>

            <div className="result-details">
              <p>
                You're getting <strong>{cpp} cents of value</strong> per point
              </p>
              <p>
                Total value: <strong>${cashValue}</strong> for{" "}
                <strong>{Number(pointsUsed).toLocaleString()}</strong> points
              </p>
              {annualFee && (
                <p className="net-value">
                  Net value after ${annualFee} annual fee:
                  <strong>
                    {" "}
                    $
                    {(parseFloat(cashValue) - parseFloat(annualFee)).toFixed(2)}
                  </strong>
                </p>
              )}
            </div>

            <button className="btn-secondary" onClick={saveCalculation}>
              Save & Compare
            </button>
          </div>
        )}
      </div>

      {savedCalculations.length > 0 && (
        <div className="saved-calculations">
          <h3>Saved Comparisons</h3>
          <table>
            <thead>
              <tr>
                <th>Cash Value</th>
                <th>Points</th>
                <th>CPP</th>
                <th>Rating</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {savedCalculations.map((calc, idx) => (
                <tr key={idx}>
                  <td>${calc.cashValue}</td>
                  <td>{calc.pointsUsed.toLocaleString()}</td>
                  <td>{calc.cpp}¢</td>
                  <td style={{ color: getRating(calc.cpp).color }}>
                    {getRating(calc.cpp).text}
                  </td>
                  <td>{calc.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="info-box">
        <h4>💡 Quick CPP Guide</h4>
        <ul>
          <li>
            <strong>2.0+ CPP:</strong> Excellent redemption (business/first
            class flights, luxury hotels)
          </li>
          <li>
            <strong>1.5-2.0 CPP:</strong> Good value (economy flights, mid-tier
            hotels)
          </li>
          <li>
            <strong>1.0-1.5 CPP:</strong> Fair (gift cards, statement credits)
          </li>
          <li>
            <strong>Under 1.0 CPP:</strong> Poor - you'd be better off with
            cashback
          </li>
        </ul>
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
    const newAnswers = {
      ...answers,
      [QUIZ_QUESTIONS[currentQuestion].id]: value,
    };
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getRecommendations = () => {
    const spending = answers[1];
    const spendCategory = answers[2];
    const carriesBalance = answers[3];
    const travel = answers[4];
    const income = answers[5];

    let recommendations = [];

    // Logic for recommendations based on quiz answers
    if (carriesBalance === "usually" || carriesBalance === "sometimes") {
      // Low APR more important than rewards
      recommendations.push({
        card: CREDIT_CARDS[2], // Tangerine
        reason:
          "No annual fee and simple cashback. Focus on paying down balance before chasing rewards.",
        priority: 1,
      });
    } else if (income === "student" || income === "entry") {
      // Student-friendly cards
      const studentCards = CREDIT_CARDS.filter((c) => c.studentFriendly);
      recommendations.push({
        card: studentCards[0],
        reason:
          "No annual fee, low income requirements, and solid earn rates for your spending level.",
        priority: 1,
      });
    } else if (travel === "multiple" || travel === "frequent") {
      // Travel cards
      const travelCards = CREDIT_CARDS.filter((c) => c.category === "travel");
      recommendations.push({
        card: travelCards[0],
        reason:
          "High CPP on travel redemptions, no foreign transaction fees, excellent welcome bonus.",
        priority: 1,
      });
    } else {
      // Default to cashback
      recommendations.push({
        card: CREDIT_CARDS[0],
        reason:
          "Simple, high earn rates on everyday spending with no annual fee.",
        priority: 1,
      });
    }

    // Add 2 more alternatives
    const remaining = CREDIT_CARDS.filter(
      (c) => !recommendations.find((r) => r.card.id === c.id)
    ).slice(0, 2);

    remaining.forEach((card) => {
      recommendations.push({
        card,
        reason: "Alternative option worth considering based on your profile.",
        priority: 2,
      });
    });

    return recommendations;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const recommendations = getRecommendations();

    return (
      <div className="quiz-results">
        <h2>Your Personalized Recommendations</h2>
        <p className="subtitle">
          Based on your spending habits and financial profile
        </p>

        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`recommendation-card ${
              rec.priority === 1 ? "top-pick" : ""
            }`}
          >
            {rec.priority === 1 && <span className="badge">Top Pick</span>}
            <div className="card-header">
              <h3>{rec.card.name}</h3>
              <span
                className={`tier-badge tier-${rec.card.tier.toLowerCase()}`}
              >
                Tier {rec.card.tier}
              </span>
            </div>
            <p className="recommendation-reason">{rec.reason}</p>
            <div className="card-details-grid">
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
