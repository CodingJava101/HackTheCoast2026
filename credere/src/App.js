import React, { useState, useMemo, useEffect, useRef } from "react";
import "./App.css";
import { CREDIT_CARDS, GLOSSARY_TERMS, QUIZ_QUESTIONS } from "./data.js";

// --- AI SDK IMPORTS ---
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

/* ================= CONFIGURATION ================= */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // "Rachel"

/* ================= MAIN APP COMPONENT ================= */

function App() {
    const [activeTab, setActiveTab] = useState("home");
    const [showLanding, setShowLanding] = useState(true);
    const [selectedBank, setSelectedBank] = useState("All Institutions");

    // --- SHARED STATE FOR CONTEXT AWARENESS ---
    // We lift this state up so the Chatbot can "see" what's in the Compare/Quiz tabs
    const [compareLeft, setCompareLeft] = useState(null);
    const [compareRight, setCompareRight] = useState(null);
    const [quizResults, setQuizResults] = useState([]); // Stores the recommended cards

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
                    <button className="btn-go" onClick={handleGoClick}>
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
                <button className={activeTab === "calculator" ? "active" : ""} onClick={() => setActiveTab("calculator")}>CPP Calculator</button>
                <button className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}>Find My Card</button>
                <button className={activeTab === "compare" ? "active" : ""} onClick={() => setActiveTab("compare")}>Compare Cards</button>
                <button className={activeTab === "learn" ? "active" : ""} onClick={() => setActiveTab("learn")}>Learn</button>
            </nav>

            <main className="content">
                {activeTab === "home" && <HomePage setActiveTab={setActiveTab} selectedBank={selectedBank} />}
                {activeTab === "calculator" && <CPPCalculator />}

                {/* Pass Setters to Pages so they can update the App state */}
                {activeTab === "quiz" && (
                    <QuizPage
                        availableCards={availableCards}
                        selectedBank={selectedBank}
                        setQuizResults={setQuizResults} // <--- Passed down
                    />
                )}
                {activeTab === "compare" && (
                    <ComparePage
                        availableCards={availableCards}
                        selectedBank={selectedBank}
                        leftCard={compareLeft}          // <--- Passed down
                        setLeftCard={setCompareLeft}    // <--- Passed down
                        rightCard={compareRight}        // <--- Passed down
                        setRightCard={setCompareRight}  // <--- Passed down
                    />
                )}
                {activeTab === "learn" && <LearnPage />}
            </main>

            {/* AI CONTEXT LAYER */}
            <Chatbot
                availableCards={availableCards}
                selectedBank={selectedBank}
                activeTab={activeTab}
                compareLeft={compareLeft}   // <--- AI sees left card
                compareRight={compareRight} // <--- AI sees right card
                quizResults={quizResults}   // <--- AI sees quiz results
            />

            <footer className="footer">
                <p>Currently viewing: <strong>{selectedBank}</strong></p>
                <p>No affiliate links • Built for transparency</p>
                <p className="disclaimer">Data is for educational purposes. Consult the issuer for official terms.</p>
            </footer>
        </div>
    );
}

/* ================= CHATBOT COMPONENT (CONTEXT AWARE) ================= */

function Chatbot({ availableCards, selectedBank, activeTab, compareLeft, compareRight, quizResults }) {
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
        // 1. Base Database (All Available Cards)
        const fullDb = availableCards.map(c =>
            `[DB: ${c.name} | Fee: $${c.annualFee} | Student: ${c.studentFriendly ? "YES" : "NO"} | Cat: ${c.category} | Earn: ${c.earnRate.substring(0, 40)}...]`
        ).join("\n");

        // 2. Dynamic "On Screen" Context
        let screenContext = "";

        if (activeTab === "compare") {
            if (compareLeft || compareRight) {
                screenContext = `
                CURRENTLY COMPARING:
                LEFT: ${compareLeft ? compareLeft.name + ` ($${compareLeft.annualFee})` : "Empty"}
                RIGHT: ${compareRight ? compareRight.name + ` ($${compareRight.annualFee})` : "Empty"}
                
                INSTRUCTION: Compare these specific cards if asked. Highlight differences in fee and earn rate.
                `;
            } else {
                screenContext = "CURRENTLY COMPARING: Nothing selected yet.";
            }
        } else if (activeTab === "quiz") {
            if (quizResults.length > 0) {
                screenContext = `
                QUIZ RESULTS DISPLAYED:
                ${quizResults.map((r, i) => `#${i+1}: ${r.card.name} (${r.reasons.join(", ")})`).join("\n")}
                
                INSTRUCTION: Explain why these specific cards were recommended based on the user's quiz inputs.
                `;
            } else {
                screenContext = "QUIZ STATUS: User is taking the quiz or hasn't started.";
            }
        } else if (activeTab === "calculator") {
            screenContext = "USER LOCATION: CPP Calculator. Help them calculate the value of their points (Cents Per Point).";
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
        1. PRIORITIZE the "CURRENTLY COMPARING" or "QUIZ RESULTS" data above. That is what the user is looking at.
        2. Keep answers under 60 words.
        3. Be concise and helpful.
        `;
    };

    /* ---------- Local Intelligence Fallback ---------- */
    const localFallback = (query) => {
        const q = query.toLowerCase();

        // 1. Context Specific Answers
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

        // 2. General Search
        const matched = availableCards.filter(c => q.includes(c.name.toLowerCase())).slice(0, 3);
        if (matched.length > 0) return `Found: ${matched.map(c => c.name).join(", ")}.`;

        return "I can help you compare cards, explain fees, or analyze your quiz results.";
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

// ================= MODIFIED PAGE COMPONENTS (RECEIVING PROPS) =================

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

// Updated QuizPage to accept setQuizResults
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

// Updated ComparePage to accept props
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
        </div>
    );
}

export default App;