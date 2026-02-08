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
    // This is the source of truth for the rest of the app
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
                {/* We pass specific availableCards so the quiz/compare only sees the selected institution */}
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

    const handleAnswer = (value) => {
        const question = QUIZ_QUESTIONS[currentQuestion];
        setAnswers({ ...answers, [question.id]: value });
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    // IMPROVED RECOMMENDATION LOGIC
    const getRecommendations = () => {
        const {
            1: spendingAmount, // low, medium, high, very-high
            2: topCategory,    // groceries, gas, travel, online, mixed
            3: carriesBalance, // never, sometimes, usually
            4: travelFreq,     // never, once, multiple, frequent
            5: incomeLevel     // student, entry, mid, high
        } = answers;

        // Map income level to rough numeric value for eligibility checks
        const incomeMap = {
            'student': 15000,
            'entry': 35000,
            'mid': 65000,
            'high': 120000
        };
        const userIncome = incomeMap[incomeLevel] || 0;

        return availableCards.map(card => {
            let score = 0;
            let reasons = [];

            // --- 1. HARD FILTER: INCOME ELIGIBILITY ---
            // If user makes 40k but card needs 80k, exclude it (set score extremely low)
            if (card.minIncome > userIncome) {
                return { card, score: -999, reasons: ["Income requirement not met"] };
            }

            // --- 2. SPENDING & FEES ---
            // If user spends very little, high fees are bad math.
            if (spendingAmount === 'low') {
                if (card.annualFee === 0) {
                    score += 15;
                    reasons.push("No annual fee matches your spending volume");
                } else {
                    score -= 10; // Penalize fees for low spenders
                }
            } else if (spendingAmount === 'very-high') {
                if (card.tier === 'S' || card.tier === 'A') {
                    score += 10; // High spenders benefit from premium tiers
                }
            }

            // --- 3. STUDENT LOGIC ---
            if (incomeLevel === 'student') {
                if (card.studentFriendly) {
                    score += 20;
                    reasons.push("Designed for students");
                }
                if (card.annualFee > 0) score -= 5; // Students usually dislike fees
            }

            // --- 4. CATEGORY MATCHING (SMARTER) ---
            const earnRateLower = card.earnRate.toLowerCase();

            // Check specific keywords in the earn rate even if card category doesn't match perfectly
            if (topCategory === 'groceries') {
                if (earnRateLower.includes('grocery') || earnRateLower.includes('food') || earnRateLower.includes('dining')) {
                    score += 15;
                    reasons.push("High rewards on food & groceries");
                }
            } else if (topCategory === 'gas') {
                if (earnRateLower.includes('gas') || earnRateLower.includes('transport')) {
                    score += 15;
                    reasons.push("Excellent returns on fuel");
                }
            } else if (topCategory === 'travel') {
                if (card.category === 'travel' || earnRateLower.includes('travel') || earnRateLower.includes('flight')) {
                    score += 15;
                    reasons.push("Maximizes travel purchases");
                }
            }

            // --- 5. TRAVEL FREQUENCY ---
            if (travelFreq === 'never') {
                if (card.category === 'travel') {
                    score -= 10; // Don't recommend travel cards to homebodies
                } else if (card.category === 'cashback') {
                    score += 10; // Push cashback instead
                    reasons.push("Cash back is better than miles for you");
                }
            } else if (travelFreq === 'multiple' || travelFreq === 'frequent') {
                if (card.foreignFee === 0) {
                    score += 15;
                    reasons.push("Saves 2.5% on every foreign transaction");
                }
                if (card.category === 'travel') {
                    score += 10;
                }
            }

            // --- 6. FINANCIAL HABITS ---
            if (carriesBalance === 'usually') {
                // If carrying a balance, high fee cards are dangerous
                if (card.annualFee > 100) score -= 20;
                if (card.category === 'cashback') {
                    score += 5; // simpler value
                }
            }

            return { card, score, reasons };
        })
            .filter(item => item.score > -100) // Remove ineligible cards
            .sort((a, b) => b.score - a.score) // Sort by score
            .slice(0, 3); // Top 3
    };

    if (showResults) {
        const recommendations = getRecommendations();
        const hasResults = recommendations.length > 0;

        return (
            <div className="results-page">
                <h2>Top Matches {selectedBank !== "All Institutions" ? `for ${selectedBank}` : ""}</h2>

                {!hasResults && (
                    <div className="result">
                        <p>No matches found based on your income and preferences for this institution.</p>
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
                            <h4>Why this card?</h4>
                            <ul>{rec.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                        </div>
                        <div className="rec-details">
                            <div><strong>Fee:</strong> {rec.card.annualFee === 0 ? "Free" : `$${rec.card.annualFee}`}</div>
                            <div><strong>Category:</strong> {rec.card.category.charAt(0).toUpperCase() + rec.card.category.slice(1)}</div>
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