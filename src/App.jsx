import { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";

const mcqs = [
  { id: 1, question: "What language do computers fundamentally understand?", options: ["English", "Binary language (0s and 1s)", "Assembly language", "Python"], answer: 1, explanation: "Computers understand binary language — sequences of 0s and 1s. Human instructions must be converted into this format before processing." },
  { id: 2, question: "What does GIGO stand for in computing?", options: ["Get Input, Get Output", "Garbage In Garbage Out", "Generate Input Generate Output", "Global Input Global Output"], answer: 1, explanation: "GIGO = 'Garbage In Garbage Out' — errors in output are due to wrong data entry or wrong instructions, not the machine itself." },
  { id: 3, question: "Which unit is responsible for arithmetic calculations and logical operations?", options: ["Control Unit", "Memory Unit", "Arithmetic Logic Unit (ALU)", "Input Unit"], answer: 2, explanation: "The ALU performs all arithmetic and logical operations, retrieves data from storage, processes it, and returns results." },
  { id: 4, question: "What is the full form of RAM?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Memory", "Remote Access Memory"], answer: 1, explanation: "RAM = Random Access Memory — the primary/main memory where the OS and currently running programs are loaded." },
  { id: 5, question: "Which component is the 'main circuit board' that holds the CPU, memory, and connectors?", options: ["Hard Disk", "Power Supply Unit", "Motherboard", "RAM"], answer: 2, explanation: "The Motherboard is the main circuit board connecting all components: CPU, memory, drives, ports, and expansion cards." },
  { id: 6, question: "1024 Megabytes is equal to:", options: ["1 Kilobyte", "1 Terabyte", "1 Gigabyte", "1 Petabyte"], answer: 2, explanation: "1024 MB = 1 Gigabyte (GB). Hierarchy: Bits → Nibble → Byte → KB → MB → GB → TB → PB." },
  { id: 7, question: "An Operating System acts as an interface between:", options: ["CPU and RAM", "Users and Hardware", "Software and Hardware", "Input and Output devices"], answer: 1, explanation: "The OS acts as an interface between users and hardware, managing all interactions between them." },
  { id: 8, question: "Which OS type ensures fixed response time for time-critical applications?", options: ["Batch Processing OS", "Multi-user OS", "Single-tasking OS", "Real-time OS"], answer: 3, explanation: "Real-time OS ensures fixed response times — used in critical apps like antiaircraft missile systems." },
  { id: 9, question: "Special programs used by the OS to recognise peripheral devices are called:", options: ["Compilers", "Drivers", "Assemblers", "Loaders"], answer: 1, explanation: "Device Drivers are special programs that allow the OS to recognise and interact with peripheral devices like printers and mice." },
  { id: 10, question: "Which memory is volatile and lost when the computer is switched off?", options: ["Hard Disk", "Secondary Memory", "RAM (Primary Memory)", "Pen Drive"], answer: 2, explanation: "RAM is volatile — its contents are lost when power is off. Secondary storage (hard disk, pen drive) retains data permanently." },
  { id: 11, question: "The speed of a processor is measured in:", options: ["Bytes and Kilobytes", "MHz and GHz", "Baud and Bits", "KB and MB"], answer: 1, explanation: "Processor speed is measured in MHz (millions of instructions/sec) and GHz (billions of instructions/sec)." },
  { id: 12, question: "In a Batch Processing System:", options: ["Users interact in real-time", "Jobs are executed immediately on arrival", "Similar jobs are grouped and submitted as a block", "Multiple users access simultaneously"], answer: 2, explanation: "In Batch Processing, similar jobs are clubbed together and submitted as a block. User intervention is minimal." },
  { id: 13, question: "Which of the following is NOT a function of an Operating System?", options: ["Process Management", "Memory Management", "File Management", "Designing new software"], answer: 3, explanation: "The OS handles Process, Memory, and File Management. Designing new software is the job of software developers, not the OS." },
  { id: 14, question: "FAT and NTFS are examples of:", options: ["Types of RAM", "File Systems", "Types of CPU", "Operating Systems"], answer: 1, explanation: "FAT (File Allocation Table) and NTFS (New Technology File System) are the two main types of file systems for disk storage." },
  { id: 15, question: "Which computer characteristic means performing the same task repeatedly without fatigue?", options: ["Speed", "Versatility", "Accuracy", "Diligence"], answer: 3, explanation: "Diligence — computers can repeat the same task endlessly with the same accuracy, without getting tired or bored." },
];

