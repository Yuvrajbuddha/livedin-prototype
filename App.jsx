import React, { useState, useRef, useEffect } from "react";

/* ---------------------------------------------------------
   LIVEDIN — "One Health Identity. Lifetime Care."
   Interactive prototype covering:
   - Citizen App (mobile frame)
   - Hospital Portal (desktop)
   - Government Dashboard (desktop)
   Colors match the proposal's design system exactly.
--------------------------------------------------------- */

const COLORS = {
  primary: "#005b9f",
  accent: "#10b981",
  slate: "#0f172a",
  bg: "#f8fafc",
  alert: "#fee2e2",
  alertText: "#b91c1c",
  purple: "#7c3aed",
};

const MOCK_CITIZEN = {
  name: "Yuvraj Maurya",
  uid: "LVD-2026-8942",
  pin: "4821",
  age: 19,
  bloodGroup: "O+",
  allergies: ["Penicillin", "Peanuts"],
  condition: "Type 2 Diabetes",
  emergencyContact: "+91-9876543210 (Wife)",
  healthScore: 85,
};

const EXTRA_PEOPLE = [
  { name: "Yuvraj Maurya", age: 19 },
  { name: "Yash Gupta", age: 19 },
  { name: "Swapnil Tripathi", age: 22 },
];

const MOCK_RECORDS = [
  { id: 1, title: "CBC Blood Report", meta: "Uploaded via App", date: "Today" },
  { id: 2, title: "Prescription Added", meta: "Dr. Sharma - General Phys. · City Hospital", date: "12 Oct" },
  { id: 3, title: "COVID-19 Booster", meta: "District PHC", date: "10 Jan" },
];

const MOCK_TIMELINE = [
  { when: "Today, 10:00 AM", title: "AI Report Uploaded", note: "Risk Flag: Low Hemoglobin" },
  { when: "Oct 12, 2025", title: "Hospital Visit", note: "City Care Clinic. Dr. notes updated." },
  { when: "1 Yr ago", title: "Covid Vaccine", note: "Booster dose administered." },
];

const MOCK_SCHEMES = [
  {
    name: "Ayushman Bharat (PM-JAY)",
    eligible: true,
    detail: "Up to ₹5 Lakhs health cover per family per year.",
  },
  {
    name: "PM Matru Vandana Yojana",
    eligible: false,
    detail: "Not applicable (gender/age criteria).",
  },
];

export const CITIZEN_STORAGE_KEY = "livedin_citizens";

function normalizeUid(uid) {
  return String(uid || "").trim().toUpperCase();
}

function normalizePin(pin) {
  return String(pin || "").trim();
}

export function getStoredCitizens() {
  if (typeof window === "undefined") {
    return [MOCK_CITIZEN];
  }

  try {
    const stored = window.localStorage.getItem(CITIZEN_STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify([MOCK_CITIZEN]));
      return [MOCK_CITIZEN];
    }

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  } catch (error) {
    console.warn("Could not read saved citizens", error);
  }

  return [MOCK_CITIZEN];
}

export function saveCitizen(citizen) {
  if (typeof window === "undefined") {
    return citizen;
  }

  const nextCitizen = {
    ...citizen,
    uid: normalizeUid(citizen.uid || `LVD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`),
    pin: normalizePin(citizen.pin),
  };

  const existing = getStoredCitizens().filter((entry) => normalizeUid(entry.uid) !== normalizeUid(nextCitizen.uid));
  const nextCitizens = [nextCitizen, ...existing];
  window.localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(nextCitizens));
  return nextCitizen;
}

export function deleteCitizen(uid) {
  if (typeof window === "undefined") {
    return [];
  }

  const nextCitizens = getStoredCitizens().filter((entry) => normalizeUid(entry.uid) !== normalizeUid(uid));
  window.localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(nextCitizens));
  return nextCitizens;
}

export function findCitizenByUid(uid, pin) {
  const normalizedUid = normalizeUid(uid);
  const normalizedPin = normalizePin(pin);

  return getStoredCitizens().find((citizen) => {
    return normalizeUid(citizen.uid) === normalizedUid && normalizePin(citizen.pin) === normalizedPin;
  });
}

export function createCitizenProfile({ name, uid, pin }) {
  const normalizedUid = normalizeUid(uid || `LVD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`);
  const normalizedPin = normalizePin(pin);

  return {
    name: String(name || "New Citizen").trim(),
    uid: normalizedUid,
    pin: normalizedPin,
    age: 18,
    bloodGroup: "Not set",
    allergies: [],
    condition: "No major condition recorded",
    emergencyContact: "Add contact",
    healthScore: 80,
  };
}

function getPinStrength(pin) {
  const value = normalizePin(pin);
  if (!value) {
    return { score: 0, label: "Enter a PIN", color: "#64748b" };
  }
  if (value.length < 4) {
    return { score: 1, label: "Too short", color: COLORS.alertText };
  }
  if (value.length < 6) {
    return { score: 2, label: "Fair", color: "#f59e0b" };
  }
  return { score: 3, label: "Strong", color: COLORS.accent };
}

/* ---------- shared bits ---------- */

