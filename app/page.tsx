"use client";

import { useMemo, useState } from "react";
import {
  LayoutDashboard, FileText, ShoppingCart, Package, Users, Truck,
  Receipt, BarChart3, Landmark, Settings as SettingsIcon, Sparkles,
  Send, X, Check, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Plus, Bot, BookOpen, Search, HelpCircle, Trash2, Download,
  ChevronRight, CircleHelp
} from "lucide-react";

type VoucherType = "Sales" | "Purchase" | "Receipt" | "Payment";
type Voucher = {
  id: number; date: string; number: string; type: VoucherType;
  party: string; amount: number; note?: string;
};
type Ledger = {
  id: number; name: string; group: string; gstin: string;
  phone: string; openingBalance: number; balance: number;
};

const nav = [
  ["Overview", LayoutDashboard],
  ["Vouchers", FileText],
  ["Parties & ledgers", BookOpen],
  ["Inventory", Package],
  ["Reports", BarChart3],
  ["Bank reconciliation", Landmark],
  ["Settings", SettingsIcon],
  ["Help", CircleHelp],
] as const;

const inventory = [
  ["Premium Ball Pen", "PEN-001", 148, "₹12.00", "Good"],
  ["A4 Copy Paper", "PAP-014", 42, "₹280.00", "Low"],
  ["Stapler No. 10", "STA-009", 76, "₹85.00", "Good"],
  ["Whiteboard Marker", "MAR-022", 24, "₹35.00", "Low"],
  ["Office Notebook", "NOT-031", 210, "₹55.00", "Good"],
];

const initialVouchers: Voucher[] = [
  { id: 1, date: "2026-09-30", number: "PAY-004", type: "Payment", party: "Salaries", amount: 12000 },
  { id: 2, date: "2026-10-02", number: "INV/26-27/005", type: "Sales", party: "Kerala Agencies", amount: 26895.70 },
  { id: 3, date: "2026-10-04", number: "RCT-004", type: "Receipt", party: "Rahul Traders", amount: 25000 },
  { id: 4, date: "2026-10-05", number: "PAY-005", type: "Payment", party: "Electricity", amount: 4850 },
  { id: 5, date: "2026-10-07", number: "INV/26-27/006", type: "Sales", party: "Cash", amount: 1180 },
];

const initialLedgers: Ledger[] = [
  { id: 1, name: "Cash", group: "Cash-in-Hand", gstin: "", phone: "", openingBalance: 0, balance: 31180 },
  { id: 2, name: "HDFC Bank", group: "Bank Accounts", gstin: "", phone: "", openingBalance: 300000, balance: 341272 },
  { id: 3, name: "Sales", group: "Sales Accounts", gstin: "", phone: "", openingBalance: 0, balance: 128275 },
  { id: 4, name: "Rahul Traders", group: "Sundry Debtors", gstin: "", phone: "9876543210", openingBalance: 0, balance: 9664.70 },
  { id: 5, name: "Kerala Agencies", group: "Sundry Debtors", gstin: "", phone: "9895012345", openingBalance: 0, balance: 61605.70 },
  { id: 6, name: "OfficeMart Supplies", group: "Sundry Creditors", gstin: "", phone: "9847012345", openingBalance: 0, balance: 18300 },
];

const money = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 2,
}).format(value);
const displayDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");

