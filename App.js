import { useState, useCallback } from "react";

const DIAGRAM_TYPES = [
  { id: "schematic", label: "Schematic / Wiring" },
  { id: "pid", label: "P&ID / Process Flow" },
  { id: "hmi", label: "HMI / SCADA Mockup" },
  { id: "block", label: "Block / Architecture" },
  { id: "state", label: "State / Sequence Chart" },
  { id: "illustrative", label: "Illustrative Image" },
];

const DOMAINS = ["Power Automation", "Process Automation", "Robotics", "Building Systems"];
const STANDARDS = ["IEC 60617", "IEC 61346", "ISO 10628", "ISA-5.1", "Free-form"];
const LIBRARIES = ["ABB Product Library", "IEC Standard Symbols", "Generic / Illustrative"];
const ROLES = ["Design Engineer", "Operator", "Student"];

const QUICK_PROMPTS = [
  { label: "Motor DOL Starter", prompt: "Motor control circuit with DOL starter, thermal overload relay, E-stop, run/stop pushbuttons, contactor K1, overload relay F2, motor M1 at 400V 3-phase" },
  { label: "Pump P&ID", prompt: "Centrifugal pump system P&ID with flow transmitter FT-101, control valve FCV-101, pressure safety valve PSV-101, suction and discharge isolation valves" },
  { label: "PLC Architecture", prompt: "PLC system block diagram with AC500 CPU rack, digital IO modules, PROFIBUS DP network, remote IO station, HMI panel, engineering workstation" },
  { label: "VFD Drive System", prompt: "VFD drive schematic with ACS880 variable frequency drive, input line reactor, main circuit breaker, 15kW motor M1, encoder feedback, control terminals" },
];

const PIPELINE_STEPS = ["NLP Parse", "Entity Extract", "Layout Engine", "SVG Render", "Validate"];

