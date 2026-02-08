// Credit card data
export const CREDIT_CARDS = [
  {
    id: 1,
    name: "RBC® British Airways Visa Infinite†",
    issuer: "RBC",
    annualFee: 165,
    earnRate: "3x points on British Airways†",
    welcomeBonus: "Companion award eVoucher upon $30,000 spend†",
    minIncome: 60000,
    tier: "A",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 1.8,
    foreignFee: 2.5,
  },
  {
    id: 2,
    name: "Business Platinum Card from American Express",
    issuer: "American Express",
    annualFee: 799,
    earnRate: "Varies by category",
    welcomeBonus: "$200 annual travel credit",
    minIncome: 100000,
    tier: "S",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 2.0,
    foreignFee: 0,
  },
  {
    id: 3,
    name: "American Express Gold Rewards Card",
    issuer: "American Express",
    annualFee: 0,
    earnRate: "2x points on travel, gas, grocery & drugstore",
    welcomeBonus: "Plaza Premium Lounge passes",
    minIncome: 12000,
    tier: "B",
    category: "cashback",
    studentFriendly: true,
    typicalCPP: 1.5,
    foreignFee: 2.5,
  },
  {
    id: 4,
    name: "American Express Platinum Card",
    issuer: "American Express",
    annualFee: 799,
    earnRate: "Varies by category",
    welcomeBonus: "$200 annual travel credit",
    minIncome: 100000,
    tier: "S",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 2.0,
    foreignFee: 0,
  },
  {
    id: 5,
    name: "American Express Aeroplan Business Reserve Card",
    issuer: "American Express",
    annualFee: 599,
    earnRate: "3x points on Air Canada flights and vacations",
    welcomeBonus: "Unlimited Maple Leaf Lounge access",
    minIncome: 80000,
    tier: "S",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 2.0,
    foreignFee: 0,
  },
  {
    id: 6,
    name: "American Express Aeroplan Reserve Card",
    issuer: "American Express",
    annualFee: 599,
    earnRate: "3x points on Air Canada flights and vacations",
    welcomeBonus: "Unlimited Maple Leaf Lounge access",
    minIncome: 80000,
    tier: "S",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 2.0,
    foreignFee: 0,
  },
  {
    id: 7,
    name: "American Express Business Gold Rewards Card",
    issuer: "American Express",
    annualFee: 199,
    earnRate: "Varies by category",
    welcomeBonus: "10,000 MR Quarterly Purchase Bonus",
    minIncome: 60000,
    tier: "A",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 1.7,
    foreignFee: 0,
  },
  {
    id: 8,
    name: "Marriott Bonvoy Business American Express Card",
    issuer: "American Express",
    annualFee: 150,
    earnRate: "Varies by category",
    welcomeBonus: "Anniversary free night award",
    minIncome: 60000,
    tier: "A",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 1.5,
    foreignFee: 0,
  },
  {
    id: 9,
    name: "Marriott Bonvoy American Express Card",
    issuer: "American Express",
    annualFee: 120,
    earnRate: "Varies by category",
    welcomeBonus: "Anniversary Free Night Award",
    minIncome: 60000,
    tier: "A",
    category: "travel",
    studentFriendly: false,
    typicalCPP: 1.5,
    foreignFee: 0,
  },
];

// Glossary terms
export const GLOSSARY_TERMS = [
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

// Quiz questions
export const QUIZ_QUESTIONS = [
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