export default function Home() {
  const [active, setActive] = useState<string>("Overview");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<{ title: string; subtitle: string; amount?: string; items?: { name: string; qty: number; price: number }[] } | null>(null);
  const [toast, setToast] = useState("");
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [ledgers, setLedgers] = useState<Ledger[]>(initialLedgers);
  const [voucherFilter, setVoucherFilter] = useState("All types");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherType, setVoucherType] = useState<VoucherType>("Sales");
  const [formParty, setFormParty] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("2026-10-14");
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerGroup, setLedgerGroup] = useState("Sundry Debtors");
  const [ledgerPhone, setLedgerPhone] = useState("");
  const [companyName, setCompanyName] = useState("Tax Elevate Pvt Ltd");
  const [gstin, setGstin] = useState("");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [currency, setCurrency] = useState("INR (₹)");
  const [helpSearch, setHelpSearch] = useState("");

  const orderedVouchers = useMemo(() => vouchers
    .filter(v => voucherFilter === "All types" || v.type === voucherFilter)
    .filter(v => `${v.number} ${v.party} ${v.type}`.toLowerCase().includes(voucherSearch.toLowerCase()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id), [vouchers, voucherFilter, voucherSearch]);

  const runAssistant = () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    window.setTimeout(() => {
      const lower = prompt.toLowerCase();
      if (lower.includes("bill") || lower.includes("invoice") || lower.includes("pen")) {
        setAction({ title: "Create sales invoice", subtitle: "Review the draft before creating the invoice.", amount: "₹120.00", items: [{ name: "Premium Ball Pen", qty: 10, price: 12 }] });
      } else if (lower.includes("expense") || lower.includes("rent")) {
        setAction({ title: "Record business expense", subtitle: "Review the proposed expense before saving.", amount: "₹2,500.00" });
      } else {
        setAction({ title: "Assistant action", subtitle: `Prepared a demo suggestion from: “${prompt}”. No records have been changed yet.`, amount: "₹1,250.00" });
      }
      setLoading(false);
    }, 1200);
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const addVoucher = () => {
    const amount = Number(formAmount);
    if (!formParty.trim() || !Number.isFinite(amount) || amount <= 0 || !formDate) {
      notify("Enter a party, valid amount and date.");
      return;
    }
    const prefix: Record<VoucherType, string> = { Sales: "INV", Purchase: "PUR", Receipt: "RCT", Payment: "PAY" };
    const next = vouchers.length + 1;
    const voucher: Voucher = { id: Date.now(), date: formDate, number: `${prefix[voucherType]}-${String(next).padStart(3, "0")}`, type: voucherType, party: formParty.trim(), amount };
    setVouchers(old => [...old, voucher]);
    setShowVoucherForm(false);
    setFormParty(""); setFormAmount("");
    notify("Voucher added to this demo. Latest entries appear at the bottom.");
  };

  const addLedger = () => {
    if (!ledgerName.trim()) { notify("Enter a ledger or party name."); return; }
    setLedgers(old => [...old, { id: Date.now(), name: ledgerName.trim(), group: ledgerGroup, gstin: "", phone: ledgerPhone.trim(), openingBalance: 0, balance: 0 }]);
    setLedgerName(""); setLedgerPhone(""); setShowLedgerForm(false);
    notify("Ledger added.");
  };

  const confirmAction = () => {
    if (action?.title.toLowerCase().includes("invoice")) {
      const newVoucher: Voucher = { id: Date.now(), date: "2026-10-14", number: `INV/26-27/${String(vouchers.length + 1).padStart(3, "0")}`, type: "Sales", party: "Rahul Traders", amount: 120 };
      setVouchers(old => [...old, newVoucher]);
    }
    setAction(null); setPrompt("");
    notify("Demo action confirmed. For production, connect this confirmation to your backend before updating accounting records.");
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">T</div><div><b>Tax Elevate</b><span>Business OS</span></div></div>
        <div className="workspace"><span className="avatar">TE</span><div><b>{companyName}</b><small>Business account</small></div><MoreHorizontal size={17}/></div>
        <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "nav active" : "nav"} onClick={() => setActive(label)}><Icon size={18}/><span>{label}</span></button>)}</nav>
        <div style={{ margin: "22px 10px 8px", color: "#91b9ae", fontSize: 10, fontWeight: 800, letterSpacing: "1.5px" }}>AI WORKSPACE</div>
        <button className={active === "Ask Tax Elevate" ? "nav active" : "nav"} onClick={() => setActive("Ask Tax Elevate")}><Bot size={18}/><span>Ask Tax Elevate</span><span style={{ marginLeft: "auto", fontSize: 10, background: "#e6a21a", color: "#173d34", padding: "3px 6px", borderRadius: 6 }}>AI</span></button>
        <div className="sidebarBottom"><div className="upgrade"><Sparkles size={17}/><b>Your AI workspace</b><p>Ask questions, prepare entries, and explore your books.</p><button onClick={() => setActive("Ask Tax Elevate")} style={{ marginTop: 8, width: "100%", border: "1px solid #4d8878", background: "#175e4e", color: "white", borderRadius: 8, padding: "9px", cursor: "pointer", font: "inherit" }}>Open assistant ↗</button></div></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><span className="eyebrow">WORKSPACE</span><h1>{active}</h1></div>
          <div className="topActions"><button className="iconBtn" title="Help" onClick={() => setActive("Help")}>?</button><button className="profile">S <span>Admin</span></button></div>
        </header>



        {active === "Ask Tax Elevate" && <AssistantPage prompt={prompt} setPrompt={setPrompt} runAssistant={runAssistant} loading={loading} setActive={setActive} />}
        {active === "Overview" && <Overview setActive={setActive} prompt={prompt} setPrompt={setPrompt} runAssistant={runAssistant} loading={loading} />}
        {active === "Vouchers" && <section className="card full">
          <div className="cardHead"><div><h2>Vouchers</h2><p>Sales, purchases, receipts and payments. Oldest entries appear first and newest entries at the bottom.</p></div><button className="primary" onClick={() => setShowVoucherForm(v => !v)}><Plus size={16}/> New voucher</button></div>
          <div className="toolbar"><select value={voucherFilter} onChange={e => setVoucherFilter(e.target.value)}><option>All types</option>{(["Sales","Purchase","Receipt","Payment"] as VoucherType[]).map(t => <option key={t}>{t}</option>)}</select><div className="searchBox"><Search size={16}/><input value={voucherSearch} onChange={e => setVoucherSearch(e.target.value)} placeholder="Search party or voucher number"/></div></div>
          {showVoucherForm && <div className="inlineForm"><h3>Create voucher</h3><div className="formGrid"><label>Type<select value={voucherType} onChange={e => setVoucherType(e.target.value as VoucherType)}>{(["Sales","Purchase","Receipt","Payment"] as VoucherType[]).map(t => <option key={t}>{t}</option>)}</select></label><label>Date<input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}/></label><label>Party / ledger<input value={formParty} onChange={e => setFormParty(e.target.value)} placeholder="Customer, supplier or account"/></label><label>Amount (₹)<input type="number" min="0.01" step="0.01" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00"/></label></div><div className="formActions"><button className="secondary" onClick={() => setShowVoucherForm(false)}>Cancel</button><button className="primary" onClick={addVoucher}>Save voucher</button></div></div>}
          <div className="dataTable"><div className="tableHeader"><span>Date</span><span>No.</span><span>Type</span><span>Party</span><span>Amount</span><span>Actions</span></div>
            {orderedVouchers.map(v => <div className="tableRow" key={v.id}><span>{displayDate(v.date)}</span><span>{v.number}</span><span><em className={`typePill ${v.type.toLowerCase()}`}>{v.type}</em></span><span>{v.party}</span><strong>{money(v.amount)}</strong><span className="rowActions"><button title="Demo PDF action" onClick={() => notify(`PDF preview for ${v.number} is not connected in this demo.`)}><Download size={15}/> PDF</button><button className="dangerText" title="Delete voucher" onClick={() => { if (window.confirm(`Delete ${v.number}? This demo action cannot be undone.`)) { setVouchers(old => old.filter(x => x.id !== v.id)); notify("Voucher deleted from demo."); } }}><Trash2 size={15}/></button></span></div>)}
            {!orderedVouchers.length && <p className="emptyMessage">No vouchers match your search.</p>}
          </div>
          <p className="tableFoot">Showing {orderedVouchers.length} entries · New vouchers are appended at the bottom of the list.</p>
        </section>}

        {active === "Parties & ledgers" && <section className="card full">
          <div className="cardHead"><div><h2>Parties &amp; ledgers</h2><p>Manage customers, suppliers, cash, bank accounts and accounting ledgers.</p></div><button className="primary" onClick={() => setShowLedgerForm(v => !v)}><Plus size={16}/> Add ledger or party</button></div>
          <div className="searchBox ledgerSearch"><Search size={16}/><input value={ledgerSearch} onChange={e => setLedgerSearch(e.target.value)} placeholder="Search ledger, group or phone"/></div>
          {showLedgerForm && <div className="inlineForm"><h3>New ledger or party</h3><div className="formGrid"><label>Name<input value={ledgerName} onChange={e => setLedgerName(e.target.value)} placeholder="Ledger / party name"/></label><label>Group<select value={ledgerGroup} onChange={e => setLedgerGroup(e.target.value)}>{["Sundry Debtors","Sundry Creditors","Cash-in-Hand","Bank Accounts","Sales Accounts","Purchase Accounts","Direct Expenses","Indirect Expenses","Capital Account"].map(g => <option key={g}>{g}</option>)}</select></label><label>Phone (optional)<input value={ledgerPhone} onChange={e => setLedgerPhone(e.target.value)} placeholder="Phone number"/></label></div><div className="formActions"><button className="secondary" onClick={() => setShowLedgerForm(false)}>Cancel</button><button className="primary" onClick={addLedger}>Save ledger</button></div></div>}
          {Array.from(new Set(ledgers.filter(l => `${l.name} ${l.group} ${l.phone}`.toLowerCase().includes(ledgerSearch.toLowerCase())).map(l => l.group))).map(group => <div className="ledgerGroup" key={group}><h3>{group}</h3><div className="dataTable"><div className="tableHeader ledgerHeader"><span>Name</span><span>GSTIN</span><span>Phone</span><span>Opening balance</span><span>Current balance</span><span>Actions</span></div>{ledgers.filter(l => l.group === group && `${l.name} ${l.group} ${l.phone}`.toLowerCase().includes(ledgerSearch.toLowerCase())).map(l => <div className="tableRow ledgerRow" key={l.id}><b>{l.name}</b><span>{l.gstin || "—"}</span><span>{l.phone || "—"}</span><span>{money(l.openingBalance)}</span><strong>{money(l.balance)}</strong><span className="rowActions"><button onClick={() => notify(`Statement for ${l.name}: connect voucher ledger entries to show a real statement.`)}>Statement</button><button onClick={() => notify(`Edit ${l.name}: ledger edit form can be connected to the backend next.`)}>Edit</button></span></div>)}</div></div>)}
          <p className="tableFoot">Demo data only. For production, calculate balances from journal entries rather than manually changing totals.</p>
        </section>}

        {active === "Inventory" && <Inventory/>}
        {active === "Reports" && <Reports notify={notify}/>}
        {active === "Bank reconciliation" && <section className="card full"><h2>Bank reconciliation</h2><p>Match your bank statement against recorded vouchers and review unmatched transactions.</p><div className="inlineForm"><label>Bank account<select><option>HDFC Bank</option><option>Cash</option></select></label><div className="formActions"><button className="secondary" onClick={() => notify("Choose a CSV statement file in the production implementation.")}>Upload statement (CSV)</button><button className="primary" onClick={() => notify("Sample statement loaded for this demo.")}>Load sample statement</button></div></div><p className="emptyMessage">No statement loaded. Load a sample statement or import a CSV to begin matching.</p></section>}
        {active === "Settings" && <section className="card full"><div className="cardHead"><div><h2>Settings</h2><p>Configure your business profile and bookkeeping preferences.</p></div></div><div className="settingsSection"><h3>Company details</h3><div className="formGrid"><label>Business / company name<input value={companyName} onChange={e => setCompanyName(e.target.value)} /></label><label>GSTIN (optional)<input value={gstin} onChange={e => setGstin(e.target.value)} placeholder="15-character GSTIN"/></label><label>Financial year<select value={financialYear} onChange={e => setFinancialYear(e.target.value)}>{["2025-26","2026-27","2027-28"].map(y => <option key={y}>{y}</option>)}</select></label><label>Currency<select value={currency} onChange={e => setCurrency(e.target.value)}><option>INR (₹)</option><option>USD ($)</option></select></label></div><h3>Preferences</h3><label className="settingCheck"><input type="checkbox" defaultChecked/> Ask for confirmation before creating AI-suggested transactions</label><label className="settingCheck"><input type="checkbox" defaultChecked/> Show newest vouchers at the bottom of the list</label><label className="settingCheck"><input type="checkbox"/> Enable dark mode (demo preference)</label><div className="formActions"><button className="primary" onClick={() => notify("Settings updated for this session.")}>Save settings</button><button className="secondary" onClick={() => { if (window.confirm("Clear all demo vouchers and ledgers?")) { setVouchers([]); setLedgers([]); notify("Demo books cleared for this session."); } }}>Start with empty books</button></div><p className="tableFoot">These settings currently stay in page state only. Persist them through your backend for real users.</p></div></section>}
        {active === "Help" && <Help helpSearch={helpSearch} setHelpSearch={setHelpSearch}/>}
      </section>

      {loading && <div className="loadingOverlay"><div className="loadingCard"><div className="aiPulse"><Sparkles/></div><h3>Tax Elevate is thinking…</h3><p>Understanding your request and preparing a draft for approval.</p><div className="progress"><i/></div></div></div>}
      {action && <div className="modalBackdrop"><div className="modal"><button className="close" onClick={() => setAction(null)}><X/></button><div className="confirmIcon"><Check/></div><span className="eyebrow">READY FOR CONFIRMATION</span><h2>{action.title}</h2><p className="muted">{action.subtitle}</p>{action.items?.map(i => <div className="actionItem" key={i.name}><div><b>{i.name}</b><small>{i.qty} × ₹{i.price.toFixed(2)}</small></div><strong>{money(i.qty * i.price)}</strong></div>)}<div className="total"><span>Total</span><b>{action.amount}</b></div><div className="modalNote">Review this draft before confirming. Production accounting records should only be written after backend validation and user approval.</div><div className="modalButtons"><button className="secondary" onClick={() => setAction(null)}>Cancel</button><button className="primary" onClick={confirmAction}><Check size={17}/> Confirm action</button></div></div></div>}
      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </main>
  );
}