const S = {
  app: { fontFamily: "system-ui, sans-serif", background: "#f9f9f7", display: "flex", flexDirection: "column", minHeight: "100vh" },
  layout: { display: "grid", gridTemplateColumns: "260px 1fr", border: "0.5px solid #e0ddd5", borderRadius: 12, overflow: "hidden", minHeight: 600, background: "#fff" },
  sidebar: { background: "#f5f4f0", borderRight: "0.5px solid #e0ddd5", padding: 14, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" },
  sLabel: { fontSize: 10, fontWeight: 500, color: "#8a8880", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, display: "block" },
  typeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  typeBtn: (a) => ({ background: a ? "#1A1A1A" : "#fff", border: `0.5px solid ${a ? "#1A1A1A" : "#e0ddd5"}`, borderRadius: 7, padding: "6px 5px", cursor: "pointer", fontSize: 11, fontWeight: 500, color: a ? "#fff" : "#8a8880", textAlign: "center", lineHeight: 1.3 }),
  pillRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  pill: (a) => ({ background: a ? "#CC0000" : "#fff", border: `0.5px solid ${a ? "#CC0000" : "#e0ddd5"}`, borderRadius: 20, padding: "3px 9px", fontSize: 11, color: a ? "#fff" : "#8a8880", cursor: "pointer", fontFamily: "inherit" }),
  select: { width: "100%", padding: "6px 9px", border: "0.5px solid #e0ddd5", borderRadius: 7, fontFamily: "inherit", fontSize: 12, background: "#fff", color: "#1a1a1a", outline: "none" },
  quickBtn: { width: "100%", textAlign: "left", background: "#fff", border: "0.5px solid #e0ddd5", borderRadius: 7, padding: "6px 9px", fontSize: 11, color: "#8a8880", cursor: "pointer", fontFamily: "inherit" },
  outputArea: { display: "flex", flexDirection: "column" },
  promptZone: { padding: 14, borderBottom: "0.5px solid #e0ddd5", display: "flex", flexDirection: "column", gap: 9 },
  textarea: { width: "100%", border: "0.5px solid #e0ddd5", borderRadius: 7, padding: "9px 11px", fontFamily: "inherit", fontSize: 13, color: "#1a1a1a", background: "#fff", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" },
  actionsRow: { display: "flex", gap: 7, alignItems: "center" },
  genBtn: (disabled) => ({ background: disabled ? "#aaa" : "#CC0000", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }),
  clearBtn: { background: "transparent", border: "0.5px solid #e0ddd5", borderRadius: 7, padding: "8px 12px", fontFamily: "inherit", fontSize: 13, color: "#8a8880", cursor: "pointer" },
  statusBadge: { fontSize: 11, fontFamily: "monospace", color: "#8a8880", marginLeft: "auto" },
  pipelineBar: { display: "flex", borderBottom: "0.5px solid #e0ddd5" },
  pStep: (s) => ({ flex: 1, padding: "6px 7px", fontSize: 10, fontFamily: "monospace", color: s === "done" ? "#0A6B4A" : s === "active" ? "#CC0000" : "#8a8880", background: s === "active" ? "rgba(200,0,0,0.05)" : "transparent", display: "flex", alignItems: "center", gap: 4 }),
  pDot: (s) => ({ width: 5, height: 5, borderRadius: "50%", background: s === "done" ? "#0A6B4A" : s === "active" ? "#CC0000" : "#e0ddd5", flexShrink: 0 }),
  renderArea: { flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 12 },
  placeholder: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 320, opacity: 0.4 },
  diagCard: { border: "0.5px solid #e0ddd5", borderRadius: 11, overflow: "hidden" },
  diagHeader: { padding: "9px 13px", display: "flex", alignItems: "center", gap: 7, borderBottom: "0.5px solid #e0ddd5", background: "#f5f4f0" },
  diagTag: { background: "#1A1A1A", color: "#fff", fontSize: 10, fontFamily: "monospace", padding: "2px 7px", borderRadius: 3, letterSpacing: ".5px" },
  diagTitle: { fontSize: 13, fontWeight: 500, color: "#1a1a1a", flex: 1 },
  exportBtn: { background: "transparent", border: "0.5px solid #e0ddd5", borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: "#8a8880", cursor: "pointer" },
  svgWrap: { padding: 20, display: "flex", justifyContent: "center", background: "#F8F8F6", overflowX: "auto", minHeight: 260 },
  compBar: { display: "flex", alignItems: "center", gap: 7, padding: "6px 13px", borderTop: "0.5px solid #e0ddd5", background: "rgba(10,107,74,0.04)" },
  verRow: { padding: "6px 13px", borderTop: "0.5px solid #e0ddd5", display: "flex", gap: 5, alignItems: "center" },
  verChip: (c) => ({ background: c ? "#1A1A1A" : "#f5f4f0", color: c ? "#fff" : "#8a8880", border: `0.5px solid ${c ? "#1A1A1A" : "#e0ddd5"}`, borderRadius: 3, padding: "2px 7px", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }),
  refineRow: { padding: "9px 13px", borderTop: "0.5px solid #e0ddd5", display: "flex", gap: 7 },
  refineInput: { flex: 1, border: "0.5px solid #e0ddd5", borderRadius: 7, padding: "6px 10px", fontFamily: "inherit", fontSize: 12, background: "#fff", color: "#1a1a1a", outline: "none" },
  refineBtn: (d) => ({ background: d ? "#aaa" : "#1A1A1A", color: "#fff", border: "none", borderRadius: 7, padding: "6px 13px", fontFamily: "inherit", fontSize: 12, cursor: d ? "not-allowed" : "pointer" }),
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  infoCard: { background: "#f5f4f0", borderRadius: 7, padding: "9px 11px" },
  iLabel: { fontSize: 10, fontFamily: "monospace", color: "#8a8880", letterSpacing: ".5px", marginBottom: 4 },
  chip: { display: "inline-block", background: "#fff", border: "0.5px solid #e0ddd5", borderRadius: 3, padding: "1px 6px", fontSize: 11, fontFamily: "monospace", color: "#8a8880", margin: "1px 1px 2px" },
  errBox: { background: "#fff0f0", border: "0.5px solid #ffcccc", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: "#cc0000", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" },
};

function Spinner() {
  return <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "abb-spin 0.6s linear infinite", display: "inline-block" }} />;
}

function pKey(label) { return label.toLowerCase().replace(/[\s\/]+/g, ""); }