const TIMER_SECONDS = 12;

export default function Unit1Quiz() {
  const [screen, setScreen] = useState("home"); // home | quiz | results | leaderboard
  const [studentName, setStudentName] = useState("");
  const [nameError, setNameError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(Array(15).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [locked, setLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  const lockAndNext = useCallback((chosenIdx) => {
    if (locked) return;
    setLocked(true);
    clearInterval(timerRef.current);
    setSelected(prev => {
      const next = [...prev];
      next[currentQ] = chosenIdx;
      return next;
    });
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQ < mcqs.length - 1) {
        setCurrentQ(q => q + 1);
        setTimeLeft(TIMER_SECONDS);
        setLocked(false);
      } else {
        finishQuiz(chosenIdx);
      }
    }, 1400);
  }, [locked, currentQ]);

  const finishQuiz = (lastChoice) => {
    setSelected(prev => {
      const final = [...prev];
      final[currentQ] = lastChoice ?? null;
      const score = final.reduce((acc, ans, i) => acc + (ans === mcqs[i].answer ? 1 : 0), 0);
      const entry = { name: studentName, time: new Date().toLocaleString(), answers: final, score, pct: Math.round(score / 15 * 100) };
      const updated = [...results, entry];
      setResults(updated);
      return final;
    });
    setTimeout(() => setScreen("results"), 200);
  };

  useEffect(() => {
    if (screen !== "quiz" || locked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { lockAndNext(null); return TIMER_SECONDS; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, currentQ, locked, lockAndNext]);

  const startQuiz = () => {
    if (!studentName.trim()) { setNameError("Please enter your name to begin."); return; }
    setNameError("");
    setCurrentQ(0);
    setSelected(Array(15).fill(null));
    setTimeLeft(TIMER_SECONDS);
    setLocked(false);
    setShowFeedback(false);
    setScreen("quiz");
  };

  const exportExcel = () => {
    if (results.length === 0) return;
    const wb = XLSX.utils.book_new();
    const rows = results.map((r, i) => {
      const row = { "S.No": i + 1, "Student Name": r.name, "Date & Time": r.time };
      r.answers.forEach((ans, qi) => { row[`Q${qi + 1}`] = ans === mcqs[qi].answer ? 1 : 0; });
      row["Total Score"] = r.score;
      row["Percentage"] = r.pct + "%";
      row["Grade"] = r.pct >= 80 ? "A (Excellent)" : r.pct >= 60 ? "B (Good)" : r.pct >= 40 ? "C (Average)" : "D (Needs Work)";
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 6 }, { wch: 22 }, { wch: 22 }, ...Array(15).fill({ wch: 5 }), { wch: 12 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Student Results");
    XLSX.writeFile(wb, `Unit1_Results_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`);
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 6 ? "#22c55e" : timeLeft > 3 ? "#f59e0b" : "#ef4444";
  const q = mcqs[currentQ];
  const lastResult = results[results.length - 1];

  // ── STYLES ──
  const S = {
    app: { fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)", display: "flex", flexDirection: "column" },
    center: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px" },
    card: { background: "#fff", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "560px", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" },
    badge: { display: "inline-block", background: "#eef2ff", color: "#4f46e5", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", padding: "4px 14px", borderRadius: "20px", marginBottom: "14px" },
    title: { fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900, color: "#1e293b", margin: "0 0 6px", lineHeight: 1.2 },
    sub: { color: "#64748b", fontSize: "14px", margin: "0 0 24px" },
    input: { width: "100%", padding: "13px 16px", border: "2px solid #e2e8f0", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" },
    startBtn: { width: "100%", padding: "15px", background: "linear-gradient(90deg, #6366f1, #7c3aed)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 800, fontSize: "17px", cursor: "pointer", marginTop: "14px", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" },
    errMsg: { color: "#ef4444", fontSize: "13px", marginTop: "6px" },
    // Quiz
    quizWrap: { width: "100%", maxWidth: "600px" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
    qLabel: { background: "#6366f1", color: "#fff", fontWeight: 800, borderRadius: "8px", padding: "4px 14px", fontSize: "13px" },
    timerBox: { display: "flex", alignItems: "center", gap: "8px" },
    timerNum: { fontWeight: 900, fontSize: "22px", color: timerColor, minWidth: "30px", textAlign: "right", transition: "color 0.3s" },
    timerLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: 600 },
    timerBarWrap: { height: "8px", background: "rgba(255,255,255,0.15)", borderRadius: "4px", marginBottom: "16px", overflow: "hidden" },
    timerBarFill: { height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "4px", transition: "width 1s linear, background 0.3s" },
    qCard: { background: "#fff", borderRadius: "18px", padding: "24px 22px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", marginBottom: "14px" },
    qText: { fontSize: "17px", fontWeight: 700, color: "#1e293b", lineHeight: 1.55, marginBottom: "20px" },
    optBtn: (i, sel, corr) => {
      let bg = "#f8fafc", border = "#e2e8f0", color = "#334155";
      if (!locked) { if (sel === i) { bg = "#eef2ff"; border = "#6366f1"; color = "#4f46e5"; } }
      else {
        if (i === corr) { bg = "#f0fdf4"; border = "#22c55e"; color = "#15803d"; }
        else if (sel === i && i !== corr) { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
        else { bg = "#fafafa"; border = "#e2e8f0"; color = "#94a3b8"; }
      }
      return { display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderRadius: "12px", border: `2px solid ${border}`, background: bg, color, cursor: locked ? "default" : "pointer", marginBottom: "10px", transition: "all 0.15s", fontSize: "15px", fontWeight: 600, width: "100%", textAlign: "left" };
    },
    optLetter: (i, sel, corr) => {
      let bg = "#e0e7ff", color = "#4f46e5";
      if (locked) {
        if (i === corr) { bg = "#dcfce7"; color = "#16a34a"; }
        else if (sel === i) { bg = "#fee2e2"; color = "#dc2626"; }
      } else if (sel === i) { bg = "#c7d2fe"; color = "#4338ca"; }
      return { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: bg, color, fontWeight: 900, fontSize: "13px", flexShrink: 0 };
    },
    feedbackBar: (correct) => ({ marginTop: "4px", background: correct ? "#f0fdf4" : "#fef2f2", border: `1px solid ${correct ? "#bbf7d0" : "#fecaca"}`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: correct ? "#166534" : "#991b1b", fontWeight: 600 }),
    progressDots: { display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap", marginTop: "4px" },
    dot: (i, cur, sel) => ({ width: "10px", height: "10px", borderRadius: "50%", background: i === cur ? "#6366f1" : sel[i] !== null ? "#94a3b8" : "rgba(255,255,255,0.2)", transition: "background 0.2s", flexShrink: 0 }),
    // Results
    scoreRing: (pct) => ({ width: "120px", height: "120px", borderRadius: "50%", background: `conic-gradient(${pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444"} ${pct * 3.6}deg, #e2e8f0 0)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }),
    scoreInner: { width: "90px", height: "90px", background: "#fff", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
    bigBtn: { padding: "13px 28px", background: "linear-gradient(90deg,#6366f1,#7c3aed)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" },
    outlineBtn: { padding: "13px 28px", background: "transparent", color: "#6366f1", border: "2px solid #6366f1", borderRadius: "12px", fontWeight: 800, fontSize: "15px", cursor: "pointer" },
    excelBtn: { padding: "13px 28px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 14px rgba(22,163,74,0.4)" },
    ansRow: (correct) => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderRadius: "8px", background: correct ? "#f0fdf4" : "#fef2f2", marginBottom: "6px", fontSize: "13px" }),
    // Footer
    footer: { textAlign: "center", padding: "18px 16px 24px", color: "rgba(255,255,255,0.35)", fontSize: "12px", letterSpacing: "1px", fontWeight: 600, textTransform: "uppercase" },
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div style={S.app}>
      {/* ── HOME ── */}
      {screen === "home" && (
        <div style={S.center}>
          <div style={S.card}>
            <div style={{ textAlign: "center" }}>
              <div style={S.badge}>IT Tools · Class XI · CBSE</div>
              <h1 style={S.title}>Unit 1 Quiz</h1>
              <p style={S.sub}>Computer Organization &amp; OS: User Perspective</p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
              {[["🎯", "15 Questions", "MCQ format"], ["⏱️", "12 Seconds", "Per question"], ["📊", "Excel Export", "Save results"]].map(([icon, head, sub]) => (
                <div key={head} style={{ flex: 1, background: "#f8fafc", borderRadius: "12px", padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "#1e293b" }}>{head}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{sub}</div>
                </div>
              ))}
            </div>
            <label style={{ fontWeight: 700, color: "#374151", fontSize: "14px", display: "block", marginBottom: "8px" }}>Your Name</label>
            <input style={S.input} placeholder="Enter your full name..." value={studentName} onChange={e => setStudentName(e.target.value)} onKeyDown={e => e.key === "Enter" && startQuiz()} />
            {nameError && <div style={S.errMsg}>{nameError}</div>}
            <button style={S.startBtn} onClick={startQuiz}>Start Quiz →</button>
            {results.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button style={{ ...S.outlineBtn, flex: 1, fontSize: "13px", padding: "10px" }} onClick={() => setScreen("leaderboard")}>📋 View Results ({results.length})</button>
                <button style={{ ...S.excelBtn, flex: 1, fontSize: "13px", padding: "10px" }} onClick={exportExcel}>📥 Export Excel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {screen === "quiz" && (
        <div style={S.center}>
          <div style={S.quizWrap}>
            <div style={S.topBar}>
              <span style={S.qLabel}>Q {currentQ + 1} / {mcqs.length}</span>
              <div style={S.timerBox}>
                <div style={S.timerLabel}>TIME</div>
                <div style={S.timerNum}>{timeLeft}</div>
              </div>
            </div>
            <div style={S.timerBarWrap}><div style={S.timerBarFill} /></div>
            <div style={S.qCard}>
              <div style={S.qText}>{q.question}</div>
              {q.options.map((opt, i) => (
                <button key={i} style={S.optBtn(i, selected[currentQ], q.answer)} onClick={() => lockAndNext(i)} disabled={locked}>
                  <span style={S.optLetter(i, selected[currentQ], q.answer)}>{letters[i]}</span>
                  {opt}
                  {locked && i === q.answer && <span style={{ marginLeft: "auto" }}>✅</span>}
                  {locked && selected[currentQ] === i && i !== q.answer && <span style={{ marginLeft: "auto" }}>❌</span>}
                </button>
              ))}
              {showFeedback && (
                <div style={S.feedbackBar(selected[currentQ] === q.answer)}>
                  {selected[currentQ] === q.answer ? "✅ Correct! " : selected[currentQ] === null ? "⏰ Time's up! " : "❌ Wrong! "}
                  {q.explanation}
                </div>
              )}
            </div>
            <div style={S.progressDots}>
              {mcqs.map((_, i) => <div key={i} style={S.dot(i, currentQ, selected)} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === "results" && lastResult && (
        <div style={S.center}>
          <div style={S.card}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={S.scoreRing(lastResult.pct)}>
                <div style={S.scoreInner}>
                  <span style={{ fontSize: "26px", fontWeight: 900, color: lastResult.pct >= 80 ? "#22c55e" : lastResult.pct >= 60 ? "#f59e0b" : "#ef4444" }}>{lastResult.pct}%</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700 }}>SCORE</span>
                </div>
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#1e293b" }}>
                {lastResult.pct >= 80 ? "🌟 Excellent!" : lastResult.pct >= 60 ? "👍 Good Job!" : lastResult.pct >= 40 ? "📚 Keep Studying!" : "💪 Don't Give Up!"}
              </h2>
              <p style={{ color: "#64748b", margin: "0 0 4px" }}>{lastResult.name} — {lastResult.score} / 15 correct</p>
              <span style={{ background: lastResult.pct >= 80 ? "#dcfce7" : lastResult.pct >= 60 ? "#fef9c3" : "#fee2e2", color: lastResult.pct >= 80 ? "#15803d" : lastResult.pct >= 60 ? "#92400e" : "#b91c1c", fontWeight: 800, padding: "3px 14px", borderRadius: "20px", fontSize: "13px" }}>
                Grade: {lastResult.pct >= 80 ? "A" : lastResult.pct >= 60 ? "B" : lastResult.pct >= 40 ? "C" : "D"}
              </span>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontWeight: 800, fontSize: "13px", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1p
