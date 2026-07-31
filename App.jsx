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

/* ---------- citizen screens ---------- */

function SplashScreen({ go }) {
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
        One Health Identity. Lifetime Care.
      </div>
      <div style={{ flex: 1 }} />
      <PrimaryButton onClick={() => go("role")}>Get Started →</PrimaryButton>
    </div>
  );
}

function RoleSelect({ go }) {
  const roles = [
    { id: "citizenLogin", color: COLORS.primary, icon: "👤", title: "Citizen", desc: "Access records, AI assistant & schemes" },
    { id: "hospital", color: COLORS.accent, icon: "🏥", title: "Hospital", desc: "Manage patients & update records" },
    { id: "government", color: COLORS.purple, icon: "🏛", title: "Government", desc: "Analytics & public health monitoring" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Select Your Role" onBack={() => go("splash")} />
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

function CitizenLogin({ go }) {
  const [uid, setUid] = useState(MOCK_CITIZEN.uid);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (pin === MOCK_CITIZEN.pin) {
      setError("");
      go("dashboard");
    } else {
      setError("Incorrect PIN. Try 4821 for this demo.");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Citizen Login" onBack={() => go("role")} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ fontSize: 12, color: "#64748b" }}>Health UID</label>
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
        />
        <label style={{ fontSize: 12, color: "#64748b" }}>Health PIN</label>
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
        />
        {error && <div style={{ color: COLORS.alertText, fontSize: 12 }}>{error}</div>}
        <PrimaryButton onClick={submit}>Login securely</PrimaryButton>
        <div style={{ textAlign: "center", fontSize: 12, color: COLORS.primary }}>🎤 Login with Voice</div>
      </div>
    </div>
  );
}

function Dashboard({ go }) {
  const items = [
    { id: "assistant", label: "AI Assistant" },
    { id: "upload", label: "Upload Report" },
    { id: "records", label: "My Records" },
    { id: "schemes", label: "Govt Schemes" },
    { id: "timeline", label: "Health Timeline" },
    { id: "emergency", label: "Emergency QR" },
    { id: "profile", label: "Profile" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont, overflowY: "auto" }}>
      <ScreenHeader title="Home · 🔔 2" onBack={() => go("role")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
            color: "#fff",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85 }}>Health Score</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{MOCK_CITIZEN.healthScore}/100</div>
          <div style={{ fontSize: 12 }}>Good standing. 1 test due.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {items.map((it) => (
            <Card key={it.id} onClick={() => go(it.id)} style={{ textAlign: "center", fontWeight: 700, fontSize: 13 }}>
              {it.label}
            </Card>
          ))}
        </div>

        <Card>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 13 }}>Today's AI Advice</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            Take Paracetamol at 2:00 PM after lunch. Keep hydrated.
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Upcoming Vaccinations</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Covid Booster — Overdue by 2 weeks.</div>
        </Card>
      </div>
    </div>
  );
}

