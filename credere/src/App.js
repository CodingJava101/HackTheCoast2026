
import React, { useState, useMemo, useEffect, useRef } from "react";
import "./App.css";
import { CREDIT_CARDS, GLOSSARY_TERMS, QUIZ_QUESTIONS } from "./data.js";

// --- AI SDK IMPORTS ---
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, Stage, PresentationControls, Html } from "@react-three/drei"; // Added Html
import { Suspense } from "react";

/* ================= CONFIGURATION ================= */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";


/* ================= 3D MODEL COMPONENT ================= */

/* ================= 3D MODEL COMPONENT ================= */

function ColosseumModel() {
    // Ensure path is correct based on previous step
    const fbx = useFBX("/colosseum.fbx");
    const modelRef = useRef();

    // Slow continuous rotation
    useFrame((state, delta) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.05; // Very slow, majestic rotation
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={fbx}
            // 1. INCREASED SCALE (Adjust this number if it's too big/small)
            scale={0.025}
            // 2. POSITIONED AT BOTTOM (x, y, z) - Lower Y pushes it down
            position={[0, -3.5, 0]}
        />
    );
}

const Scene3D = () => {
    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0, // Behind everything
            overflow: "hidden"
        }}>
            <Canvas dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 50 }}>
                {/* Match background color to page to blend seamlessly */}
                <color attach="background" args={["#fdfaf3"]} />

                {/* 3. LIGHTING SETUP (No Black Shadows) */}
                {/* Ambient light hits every surface equally */}
                <ambientLight intensity={1.5} />
                {/* Hemisphere light creates a nice sky/ground gradient, preventing dark undersides */}
                <hemisphereLight skyColor={"#ffffff"} groundColor={"#fdfaf3"} intensity={1} />
                {/* Directional light for subtle depth, but soft */}
                <directionalLight position={[5, 10, 5]} intensity={1} />

                <Suspense fallback={null}>
                    {/* PresentationControls allow user to rotate the background model if they click empty space */}
                    <PresentationControls
                        global
                        zoom={0.8}
                        rotation={[0.1, 0, 0]}
                        polar={[-0.1, 0.1]}
                        azimuth={[-Math.PI / 4, Math.PI / 4]}
                    >
                        <ColosseumModel />
                    </PresentationControls>
                </Suspense>
            </Canvas>
        </div>
    );
};
/* ================= MAIN APP COMPONENT ================= */


function App() {
    const [activeTab, setActiveTab] = useState("home");
    const [showLanding, setShowLanding] = useState(true);
    const [selectedBank, setSelectedBank] = useState("All Institutions");

    // --- SHARED STATE FOR CONTEXT AWARENESS ---
    const [compareLeft, setCompareLeft] = useState(null);
    const [compareRight, setCompareRight] = useState(null);
    const [quizResults, setQuizResults] = useState([]);

    // --- OPTIMIZER STATE ---
    const [optimizerResult, setOptimizerResult] = useState(null);
    const [myWalletIds, setMyWalletIds] = useState([]);
    const [useEntireDb, setUseEntireDb] = useState(false);

    const canadianBanks = useMemo(() => {
        const banks = [...new Set(CREDIT_CARDS.map((card) => card.issuer))].sort();
        return ["All Institutions", ...banks];
    }, []);

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
        <div className="landing-page" style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>

            {/* 1. The 3D Scene (Background) */}
            <Scene3D />

            {/* 2. The Content (Foreground) */}
            <div className="landing-container" style={{
                position: 'relative',
                zIndex: 10, // Sits on top of 3D model
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Centers text vertically
                pointerEvents: 'none' // Allows clicking through to rotate the model
            }}>
                <h1 className="landing-title" style={{
                    marginTop: '0',
                    textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)' // Adds readability over the model
                }}>
                    CREDERE
                </h1>
                <p style={{
                    color: 'var(--warm-gold)',
                    letterSpacing: '2px',
                    marginBottom: '2rem',
                    fontWeight: 'bold',
                    textShadow: '0 1px 4px rgba(255, 255, 255, 0.8)'
                }}>
                    ENTER THE COLOSSEUM OF CREDIT
                </p>

                {/* Re-enable clicks for the form area */}
                <div className="landing-form" style={{ pointerEvents: 'auto' }}>
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
                    <button className="btn-go" onClick={handleGoClick}>
                        Enter Colosseum
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
                            position: 'absolute', right: '0', background: 'transparent', border: '1px solid var(--warm-gold)',
                            color: 'var(--warm-gold)', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem',
                            borderRadius: '2px', transition: 'all 0.3s ease'
                        }}
                    >
                        Change Institution
                    </button>
                </div>
            </header>

            <nav className="nav-tabs">
                <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Home</button>
                <button className={activeTab === "list" ? "active" : ""} onClick={() => setActiveTab("list")}>List</button>
                <button className={activeTab === "optimizer" ? "active" : ""} onClick={() => setActiveTab("optimizer")}>Optimizer</button>
                <button className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}>Find My Card</button>
                <button className={activeTab === "compare" ? "active" : ""} onClick={() => setActiveTab("compare")}>Compare</button>
                <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>CPP Calc</button>
                <button className={activeTab === "learn" ? "active" : ""} onClick={() => setActiveTab("learn")}>Learn</button>
            </nav>

            <main className="content">
                {activeTab === "home" && <HomePage setActiveTab={setActiveTab} selectedBank={selectedBank} />}

                {activeTab === "list" && (
                    <CardListPage
                        availableCards={availableCards}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === "optimizer" && (
                    <OptimizerPage
                        allCards={CREDIT_CARDS}
                        myWalletIds={myWalletIds}
                        setMyWalletIds={setMyWalletIds}
                        useEntireDb={useEntireDb}
                        setUseEntireDb={setUseEntireDb}
                        optimizerResult={optimizerResult}
                        setOptimizerResult={setOptimizerResult}
                    />
                )}

                {activeTab === "calculator" && <CPPCalculator />}

                {activeTab === "quiz" && (
                    <QuizPage
                        availableCards={availableCards}
                        selectedBank={selectedBank}
                        setQuizResults={setQuizResults}
                    />
                )}
                {activeTab === "compare" && (
                    <ComparePage
                        availableCards={availableCards}
                        selectedBank={selectedBank}
                        leftCard={compareLeft}
                        setLeftCard={setCompareLeft}
                        rightCard={compareRight}
                        setRightCard={setCompareRight}
                    />
                )}
                {activeTab === "learn" && <LearnPage />}
            </main>

            {/* AI CONTEXT LAYER */}
            <Chatbot
                availableCards={availableCards}
                selectedBank={selectedBank}
                activeTab={activeTab}
                compareLeft={compareLeft}
                compareRight={compareRight}
                quizResults={quizResults}
                optimizerResult={optimizerResult}
            />

            <footer className="footer">
                <p>Currently viewing: <strong>{selectedBank}</strong></p>
                <p>No affiliate links • Built for transparency</p>
                <p className="disclaimer">Data is for educational purposes. Consult the issuer for official terms.</p>
            </footer>
        </div>
    );
}

