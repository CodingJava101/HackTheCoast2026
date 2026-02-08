import React, { useState, useMemo } from "react";
import "./App.css";
import { CREDIT_CARDS, GLOSSARY_TERMS, QUIZ_QUESTIONS } from "./data.js";

function App() {
    const [activeTab, setActiveTab] = useState("home");
    const [showLanding, setShowLanding] = useState(true);
    const [selectedBank, setSelectedBank] = useState("All Institutions");

    // Get unique issuers from data for the dropdown
    const canadianBanks = useMemo(() => {
        const banks = [...new Set(CREDIT_CARDS.map((card) => card.issuer))].sort();
        return ["All Institutions", ...banks];
    }, []);

    // Filtered dataset based on landing page selection
    const availableCards = useMemo(() => {
        if (!selectedBank || selectedBank === "All Institutions") {
            return CREDIT_CARDS;
        }
        return CREDIT_CARDS.filter((card) => card.issuer === selectedBank);
    }, [selectedBank]);

    const handleGoClick = () => {
        if (selectedBank) {
            setShowLanding(false);
        }
    };

    const LandingPage = () => (
        <div className="landing-page">
            <div className="landing-container">
                <h1 className="landing-title">CREDERE</h1>
                <div className="landing-form">
                    <select
                        className="bank-dropdown"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                    >
                        {canadianBanks.map((bank, idx) => (
                            <option key={idx} value={bank}>
                                {bank}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn-go"
                        onClick={handleGoClick}
                    >
                        Enter Temple
                    </button>
                </div>
            </div>
        </div>
    );

    if (showLanding) {
        return <div className="app"><LandingPage /></div>;
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content" style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h1 className="app-title" onClick={() => setShowLanding(true)} style={{cursor: 'pointer'}}>
                        CREDERE
                    </h1>
                    <button
                        onClick={() => setShowLanding(true)}
                        style={{
                            position: 'absolute',
                            right: '0',
                            background: 'transparent',
                            border: '1px solid var(--warm-gold)',
                            color: 'var(--warm-gold)',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--warm-gold)';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--warm-gold)';
                        }}
                    >
                        Change Institution
                    </button>
                </div>
            </header>

            <nav className="nav-tabs">
                <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Home</button>
                <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>CPP Calculator</button>
                <button className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}>Find My Card</button>
                <button className={activeTab === "compare" ? "active" : ""} onClick={() => setActiveTab("compare")}>Compare Cards</button>
                <button className={activeTab === "learn" ? "active" : ""} onClick={() => setActiveTab("learn")}>Learn</button>
            </nav>

            <main className="content">
                {activeTab === "home" && <HomePage setActiveTab={setActiveTab} selectedBank={selectedBank} />}
                {activeTab === "calculator" && <CPPCalculator />}
                {activeTab === "quiz" && <QuizPage availableCards={availableCards} selectedBank={selectedBank} />}
                {activeTab === "compare" && <ComparePage availableCards={availableCards} selectedBank={selectedBank} />}
                {activeTab === "learn" && <LearnPage />}
            </main>

            <footer className="footer">
                <p>Currently viewing: <strong>{selectedBank}</strong></p>
                <p>No affiliate links • Built for transparency</p>
                <p className="disclaimer">Data is for educational purposes. Consult the issuer for official terms.</p>
            </footer>
        </div>
    );
}

function HomePage({ setActiveTab, selectedBank }) {
    return (
        <div className="home-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>
            <section className="hero">
                <h2>Clarity for your {selectedBank === "All Institutions" ? "finances" : selectedBank + " cards"}</h2>
                <p className="hero-subtitle">Unbiased tools and transparent comparisons</p>
                <section className="action-cards">
                    <div className="action-card" onClick={() => setActiveTab("quiz")}>
                        <div className="card-icon">⊕</div>
                        <h3>Find My Card</h3>
                        <p>Personalized matches {selectedBank !== "All Institutions" ? `from ${selectedBank}` : ""}</p>
                    </div>
                    <div className="action-card" onClick={() => setActiveTab("compare")}>
                        <div className="card-icon">⊞</div>
                        <h3>Compare</h3>
                        <p>Side-by-side spec breakdown</p>
                    </div>
                    <div className="action-card" onClick={() => setActiveTab("calculator")}>
                        <div className="card-icon">◈</div>
                        <h3>CPP Calc</h3>
                        <p>True worth of your points</p>
                    </div>
                </section>
            </section>
        </div>
    );
}

function QuizPage({ availableCards, selectedBank }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [userArchetype, setUserArchetype] = useState(null);

    const handleAnswer = (value) => {
        const question = QUIZ_QUESTIONS[currentQuestion];
        setAnswers({ ...answers, [question.id]: value });
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    // Determine the user's "Persona" or Archetype
    const determineArchetype = (answers) => {
        const { 1: spending, 4: travel, 5: income } = answers;

        if (income === 'student') return "The Aspiring Student";
        if (travel === 'frequent' || travel === 'multiple') return "The Jetsetter";
        if (spending === 'very-high' && income === 'high') return "The High Roller";
        if (spending === 'low') return "The Value Seeker";
        return "The Balanced Spender";
    };

    const getRecommendations = () => {
        const {
            1: spendingAmount,
            2: topCategory,
            3: carriesBalance,
            4: travelFreq,
            5: incomeLevel
        } = answers;

        // Map income
        const incomeMap = { 'student': 15000, 'entry': 35000, 'mid': 65000, 'high': 120000 };
        const userIncome = incomeMap[incomeLevel] || 0;

        // Determine Archetype for weighting
        const archetype = determineArchetype(answers);

        return availableCards.map(card => {
            let score = 0;
            let reasons = [];

            // 1. HARD FILTER: INCOME
            if (card.minIncome > userIncome) return { card, score: -999, reasons: [] };

            const earnRateLower = card.earnRate.toLowerCase();

            // 2. ARCHETYPE WEIGHTING
            switch (archetype) {
                case "The Aspiring Student":
                    if (card.studentFriendly) { score += 30; reasons.push("Student-specific benefits"); }
                    if (card.annualFee === 0) { score += 20; reasons.push("No annual fee (essential for students)"); }
                    else { score -= 20; } // Heavily penalize fees
                    break;

                case "The Jetsetter":
                    if (card.category === 'travel') { score += 25; reasons.push("Premium travel rewards"); }
                    if (card.foreignFee === 0) { score += 20; reasons.push("No FX fees on your travels"); }
                    if (card.tier === 'S' || card.tier === 'A') { score += 10; }
                    break;

                case "The High Roller":
                    if (card.tier === 'S') { score += 25; reasons.push("Luxury perks matching your lifestyle"); }
                    if (card.annualFee > 150) { score += 5; } // Fee is less relevant, perks matter
                    break;

                case "The Value Seeker":
                    if (card.annualFee === 0) { score += 30; reasons.push("Zero annual fee"); }
                    if (card.category === 'cashback') { score += 15; reasons.push("Simple cash back returns"); }
                    break;

                default: // Balanced Spender
                    if (card.annualFee < 150) score += 10;
                    break;
            }

            // 3. SPENDING CATEGORY MATCH
            if (topCategory === 'groceries') {
                if (earnRateLower.includes('grocery') || earnRateLower.includes('food')) { score += 15; reasons.push("High grocery earn rate"); }
            } else if (topCategory === 'gas') {
                if (earnRateLower.includes('gas') || earnRateLower.includes('transport')) { score += 15; reasons.push("Great for gas & transit"); }
            } else if (topCategory === 'travel') {
                if (earnRateLower.includes('travel') || earnRateLower.includes('flight')) { score += 15; reasons.push("Accelerated travel earning"); }
            }

            return { card, score, reasons };
        })
            .filter(item => item.score > -100)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    };

    if (showResults) {
        const recommendations = getRecommendations();
        const archetype = determineArchetype(answers);
        const hasResults = recommendations.length > 0;

        return (
            <div className="results-page">
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'var(--warm-gold)',
                        color: 'white',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em'
                    }}>
                        ARCHETYPE DETECTED
                    </span>
                    <h2 style={{fontSize: '2.5rem', margin: '0'}}>{archetype}</h2>
                    <p style={{color: 'var(--slate)'}}>
                        {archetype === "The Aspiring Student" && "Building credit with minimal costs."}
                        {archetype === "The Jetsetter" && "Maximizing miles and lounge access."}
                        {archetype === "The High Roller" && "Luxury perks and premium service."}
                        {archetype === "The Value Seeker" && "Keeping costs low and returns simple."}
                        {archetype === "The Balanced Spender" && "A sensible mix of value and rewards."}
                    </p>
                </div>

                {!hasResults && (
                    <div className="result">
                        <p>No matches found matching your strict criteria.</p>
                        <button className="btn-secondary" onClick={() => {setShowResults(false); setCurrentQuestion(0);}}>Try Again</button>
                    </div>
                )}

                {recommendations.map((rec, idx) => (
                    <div key={rec.card.id} className="recommendation-card">
                        <div className="rec-header">
                            <span className="rec-rank">#{idx + 1}</span>
                            <h3>{rec.card.name}</h3>
                            <span className={`tier-badge tier-${rec.card.tier.toLowerCase()}`}>{rec.card.tier}</span>
                        </div>
                        <div className="rec-reasons">
                            <h4>Why this fits your archetype:</h4>
                            <ul>{rec.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                        </div>
                        <div className="rec-details">
                            <div><strong>Fee:</strong> {rec.card.annualFee === 0 ? "Free" : `$${rec.card.annualFee}`}</div>
                            <div><strong>Type:</strong> {rec.card.category.toUpperCase()}</div>
                            <div><strong>Earn Rate:</strong> {rec.card.earnRate}</div>
                        </div>
                    </div>
                ))}

                {hasResults && (
                    <button className="btn-secondary" onClick={() => {setShowResults(false); setCurrentQuestion(0);}}>Retake Quiz</button>
                )}
            </div>
        );
    }

    const question = QUIZ_QUESTIONS[currentQuestion];
    return (
        <div className="quiz-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>
            <h2>Find Your {selectedBank === "All Institutions" ? "" : selectedBank} Card</h2>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div></div>
            <div className="question-card">
                <h3>{question.question}</h3>
                <div className="options-grid">
                    {question.options.map((opt, i) => (
                        <button key={i} className="option-button" onClick={() => handleAnswer(opt.value)}>{opt.label}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ComparePage({ availableCards, selectedBank }) {
    const [leftCard, setLeftCard] = useState(null);
    const [rightCard, setRightCard] = useState(null);

    const ComparisonColumn = ({ card, setCard }) => {
        const [isSelecting, setIsSelecting] = useState(false);

        return (
            <div className={`comparison-column ${card ? "filled" : "empty"}`}>
                {!card ? (
                    <button className="select-card-btn" onClick={() => setIsSelecting(true)}>Select Card</button>
                ) : (
                    <>
                        <div className="card-header">
                            <h3>{card.name}</h3>
                            <button className="change-card-btn" onClick={() => setIsSelecting(true)}>Change</button>
                        </div>
                        <div className="card-specs">
                            <div className="spec-group"><div className="spec-label">Issuer</div><div className="spec-value">{card.issuer}</div></div>
                            <div className="spec-group"><div className="spec-label">Tier</div><div className="spec-value"><span className={`tier-badge tier-${card.tier.toLowerCase()}`}>{card.tier}</span></div></div>
                            <div className="spec-group"><div className="spec-label">Annual Fee</div><div className="spec-value">${card.annualFee}</div></div>
                            <div className="spec-group"><div className="spec-label">Earn Rate</div><div className="spec-value">{card.earnRate}</div></div>
                            <div className="spec-group"><div className="spec-label">Point Value</div><div className="spec-value">{card.typicalCPP}¢</div></div>
                            <div className="spec-group"><div className="spec-label">FX Fee</div><div className="spec-value">{card.foreignFee}%</div></div>
                            <div className="spec-group"><div className="spec-label">Min. Income</div><div className="spec-value">${card.minIncome.toLocaleString()}</div></div>
                        </div>
                    </>
                )}
                {isSelecting && (
                    <div className="card-selector-overlay" onClick={() => setIsSelecting(false)}>
                        <div className="card-selector" onClick={(e) => e.stopPropagation()}>
                            <h3>Select from {selectedBank}</h3>
                            <div className="card-list">
                                {availableCards.map((c) => (
                                    <button key={c.id} className="card-option" onClick={() => { setCard(c); setIsSelecting(false); }}>
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
            <h2>Compare {selectedBank === "All Institutions" ? "Cards" : selectedBank + " Cards"}</h2>
            <div className="comparison-grid">
                <ComparisonColumn card={leftCard} setCard={setLeftCard} />
                <ComparisonColumn card={rightCard} setCard={setRightCard} />
            </div>
        </div>
    );
}

function CPPCalculator() {
    const [points, setPoints] = useState("");
    const [cashValue, setCashValue] = useState("");
    const [result, setResult] = useState(null);

    const calculateCPP = () => {
        if (points && cashValue) {
            const cpp = (parseFloat(cashValue) / parseFloat(points)) * 100;
            setResult(cpp.toFixed(2));
        }
    };

    const getRating = (cpp) => {
        if (cpp >= 2.0) return { label: "Excellent", class: "excellent" };
        if (cpp >= 1.5) return { label: "Good", class: "good" };
        if (cpp >= 1.0) return { label: "Fair", class: "fair" };
        return { label: "Poor", class: "poor" };
    };

    return (
        <div className="calculator-page">
            <div className="calculator-card">
                <h2>Cents Per Point (CPP) Calculator</h2>
                <div className="input-group">
                    <label>Points Required</label>
                    <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Cash Value of Redemption ($)</label>
                    <input
                        type="number"
                        placeholder="e.g. 500"
                        value={cashValue}
                        onChange={(e) => setCashValue(e.target.value)}
                    />
                </div>
                <button className="btn-primary" onClick={calculateCPP}>Calculate Value</button>

                {result && (
                    <div className="result">
                        <h3>{result}¢ / point</h3>
                        <span className={`value-rating ${getRating(result).class}`}>
                            {getRating(result).label} Value
                        </span>
                    </div>
                )}
            </div>

            <div className="info-section">
                <h3>Why does this matter?</h3>
                <p>Not all points are created equal. Before you redeem, check if you're getting good value.</p>
                <div className="benchmark-box">
                    <h4>Benchmarks</h4>
                    <ul>
                        <li><strong>2.0¢+</strong>: Amazing redemption (usually Business Class flights)</li>
                        <li><strong>1.0¢ - 1.5¢</strong>: Standard redemption (Economy flights, Gift Cards)</li>
                        <li><strong>Under 1.0¢</strong>: Poor value (Merchandise, Statement Credits)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function LearnPage() {
    const [expandedTerm, setExpandedTerm] = useState(null);

    return (
        <div className="learn-page">
            <h2>Financial Lexicon</h2>
            <p className="subtitle">Master the language of credit</p>

            <div className="glossary-list">
                {GLOSSARY_TERMS.map((item, index) => (
                    <div key={index} className="glossary-item">
                        <div
                            className="glossary-header"
                            onClick={() => setExpandedTerm(expandedTerm === index ? null : index)}
                        >
                            <h3>{item.term}</h3>
                            <span className="expand-icon">{expandedTerm === index ? "−" : "+"}</span>
                        </div>
                        {expandedTerm === index && (
                            <div className="glossary-content">
                                <p>{item.definition}</p>
                                <div className="why-matters">
                                    <strong>Why it matters:</strong>
                                    {item.whyMatters}
                                </div>
                                <div className="example">
                                    <strong>Example:</strong>
                                    {item.example}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="research-section">
                <h3>Methodology</h3>
                <p>
                    CREDERE operates on a principle of absolute transparency.
                    We do not accept payment for rankings. Our card database is
                    manually curated based on public offers.
                </p>
                <ul>
                    <li><strong>Tier S:</strong> Exceptional value, luxury perks, high income req.</li>
                    <li><strong>Tier A:</strong> Strong daily drivers, good insurance, fee > $100.</li>
                    <li><strong>Tier B:</strong> Niche uses or decent mid-range options.</li>
                    <li><strong>Tier C:</strong> Entry level, student, or low value cards.</li>
                </ul>
            </div>
        </div>
    );
}

export default App;