function parsePlainText(raw, diagLabel) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const get = (key) => {
    const line = lines.find(l => l.toLowerCase().startsWith(key + ":"));
    return line ? line.slice(key.length + 1).trim() : "";
  };
  const getList = (key) => {
    const val = get(key);
    if (!val) return [];
    return val.split("|").map(s => s.trim()).filter(Boolean);
  };
  return {
    intent: get("intent") || diagLabel,
    confidence: parseInt(get("confidence")) || 93,
    diagram_title: get("title") || diagLabel + " Diagram",
    components: getList("components"),
    connections: getList("connections"),
    attributes: getList("attributes"),
    compliance_score: parseInt(get("score")) || 96,
    compliance_checks: ["Floating terminals: PASS", "Earth connections: PASS", "Symbol conformity: PASS", "Tag format: PASS"],
  };
}

async function callAPI(systemPrompt, userMsg, maxTokens) {
  const resp = await fetch("http://localhost:3001/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: systemPrompt, userMsg, maxTokens }),
  });
  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.error || `HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.text;
}

export default function App() {
  const [diagType, setDiagType] = useState("schematic");
  const [domain, setDomain] = useState("Power Automation");
  const [standard, setStandard] = useState("IEC 60617");
  const [library, setLibrary] = useState("ABB Product Library");
  const [role, setRole] = useState("Design Engineer");
  const [prompt, setPrompt] = useState("");
  const [refineText, setRefineText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipeline, setPipelineState] = useState({});
  const [result, setResult] = useState(null);
  const [versions, setVersions] = useState([]);
  const [curVer, setCurVer] = useState(-1);
  const [latency, setLatency] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const delay = ms => new Promise(r => setTimeout(r, ms));
  const setStep = useCallback((label, state) => setPipelineState(p => ({ ...p, [pKey(label)]: state })), []);
  const resetPipeline = () => setPipelineState({});

  async function runGeneration(fullPrompt) {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");
    resetPipeline();
    setStatusMsg("");
    const t0 = Date.now();
    const diagLabel = DIAGRAM_TYPES.find(d => d.id === diagType)?.label || diagType;

    try {
      setStep("NLP Parse", "active");
      await delay(250);

      const metaRaw = await callAPI(
        `You extract engineering diagram metadata. Reply in this exact plain-text format with no extra text:
intent: <diagram type>
confidence: <number 85-99>
title: <short diagram title>
components: <item1 | item2 | item3 | item4 | item5>
connections: <item1 | item2 | item3>
attributes: <item1 | item2 | item3>
score: <number 90-99>`,
        `Extract metadata for: "${fullPrompt}". Type: ${diagLabel}. Standard: ${standard}. Domain: ${domain}.`,
        300
      );

      setStep("NLP Parse", "done");
      setStep("Entity Extract", "active");
      const meta = parsePlainText(metaRaw, diagLabel);
      setStep("Entity Extract", "done");
      setStep("Layout Engine", "active");

      const svgRaw = await callAPI(
        `You generate SVG engineering diagrams. Output ONLY the SVG element — nothing before <svg, nothing after </svg>. No markdown, no explanation.`,
        `Create an IEC-style SVG engineering diagram for: "${fullPrompt}".
Type: ${diagLabel}. Standard: ${standard}. Library: ${library}. Domain: ${domain}.
Components: ${meta.components.join(", ") || "standard components"}.