/* ================= NEW COMPONENT: CARD LIST PAGE ================= */

function CardListPage({ availableCards }) {
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("name");

    // Helper to estimate First Year Value (FYV)
    // Formula: (Welcome Bonus * CPP) - Annual Fee
    const getFYV = (card) => {
        const bonus = card.welcomeBonus || 0; // Assuming data has welcomeBonus, defaulting if not
        const cpp = card.typicalCPP || 1;
        const value = (bonus * cpp / 100) - card.annualFee;
        return value;
    };

    const filteredAndSortedCards = useMemo(() => {
        let result = [...availableCards];

        // 1. Filter
        if (filter === "student") {
            result = result.filter(c => c.studentFriendly);
        } else if (filter === "no-fee") {
            result = result.filter(c => c.annualFee === 0);
        } else if (filter === "travel") {
            result = result.filter(c => c.category === "travel");
        } else if (filter === "cashback") {
            result = result.filter(c => c.category === "cashback" || c.earnRate.toLowerCase().includes("cash"));
        } else if (filter === "premium") {
            result = result.filter(c => c.annualFee > 120);
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sort === "name") {
                return a.name.localeCompare(b.name);
            } else if (sort === "fee-low") {
                return a.annualFee - b.annualFee;
            } else if (sort === "fee-high") {
                return b.annualFee - a.annualFee;
            } else if (sort === "value") {
                return getFYV(b) - getFYV(a);
            }
            return 0;
        });

        return result;
    }, [availableCards, filter, sort]);

    return (
        <div className="list-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>

            <section className="list-header">
                <h2>Card Directory</h2>
                <p>Browse, filter, and analyze the full database.</p>
            </section>

            {/* Controls */}
            <div className="list-controls">
                <div className="control-group">
                    <label>Filter:</label>
                    <div className="filter-pills">
                        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
                        <button className={filter === "student" ? "active" : ""} onClick={() => setFilter("student")}>Students</button>
                        <button className={filter === "no-fee" ? "active" : ""} onClick={() => setFilter("no-fee")}>No Annual Fee</button>
                        <button className={filter === "travel" ? "active" : ""} onClick={() => setFilter("travel")}>Travel</button>
                        <button className={filter === "cashback" ? "active" : ""} onClick={() => setFilter("cashback")}>Cash Back</button>
                        <button className={filter === "premium" ? "active" : ""} onClick={() => setFilter("premium")}>Premium</button>
                    </div>
                </div>

                <div className="control-group">
                    <label>Sort By:</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="name">Name (A-Z)</option>
                        <option value="value">First Year Value (High to Low)</option>
                        <option value="fee-low">Annual Fee (Low to High)</option>
                        <option value="fee-high">Annual Fee (High to Low)</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="card-list-grid">
                {filteredAndSortedCards.length === 0 ? (
                    <div className="no-results">No cards match your filters.</div>
                ) : (
                    filteredAndSortedCards.map(card => (
                        <div key={card.id} className="directory-card">
                            <div className="dir-card-header">
                                <span className={`tier-badge tier-${card.tier.toLowerCase()}`}>{card.tier}</span>
                                <span className="dir-issuer">{card.issuer}</span>
                            </div>
                            <h3>{card.name}</h3>
                            <div className="dir-stats">
                                <div className="stat">
                                    <span className="label">Fee</span>
                                    <span className="value">${card.annualFee}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Income</span>
                                    <span className="value">{card.minIncome > 0 ? `$${card.minIncome/1000}k` : "None"}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">FX Fee</span>
                                    <span className="value">{card.foreignFee}%</span>
                                </div>
                            </div>
                            <div className="dir-earn">
                                <strong>Earn:</strong> {card.earnRate}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .list-controls {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2rem;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid var(--border-gray);
                }
                .control-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .control-group label {
                    font-weight: 600;
                    color: var(--charcoal);
                }
                .filter-pills {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .filter-pills button {
                    background: white;
                    border: 1px solid #ccc;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }
                .filter-pills button.active {
                    background: var(--warm-gold);
                    color: white;
                    border-color: var(--warm-gold);
                }
                .control-group select {
                    padding: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }
                .card-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .directory-card {
                    background: white;
                    border: 1px solid var(--border-gray);
                    border-radius: 8px;
                    padding: 1.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                }
                .directory-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                    border-color: var(--warm-gold);
                }
                .dir-card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .dir-issuer {
                    font-size: 0.8rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .directory-card h3 {
                    margin: 0.5rem 0 1rem 0;
                    font-size: 1.2rem;
                    min-height: 3rem; /* Align heights */
                }
                .dir-stats {
                    display: flex;
                    justify-content: space-between;
                    background: #f9f9f9;
                    padding: 0.8rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                }
                .stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .stat .label { font-size: 0.7rem; color: #888; text-transform: uppercase; }
                .stat .value { font-weight: 600; color: var(--charcoal); }
                .dir-earn {
                    font-size: 0.9rem;
                    line-height: 1.4;
                    color: #555;
                }
                .no-results {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem;
                    font-style: italic;
                    color: #888;
                }
            `}</style>
        </div>
    );
}

/* ================= UPDATED HOME PAGE ================= */

function HomePage({ setActiveTab, selectedBank }) {
    return (
        <div className="home-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>
            <section className="hero">
                <h2>Clarity for your {selectedBank === "All Institutions" ? "finances" : selectedBank + " cards"}</h2>
                <p className="hero-subtitle">Unbiased tools and transparent comparisons</p>
                <section className="action-cards">
                    {/* NEW: LIST CARD */}
                    <div className="action-card" onClick={() => setActiveTab("list")}>
                        {/* Greek Letter Xi (Looks like a stylized list or columns) */}
                        <div className="card-icon">☰</div>
                        <h3>Card Directory</h3>
                        <p>Sort and filter through the cards</p>
                    </div>

                    {/* EXISTING: OPTIMIZER */}
                    <div className="action-card" onClick={() => setActiveTab("optimizer")}>
                        {/* Bullseye / Concentric Circles (Represents Vision/Focus) */}
                        <div className="card-icon">◎</div>
                        <h3>Optimizer</h3>
                        <p>Vision-based recommendations</p>
                    </div>

                    {/* EXISTING: QUIZ */}
                    <div className="action-card" onClick={() => setActiveTab("quiz")}>
                        {/* Circled Plus (Represents a compass/intersection) */}
                        <div className="card-icon">⊕</div>
                        <h3>Find My Card</h3>
                        <p>Personalized matches {selectedBank !== "All Institutions" ? `from ${selectedBank}` : ""}</p>
                    </div>

                    {/* EXISTING: COMPARE */}
                    <div className="action-card" onClick={() => setActiveTab("compare")}>
                        {/* Square with Vertical Line (Represents Side-by-Side comparison) */}
                        <div className="card-icon">◫</div>
                        <h3>Compare</h3>
                        <p>Side-by-side spec breakdown</p>
                    </div>

                    {/* EXISTING: CALCULATOR */}
                    <div className="action-card" onClick={() => setActiveTab("calculator")}>
                        {/* Diamond Operator (Represents Value/Gem) */}
                        <div className="card-icon">◈</div>
                        <h3>CPP Calc</h3>
                        <p>True worth of your points</p>
                    </div>

                    {/* NEW: LEARN CARD */}
                    <div className="action-card" onClick={() => setActiveTab("learn")}>
                        {/* Greek Letter Omega (Represents Knowledge/The Ultimate) */}
                        <div className="card-icon">Ω</div>
                        <h3>Learn</h3>
                        <p>Glossary & financial literacy</p>
                    </div>
                </section>
            </section>
        </div>
    );
}
/* ================= CHATBOT COMPONENT (CONTEXT AWARE) ================= */

function Chatbot({ availableCards, selectedBank, activeTab, compareLeft, compareRight, quizResults, optimizerResult }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Greetings. I am the Credere Oracle. I see exactly what is on your screen. How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [usedModel, setUsedModel] = useState(null);

    // Voice State
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [autoListen, setAutoListen] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    /* --- DYNAMIC SYSTEM PROMPT (THE BRAIN) --- */
    const getSystemPrompt = () => {
        // 1. Base Database
        const fullDb = availableCards.map(c =>
            `[DB: ${c.name} | Fee: $${c.annualFee} | Student: ${c.studentFriendly ? "YES" : "NO"} | Cat: ${c.category} | Earn: ${c.earnRate.substring(0, 40)}...]`
        ).join("\n");

        // 2. Dynamic "On Screen" Context
        let screenContext = "";

        if (activeTab === "list") {
            screenContext = "USER LOCATION: Card Directory. User is filtering/sorting the full list of cards.";
        } else if (activeTab === "optimizer") {
            if (optimizerResult) {
                screenContext = `
                OPTIMIZER RESULT DISPLAYED:
                User uploaded an image.
                AI Recommended: ${optimizerResult.recommendedCard}
                Reason: ${optimizerResult.reasoning}
                Category Detected: ${optimizerResult.category}
                
                INSTRUCTION: If user asks, explain why this category matches that card's multipliers.
                `;
            } else {
                screenContext = "OPTIMIZER: User is configuring their wallet or uploading an image.";
            }
        } else if (activeTab === "compare") {
            if (compareLeft || compareRight) {
                screenContext = `
                CURRENTLY COMPARING:
                LEFT: ${compareLeft ? compareLeft.name + ` ($${compareLeft.annualFee})` : "Empty"}
                RIGHT: ${compareRight ? compareRight.name + ` ($${compareRight.annualFee})` : "Empty"}
                `;
            } else {
                screenContext = "CURRENTLY COMPARING: Nothing selected yet.";
            }
        } else if (activeTab === "quiz") {
            if (quizResults.length > 0) {
                screenContext = `
                QUIZ RESULTS DISPLAYED:
                ${quizResults.map((r, i) => `#${i+1}: ${r.card.name} (${r.reasons.join(", ")})`).join("\n")}
                `;
            } else {
                screenContext = "QUIZ STATUS: User is taking the quiz or hasn't started.";
            }
        } else if (activeTab === "calculator") {
            screenContext = "USER LOCATION: CPP Calculator. Help them calculate the value of their points (Cents Per Point).";
        } else if (activeTab === "learn") {
            screenContext = "USER LOCATION: Glossary/Learn page. User is reading financial terms.";
        }

        return `
        You are Credere AI, a financial assistant specialized for the **CANADIAN** market (CAD Currency).
        
        CONTEXT:
        - Tab: ${activeTab.toUpperCase()}
        - Bank Filter: ${selectedBank}
        
        ${screenContext}

        FULL CARD DATABASE (Reference only):
        ${fullDb}
        
        STRICT RULES:
        1. PRIORITIZE the "CURRENTLY COMPARING" or "OPTIMIZER RESULT" or "QUIZ RESULTS" data above. That is what the user is looking at.
        2. Keep answers under 60 words.
        3. Be concise and helpful.
        `;
    };

    /* ---------- Local Intelligence Fallback ---------- */
    const localFallback = (query) => {
        const q = query.toLowerCase();

        if (activeTab === "compare" && (compareLeft || compareRight)) {
            if (q.includes("better") || q.includes("compare")) {
                if (compareLeft && compareRight) {
                    return `Between the ${compareLeft.name} and ${compareRight.name}, the main difference is the fee ($${compareLeft.annualFee} vs $${compareRight.annualFee}).`;
                }
                return "Please select two cards to compare.";
            }
        }

        if (activeTab === "quiz" && quizResults.length > 0) {
            if (q.includes("why") || q.includes("first")) {
                return `The ${quizResults[0].card.name} is #1 because it fits your profile: ${quizResults[0].reasons.join(", ")}.`;
            }
        }

        if (activeTab === "optimizer" && optimizerResult) {
            return `I recommended the ${optimizerResult.recommendedCard} because it has the best multiplier for ${optimizerResult.category}.`;
        }

        const matched = availableCards.filter(c => q.includes(c.name.toLowerCase())).slice(0, 3);
        if (matched.length > 0) return `Found: ${matched.map(c => c.name).join(", ")}.`;

        return "I can help you compare cards, optimize your wallet, or analyze quiz results.";
    };

    /* ---------- Text to Speech ---------- */
    const playTTS = (text) => {
        if (!isSpeakerOn || !ELEVENLABS_API_KEY) return Promise.resolve();

        return new Promise(async (resolve) => {
            try {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
                    method: "POST",
                    headers: {
                        "Accept": "audio/mpeg",
                        "Content-Type": "application/json",
                        "xi-api-key": ELEVENLABS_API_KEY
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                    })
                });

                if (!response.ok) throw new Error("ElevenLabs Error");

                const blob = await response.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.onended = () => resolve();
                audio.onerror = () => resolve();
                await audio.play();
            } catch (e) {
                console.error("TTS Failed:", e);
                resolve();
            }
        });
    };

    /* ---------- Speech to Text ---------- */
    const toggleMic = () => {
        if (isRecording) {
            window.speechRecognitionInstance?.stop();
            setIsRecording(false);
            setAutoListen(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        window.speechRecognitionInstance = recognition;
        recognition.continuous = false;
        recognition.lang = "en-CA";
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsRecording(true);
            setAutoListen(true);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error("Mic Error:", event.error);
            setIsRecording(false);
            setAutoListen(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Mic Start Error:", e);
        }
    };

    /* ---------- Send Logic ---------- */
    const handleSend = async (manualText = null) => {
        const textToSend = manualText || input;
        if (!textToSend.trim() || isLoading) return;

        const newMessages = [...messages, { role: "user", text: textToSend }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setUsedModel(null);

        const finalizeResponse = async (reply, modelName) => {
            setMessages(prev => [...prev, { role: "assistant", text: reply }]);
            setUsedModel(modelName);
            setIsLoading(false);

            if (reply && isSpeakerOn) {
                await playTTS(reply);
                if (autoListen) setTimeout(() => toggleMic(), 500);
            }
        };

        const currentSystemPrompt = getSystemPrompt();

        // Gemini Prompt Construction
        const geminiHistory = newMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n");
        const geminiFullPrompt = `${currentSystemPrompt}\n\nCONVERSATION HISTORY:\n${geminiHistory}\n\nAI RESPONSE:`;

        // Groq Prompt Construction
        const groqHistory = [
            { role: "system", content: currentSystemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.text }))
        ];

        /* 1. Try Gemini (New GenAI SDK) */
        if (GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: geminiFullPrompt,
                });

                if (response && response.text) {
                    finalizeResponse(response.text, "Gemini 2.0");
                    return;
                }
            } catch (e) {
                console.warn("Gemini unavailable, failing over...", e);
            }
        }

        /* 2. Try Groq (Backup) */
        if (GROQ_API_KEY) {
            try {
                const client = new OpenAI({
                    apiKey: GROQ_API_KEY,
                    baseURL: "https://api.groq.com/openai/v1",
                    dangerouslyAllowBrowser: true
                });
                const response = await client.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: groqHistory,
                });
                finalizeResponse(response.choices[0]?.message?.content, "Groq Llama 3");
                return;
            } catch (e) {
                console.error("Groq unavailable:", e);
            }
        }

        /* 3. Local Fallback */
        setTimeout(() => {
            finalizeResponse(localFallback(textToSend), "Local Core");
        }, 500);
    };

    return (
        <>
            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: '6rem', right: '6rem', width: '60px', height: '60px',
                    borderRadius: '50%', backgroundColor: 'var(--warm-gold)', color: 'white', border: 'none',
                    boxShadow: '0 4px 12px rgba(212, 165, 116, 0.4)', cursor: 'pointer', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
            >
                {isOpen ? "✕" : "💬"}
            </button>

            <div style={{
                position: 'fixed', bottom: '10rem', right: '6rem', width: '350px', height: '500px',
                backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', zIndex: 1000,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', border: '1px solid var(--border-gray)',
                overflow: 'hidden'
            }}>
                <div style={{
                    backgroundColor: 'var(--warm-gold)', color: 'white', padding: '0.8rem 1rem',
                    borderBottom: '1px solid var(--deep-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{fontSize: '1.2rem'}}>🤖</div>
                        <div>
                            <div style={{fontWeight: '600', fontSize: '0.9rem'}}>Credere AI</div>
                            <div style={{fontSize: '0.65rem', opacity: 0.9}}>{usedModel ? `via ${usedModel}` : "Online"}</div>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                            title={isSpeakerOn ? "Mute Voice" : "Enable Voice"}
                            style={{
                                background: isSpeakerOn ? 'rgba(255,255,255,0.3)' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.5)',
                                color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem'
                            }}
                        >
                            {isSpeakerOn ? "🔊" : "🔇"}
                        </button>
                        <button
                            onClick={toggleMic}
                            title="Speak"
                            style={{
                                background: isRecording ? '#ff4d4d' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.5)',
                                color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem',
                                animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                            }}
                        >
                            {isRecording ? "🛑" : "🎤"}
                        </button>
                    </div>
                </div>

                <div style={{
                    flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: 'var(--ivory)',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.role === 'user' ? 'var(--warm-gold)' : 'white',
                            color: msg.role === 'user' ? 'white' : 'var(--charcoal)',
                            padding: '0.8rem 1rem', borderRadius: '12px',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                            maxWidth: '85%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            lineHeight: 1.5, fontSize: '0.95rem'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && <div style={{alignSelf: 'flex-start', color: 'var(--slate)', fontSize: '0.8rem', paddingLeft: '0.5rem', fontStyle: 'italic'}}>● ● ●</div>}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{
                    padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--border-gray)',
                    display: 'flex', gap: '0.5rem'
                }}>
                    <input
                        type="text" value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? "Listening..." : "Type or speak..."}
                        style={{
                            flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-gray)',
                            outline: 'none', fontFamily: 'inherit',
                            background: isRecording ? '#fff0f0' : 'white'
                        }}
                    />
                    <button
                        onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                        style={{
                            backgroundColor: 'var(--charcoal)', color: 'white', border: 'none',
                            borderRadius: '4px', padding: '0 1rem', cursor: 'pointer', opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 77, 77, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
                }
            `}</style>
        </>
    );
}

// ================= OPTIMIZER PAGE (MODIFIED) =================

function OptimizerPage({ allCards, myWalletIds, setMyWalletIds, useEntireDb, setUseEntireDb, optimizerResult, setOptimizerResult }) {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- NEW: INSTITUTION FILTER STATE ---
    const [selectedIssuers, setSelectedIssuers] = useState([]);
    const [isIssuerDropdownOpen, setIsIssuerDropdownOpen] = useState(false);

    // Get unique list of issuers for the dropdown
    const allIssuers = useMemo(() => {
        return [...new Set(allCards.map(c => c.issuer))].sort();
    }, [allCards]);

    // Calculate displayed cards based on filter
    const displayedCards = useMemo(() => {
        if (selectedIssuers.length === 0) {
            return allCards; // If none selected, show all
        }
        return allCards.filter(c => selectedIssuers.includes(c.issuer));
    }, [allCards, selectedIssuers]);

    const toggleIssuer = (issuer) => {
        if (selectedIssuers.includes(issuer)) {
            setSelectedIssuers(selectedIssuers.filter(i => i !== issuer));
        } else {
            setSelectedIssuers([...selectedIssuers, issuer]);
        }
    };

    // Toggle card selection in wallet
    const toggleCard = (id) => {
        if (myWalletIds.includes(id)) {
            setMyWalletIds(myWalletIds.filter(cardId => cardId !== id));
        } else {
            setMyWalletIds([...myWalletIds, id]);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setOptimizerResult(null); // Reset previous result
        }
    };

    const runOptimization = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }

        // Determine which cards to analyze
        let cardsToAnalyze = [];
        if (useEntireDb) {
            cardsToAnalyze = allCards;
        } else {
            if (myWalletIds.length === 0) {
                alert("Please select cards in your wallet, or check 'Use Entire Database'.");
                return;
            }
            cardsToAnalyze = allCards.filter(c => myWalletIds.includes(c.id));
        }

        setIsAnalyzing(true);

        try {
            // Convert file to Base64
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];

                // --- MODIFIED: Added typicalCPP to card context ---
                const cardContext = cardsToAnalyze.map(c =>
                    `- ${c.name}: ${c.earnRate} (Value: ~${c.typicalCPP || 1} cents/point, Fee: $${c.annualFee})`
                ).join("\n");

                const prompt = `
                Analyze this image (receipt, product, or food). 
                1. Identify the Merchant Category Code (MCC) or general category (e.g., Grocery, Dining, Gas, Drugstore).
                2. Review the following Credit Cards:
                ${cardContext}
                
                3. Determine which card yields the HIGHEST return for this specific purchase.
                4. Calculate the approximate % return value (Multiplier * CPP).
                
                IMPORTANT: Return ONLY raw JSON. Do not include Markdown formatting (no \`\`\`json).
                Structure:
                {
                    "category": "String (e.g. Dining)",
                    "recommendedCard": "String (Name of card)",
                    "reasoning": "String (Short explanation why)",
                    "estimatedReturn": "String (e.g. '4 points/$1')",
                    "returnPercentage": "String (e.g. '~4.5%')"
                }
                `;

                if (!GEMINI_API_KEY) {
                    throw new Error("No Gemini API Key found.");
                }

                const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

                // Call the API
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: image.type,
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ]
                });

                // --- ROBUST RESPONSE PARSING ---
                let responseText = "";

                // 1. Extract text safely
                if (typeof response.text === 'function') {
                    responseText = response.text();
                } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                    responseText = response.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Could not extract text from AI response.");
                }

                console.log("Raw AI Response:", responseText); // Helpful for debugging

                // 2. Extract JSON using Regex (ignores "I am unable..." or Markdown wrappers)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);

                if (!jsonMatch) {
                    // Check if it's a refusal
                    if (responseText.includes("unable") || responseText.includes("cannot")) {
                        throw new Error("The AI refused to analyze this image. Try an image without people or sensitive text.");
                    }
                    throw new Error("AI did not return valid JSON.");
                }

                // 3. Parse the extracted JSON string
                const jsonString = jsonMatch[0];
                const data = JSON.parse(jsonString);

                setOptimizerResult(data);
                setIsAnalyzing(false);
            };
        } catch (error) {
            console.error("Optimization failed:", error);
            alert(`Analysis failed: ${error.message}`);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="optimizer-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>

            <section className="optimizer-header">
                <h2>Spending Optimizer</h2>
                <p>Upload a receipt or snap a photo of a product. Credere Vision will tell you which card to use.</p>
            </section>

            <div className="optimizer-grid">
                {/* Left Panel: Wallet Config */}
                <div className="panel wallet-panel">
                    <div className="panel-header">
                        <h3>My Wallet</h3>
                        <div className="toggle-container">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={useEntireDb}
                                    onChange={() => setUseEntireDb(!useEntireDb)}
                                />
                                <span className="slider round"></span>
                            </label>
                            <span>Use Entire Database (Any)</span>
                        </div>
                    </div>

                    {!useEntireDb && (
                        <>
                            {/* --- NEW: INSTITUTION MULTI-SELECT DROPDOWN --- */}
                            <div className="institution-filter-wrapper" style={{ position: 'relative', margin: '1rem 0' }}>
                                <button
                                    className="btn-filter-dropdown"
                                    onClick={() => setIsIssuerDropdownOpen(!isIssuerDropdownOpen)}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem',
                                        color: '#555'
                                    }}
                                >
                                    <span>
                                        {selectedIssuers.length === 0
                                            ? "Filter by Institution (All)"
                                            : `${selectedIssuers.length} Institution${selectedIssuers.length > 1 ? 's' : ''} Selected`}
                                    </span>
                                    <span>{isIssuerDropdownOpen ? "▲" : "▼"}</span>
                                </button>

                                {isIssuerDropdownOpen && (
                                    <div className="filter-dropdown-content" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        background: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        marginTop: '4px'
                                    }}>
                                        {allIssuers.map(issuer => (
                                            <div
                                                key={issuer}
                                                onClick={() => toggleIssuer(issuer)}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #f5f5f5',
                                                    background: selectedIssuers.includes(issuer) ? '#fafafa' : 'white'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px', height: '16px', border: '1px solid #ccc', borderRadius: '3px',
                                                    marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: selectedIssuers.includes(issuer) ? 'var(--warm-gold)' : 'white',
                                                    borderColor: selectedIssuers.includes(issuer) ? 'var(--warm-gold)' : '#ccc'
                                                }}>
                                                    {selectedIssuers.includes(issuer) && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{issuer}</span>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => {setSelectedIssuers([]); setIsIssuerDropdownOpen(false);}}
                                            style={{padding: '8px 12px', cursor: 'pointer', color: 'var(--warm-gold)', fontSize: '0.8rem', textAlign:'center', fontWeight:'bold', borderTop:'1px solid #eee'}}
                                        >
                                            Clear Filters
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="card-selector-list">
                                <p className="instruction">Select the cards you own:</p>
                                {/* USES DISPLAYED CARDS (Filtered) INSTEAD OF ALL CARDS */}
                                {displayedCards.length === 0 ? (
                                    <p style={{fontStyle:'italic', color: '#888', textAlign:'center', padding:'1rem'}}>No cards match current filter.</p>
                                ) : (
                                    displayedCards.map(card => (
                                        <div
                                            key={card.id}
                                            className={`wallet-card-item ${myWalletIds.includes(card.id) ? 'selected' : ''}`}
                                            onClick={() => toggleCard(card.id)}
                                        >
                                            <div className="checkbox-indicator">
                                                {myWalletIds.includes(card.id) && "✓"}
                                            </div>
                                            <div className="card-info">
                                                <div className="card-name">{card.name}</div>
                                                <div className="card-issuer">{card.issuer}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                    {/* Visual cue for mobile wallets - optional but good context */}

                </div>

                {/* Right Panel: Vision Analysis */}
                <div className="panel vision-panel">
                    <h3>Visual Analysis</h3>
                    <div className="upload-area">
                        {!previewUrl ? (
                            <label className="file-upload-label">
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                                <span className="upload-icon" style={{fontSize: '3rem'}}>📷</span>
                                <span>Click to upload Receipt or Item</span>
                            </label>
                        ) : (
                            <div className="image-preview">
                                <img src={previewUrl} alt="Analysis Target" />
                                <button className="btn-clear" onClick={() => { setPreviewUrl(null); setImage(null); setOptimizerResult(null); }}>✕ Remove</button>
                            </div>
                        )}
                    </div>

                    <button
                        className="btn-primary btn-analyze"
                        onClick={runOptimization}
                        disabled={isAnalyzing || !image}
                        style={{width: '100%', padding: '1rem', marginTop: '1rem'}}
                    >
                        {isAnalyzing ? "Consulting the Oracle..." : "Analyze & Optimize"}
                    </button>

                    {optimizerResult && (
                        <div className="result-card fade-in">
                            <div className="result-header">
                                <span className="label" style={{fontSize: '0.8rem', opacity: 0.8}}>BEST CARD</span>
                                <h4 style={{fontSize: '1.4rem', margin: '0.5rem 0'}}>{optimizerResult.recommendedCard}</h4>
                            </div>
                            <div className="result-body">
                                <div className="result-row">
                                    <strong>Category Detected:</strong>
                                    <span>{optimizerResult.category}</span>
                                </div>
                                {/* --- MODIFIED: Added return percentage below estimated return --- */}
                                <div className="result-row">
                                    <strong>Estimated Return:</strong>
                                    <div style={{textAlign: 'right'}}>
                                        <span className="highlight" style={{display:'block'}}>{optimizerResult.estimatedReturn}</span>
                                        {optimizerResult.returnPercentage && (
                                            <span style={{fontSize: '0.85rem', color: 'var(--slate)', fontWeight: '500'}}>
                                                ({optimizerResult.returnPercentage} return)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="result-reason">
                                    <p>"{optimizerResult.reasoning}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .optimizer-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 1rem;
                }
                .panel {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    padding: 1.5rem;
                    border: 1px solid var(--border-gray);
                }
                .wallet-card-item {
                    display: flex;
                    align-items: center;
                    padding: 0.8rem;
                    border: 1px solid #eee;
                    margin-bottom: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .wallet-card-item:hover { background: #fafafa; }
                .wallet-card-item.selected {
                    background: rgba(212, 165, 116, 0.1);
                    border-color: var(--warm-gold);
                }
                .checkbox-indicator {
                    width: 20px; height: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-right: 1rem;
                    display: flex; align-items: center; justify-content: center;
                    color: var(--warm-gold); fontWeight: bold;
                }
                .wallet-card-item.selected .checkbox-indicator {
                    border-color: var(--warm-gold);
                    background: white;
                }
                .card-selector-list {
                    max-height: 400px;
                    overflow-y: auto;
                    margin-top: 1rem;
                }
                .upload-area {
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 1.5rem 0;
                    position: relative;
                    overflow: hidden;
                    background-color: #f9f9f9;
                }
                .file-upload-label {
                    cursor: pointer;
                    display: flex; flex-direction: column; align-items: center;
                    color: var(--slate);
                    width: 100%; height: 100%;
                    justify-content: center;
                }
                .image-preview img {
                    max-height: 100%; max-width: 100%;
                    object-fit: contain;
                }
                .image-preview {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    flex-direction: column;
                }
                .btn-clear {
                    position: absolute; top: 10px; right: 10px;
                    background: rgba(0,0,0,0.6); color: white;
                    border: none; padding: 5px 10px; border-radius: 4px;
                    cursor: pointer;
                }
                .result-card {
                    margin-top: 1.5rem;
                    border: 1px solid var(--warm-gold);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .result-header {
                    background: var(--warm-gold);
                    color: white;
                    padding: 1rem;
                    text-align: center;
                }
                .result-body { padding: 1.5rem; }
                .result-row {
                    display: flex; justify-content: space-between;
                    margin-bottom: 0.8rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 0.5rem;
                }
                .highlight { color: var(--deep-gold); font-weight: bold; }
                .toggle-container {
                    display: flex; align-items: center; gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                /* Switch CSS */
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--warm-gold); }
                input:checked + .slider:before { transform: translateX(18px); }
            `}</style>
        </div>
    );
}

function QuizPage({ availableCards, selectedBank, setQuizResults }) {
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

    const determineArchetype = (answers) => {
        const { 1: spending, 4: travel, 5: income } = answers;
        if (income === 'student') return "The Aspiring Student";
        if (travel === 'frequent' || travel === 'multiple') return "The Jetsetter";
        if (spending === 'very-high' && income === 'high') return "The High Roller";
        if (spending === 'low') return "The Value Seeker";
        return "The Balanced Spender";
    };

    const getRecommendations = () => {
        const { 1: spendingAmount, 2: topCategory, 3: carriesBalance, 4: travelFreq, 5: incomeLevel } = answers;
        const incomeMap = { 'student': 15000, 'entry': 35000, 'mid': 65000, 'high': 120000 };
        const userIncome = incomeMap[incomeLevel] || 0;
        const archetype = determineArchetype(answers);

        return availableCards.map(card => {
            let score = 0;
            let reasons = [];
            if (card.minIncome > userIncome) return { card, score: -999, reasons: [] };
            const earnRateLower = card.earnRate.toLowerCase();

            switch (archetype) {
                case "The Aspiring Student":
                    if (card.studentFriendly) { score += 30; reasons.push("Student-specific benefits"); }
                    if (card.annualFee === 0) { score += 20; reasons.push("No annual fee"); }
                    else { score -= 20; }
                    break;
                case "The Jetsetter":
                    if (card.category === 'travel') { score += 25; reasons.push("Premium travel rewards"); }
                    if (card.foreignFee === 0) { score += 20; reasons.push("No FX fees"); }
                    break;
                case "The High Roller":
                    if (card.tier === 'S') { score += 25; reasons.push("Luxury perks matching your lifestyle"); }
                    break;
                case "The Value Seeker":
                    if (card.annualFee === 0) { score += 30; reasons.push("Zero annual fee"); }
                    break;
                default:
                    if (card.annualFee < 150) score += 10;
                    break;
            }

            if (topCategory === 'groceries' && (earnRateLower.includes('grocery') || earnRateLower.includes('food'))) { score += 15; reasons.push("High grocery earn rate"); }
            else if (topCategory === 'gas' && (earnRateLower.includes('gas') || earnRateLower.includes('transport'))) { score += 15; reasons.push("Great for gas"); }
            else if (topCategory === 'travel' && (earnRateLower.includes('travel') || earnRateLower.includes('flight'))) { score += 15; reasons.push("Accelerated travel earning"); }

            return { card, score, reasons };
        })
            .filter(item => item.score > -100)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    };

    // Update global state when results are shown
    useEffect(() => {
        if (showResults) {
            const recs = getRecommendations();
            setQuizResults(recs);
        }
    }, [showResults]);

    if (showResults) {
        const recommendations = getRecommendations();
        const archetype = determineArchetype(answers);
        const hasResults = recommendations.length > 0;

        return (
            <div className="results-page">
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <span style={{display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--warm-gold)', color: 'white', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.05em'}}>ARCHETYPE DETECTED</span>
                    <h2 style={{fontSize: '2.5rem', margin: '0'}}>{archetype}</h2>
                </div>
                {!hasResults && <div className="result"><p>No matches found.</p><button className="btn-secondary" onClick={() => {setShowResults(false); setCurrentQuestion(0);}}>Try Again</button></div>}
                {recommendations.map((rec, idx) => (
                    <div key={rec.card.id} className="recommendation-card">
                        <div className="rec-header">
                            <span className="rec-rank">#{idx + 1}</span>
                            <h3>{rec.card.name}</h3>
                            <span className={`tier-badge tier-${rec.card.tier.toLowerCase()}`}>{rec.card.tier}</span>
                        </div>
                        <div className="rec-reasons">
                            <h4>Why this fits:</h4>
                            <ul>{rec.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                        </div>
                        <div className="rec-details">
                            <div><strong>Fee:</strong> {rec.card.annualFee === 0 ? "Free" : `$${rec.card.annualFee}`}</div>
                            <div><strong>Type:</strong> {rec.card.category.toUpperCase()}</div>
                            <div><strong>Earn Rate:</strong> {rec.card.earnRate}</div>
                        </div>
                    </div>
                ))}
                {hasResults && <button className="btn-secondary" onClick={() => {setShowResults(false); setCurrentQuestion(0);}}>Retake Quiz</button>}
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

function ComparePage({ availableCards, selectedBank, leftCard, setLeftCard, rightCard, setRightCard }) {

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
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>
            <div className="calculator-card">
                <h2>Cents Per Point (CPP) Calculator</h2>
                <div className="input-group">
                    <label>Points Required</label>
                    <input type="number" placeholder="e.g. 25000" value={points} onChange={(e) => setPoints(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Cash Value of Redemption ($)</label>
                    <input type="number" placeholder="e.g. 500" value={cashValue} onChange={(e) => setCashValue(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={calculateCPP}>Calculate Value</button>
                {result && (
                    <div className="result">
                        <h3>{result}¢ / point</h3>
                        <span className={`value-rating ${getRating(result).class}`}>{getRating(result).label} Value</span>
                    </div>
                )}
            </div>

            {/* RESTORED SECTION */}
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

function LearnPage() {
    const [expandedTerm, setExpandedTerm] = useState(null);
    return (
        <div className="learn-page">
            <div className="greek-column left-column"></div>
            <div className="greek-column right-column"></div>
            <h2>Financial Lexicon</h2>
            <p className="subtitle">Master the language of credit</p>
            <div className="glossary-list">
                {GLOSSARY_TERMS.map((item, index) => (
                    <div key={index} className="glossary-item">
                        <div className="glossary-header" onClick={() => setExpandedTerm(expandedTerm === index ? null : index)}>
                            <h3>{item.term}</h3>
                            <span className="expand-icon">{expandedTerm === index ? "−" : "+"}</span>
                        </div>
                        {expandedTerm === index && (
                            <div className="glossary-content">
                                <p>{item.definition}</p>
                                <div className="why-matters"><strong>Why it matters:</strong>{item.whyMatters}</div>
                                <div className="example"><strong>Example:</strong>{item.example}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* RESTORED SECTION */}
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