function AssistantPage({ prompt, setPrompt, runAssistant, loading, setActive }: { prompt: string; setPrompt: (s: string) => void; runAssistant: () => void; loading: boolean; setActive: (s: string) => void }) {
  const examples = [
    { icon: FileText, title: "Create an invoice", text: "Create a bill for 10 premium pens for Rahul Traders at ₹12 each" },
    { icon: BarChart3, title: "Understand my numbers", text: "Explain my profit and loss for this month" },
    { icon: Receipt, title: "Record an expense", text: "Record an office rent expense of ₹25,000" },
    { icon: Package, title: "Check my inventory", text: "Which products are running low in stock?" },
  ];
  return <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 28px 40px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#17624f", fontWeight: 750, fontSize: 12, letterSpacing: "1.4px", marginBottom: 16 }}><span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 11, color: "#fff", background: "linear-gradient(135deg,#17624f,#2d8b70)" }}><Sparkles size={18}/></span> TAX ELEVATE INTELLIGENCE <span style={{ borderRadius: 20, background: "#e5f3ec", color: "#237459", padding: "5px 9px", letterSpacing: 0 }}>PREVIEW</span></div>
    <div style={{ textAlign: "center", padding: "28px 12px 22px" }}>
      <div style={{ width: 62, height: 62, display: "grid", placeItems: "center", margin: "0 auto 18px", borderRadius: 20, color: "#fff", background: "linear-gradient(145deg,#145b4a,#27866c)", boxShadow: "0 12px 28px #17624f25" }}><Bot size={30}/></div>
      <h2 style={{ margin: "0 0 10px", color: "#183c32", fontSize: "clamp(28px, 3vw, 38px)", letterSpacing: "-1.2px" }}>What can I help you with?</h2>
      <p style={{ maxWidth: 590, margin: "0 auto", color: "#71817a", lineHeight: 1.7, fontSize: 15 }}>Ask in plain language. I can help you explore your books and prepare accounting actions for your review.</p>
    </div>
    <div style={{ maxWidth: 830, margin: "0 auto" }}>
      <div style={{ background: "#fff", border: "1px solid #d8e5de", borderRadius: 20, padding: 12, boxShadow: "0 12px 36px #163e3010" }}>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAssistant(); } }} placeholder="Ask anything about your business… e.g. Create an invoice for Rahul Traders" style={{ width: "100%", minHeight: 86, border: 0, outline: 0, resize: "vertical", padding: "12px 13px", boxSizing: "border-box", color: "#193b31", background: "transparent", font: "inherit", fontSize: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid #edf1ee", padding: "12px 3px 1px" }}><span style={{ color: "#8a9891", fontSize: 12 }}>AI suggestions are drafts. You approve before anything is saved.</span><button onClick={runAssistant} disabled={loading || !prompt.trim()} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: 0, borderRadius: 11, padding: "11px 17px", color: "white", background: loading || !prompt.trim() ? "#8aa99f" : "#12624f", fontWeight: 700, cursor: loading || !prompt.trim() ? "not-allowed" : "pointer" }}>{loading ? "Thinking…" : <>Ask Tax Elevate <Send size={16}/></>}</button></div>
      </div>
      <div style={{ margin: "25px 0 11px", color: "#667b72", fontSize: 12, fontWeight: 750, letterSpacing: ".8px" }}>TRY ASKING</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>{examples.map(({ icon: Icon, title, text }) => <button key={title} onClick={() => setPrompt(text)} style={{ display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", minHeight: 88, border: "1px solid #dce6e0", borderRadius: 14, background: "#fff", padding: 16, cursor: "pointer", color: "#24483c" }}><span style={{ display: "grid", placeItems: "center", flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "#edf6f1", color: "#24745c" }}><Icon size={18}/></span><span><b style={{ display: "block", marginBottom: 5, fontSize: 14 }}>{title}</b><span style={{ display: "block", color: "#7a8b83", fontSize: 12, lineHeight: 1.5 }}>{text}</span></span></button>)}</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 24, padding: 16, borderRadius: 14, background: "#fff7e7", border: "1px solid #f3e2bb", color: "#70552a" }}><CircleHelp size={19}/><div><b style={{ fontSize: 13 }}>You’re always in control</b><p style={{ margin: "5px 0 0", fontSize: 12, lineHeight: 1.6 }}>Tax Elevate prepares a suggestion first. Review the details and confirm before a transaction is created. Demo responses are illustrative and are not a substitute for verified accounting advice.</p></div></div>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 20 }}><button className="secondary" onClick={() => setActive("Vouchers")}>Open vouchers <ChevronRight size={15}/></button><button className="secondary" onClick={() => setActive("Reports")}>View reports <ChevronRight size={15}/></button><button className="secondary" onClick={() => setActive("Help")}>Assistant guide <ChevronRight size={15}/></button></div>
    </div>
  </div>;
}

function Overview({ setActive, prompt, setPrompt, runAssistant, loading }: { setActive: (s: string) => void; prompt: string; setPrompt: (s: string) => void; runAssistant: () => void; loading: boolean }) {
  const quickPrompts = [
    { label: "Create an invoice", prompt: "Create a bill for 10 pens for Rahul Traders", icon: FileText },
    { label: "Record an expense", prompt: "Record an expense of ₹2,500 for office rent", icon: Receipt },
    { label: "Check low stock", prompt: "Which products are running low in stock?", icon: Package },
    { label: "View profit & loss", prompt: "Show me this month's profit and loss", icon: BarChart3 },
  ];
  return <>
    <section style={{ borderRadius: 20, padding: "28px clamp(18px, 3vw, 34px)", marginBottom: 22, color: "#183d32", background: "linear-gradient(125deg,#f3faf6 0%,#ffffff 62%,#fff7e6 100%)", border: "1px solid #d9e8df", boxShadow: "0 10px 30px #174c3910" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#17624f", fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", marginBottom: 14 }}><span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 11, background: "#17624f", color: "white" }}><Sparkles size={18}/></span> TAX ELEVATE AI <span style={{ fontSize: 10, letterSpacing: 0, borderRadius: 20, padding: "5px 8px", background: "#e3f3e9", color: "#267256" }}>READY TO HELP</span></div>
      <h2 style={{ margin: "0 0 8px", fontSize: "clamp(25px,3vw,36px)", letterSpacing: "-1px", lineHeight: 1.2 }}>Good morning! 👋</h2>
      <p style={{ margin: "0 0 20px", fontSize: "clamp(16px,2vw,21px)", fontWeight: 650, color: "#38594d" }}>How can Tax Elevate AI help you today?</p>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap", padding: 9, borderRadius: 15, border: "1px solid #d4e3da", background: "white", boxShadow: "0 5px 18px #183d3208" }}>
        <textarea aria-label="Ask Tax Elevate AI" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAssistant(); } }} placeholder="Ask about your business, create a bill, record an expense…" style={{ flex: "1 1 300px", minHeight: 54, maxHeight: 130, resize: "vertical", border: 0, outline: 0, padding: "10px 12px", background: "transparent", color: "#193b31", font: "inherit", fontSize: 15 }} />
        <button onClick={runAssistant} disabled={loading || !prompt.trim()} style={{ alignSelf: "stretch", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8, border: 0, borderRadius: 11, padding: "0 19px", minHeight: 48, color: "white", background: loading || !prompt.trim() ? "#8aa99f" : "#12624f", fontWeight: 750, cursor: loading || !prompt.trim() ? "not-allowed" : "pointer" }}>{loading ? "Thinking…" : <>Ask AI <Send size={16}/></>}</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 14 }}><span style={{ color: "#74877d", fontSize: 12, marginRight: 2 }}>Try:</span>{quickPrompts.map(item => <button key={item.label} onClick={() => setPrompt(item.prompt)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #dce8e0", borderRadius: 999, padding: "8px 11px", background: "#fff", color: "#35594b", font: "inherit", fontSize: 12, cursor: "pointer" }}><item.icon size={14}/>{item.label}</button>)}</div>
      <p style={{ margin: "13px 0 0", fontSize: 11, color: "#71847a" }}>Your request is prepared as a draft. Review and confirm before any accounting action is saved.</p>
    </section>
    <div className="stats"><Stat title="Total Revenue" value="₹8,42,650" change="+12.8%" up/><Stat title="Total Expenses" value="₹3,18,420" change="+4.6%" up={false}/><Stat title="Net Profit" value="₹5,24,230" change="+18.4%" up/><Stat title="Receivables" value="₹1,84,600" change="24 invoices" up={false}/></div>
    <div className="grid2"><section className="card"><div className="cardHead"><div><h3>Financial overview</h3><p>Revenue vs expenses · Last 6 months</p></div></div><div className="chart"><div className="bars">{[42,58,51,76,68,91].map((h,i)=><div className="barGroup" key={i}><div className="bar revenue" style={{height:`${h}%`}}/><div className="bar expense" style={{height:`${h*0.48}%`}}/><span>{["May","Jun","Jul","Aug","Sep","Oct"][i]}</span></div>)}</div></div></section><section className="card"><div className="cardHead"><div><h3>Quick navigation</h3><p>Jump straight to what you need</p></div></div>{["Ask Tax Elevate","Vouchers","Parties & ledgers","Inventory","Reports","Bank reconciliation","Settings","Help"].map(item=><button className="quickLink" key={item} onClick={()=>setActive(item)}>{item}<ChevronRight size={16}/></button>)}</section></div>
    <section className="card inventoryCard"><div className="cardHead"><div><h3>Inventory snapshot</h3><p>Stock health across your products</p></div><button className="linkBtn" onClick={()=>setActive("Inventory")}>View inventory <ArrowUpRight size={15}/></button></div><div className="table">{inventory.slice(0,4).map(r=><div className="row" key={r[1]}><div><b>{r[0]}</b><small>{r[1]}</small></div><span>{r[2]} units</span><span>{r[3]}</span><em className={r[4] === "Low" ? "low" : "good"}>{r[4]}</em></div>)}</div></section>
  </>;
}
function Stat({title,value,change,up}:{title:string;value:string;change:string;up:boolean}) { return <div className="stat"><span>{title}</span><h3>{value}</h3><small className={up?"positive":"negative"}>{up?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {change} <i>vs last month</i></small></div>; }
function Inventory() { return <section className="card full"><div className="cardHead"><div><p className="eyebrow">PRODUCT MANAGEMENT</p><h2>Inventory</h2><p>Track stock, pricing and product movement.</p></div><button className="primary" onClick={()=>window.alert("Connect this action to your product creation form.")}><Plus size={16}/> Add product</button></div><div className="table inventoryTable">{inventory.map(r=><div className="row" key={r[1]}><div><b>{r[0]}</b><small>{r[1]}</small></div><span>{r[2]} units</span><span>{r[3]}</span><em className={r[4] === "Low" ? "low" : "good"}>{r[4]}</em></div>)}</div></section>; }
function Reports({notify}:{notify:(s:string)=>void}) { return <section className="card full"><div className="cardHead"><div><h2>Reports</h2><p>Review financial summaries for the selected period.</p></div><button className="secondary" onClick={()=>notify("PDF export needs a report-generation endpoint.")}><Download size={16}/> Export PDF</button></div><div className="reportGrid"><div><span>Revenue</span><h3>₹8,42,650.00</h3></div><div><span>Expenses</span><h3>₹3,18,420.00</h3></div><div><span>Net profit</span><h3>₹5,24,230.00</h3></div></div><div className="reportTabs"><button className="active" onClick={()=>notify("Profit & Loss selected.")}>Profit &amp; Loss</button><button onClick={()=>notify("Balance Sheet report selected.")}>Balance Sheet</button><button onClick={()=>notify("Trial Balance report selected.")}>Trial Balance</button><button onClick={()=>notify("Day Book report selected.")}>Day Book</button><button onClick={()=>notify("Ledger report selected.")}>Ledger</button></div><p className="tableFoot">These are illustrative demo totals. Build production reports from balanced journal entries.</p></section>; }
function Help({helpSearch,setHelpSearch}:{helpSearch:string;setHelpSearch:(s:string)=>void}) {
  const guides = [
    ["Create a sales invoice","Open Vouchers → New voucher → choose Sales. Enter the date, customer, and amount, then save."],
    ["Record a customer receipt","Create a Receipt voucher and select the customer ledger. Match it against the outstanding invoice in the full version."],
    ["Record a supplier payment","Create a Payment voucher, choose the supplier or expense ledger, and enter the amount and date."],
    ["Manage parties and ledgers","Open Parties & ledgers to search existing accounts or add a customer, supplier, cash or bank ledger."],
    ["Understand reports","Use Reports to review Profit & Loss, Balance Sheet, Trial Balance, Day Book and ledger statements. Figures must come from verified journal entries."],
    ["Use the AI assistant safely","Describe the action in plain language. Review the proposed details and confirm only when correct. The production backend should validate and save the transaction after confirmation."],
    ["Configure your company","Open Settings to update company name, GSTIN, financial year and preferences."],
    ["Bank reconciliation","Import a bank statement CSV, match statement lines with vouchers, then investigate unmatched entries."]
  ];
  const filtered = guides.filter(([title,body])=>`${title} ${body}`.toLowerCase().includes(helpSearch.toLowerCase()));
  return <section className="card full"><div className="cardHead"><div><p className="eyebrow">SUPPORT CENTRE</p><h2>How can we help?</h2><p>Short guides for everyday bookkeeping tasks.</p></div><div className="helpIcon"><HelpCircle size={30}/></div></div><div className="searchBox helpSearch"><Search size={16}/><input value={helpSearch} onChange={e=>setHelpSearch(e.target.value)} placeholder="Search help articles"/></div><div className="helpGrid">{filtered.map(([title,body])=><article className="helpArticle" key={title}><div className="helpArticleIcon"><BookOpen size={18}/></div><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>{!filtered.length&&<p className="emptyMessage">No help articles match your search.</p>}<div className="helpFooter"><h3>Still need help?</h3><p>For accounting, GST filing or bank integration decisions, verify the workflow with your accountant before using it for live books.</p></div></section>;
}