function PhoneFrame({ children }) {
  return (
    <div
      style={{
        width: 320,
        height: 640,
        borderRadius: 32,
        border: `8px solid ${COLORS.slate}`,
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 45px rgba(15,23,42,0.25)",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

function ScreenHeader({ title, onBack, dark }) {
  return (
    <div
      style={{
        background: COLORS.primary,
        color: "#fff",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 700,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        flexShrink: 0,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ←
        </button>
      )}
      <span>{title}</span>
    </div>
  );
}

function PrimaryButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: COLORS.primary,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "12px 16px",
        fontWeight: 700,
        cursor: "pointer",
        width: "100%",
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 14,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const bodyFont = { fontFamily: "'Segoe UI', Arial, sans-serif" };

const translations = {
  en: {
    getStarted: "Get Started →",
    splashSubtitle: "One Health Identity. Lifetime Care.",
    selectRole: "Select Your Role",
    citizen: "Citizen",
    citizenDesc: "Access records, AI assistant & schemes",
    hospital: "Hospital",
    hospitalDesc: "Manage patients & update records",
    government: "Government",
    governmentDesc: "Analytics & public health monitoring",
    citizenLogin: "Citizen Login",
    healthUid: "Health UID",
    healthPin: "Health PIN",
    loginSecurely: "Login securely",
    voiceLogin: "🎤 Login with Voice",
    newUserTitle: "Create a new Health UID",
    uidHowTitle: "How citizens create a Health UID",
    uidHowText: "Enter your name, tap Generate UID, choose a secure PIN, and confirm it. Your Health UID becomes your personal health identity.",
    uidHowNote: "Use this UID later to sign in to your health dashboard.",
    fullName: "Full name",
    choosePin: "Choose Health PIN",
    confirmPin: "Confirm Health PIN",
    createAccount: "Create account",
    switchToRegister: "Create new Health UID",
    switchToLogin: "Back to login",
    registerSuccess: "Account created. You can now log in.",
    registerError: "Please enter a name, a UID, and matching PINs.",
    demoAccount: "Use demo account",
    generateUid: "Generate UID",
    pinHint: "Use 4 or more digits for a stronger PIN.",
    rememberMe: "Remember me",
    forgotPin: "Forgot PIN?",
    forgotPinMessage: "Use the demo PIN 4821 or create a new account.",
    onboardingTitle: "Welcome to LIVEDIN",
    onboardingText: "Create your health profile in a few easy steps and start using your secure Health UID.",
    onboardingCta: "Start setup",
    welcomeBack: "Welcome back",
    welcomeBackText: "Your health dashboard is ready.",
    dismiss: "Dismiss",
    incorrectPin: "Incorrect PIN. Try 4821 for this demo.",
    home: "Home · 🔔 2",
    healthScore: "Health Score",
    goodStanding: "Good standing. 1 test due.",
    aiAdvice: "Today's AI Advice",
    vaccinations: "Upcoming Vaccinations",
    vaccinationNote: "Covid Booster — Overdue by 2 weeks.",
    aiAdviceNote: "Take Paracetamol at 2:00 PM after lunch. Keep hydrated.",
    aiAssistant: "AI Assistant",
    uploadReport: "Upload Report",
    myRecords: "My Records",
    govtSchemes: "Govt Schemes",
    healthTimeline: "Health Timeline",
    emergencyQr: "Emergency QR",
    profile: "Profile",
    assistantTitle: "AI Assistant (हिंदी / Eng)",
    assistantIntro: "Hello! I am your LIVEDIN assistant. How can I help you today?",
    assistantError: "I'm having trouble responding right now. Please try again.",
    assistantTyping: "Assistant is typing…",
    assistantPlaceholder: "Type message...",
    send: "Send",
    uploadTitle: "Upload Document",
    uploadAreaTitle: "Take Photo or Upload PDF",
    uploadAreaSubtitle: "Supports Blood Reports, X-Ray, Prescriptions",
    processing: "Processing… OCR extracting text...",
    riskIndicator: "Risk Indicator: Abnormal Values Found",
    extractedHighlights: "Extracted Highlights",
    aiRecommendation: "AI Recommendation",
    updateTimeline: "Update Health Timeline",
    recordsTitle: "My Records",
    schemesTitle: "Govt Schemes",
    eligibleText: "✓ AI Analysis: Based on your profile (Farmer, Income < ₹2L), you are eligible for 1 scheme.",
    applyText: "View Details & Apply",
    notApplicable: "Not applicable",
    timelineTitle: "Health Timeline",
    emergencyTitle: "Emergency Card",
    emergencyUid: "UID",
    emergencyBlood: "Blood Group",
    emergencyAllergies: "Allergies",
    emergencyCondition: "Condition",
    emergencyContact: "Contact",
    emergencyNote: "Scan grants emergency info only — full records stay PIN-protected.",
    profileTitle: "Profile",
    relatedPatients: "Related patients",
    updateMedicalInfo: "Update Medical Info",
    changePin: "Change Health PIN",
    languageOption: "Language / भाषा (Hindi)",
    languageOptionHi: "भाषा / Language (English)",
    profileName: "Profile",
    signOut: "Sign out",
  },
  hi: {
    getStarted: "शुरू करें →",
    splashSubtitle: "वन हेल्थ पहचान। जीवन भर की देखभाल।",
    selectRole: "अपना रोल चुनें",
    citizen: "नागरिक",
    citizenDesc: "रिकॉर्ड, एआई सहायक और योजनाएँ देखें",
    hospital: "अस्पताल",
    hospitalDesc: "रोगियों का प्रबंधन और रिकॉर्ड अपडेट करें",
    government: "सरकार",
    governmentDesc: "विश्लेषण और सार्वजनिक स्वास्थ्य निगरानी",
    citizenLogin: "नागरिक लॉगिन",
    healthUid: "स्वास्थ्य UID",
    healthPin: "स्वास्थ्य PIN",
    loginSecurely: "सुरक्षित रूप से लॉगिन करें",
    voiceLogin: "🎤 आवाज से लॉगिन",
    newUserTitle: "नया Health UID बनाएँ",
    uidHowTitle: "नागरिक Health UID कैसे बनाते हैं",
    uidHowText: "अपना नाम दर्ज करें, Generate UID पर tap करें, एक सुरक्षित PIN चुनें और उसकी पुष्टि करें। आपका Health UID आपकी व्यक्तिगत स्वास्थ्य पहचान बन जाता है।",
    uidHowNote: "भविष्य में इस UID से अपने हेल्थ डैशबोर्ड में साइन इन करें।",
    fullName: "पूरा नाम",
    choosePin: "स्वास्थ्य PIN चुनें",
    confirmPin: "PIN की पुष्टि करें",
    createAccount: "खाता बनाएं",
    switchToRegister: "नया Health UID बनाएँ",
    switchToLogin: "लॉगिन पर वापस जाएँ",
    registerSuccess: "खाता बन गया। अब आप लॉगिन कर सकते हैं।",
    registerError: "कृपया नाम, UID और मेल खाने वाला PIN दर्ज करें।",
    demoAccount: "डेमो अकाउंट उपयोग करें",
    generateUid: "UID जनरेट करें",
    pinHint: "मज़बूत PIN के लिए 4 या अधिक अंक इस्तेमाल करें।",
    rememberMe: "मुझे याद रखें",
    forgotPin: "PIN भूल गए?",
    forgotPinMessage: "डेमो PIN 4821 का उपयोग करें या नया अकाउंट बनाएं।",
    onboardingTitle: "LIVEDIN में आपका स्वागत है",
    onboardingText: "कुछ आसान चरणों में अपना स्वास्थ्य प्रोफ़ाइल बनाएं और अपना सुरक्षित Health UID इस्तेमाल करना शुरू करें।",
    onboardingCta: "सेटअप शुरू करें",
    welcomeBack: "वापस स्वागत है",
    welcomeBackText: "आपका हेल्थ डैशबोर्ड तैयार है।",
    dismiss: "बंद करें",
    incorrectPin: "गलता PIN। इस डेमो के लिए 4821 आज़माएं।",
    home: "होम · 🔔 2",
    healthScore: "स्वास्थ्य स्कोर",
    goodStanding: "अच्छी स्थिति। 1 टेस्ट बाकी है।",
    aiAdvice: "आज की एआई सलाह",
    vaccinations: "आगामी टीकाकरण",
    vaccinationNote: "कोविड बूस्टर — 2 हफ्ते से देरी।",
    aiAdviceNote: "दोपहर 2:00 बजे पैरासिटामोल लें। हाइड्रेट रहें।",
    aiAssistant: "एआई सहायक",
    uploadReport: "रिपोर्ट अपलोड करें",
    myRecords: "मेरे रिकॉर्ड",
    govtSchemes: "सरकारी योजनाएँ",
    healthTimeline: "स्वास्थ्य टाइमलाइन",
    emergencyQr: "आपातकालीन QR",
    profile: "प्रोफ़ाइल",
    assistantTitle: "एआई सहायक (हिंदी / Eng)",
    assistantIntro: "नमस्ते! मैं आपका LIVEDIN सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    assistantError: "मैं अभी जवाब देने में समस्या महसूस कर रहा हूँ। कृपया फिर से कोशिश करें।",
    assistantTyping: "सहायक टाइप कर रहा है…",
    assistantPlaceholder: "संदेश लिखें...",
    send: "भेजें",
    uploadTitle: "दस्तावेज अपलोड करें",
    uploadAreaTitle: "फोटो लें या PDF अपलोड करें",
    uploadAreaSubtitle: "ब्लड रिपोर्ट, X-Ray, पर्ची समर्थित",
    processing: "प्रोसेसिंग… OCR टेक्स्ट निकाल रहा है...",
    riskIndicator: "जोखिम संकेतक: असामान्य मान मिले",
    extractedHighlights: "निकाले गए मुख्य बिंदु",
    aiRecommendation: "एआई सिफ़ारिश",
    updateTimeline: "स्वास्थ्य टाइमलाइन अपडेट करें",
    recordsTitle: "मेरे रिकॉर्ड",
    schemesTitle: "सरकारी योजनाएँ",
    eligibleText: "✓ एआई विश्लेषण: आपकी प्रोफ़ाइल (किसान, आय < ₹2L) के आधार पर आप 1 योजना के लिए पात्र हैं।",
    applyText: "विवरण देखें और आवेदन करें",
    notApplicable: "लागू नहीं",
    timelineTitle: "स्वास्थ्य टाइमलाइन",
    emergencyTitle: "आपातकालीन कार्ड",
    emergencyUid: "UID",
    emergencyBlood: "रक्त समूह",
    emergencyAllergies: "एलर्जी",
    emergencyCondition: "स्थिति",
    emergencyContact: "संपर्क",
    emergencyNote: "स्कैन केवल आपातकालीन जानकारी देता है — पूरे रिकॉर्ड PIN-से सुरक्षित रहते हैं।",
    profileTitle: "प्रोफ़ाइल",
    relatedPatients: "संबंधित रोगी",
    updateMedicalInfo: "मेडिकल जानकारी अपडेट करें",
    changePin: "स्वास्थ्य PIN बदलें",
    languageOption: "भाषा / Language (English)",
    languageOptionHi: "Language / भाषा (Hindi)",
    profileName: "प्रोफ़ाइल",
    signOut: "लॉग आउट",
  },
};

function getText(language, key) {
  const lang = language === "hi" ? "hi" : "en";
  return translations[lang][key] || translations.en[key];
}

/* ---------- citizen screens ---------- */

function SplashScreen({ go, language }) {
  const t = (key) => getText(language, key);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
        ...bodyFont,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: COLORS.primary,
        }}
      />
      <div style={{ fontWeight: 800, fontSize: 24, color: COLORS.slate }}>LIVEDIN</div>
      <div style={{ color: "#64748b", textAlign: "center", fontSize: 13 }}>
        {t("splashSubtitle")}
      </div>
      <div style={{ flex: 1 }} />
      <PrimaryButton onClick={() => go("role")}>{t("getStarted")}</PrimaryButton>
    </div>
  );
}

function RoleSelect({ go, language }) {
  const t = (key) => getText(language, key);
  const roles = [
    { id: "citizenLogin", color: COLORS.primary, icon: "👤", title: t("citizen"), desc: t("citizenDesc") },
    { id: "hospital", color: COLORS.accent, icon: "🏥", title: t("hospital"), desc: t("hospitalDesc") },
    { id: "government", color: COLORS.purple, icon: "🏛", title: t("government"), desc: t("governmentDesc") },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("selectRole")} onBack={() => go("splash")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {roles.map((r) => (
          <Card key={r.id} onClick={() => go(r.id)} style={{ borderLeft: `4px solid ${r.color}` }}>
            <div style={{ fontWeight: 700, color: r.color }}>{r.icon} {r.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{r.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CitizenLogin({ go, language }) {
  const [uid, setUid] = useState(MOCK_CITIZEN.uid);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [newUid, setNewUid] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [uidGenerated, setUidGenerated] = useState(false);
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [savedCitizens, setSavedCitizens] = useState(() => getStoredCitizens());
  const recognitionRef = useRef(null);
  const t = (key) => getText(language, key);
  const pinStrength = getPinStrength(newPin);

  const parseVoicePin = (transcript) => {
    const digitsFromText = transcript.match(/\d+/g)?.join("");
    if (digitsFromText) {
      return digitsFromText;
    }

    const numberWords = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      shunya: "0",
      ek: "1",
      do: "2",
      teen: "3",
      char: "4",
      pach: "5",
      chah: "6",
      sat: "7",
      aath: "8",
      nau: "9",
      "चार": "4",
      "पाँच": "5",
      "छह": "6",
      "सात": "7",
      "आठ": "8",
      "नौ": "9",
      "तीन": "3",
      "दो": "2",
      "एक": "1",
      "शून्य": "0",
    };

    const spokenWords = transcript
      .toLowerCase()
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const wordDigits = spokenWords.map((word) => numberWords[word] || word).join("");
    return wordDigits.replace(/\D/g, "");
  };

  const submit = (pinValue = pin) => {
    const citizen = findCitizenByUid(uid, pinValue);

    if (citizen) {
      if (rememberMe && typeof window !== "undefined") {
        window.localStorage.setItem("livedin_last_login", JSON.stringify({ uid: citizen.uid, pin: citizen.pin }));
      }
      setError("");
      setRegisterMessage("");
      setShowWelcome(true);
      go("dashboard");
    } else {
      setError(t("incorrectPin"));
    }
  };

  const handleDemoLogin = () => {
    setUid(MOCK_CITIZEN.uid);
    setPin(MOCK_CITIZEN.pin);
    setError("");
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const lastLogin = window.localStorage.getItem("livedin_last_login");
      if (lastLogin) {
        const parsed = JSON.parse(lastLogin);
        setUid(parsed.uid || "");
        setPin(parsed.pin || "");
      }
    } catch (error) {
      console.warn("Could not restore previous login", error);
    }
  }, []);

  const handleGenerateUid = () => {
    const generatedId = createCitizenProfile({ name: fullName || "New Citizen", uid: "", pin: newPin || "1234" }).uid;
    setNewUid(generatedId);
    setUidGenerated(true);
  };

  const handleRegister = () => {
    if (!fullName.trim() || !newPin.trim() || newPin !== confirmPin) {
      setRegisterMessage(t("registerError"));
      return;
    }

    const profile = createCitizenProfile({ name: fullName, uid: newUid, pin: newPin });
    saveCitizen(profile);
    setSavedCitizens(getStoredCitizens());
    setUid(profile.uid);
    setPin(profile.pin);
    setNewUid(profile.uid);
    setUidGenerated(true);
    setRegisterMessage(t("registerSuccess"));
    setIsRegistering(false);
    setShowOnboarding(false);
    setError("");
    setShowLoginPin(true);
    setShowNewPin(false);
    setShowConfirmPin(false);
    setIsRegistering(false);
    go("citizenLogin");
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceStatus("Voice input is not available in this browser. Using the demo PIN so the prototype still works.");
      return undefined;
    }

    setVoiceSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening… say your PIN, for example 4 8 2 1.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setVoiceStatus("Microphone access was blocked. Please allow it and try again.");
      } else {
        setVoiceStatus(`Voice login unavailable: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

      setVoiceTranscript(transcript);
      const parsedPin = parseVoicePin(transcript);

      if (!parsedPin) {
        setVoiceStatus("I couldn’t hear the PIN clearly. Please try again.");
        return;
      }

      const normalizedPin = parsedPin.slice(0, 6);
      setPin(normalizedPin);
      setVoiceStatus(`Heard: ${transcript}`);

      if (normalizedPin.length >= 4) {
        setTimeout(() => submit(normalizedPin), 250);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Ignore cleanup errors.
      }
    };
  }, [go, language]);

  const startVoiceLogin = () => {
    if (!recognitionRef.current) {
      setPin(MOCK_CITIZEN.pin);
      setVoiceStatus("Voice input is not available here, so the demo PIN has been filled in.");
      submit(MOCK_CITIZEN.pin);
      return;
    }

    try {
      recognitionRef.current.stop();
      recognitionRef.current.start();
    } catch (error) {
      setPin(MOCK_CITIZEN.pin);
      setVoiceStatus("Voice capture could not start. The demo PIN has been applied instead.");
      submit(MOCK_CITIZEN.pin);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("citizenLogin")} onBack={() => go("role")} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {!isRegistering ? (
          <>
            {uidGenerated && newUid && (
              <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${COLORS.accent}44`, color: COLORS.slate, fontSize: 12, boxShadow: "0 8px 20px rgba(15,23,42,0.06)" }}>
                <div style={{ fontWeight: 800, color: COLORS.accent, marginBottom: 4, fontSize: 13 }}>Welcome! Your account is ready</div>
                <div style={{ marginBottom: 10, lineHeight: 1.6 }}>Your Health UID and PIN are already filled in. Tap Login to continue.</div>
                <button
                  type="button"
                  onClick={() => submit()}
                  style={{ border: "none", background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                >
                  Continue
                </button>
              </div>
            )}
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("healthUid")}</label>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: COLORS.slate, marginBottom: 4 }}>Create your Health UID</div>
              <div>Enter your name, choose a secure PIN, and confirm it. This UID will help you sign in to your health dashboard whenever you need access.</div>
            </div>
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
            />
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("healthPin")}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={showLoginPin ? "text" : "password"}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                style={{ flex: 1, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPin((prev) => !prev)}
                style={{ border: "1px solid #e2e8f0", background: "#fff", color: COLORS.slate, borderRadius: 8, padding: "8px 10px", fontSize: 11, cursor: "pointer" }}
              >
                {showLoginPin ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Demo: {MOCK_CITIZEN.uid} / {MOCK_CITIZEN.pin}</div>
              <button
                type="button"
                onClick={handleDemoLogin}
                style={{ border: "none", background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "4px 8px", fontSize: 10, cursor: "pointer" }}
              >
                {t("demoAccount")}
              </button>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}>
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe((prev) => !prev)} />
              <span>{t("rememberMe")}</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPin((prev) => !prev)}
              style={{ border: "none", background: "transparent", color: COLORS.primary, textAlign: "left", padding: 0, fontSize: 12, cursor: "pointer", fontWeight: 700 }}
            >
              {t("forgotPin")}
            </button>
            {showForgotPin && (
              <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: 8, borderRadius: 8 }}>
                {t("forgotPinMessage")}
              </div>
            )}
            {error && <div style={{ color: COLORS.alertText, fontSize: 12 }}>{error}</div>}
            <PrimaryButton onClick={() => submit()}>{t("loginSecurely")}</PrimaryButton>
            <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
              {voiceSupported ? "Tap the mic to speak your PIN" : "Voice is unavailable, so the demo PIN is used automatically"}
            </div>
            <button
              type="button"
              onClick={startVoiceLogin}
              disabled={isListening}
              style={{
                border: `1px solid ${COLORS.primary}`,
                color: COLORS.primary,
                background: isListening ? "#e0f2fe" : "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 700,
                cursor: isListening ? "default" : "pointer",
              }}
            >
              {isListening ? "Listening…" : voiceSupported ? t("voiceLogin") : "Use Demo PIN"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(true);
                setRegisterMessage("");
              }}
              style={{
                border: "1px solid #e2e8f0",
                color: COLORS.primary,
                background: "#f8fafc",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 700,
              }}
            >
              {t("switchToRegister")}
            </button>
            {savedCitizens.length > 0 && (
              <div style={{ marginTop: 4, padding: 10, borderRadius: 10, background: "#f8fafc" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 6 }}>Saved citizens</div>
                {savedCitizens.slice(0, 4).map((citizen) => (
                  <div
                    key={citizen.uid}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 6,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      <div style={{ fontWeight: 700, color: COLORS.slate }}>{citizen.name}</div>
                      <div>{citizen.uid}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setUid(citizen.uid);
                          setPin(citizen.pin || "");
                          setError("");
                        }}
                        style={{ border: "none", background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "4px 8px", fontSize: 10, cursor: "pointer" }}
                      >
                        Use
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextCitizens = deleteCitizen(citizen.uid);
                          setSavedCitizens(nextCitizens);
                        }}
                        style={{ border: "none", background: "#fee2e2", color: COLORS.alertText, borderRadius: 8, padding: "4px 8px", fontSize: 10, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {voiceStatus && <div style={{ fontSize: 12, color: "#64748b" }}>{voiceStatus}</div>}
            {voiceTranscript && <div style={{ fontSize: 12, color: COLORS.primary }}>Heard: {voiceTranscript}</div>}
          </>
        ) : showOnboarding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 800, color: COLORS.slate, fontSize: 18 }}>{t("onboardingTitle")}</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{t("onboardingText")}</div>
            <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)", borderRadius: 12, padding: 12, fontSize: 12, color: "#64748b", border: `1px solid ${COLORS.primary}22`, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
              <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 8, fontSize: 13 }}>{t("uidHowTitle")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>{t("uidHowText")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.accent, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>{t("uidHowNote")}</div>
                </div>
              </div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 12, color: "#64748b" }}>
              • Secure Health UID<br />
              • Easy PIN setup<br />
              • Quick access to your health dashboard
            </div>
            <PrimaryButton onClick={() => setIsRegistering(true)}>{t("onboardingCta")}</PrimaryButton>
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(false);
                setIsRegistering(false);
              }}
              style={{
                border: "1px solid #e2e8f0",
                color: COLORS.slate,
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 700,
              }}
            >
              {t("switchToLogin")}
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 800, color: COLORS.slate }}>{t("newUserTitle")}</div>
            <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)", borderRadius: 12, padding: 12, fontSize: 12, color: "#64748b", border: `1px solid ${COLORS.primary}22`, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
              <div style={{ fontWeight: 800, color: COLORS.primary, marginBottom: 8, fontSize: 13 }}>{t("uidHowTitle")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>1</span>
                  <div>{t("uidHowText")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.accent, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>2</span>
                  <div>{t("uidHowNote")}</div>
                </div>
              </div>
            </div>
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("fullName")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
            />
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("healthUid")}</label>
            <div style={{ background: "#eef8f2", borderRadius: 10, padding: "8px 10px", border: `1px solid ${COLORS.accent}33`, fontSize: 12, color: COLORS.slate }}>
              <div style={{ fontWeight: 700, color: COLORS.accent, marginBottom: 2 }}>Create Health UID</div>
              <div>Generate your UID below and use it as your secure health identity.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
                placeholder="LVD-2026-9999"
                style={{
                  flex: 1,
                  padding: 10,
                  border: uidGenerated && newUid ? `1px solid ${COLORS.accent}` : "1px solid #cbd5e1",
                  borderRadius: 8,
                  background: uidGenerated && newUid ? "#f0fdf4" : "#fff",
                  boxShadow: uidGenerated && newUid ? "0 0 0 2px rgba(16,185,129,0.12)" : "none",
                }}
              />
              <button
                type="button"
                onClick={handleGenerateUid}
                style={{ border: "none", background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "0 10px", fontSize: 12, cursor: "pointer" }}
              >
                {t("generateUid")}
              </button>
            </div>
            {uidGenerated && newUid && (
              <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.accent}44`, color: COLORS.slate, fontSize: 12, boxShadow: "0 4px 10px rgba(16,185,129,0.08)" }}>
                <div style={{ fontWeight: 800, color: COLORS.accent, marginBottom: 3 }}>✓ UID generated successfully</div>
                <div>Your Health UID is ready. Continue with your PIN setup to finish creating your secure profile.</div>
              </div>
            )}
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("choosePin")}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={showNewPin ? "text" : "password"}
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                style={{ flex: 1, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => setShowNewPin((prev) => !prev)}
                style={{ border: "1px solid #e2e8f0", background: "#fff", color: COLORS.slate, borderRadius: 8, padding: "8px 10px", fontSize: 11, cursor: "pointer" }}
              >
                {showNewPin ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: pinStrength.color }}>{t("pinHint")} · {pinStrength.label}</div>
            <label style={{ fontSize: 12, color: "#64748b" }}>{t("confirmPin")}</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={showConfirmPin ? "text" : "password"}
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                style={{ flex: 1, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin((prev) => !prev)}
                style={{ border: "1px solid #e2e8f0", background: "#fff", color: COLORS.slate, borderRadius: 8, padding: "8px 10px", fontSize: 11, cursor: "pointer" }}
              >
                {showConfirmPin ? "Hide" : "Show"}
              </button>
            </div>
            {registerMessage && <div style={{ color: COLORS.primary, fontSize: 12 }}>{registerMessage}</div>}
            <PrimaryButton onClick={handleRegister}>{t("createAccount")}</PrimaryButton>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setRegisterMessage("");
              }}
              style={{
                border: "1px solid #e2e8f0",
                color: COLORS.slate,
                background: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 700,
              }}
            >
              {t("switchToLogin")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ go, language, showWelcome, onDismissWelcome }) {
  const t = (key) => getText(language, key);
  const items = [
    { id: "assistant", label: t("aiAssistant") },
    { id: "upload", label: t("uploadReport") },
    { id: "records", label: t("myRecords") },
    { id: "schemes", label: t("govtSchemes") },
    { id: "timeline", label: t("healthTimeline") },
    { id: "emergency", label: t("emergencyQr") },
    { id: "profile", label: t("profile") },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont, overflowY: "auto" }}>
      <ScreenHeader title={t("home")} onBack={() => go("role")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
            color: "#fff",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85 }}>{t("healthScore")}</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{MOCK_CITIZEN.healthScore}/100</div>
          <div style={{ fontSize: 12 }}>{t("goodStanding")}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {items.map((it) => (
            <Card key={it.id} onClick={() => go(it.id)} style={{ textAlign: "center", fontWeight: 700, fontSize: 13 }}>
              {it.label}
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 13 }}>{t("aiAdvice")}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            {t("aiAdviceNote")}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{t("vaccinations")}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{t("vaccinationNote")}</div>
        </Card>
      </div>
    </div>
  );
}

function AIAssistant({ go, language }) {
  const t = (key) => getText(language, key);
  const [messages, setMessages] = useState([
    { role: "assistant", text: t("assistantIntro") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "You are the LIVEDIN AI Health Assistant for a rural Indian healthcare app. Be warm, plain-spoken, and brief (3-5 sentences max). Suggest possible causes and relevant follow-up tests using cautious language ('may indicate', 'could suggest'). NEVER diagnose. Always end by recommending the person consult a doctor or nearest health centre. If symptoms sound severe or urgent, say so clearly and recommend immediate care.",
          messages: [...messages, userMsg].map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });
      const data = await response.json();
      const text =
        data?.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n") ||
        t("assistantError");
      setMessages((m) => [...m, { role: "assistant", text }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: t("assistantError") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("assistantTitle")} onBack={() => go("dashboard")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? COLORS.accent : "#e0f2fe",
              color: m.role === "user" ? "#fff" : "#0f172a",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "80%",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("assistantTyping")}</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 10, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("assistantPlaceholder")}
          style={{ flex: 1, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
        />
        <button
          onClick={send}
          style={{
            background: COLORS.slate,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          {t("send")}
        </button>
      </div>
    </div>
  );
}

function UploadReport({ go, language }) {
  const t = (key) => getText(language, key);
  const [stage, setStage] = useState("idle");

  const startUpload = () => {
    setStage("processing");
    setTimeout(() => setStage("done"), 1800);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("uploadTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 20 }}>
        {stage !== "done" && (
          <div
            onClick={startUpload}
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: 12,
              padding: 30,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 30 }}>📷</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{t("uploadAreaTitle")}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {t("uploadAreaSubtitle")}
            </div>
          </div>
        )}
        {stage === "processing" && (
          <div style={{ marginTop: 16, fontSize: 13, color: "#64748b" }}>
            {t("processing")}
          </div>
        )}
        {stage === "done" && (
          <div>
            <div style={{ background: COLORS.alert, color: COLORS.alertText, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700 }}>
              {t("riskIndicator")}
            </div>
            <Card style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t("extractedHighlights")}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>• Hemoglobin: 9.2 g/dL (Low)</div>
              <div style={{ fontSize: 12 }}>• WBC Count: 7,500 (Normal)</div>
            </Card>
            <Card style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.accent }}>{t("aiRecommendation")}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                May indicate anemia. Suggested tests: Iron Profile, Vitamin B12. Please consult a doctor.
              </div>
            </Card>
            <PrimaryButton style={{ marginTop: 12 }} onClick={() => go("timeline")}>
              Update Health Timeline
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function Records({ go, language }) {
  const t = (key) => getText(language, key);
  const records = language === "hi"
    ? [
        { id: 1, title: "सीबीसी ब्लड रिपोर्ट", meta: "ऐप के माध्यम से अपलोड", date: "आज" },
        { id: 2, title: "प्रिस्क्रिप्शन जोड़ दिया गया", meta: "डॉ. शर्मा - जनरल फिजिशियन · सिटी हॉस्पिटल", date: "12 अक्टूबर" },
        { id: 3, title: "कोविड-19 बूस्टर", meta: "जिला पीएचसी", date: "10 जनवरी" },
      ]
    : MOCK_RECORDS;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("recordsTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {records.map((r) => (
          <Card key={r.id}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.meta}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{r.date}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Schemes({ go, language }) {
  const t = (key) => getText(language, key);
  const schemeData = language === "hi"
    ? [
        { name: "आयुष्मान भारत (PM-JAY)", eligible: true, detail: "परिवार प्रति वर्ष अधिकतम ₹5 लाख तक स्वास्थ्य कवरेज।" },
        { name: "पीएम मातृ वंदना योजना", eligible: false, detail: "लागू नहीं (लिंग/आयु मानदंड)।" },
      ]
    : MOCK_SCHEMES;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("schemesTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#475569" }}>
          {t("eligibleText")}
        </div>
        {schemeData.map((s) => (
          <Card key={s.name} style={{ borderLeft: `4px solid ${s.eligible ? COLORS.accent : "#cbd5e1"}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.detail}</div>
            {s.eligible ? (
              <div style={{ color: COLORS.primary, fontSize: 12, marginTop: 6, fontWeight: 700 }}>
                {t("applyText")}
              </div>
            ) : (
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>{t("notApplicable")}</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Timeline({ go, language }) {
  const t = (key) => getText(language, key);
  const timelineData = language === "hi"
    ? [
        { when: "आज, 10:00 AM", title: "एआई रिपोर्ट अपलोड", note: "जोखिम संकेत: कम हीमोग्लोबिन" },
        { when: "12 अक्टूबर, 2025", title: "अस्पताल विजिट", note: "सिटी केयर क्लिनिक। डॉक्टर के नोट अपडेट किए गए।" },
        { when: "1 वर्ष पहले", title: "कोविड वैक्सीन", note: "बूस्टर खुराक दी गई।" },
      ]
    : MOCK_TIMELINE;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("timelineTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {timelineData.map((item, i) => (
          <Card key={i}>
            <div style={{ fontSize: 11, color: COLORS.primary, fontWeight: 700 }}>{item.when}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.note}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmergencyQR({ go, language }) {
  const t = (key) => getText(language, key);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("emergencyTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 20 }}>
        <div style={{ background: COLORS.slate, color: "#fff", borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>{t("emergencyTitle").toUpperCase()}</div>
          <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
            <div>{t("emergencyUid")}: {MOCK_CITIZEN.uid}</div>
            <div>{t("emergencyBlood")}: {MOCK_CITIZEN.bloodGroup}</div>
            <div>{t("emergencyAllergies")}: {MOCK_CITIZEN.allergies.join(", ")}</div>
            <div>{t("emergencyCondition")}: {MOCK_CITIZEN.condition}</div>
            <div>{t("emergencyContact")}: {MOCK_CITIZEN.emergencyContact}</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 60 }}>▦</div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
          {t("emergencyNote")}
        </div>
      </div>
    </div>
  );
}

function Profile({ go, language, onLanguageToggle }) {
  const t = (key) => getText(language, key);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("livedin_last_login");
    }
    go("role");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title={t("profileTitle")} onBack={() => go("dashboard")} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{MOCK_CITIZEN.name}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>UID: {MOCK_CITIZEN.uid}</div>
        <div style={{ fontSize: 12, color: COLORS.primary, marginTop: 4, fontWeight: 700 }}>
          {t("relatedPatients")}: {EXTRA_PEOPLE.map((p) => `${p.name} (${p.age})`).join(" • ")}
        </div>
        {[t("updateMedicalInfo"), t("changePin"), language === "hi" ? t("languageOptionHi") : t("languageOption")].map((row, index) => (
          <Card
            key={row}
            onClick={() => {
              if (index === 2) {
                onLanguageToggle();
              }
            }}
            style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, cursor: index === 2 ? "pointer" : "default" }}
          >
            <span>{row}</span> <span>›</span>
          </Card>
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            marginTop: 6,
            border: "none",
            background: COLORS.alert,
            color: COLORS.alertText,
            borderRadius: 10,
            padding: "10px 12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}

/* ---------- hospital portal (desktop) ---------- */

function HospitalPortal({ go }) {
  const [uid, setUid] = useState(MOCK_CITIZEN.uid);
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savedNotes, setSavedNotes] = useState(() => {
    try {
      const stored = localStorage.getItem("livedin-hospital-notes");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const activePatientKey = selectedPatient?.uid || MOCK_CITIZEN.uid;
  const currentSavedNotes = savedNotes[activePatientKey] || [];

  useEffect(() => {
    try {
      localStorage.setItem("livedin-hospital-notes", JSON.stringify(savedNotes));
    } catch {
      // ignore storage errors in demo mode
    }
  }, [savedNotes]);

  const openPatient = (patient) => {
    setSelectedPatient(patient);
    setUid(patient.uid || MOCK_CITIZEN.uid);
    setPin("");
    setAuthed(true);
    setNoteText("");
  };

  const saveRecord = () => {
    if (!noteText.trim()) return;
    setSavedNotes((prev) => ({
      ...prev,
      [activePatientKey]: [
        { id: Date.now(), text: noteText.trim(), patient: selectedPatient?.name || MOCK_CITIZEN.name },
        ...(prev[activePatientKey] || []),
      ],
    }));
    setNoteText("");
  };

  const removeNote = (noteId) => {
    setSavedNotes((prev) => ({
      ...prev,
      [activePatientKey]: (prev[activePatientKey] || []).filter((note) => note.id !== noteId),
    }));
  };

  const renderPatientProfile = (patient) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h3>{patient.name}</h3>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Age: {patient.age} | {patient.bloodGroup}
        </div>
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Clinical Summary</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            Condition: {patient.condition}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            Emergency Contact: {patient.emergencyContact}
          </div>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Add Clinical Notes & Prescription</div>
          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Patient complains of fatigue..."
            style={{ width: "100%", marginTop: 8, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <PrimaryButton style={{ marginTop: 8 }} onClick={saveRecord}>Save Record</PrimaryButton>
          {currentSavedNotes.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Saved Notes</div>
              {currentSavedNotes.map((entry) => (
                <div key={entry.id} style={{ fontSize: 12, color: "#475569", marginTop: 4, background: "#f8fafc", padding: 6, borderRadius: 6, display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{entry.text}</span>
                  <button onClick={() => removeNote(entry.id)} style={{ border: "none", background: "transparent", color: COLORS.alertText, cursor: "pointer", fontSize: 12 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div>
        <Card style={{ background: "#ecfdf5" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.accent }}>AI Recommendations for Doctor</div>
          <ul style={{ fontSize: 12, marginTop: 6, paddingLeft: 18 }}>
            <li>Suggested Test: Iron Profile</li>
            <li>Suggested Test: Vitamin B12</li>
            <li>Trend: Latest vitals stable.</li>
          </ul>
        </Card>
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Patient Timeline</div>
          {MOCK_TIMELINE.map((t, i) => (
            <div key={i} style={{ fontSize: 12, marginTop: 6 }}>
              <b>{t.when}:</b> {t.title}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const patientProfiles = {
    [MOCK_CITIZEN.name]: {
      name: MOCK_CITIZEN.name,
      age: MOCK_CITIZEN.age,
      uid: MOCK_CITIZEN.uid,
      bloodGroup: MOCK_CITIZEN.bloodGroup,
      condition: MOCK_CITIZEN.condition,
      emergencyContact: MOCK_CITIZEN.emergencyContact,
    },
    ...Object.fromEntries(
      EXTRA_PEOPLE.map((person) => [
        person.name,
        {
          name: person.name,
          age: person.age,
          uid: `${person.name.toLowerCase().replace(/\s+/g, "-")}-uid`,
          bloodGroup: person.name === "Yash Gupta" ? "A+" : "B+",
          condition: person.name === "Yash Gupta" ? "Asthma" : "Hypertension",
          emergencyContact: person.name === "Yash Gupta" ? "+91-9876543211 (Mother)" : "+91-9876543212 (Sibling)",
        },
      ])
    ),
  };

  return (
    <div style={{ ...bodyFont, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          background: COLORS.slate,
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "10px 10px 0 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>🏥 LIVEDIN | District Hospital Portal</span>
        <span>Dr. Urmila Dwivedi (Cardiology)</span>
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 24 }}>
        <button onClick={() => go("role")} style={{ marginBottom: 16, background: "none", border: "none", color: COLORS.primary, cursor: "pointer" }}>
          ← Back to role select
        </button>

        {!authed ? (
          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <h3 style={{ color: COLORS.primary }}>Patient Authorization</h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>Enter patient details to access lifecycle medical records.</p>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {EXTRA_PEOPLE.map((person) => (
                <div
                  key={person.name}
                  onClick={() => openPatient(patientProfiles[person.name])}
                  style={{ cursor: "pointer" }}
                >
                  <Card style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate }}>
                    {person.name} • Age {person.age}
                  </Card>
                </div>
              ))}
            </div>
            <input value={uid} onChange={(e) => setUid(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
            <input
              type="password"
              placeholder="Health PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 8 }}
            />
            <PrimaryButton
              style={{ marginTop: 12, background: COLORS.accent }}
              onClick={() => pin === MOCK_CITIZEN.pin && setAuthed(true)}
            >
              Authorize via Health PIN
            </PrimaryButton>
            <div style={{ fontSize: 11, color: COLORS.alertText, marginTop: 8 }}>
              Note: Any access is permanently logged in the audit trail. (Demo PIN: 4821)
            </div>
          </div>
        ) : (
          renderPatientProfile(selectedPatient || patientProfiles[MOCK_CITIZEN.name])
        )}
      </div>
    </div>
  );
}

/* ---------- government dashboard (desktop) ---------- */

function GovernmentDashboard({ go }) {
  const [selectedMetric, setSelectedMetric] = useState("Total Citizens Registered");
  const [selectedCitizen, setSelectedCitizen] = useState(EXTRA_PEOPLE[0]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedSchemeQuestion, setSelectedSchemeQuestion] = useState(null);
  const [schemeQuestion, setSchemeQuestion] = useState("");
  const [schemeAnswer, setSchemeAnswer] = useState("Ask a question to receive an AI-assisted answer.");

  const stats = [
    {
      label: "Total Citizens Registered",
      value: "45.2M",
      color: COLORS.accent,
      detailTitle: "Registered Citizens",
      detailItems: EXTRA_PEOPLE.map((p) => ({
        name: p.name,
        meta: `Age ${p.age}`,
      })),
    },
    {
      label: "Hospitals Onboarded",
      value: "12,450",
      color: COLORS.primary,
      detailTitle: "Onboarded Hospitals",
      detailItems: [
        { name: "City Care Hospital", meta: "Delhi • 1.2M patients" },
        { name: "Apex Multi-Specialty", meta: "Mumbai • 980K patients" },
        { name: "Rural Health Network", meta: "Bihar • 640K patients" },
        { name: "Metro Cardiac Centre", meta: "Chennai • 760K patients" },
        { name: "Sunrise Women & Child", meta: "Kolkata • 540K patients" },
        { name: "Northstar Community Hospital", meta: "Jaipur • 420K patients" },
        { name: "Lifeline Diagnostic Hub", meta: "Pune • 330K patients" },
        { name: "Evergreen District Hospital", meta: "Lucknow • 290K patients" },
      ],
    },
    {
      label: "AI Risk Alerts Triggered",
      value: "842K",
      color: "#f59e0b",
      detailTitle: "Recent Alerts",
      detailItems: [
        { name: "Heat Stress Watch", meta: "North region • 14K flagged" },
        { name: "Diabetes Follow-up", meta: "Urban cluster • 8.3K flagged" },
        { name: "Respiratory Infection Surge", meta: "Coastal belt • 6.8K flagged" },
        { name: "Maternal Nutrition Risk", meta: "Central districts • 4.2K flagged" },
        { name: "Medication Adherence Drop", meta: "Western corridor • 3.6K flagged" },
        { name: "Waterborne Illness Cluster", meta: "River belt • 2.9K flagged" },
      ],
    },
  ];

  const activeMetric = stats.find((s) => s.label === selectedMetric) || stats[0];

  return (
    <div style={{ ...bodyFont, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ background: COLORS.purple, color: "#fff", padding: "12px 20px", borderRadius: "10px 10px 0 0", display: "flex", justifyContent: "space-between" }}>
        <span>🏛 LIVEDIN | Ministry of Health Dashboard</span>
        <span>State Admin</span>
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 24 }}>
        <button onClick={() => go("role")} style={{ marginBottom: 16, background: "none", border: "none", color: COLORS.primary, cursor: "pointer" }}>
          ← Back to role select
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {stats.map((s) => {
            const isSelected = selectedMetric === s.label;
            return (
              <div key={s.label} onClick={() => setSelectedMetric(s.label)} style={{ cursor: "pointer" }}>
                <Card style={{ borderTop: `3px solid ${s.color}`, border: isSelected ? `2px solid ${s.color}` : "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                </Card>
              </div>
            );
          })}
        </div>
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{activeMetric.detailTitle}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {activeMetric.detailItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  if (activeMetric.label === "Total Citizens Registered") {
                    setSelectedCitizen(EXTRA_PEOPLE.find((p) => p.name === item.name) || EXTRA_PEOPLE[0]);
                    setSelectedHospital(null);
                  }
                  if (activeMetric.label === "Hospitals Onboarded") {
                    setSelectedHospital(item);
                    setSelectedAlert(null);
                  }
                  if (activeMetric.label === "AI Risk Alerts Triggered") {
                    setSelectedAlert(item);
                  }
                }}
                style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc", cursor: activeMetric.label === "Total Citizens Registered" || activeMetric.label === "Hospitals Onboarded" || activeMetric.label === "AI Risk Alerts Triggered" ? "pointer" : "default" }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.meta}</div>
              </div>
            ))}
          </div>
        </Card>
        {activeMetric.label === "Total Citizens Registered" && (
          <Card style={{ marginTop: 14, background: "#f8fafc" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Selected Citizen Profile</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>{selectedCitizen.name}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>Age: {selectedCitizen.age}</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>UID: {selectedCitizen.name === "Yuvraj Maurya" ? "LVD-2026-8942" : selectedCitizen.name === "Yash Gupta" ? "LVD-2026-8943" : "LVD-2026-8944"}</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>Status: Active in national health registry</div>
            </div>
          </Card>
        )}
        {activeMetric.label === "Hospitals Onboarded" && selectedHospital && (
          <Card style={{ marginTop: 14, background: "#f8fafc" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Selected Hospital Profile</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>{selectedHospital.name}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>{selectedHospital.meta}</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>Status: Live on national health network</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>Interoperability: ICD-10 / HL7 enabled</div>
            </div>
          </Card>
        )}
        {activeMetric.label === "AI Risk Alerts Triggered" && selectedAlert && (
          <Card style={{ marginTop: 14, background: "#f8fafc" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Selected Alert Insight</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>{selectedAlert.name}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>{selectedAlert.meta}</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>Priority: High</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>Recommended action: Dispatch mobile screening team</div>
            </div>
          </Card>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <Card style={{ background: "linear-gradient(135deg, #fff7ed, #fee2e2)" }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.alertText }}>Disease Trend: Vector-borne (30 days)</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Live outbreak pattern • rising in 3 districts</div>
            <svg viewBox="0 0 200 60" style={{ width: "100%", marginTop: 10 }}>
              <path d="M0,50 C20,45 35,38 50,35 C70,30 85,20 100,18 C120,15 140,8 160,12 C175,15 185,25 200,10" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="35" r="4" fill="#ef4444" />
              <circle cx="100" cy="18" r="4" fill="#ef4444" />
              <circle cx="160" cy="12" r="4" fill="#ef4444" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 6 }}>
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.primary }}>Govt Scheme Utilization (Ayushman Bharat)</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[
                { q: "Q1", value: "78%" },
                { q: "Q2", value: "84%" },
                { q: "Q3", value: "91%" },
              ].map((item, i) => (
                <div key={item.q} style={{ flex: 1, background: i === 2 ? COLORS.accent : COLORS.primary, color: "#fff", textAlign: "center", padding: "8px 0", borderRadius: 6 }}>
                  <div style={{ fontSize: 10 }}>{item.q}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
              <div style={{ fontWeight: 700, color: COLORS.slate }}>Common questions</div>
              {[
                { question: "Who is eligible for Ayushman Bharat?", answer: "Families with valid ration cards and low-income criteria are prioritized." },
                { question: "How can hospitals claim reimbursement?", answer: "Claims are processed through the digital health wallet and verified by district officers." },
              ].map((item) => (
                <div key={item.question} onClick={() => { setSelectedSchemeQuestion(item); setSchemeAnswer(item.answer); }} style={{ marginTop: 8, padding: 8, borderRadius: 8, background: selectedSchemeQuestion?.question === item.question ? "#ecfeff" : "#f8fafc", cursor: "pointer" }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{item.question}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{item.answer}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>Ask any question</div>
          <textarea value={schemeQuestion} onChange={(e) => setSchemeQuestion(e.target.value)} placeholder="Ask about eligibility, reimbursement, or district outreach..." style={{ width: "100%", marginTop: 8, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, minHeight: 70 }} />
          <PrimaryButton style={{ marginTop: 8 }} onClick={() => setSchemeAnswer(`AI suggestion: ${schemeQuestion || "Please enter a question."}`)}>Get AI Suggestion</PrimaryButton>
          <div style={{ marginTop: 8, fontSize: 12, color: COLORS.primary, background: "#f8fafc", padding: 8, borderRadius: 8 }}>{schemeAnswer}</div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- root ---------- */

const CITIZEN_SCREENS = {
  splash: SplashScreen,
  role: RoleSelect,
  citizenLogin: CitizenLogin,
  dashboard: Dashboard,
  assistant: AIAssistant,
  upload: UploadReport,
  records: Records,
  schemes: Schemes,
  timeline: Timeline,
  emergency: EmergencyQR,
  profile: Profile,
};

export default function LivedinPrototype() {
  const [screen, setScreen] = useState("splash");
  const [language, setLanguage] = useState("en");
  const [showWelcome, setShowWelcome] = useState(false);
  const go = (s) => setScreen(s);

  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  if (screen === "hospital") {
    return (
      <div style={{ padding: 24, background: COLORS.bg, minHeight: "100vh" }}>
        <HospitalPortal go={go} />
      </div>
    );
  }
  if (screen === "government") {
    return (
      <div style={{ padding: 24, background: COLORS.bg, minHeight: "100vh" }}>
        <GovernmentDashboard go={go} />
      </div>
    );
  }

  const Screen = CITIZEN_SCREENS[screen] || SplashScreen;
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <PhoneFrame>
        <Screen go={go} language={language} onLanguageToggle={handleLanguageToggle} showWelcome={showWelcome} onDismissWelcome={() => setShowWelcome(false)} />
      </PhoneFrame>
      <div style={{ fontSize: 11, color: "#94a3b8", ...bodyFont }}>
        LIVEDIN Prototype · Demo data only · AI never diagnoses
      </div>
    </div>
  );
}