function AIAssistant({ go }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your LIVEDIN assistant. How can I help you today?" },
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
        "Sorry, I couldn't process that just now.";
      setMessages((m) => [...m, { role: "assistant", text }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="AI Assistant (हिंदी / Eng)" onBack={() => go("dashboard")} />
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
        {loading && <div style={{ fontSize: 12, color: "#94a3b8" }}>Assistant is typing…</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 10, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type message..."
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
          Send
        </button>
      </div>
    </div>
  );
}

function UploadReport({ go }) {
  const [stage, setStage] = useState("idle");

  const startUpload = () => {
    setStage("processing");
    setTimeout(() => setStage("done"), 1800);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Upload Document" onBack={() => go("dashboard")} />
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
            <div style={{ fontWeight: 700, marginTop: 8 }}>Take Photo or Upload PDF</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Supports Blood Reports, X-Ray, Prescriptions
            </div>
          </div>
        )}
        {stage === "processing" && (
          <div style={{ marginTop: 16, fontSize: 13, color: "#64748b" }}>
            Processing… OCR extracting text...
          </div>
        )}
        {stage === "done" && (
          <div>
            <div style={{ background: COLORS.alert, color: COLORS.alertText, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700 }}>
              Risk Indicator: Abnormal Values Found
            </div>
            <Card style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Extracted Highlights</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>• Hemoglobin: 9.2 g/dL (Low)</div>
              <div style={{ fontSize: 12 }}>• WBC Count: 7,500 (Normal)</div>
            </Card>
            <Card style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.accent }}>AI Recommendation</div>
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

function Records({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="My Records" onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_RECORDS.map((r) => (
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

function Schemes({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Govt Schemes" onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#475569" }}>
          ✓ AI Analysis: Based on your profile (Farmer, Income &lt; ₹2L), you are eligible for 1 scheme.
        </div>
        {MOCK_SCHEMES.map((s) => (
          <Card key={s.name} style={{ borderLeft: `4px solid ${s.eligible ? COLORS.accent : "#cbd5e1"}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.detail}</div>
            {s.eligible ? (
              <div style={{ color: COLORS.primary, fontSize: 12, marginTop: 6, fontWeight: 700 }}>
                View Details &amp; Apply
              </div>
            ) : (
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Not applicable</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Timeline({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Health Timeline" onBack={() => go("dashboard")} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_TIMELINE.map((t, i) => (
          <Card key={i}>
            <div style={{ fontSize: 11, color: COLORS.primary, fontWeight: 700 }}>{t.when}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.note}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmergencyQR({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Emergency Card" onBack={() => go("dashboard")} />
      <div style={{ padding: 20 }}>
        <div style={{ background: COLORS.slate, color: "#fff", borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>MEDICAL EMERGENCY CARD</div>
          <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
            <div>UID: {MOCK_CITIZEN.uid}</div>
            <div>Blood Group: {MOCK_CITIZEN.bloodGroup}</div>
            <div>Allergies: {MOCK_CITIZEN.allergies.join(", ")}</div>
            <div>Condition: {MOCK_CITIZEN.condition}</div>
            <div>Contact: {MOCK_CITIZEN.emergencyContact}</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 60 }}>▦</div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
          Scan grants emergency info only — full records stay PIN-protected.
        </div>
      </div>
    </div>
  );
}

function Profile({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", ...bodyFont }}>
      <ScreenHeader title="Profile" onBack={() => go("dashboard")} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{MOCK_CITIZEN.name}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>UID: {MOCK_CITIZEN.uid}</div>
        <div style={{ fontSize: 12, color: COLORS.primary, marginTop: 4, fontWeight: 700 }}>
          Related patients: {EXTRA_PEOPLE.map((p) => `${p.name} (${p.age})`).join(" • ")}
        </div>
        {["Update Medical Info", "Change Health PIN", "Language / भाषा (Hindi)"].map((row) => (
          <Card key={row} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
            <span>{row}</span> <span>›</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- hospital portal (desktop) ---------- */

function HospitalPortal({ go }) {
  const [uid, setUid] = useState(MOCK_CITIZEN.uid);
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);

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
        <span>Dr. Urmila Dwivedi (Cardiology) • {EXTRA_PEOPLE.map((p) => `${p.name} (${p.age})`).join(', ')}</span>
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
                <Card key={person.name} style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate }}>
                  {person.name} • Age {person.age}
                </Card>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <h3>{MOCK_CITIZEN.name}</h3>
              <div style={{ fontSize: 12, color: "#64748b" }}>Age: {MOCK_CITIZEN.age} | {MOCK_CITIZEN.bloodGroup}</div>
              <Card style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>AI Clinical Report Summary (Latest CBC)</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  Extracted Text Analysis: Patient shows decreased hemoglobin levels (9.2 g/dL) and low MCV.
                </div>
                <div style={{ background: COLORS.alert, color: COLORS.alertText, padding: 8, borderRadius: 8, marginTop: 8, fontSize: 12 }}>
                  AI Risk Flag: Microcytic anemia indicators detected.
                </div>
              </Card>
              <Card style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Add Clinical Notes &amp; Prescription</div>
                <textarea rows={3} placeholder="Patient complains of fatigue. Ordering iron profile..." style={{ width: "100%", marginTop: 8, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                <PrimaryButton style={{ marginTop: 8 }}>Save Record</PrimaryButton>
              </Card>
            </div>
            <div>
              <Card style={{ background: "#ecfdf5" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.accent }}>AI Recommendations for Doctor</div>
                <ul style={{ fontSize: 12, marginTop: 6, paddingLeft: 18 }}>
                  <li>Suggested Test: Iron Profile</li>
                  <li>Suggested Test: Vitamin B12</li>
                  <li>Trend: Hb dropped 1.5 g/dL in 6 months.</li>
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
        )}
      </div>
    </div>
  );
}

/* ---------- government dashboard (desktop) ---------- */

function GovernmentDashboard({ go }) {
  const stats = [
    { label: "Total Citizens Registered", value: "45.2M", color: COLORS.accent },
    { label: "Hospitals Onboarded", value: "12,450", color: COLORS.primary },
    { label: "AI Risk Alerts Triggered", value: "842K", color: "#f59e0b" },
  ];
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
          {stats.map((s) => (
            <Card key={s.label} style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
            </Card>
          ))}
        </div>
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Registered Patients</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {EXTRA_PEOPLE.map((p) => (
              <div key={p.name} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Age: {p.age}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Disease Trend: Vector-borne (30 days)</div>
            <svg viewBox="0 0 200 60" style={{ width: "100%", marginTop: 8 }}>
              <polyline points="0,55 40,45 80,40 120,20 160,25 200,5" fill="none" stroke="#ef4444" strokeWidth="3" />
            </svg>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Govt Scheme Utilization (Ayushman Bharat)</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {["Q1", "Q2", "Q3"].map((q, i) => (
                <div key={q} style={{ flex: 1, background: COLORS.primary, color: "#fff", textAlign: "center", padding: "8px 0", borderRadius: 6, opacity: 0.6 + i * 0.2 }}>
                  {q}
                </div>
              ))}
            </div>
          </Card>
        </div>
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
  const go = (s) => setScreen(s);

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
        <Screen go={go} />
      </PhoneFrame>
      <div style={{ fontSize: 11, color: "#94a3b8", ...bodyFont }}>
        LIVEDIN Prototype · Demo data only · AI never diagnoses
      </div>
    </div>
  );
}