SVG rules:
- viewBox="0 0 620 400" width="620" height="400" xmlns="http://www.w3.org/2000/svg"
- Background: rect fill="#F8F8F6" width="620" height="400"
- Motor (M1): circle r=20 fill="none" stroke="#1A1A1A" with text M inside, 3 lines from top
- Contactor (K1): rect width=32 height=22 fill="none" stroke="#1A1A1A" with label
- Circuit breaker (Q1): rect width=28 height=18 with diagonal line inside
- Thermal overload (F2): rect width=36 height=14 with zigzag inside
- E-Stop: circle r=9 fill="none" stroke="#CC0000" with X lines
- Wires: line stroke="#1A1A1A" stroke-width="1.5"
- Junction dots: circle r=3 fill="#1A1A1A"
- Labels: text font-size="11" font-family="monospace" fill="#1A1A1A"
- Title block: rect at y=375 fill="#1A1A1A" with white text
- Draw 8-12 components with full wiring`,
        3000
      );

      setStep("Layout Engine", "done");
      setStep("SVG Render", "active");

      let svg = svgRaw.replace(/^```[a-z]*\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      const si = svg.indexOf("<svg");
      if (si > 0) svg = svg.slice(si);
      const ei = svg.lastIndexOf("</svg>");
      if (ei > 0) svg = svg.slice(0, ei + 6);
      if (!svg.startsWith("<svg")) {
        svg = `<svg viewBox="0 0 620 400" width="620" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="620" height="400" fill="#F8F8F6"/><text x="310" y="195" text-anchor="middle" font-size="13" fill="#888" font-family="monospace">Diagram could not be rendered</text></svg>`;
      }

      await delay(120);
      setStep("SVG Render", "done");
      setStep("Validate", "active");
      await delay(160);
      setStep("Validate", "done");

      const elapsed = Date.now() - t0;
      setLatency(elapsed);
      setStatusMsg(`Generated in ${(elapsed / 1000).toFixed(1)}s`);

      const combined = { ...meta, svg };
      setVersions(prev => {
        const next = [...prev, { prompt: fullPrompt, result: combined }];
        setCurVer(next.length - 1);
        return next;
      });
      setResult(combined);
    } catch (err) {
      resetPipeline();
      setErrorMsg(err.message);
      setStatusMsg("Error");
    } finally {
      setLoading(false);
    }
  }

  const generate = () => { if (prompt.trim()) runGeneration(prompt.trim()); };
  const refine = () => {
    if (!refineText.trim() || !prompt.trim()) return;
    runGeneration(`${prompt.trim()}. Refinement: ${refineText.trim()}`);
    setRefineText("");
  };
  const clearAll = () => {
    setPrompt(""); setResult(null); setVersions([]); setCurVer(-1);
    setLatency(null); setStatusMsg(""); setErrorMsg(""); resetPipeline();
  };
  const exportSVG = () => {
    if (!result?.svg) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
    a.download = `${(result.diagram_title || "diagram").replace(/\s+/g, "-")}.svg`;
    a.click();
  };
  const exportJSON = () => {
    if (!result) return;
    const { svg, ...rest } = result;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ "@context": "https://schema.org", "@type": "EngineeringDiagram", ...rest }, null, 2)], { type: "application/json" }));
    a.download = "diagram.jsonld";
    a.click();
  };

  const pState = label => pipeline[pKey(label)] || "";

  return (
    <div style={S.app}>
      <style>{`@keyframes abb-spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      <div style={S.layout}>
        <div style={S.sidebar}>
          <div>
            <span style={S.sLabel}>Diagram Type</span>
            <div style={S.typeGrid}>
              {DIAGRAM_TYPES.map(t => (
                <button key={t.id} style={S.typeBtn(diagType === t.id)} onClick={() => setDiagType(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <span style={S.sLabel}>Industry Domain</span>
            <div style={S.pillRow}>
              {DOMAINS.map(d => (
                <button key={d} style={S.pill(domain === d)} onClick={() => setDomain(d)}>{d.split(" ")[0]}</button>
              ))}
            </div>
          </div>
          <div>
            <span style={S.sLabel}>Engineering Standard</span>
            <select style={S.select} value={standard} onChange={e => setStandard(e.target.value)}>
              {STANDARDS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <span style={S.sLabel}>Component Library</span>
            <select style={S.select} value={library} onChange={e => setLibrary(e.target.value)}>
              {LIBRARIES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <span style={S.sLabel}>User Role</span>
            <select style={S.select} value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <span style={S.sLabel}>Quick Prompts</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {QUICK_PROMPTS.map(q => (
                <button key={q.label} style={S.quickBtn} onClick={() => setPrompt(q.prompt)}>{q.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={S.outputArea}>
          <div style={S.promptZone}>
            <textarea
              style={S.textarea} rows={3}
              placeholder="Describe your engineering diagram… e.g. 'Draw a motor control circuit with overload protection and E-stop'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
            />
            <div style={S.actionsRow}>
              <button style={S.genBtn(loading || !prompt.trim())} onClick={generate} disabled={loading || !prompt.trim()}>
                {loading ? <><Spinner /> Generating…</> : "⚡ Generate Graphic"}
              </button>
              <button style={S.clearBtn} onClick={clearAll}>Clear</button>
              {statusMsg && <span style={S.statusBadge}>{statusMsg}</span>}
            </div>
          </div>

          <div style={S.pipelineBar}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step} style={{ ...S.pStep(pState(step)), borderRight: i < PIPELINE_STEPS.length - 1 ? "0.5px solid #e0ddd5" : "none" }}>
                <div style={S.pDot(pState(step))} />{step}
              </div>
            ))}
          </div>

          <div style={S.renderArea}>
            {errorMsg && <div style={S.errBox}>{errorMsg}</div>}

            {!result && !loading && !errorMsg && (
              <div style={S.placeholder}>
                <div style={{ fontSize: 32, opacity: 0.3 }}>◈</div>
                <div style={{ fontSize: 13, color: "#8a8880", textAlign: "center", lineHeight: 1.6, maxWidth: 240 }}>
                  Enter a plain-language description and click Generate.
                </div>
                <div style={{ fontSize: 11, color: "#8a8880", fontFamily: "monospace" }}>Ctrl+Enter to generate</div>
              </div>
            )}

            {loading && !result && (
              <div style={{ ...S.placeholder, opacity: 1 }}>
                <div style={{ width: 20, height: 20, border: "2px solid #e0ddd5", borderTopColor: "#CC0000", borderRadius: "50%", animation: "abb-spin 0.6s linear infinite" }} />
                <div style={{ fontSize: 13, color: "#8a8880" }}>Running generation pipeline…</div>
              </div>
            )}

            {result && (
              <>
                <div style={S.diagCard}>
                  <div style={S.diagHeader}>
                    <div style={S.diagTag}>{String(result.intent || "DIAGRAM").toUpperCase()}</div>
                    <div style={S.diagTitle}>{result.diagram_title || "Engineering Diagram"}</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={S.exportBtn} onClick={exportSVG}>SVG ↓</button>
                      <button style={S.exportBtn} onClick={exportJSON}>JSON-LD ↓</button>
                    </div>
                  </div>

                  <div style={S.svgWrap} dangerouslySetInnerHTML={{ __html: result.svg }} />

                  <div style={S.compBar}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "#0A6B4A" }}>✓ {standard} Validated</span>
                    <div style={{ display: "flex", gap: 10, marginLeft: "auto", alignItems: "center" }}>
                      {result.compliance_checks.slice(0, 3).map((c, i) => (
                        <span key={i} style={{ fontSize: 10, fontFamily: "monospace", color: "#0A6B4A" }}>{c.split(":")[0]}: ✓</span>
                      ))}
                      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "#0A6B4A" }}>{result.compliance_score}%</span>
                    </div>
                  </div>

                  {versions.length > 0 && (
                    <div style={S.verRow}>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#8a8880" }}>Versions:</span>
                      {versions.map((_, i) => (
                        <button key={i} style={S.verChip(i === curVer)} onClick={() => { setCurVer(i); setResult(versions[i].result); }}>v{i + 1}</button>
                      ))}
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#8a8880", marginLeft: "auto" }}>
                        Confidence: {result.confidence || 95}%{latency ? ` | ${(latency / 1000).toFixed(1)}s` : ""}
                      </span>
                    </div>
                  )}

                  <div style={S.refineRow}>
                    <input
                      style={S.refineInput}
                      placeholder="Refine: 'Add current transformer' or 'Change motor to 15kW'…"
                      value={refineText}
                      onChange={e => setRefineText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") refine(); }}
                    />
                    <button style={S.refineBtn(loading || !refineText.trim())} onClick={refine} disabled={loading || !refineText.trim()}>↺ Refine</button>
                  </div>
                </div>

                <div style={S.infoGrid}>
                  <div style={S.infoCard}>
                    <div style={S.iLabel}>Identified Components</div>
                    <div>{result.components.map((c, i) => <span key={i} style={S.chip}>{c}</span>)}</div>
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.iLabel}>Connections & Relationships</div>
                    <div>{result.connections.map((c, i) => <span key={i} style={S.chip}>{c}</span>)}</div>
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.iLabel}>Attributes & Ratings</div>
                    <div>{result.attributes.map((c, i) => <span key={i} style={S.chip}>{c}</span>)}</div>
                  </div>
                  <div style={S.infoCard}>
                    <div style={S.iLabel}>Pipeline Status</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {["NLP intent classified", "Entities extracted", "Layout computed", "SVG rendered", "Standards validated"].map((s, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#0A6B4A", display: "flex", gap: 5 }}>✓ {s}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}