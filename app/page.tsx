"use client";

import { useState } from "react";
import {
  LayoutDashboard, FileText, ShoppingCart, Package, Users, Truck,
  Receipt, BarChart3, Landmark, Settings, Sparkles, Send, X,
  Check, ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus, Bot
} from "lucide-react";

/* ---------- Types ---------- */
type Product = { name: string; sku: string; stock: number; price: number; reorderAt: number };
type Invoice = { id: string; customer: string; date: string; amount: number; status: "Paid" | "Pending" | "Overdue" };
type Action = {
  kind: "invoice" | "expense" | "generic";
  title: string;
  subtitle: string;
  amount: number;
  customer?: string;
  items?: { sku: string; name: string; qty: number; price: number }[];
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr0 = (n: number) => "₹" + n.toLocaleString("en-IN");

/* ---------- Demo data ---------- */
const nav = [
  ["Overview", LayoutDashboard],
  ["Invoices", FileText],
  ["Purchases", ShoppingCart],
  ["Inventory", Package],
  ["Customers", Users],
  ["Suppliers", Truck],
  ["Expenses", Receipt],
  ["Reports", BarChart3],
  ["Banking", Landmark],
] as const;

const initialInventory: Product[] = [
  { name: "Premium Ball Pen", sku: "PEN-001", stock: 148, price: 12, reorderAt: 50 },
  { name: "Gel Pen (Blue)", sku: "PEN-004", stock: 96, price: 20, reorderAt: 40 },
  { name: "A4 Copy Paper (500 sheets)", sku: "PAP-014", stock: 42, price: 280, reorderAt: 50 },
  { name: "Stapler No. 10", sku: "STA-009", stock: 76, price: 85, reorderAt: 25 },
  { name: "Whiteboard Marker", sku: "MAR-022", stock: 24, price: 35, reorderAt: 30 },
  { name: "Office Notebook", sku: "NOT-031", stock: 210, price: 55, reorderAt: 60 },
  { name: "Sticky Notes (Pack of 5)", sku: "STK-017", stock: 130, price: 60, reorderAt: 40 },
  { name: "Highlighter Set", sku: "HIG-008", stock: 18, price: 110, reorderAt: 25 },
  { name: "File Folder (A4)", sku: "FLD-012", stock: 320, price: 25, reorderAt: 100 },
  { name: "Desk Organiser", sku: "DSK-003", stock: 35, price: 349, reorderAt: 15 },
  { name: "Printer Ink Cartridge", sku: "INK-006", stock: 9, price: 950, reorderAt: 12 },
  { name: "Paper Clips (Box of 100)", sku: "CLP-020", stock: 185, price: 18, reorderAt: 60 },
];

const initialInvoices: Invoice[] = [
  { id: "INV-1048", customer: "Rahul Traders", date: "06 Oct 2026", amount: 12400, status: "Paid" },
  { id: "INV-1047", customer: "Metro Stationery", date: "05 Oct 2026", amount: 8600, status: "Paid" },
  { id: "INV-1046", customer: "Malabar Office Supplies", date: "03 Oct 2026", amount: 21350, status: "Pending" },
  { id: "INV-1045", customer: "Sunrise Public School", date: "29 Sep 2026", amount: 34800, status: "Pending" },
  { id: "INV-1044", customer: "Calicut Print House", date: "24 Sep 2026", amount: 15920, status: "Overdue" },
  { id: "INV-1043", customer: "Green Valley Traders", date: "20 Sep 2026", amount: 9480, status: "Paid" },
  { id: "INV-1042", customer: "Nair & Sons", date: "15 Sep 2026", amount: 6750, status: "Overdue" },
  { id: "INV-1041", customer: "Rahul Traders", date: "10 Sep 2026", amount: 18200, status: "Paid" },
];

const purchases = [
  { id: "PUR-882", supplier: "OfficeMart Supplies", date: "04 Oct 2026", amount: 7250, status: "Received" },
  { id: "PUR-881", supplier: "Kerala Paper Mills", date: "30 Sep 2026", amount: 28600, status: "Received" },
  { id: "PUR-880", supplier: "InkWorks India", date: "26 Sep 2026", amount: 19000, status: "In transit" },
  { id: "PUR-879", supplier: "Stationers Hub", date: "21 Sep 2026", amount: 11480, status: "Received" },
  { id: "PUR-878", supplier: "OfficeMart Supplies", date: "14 Sep 2026", amount: 9360, status: "Received" },
  { id: "PUR-877", supplier: "Kerala Paper Mills", date: "08 Sep 2026", amount: 31200, status: "Received" },
];

const customers = [
  { name: "Rahul Traders", city: "Kozhikode", invoices: 14, outstanding: 0 },
  { name: "Metro Stationery", city: "Kochi", invoices: 9, outstanding: 0 },
  { name: "Malabar Office Supplies", city: "Kannur", invoices: 11, outstanding: 21350 },
  { name: "Sunrise Public School", city: "Malappuram", invoices: 6, outstanding: 34800 },
  { name: "Calicut Print House", city: "Kozhikode", invoices: 8, outstanding: 15920 },
  { name: "Green Valley Traders", city: "Wayanad", invoices: 5, outstanding: 0 },
  { name: "Nair & Sons", city: "Thrissur", invoices: 4, outstanding: 6750 },
];

const suppliers = [
  { name: "OfficeMart Supplies", city: "Kochi", orders: 18, payable: 0 },
  { name: "Kerala Paper Mills", city: "Palakkad", orders: 12, payable: 14300 },
  { name: "InkWorks India", city: "Bengaluru", orders: 7, payable: 19000 },
  { name: "Stationers Hub", city: "Coimbatore", orders: 9, payable: 0 },
  { name: "Pioneer Plastics", city: "Chennai", orders: 4, payable: 5200 },
];

const expenses = [
  { id: "EXP-331", category: "Internet & Utilities", date: "05 Oct 2026", amount: 2400, method: "UPI" },
  { id: "EXP-330", category: "Shop Rent", date: "01 Oct 2026", amount: 38000, method: "Bank transfer" },
  { id: "EXP-329", category: "Staff Salaries", date: "01 Oct 2026", amount: 96000, method: "Bank transfer" },
  { id: "EXP-328", category: "Transport & Delivery", date: "28 Sep 2026", amount: 4650, method: "Cash" },
  { id: "EXP-327", category: "Marketing", date: "22 Sep 2026", amount: 7500, method: "Card" },
  { id: "EXP-326", category: "Electricity", date: "18 Sep 2026", amount: 5120, method: "UPI" },
];

const bankTxns = [
  { date: "06 Oct", desc: "Rahul Traders · INV-1048", amount: 12400 },
  { date: "05 Oct", desc: "Metro Stationery · INV-1047", amount: 8600 },
  { date: "05 Oct", desc: "Airtel Broadband", amount: -2400 },
  { date: "04 Oct", desc: "OfficeMart Supplies · PUR-882", amount: -7250 },
  { date: "01 Oct", desc: "Shop rent", amount: -38000 },
  { date: "01 Oct", desc: "Salary run · October", amount: -96000 },
  { date: "29 Sep", desc: "Green Valley Traders · INV-1043", amount: 9480 },
];

const monthly = {
  labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  revenue: [96000, 132000, 118000, 174000, 156000, 166650],
};

/* ---------- Page ---------- */
export default function Home() {
  const [active, setActive] = useState("Overview");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [toast, setToast] = useState("");
  const [inventory, setInventory] = useState<Product[]>(initialInventory);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const runAssistant = () => {
    if (!prompt.trim()) return;
    const lower = prompt.toLowerCase();

    // Quick navigation intents (no confirmation needed)
    if (lower.includes("low") && lower.includes("stock")) {
      setActive("Inventory");
      showToast("Showing products that are low in stock.");
      return;
    }
    if (lower.includes("sales")) {
      setActive("Invoices");
      showToast("Showing this month's sales invoices.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let result: Action;
      if (lower.includes("bill") || lower.includes("invoice") || lower.includes("pen") || lower.includes("paper") || lower.includes("notebook")) {
        const product =
          inventory.find(p => lower.includes(p.name.toLowerCase().split(" ").pop()!.replace(/s$/, ""))) ??
          inventory[0];
        const qty = Number(prompt.match(/\d+/)?.[0] ?? 10);
        const customer = prompt.match(/for\s+([A-Za-z&' ]+?)\s*$/i)?.[1]?.trim() || "Rahul Traders";
        result = {
          kind: "invoice",
          title: "Create Sales Invoice",
          subtitle: `Invoice for ${customer} prepared for your confirmation.`,
          customer,
          amount: qty * product.price,
          items: [{ sku: product.sku, name: product.name, qty, price: product.price }],
        };
      } else if (lower.includes("expense")) {
        const amt = Number(prompt.replace(/,/g, "").match(/\d+/)?.[0] ?? 2500);
        result = { kind: "expense", title: "Record Business Expense", subtitle: "Prepared expense entry for confirmation.", amount: amt };
      } else {
        result = { kind: "generic", title: "Assistant Action", subtitle: `Prepared an action from: “${prompt}”`, amount: 1250 };
      }
      setAction(result);
      setLoading(false);
    }, 2000);
  };

  const confirm = () => {
    if (action?.kind === "invoice" && action.items) {
      const next = `INV-${1049 + (invoices.length - initialInvoices.length)}`;
      setInvoices(prev => [
        { id: next, customer: action.customer ?? "Walk-in customer", date: "07 Oct 2026", amount: action.amount, status: "Pending" },
        ...prev,
      ]);
      setInventory(prev =>
        prev.map(p => {
          const line = action.items!.find(i => i.sku === p.sku);
          return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
        })
      );
    }
    setAction(null);
    setPrompt("");
    showToast("Action confirmed. Inventory, accounts and reports have been updated.");
  };

  const status = (p: Product) => (p.stock <= p.reorderAt ? "Low" : "Good");
  const lowCount = inventory.filter(p => status(p) === "Low").length;
  const receivables = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "Paid").length;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">T</div><div><b>Tax Elevate</b><span>Business OS</span></div></div>
        <div className="workspace"><span className="avatar">TE</span><div><b>Tax Elevate Pvt Ltd</b><small>Business account</small></div><MoreHorizontal size={17} /></div>
        <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? "nav active" : "nav"} onClick={() => setActive(label)}><Icon size={18} /><span>{label}</span></button>)}</nav>
        <div className="sidebarBottom">
          <button className="nav"><Settings size={18} /><span>Settings</span></button>
          <div className="upgrade"><Sparkles size={17} /><b>AI Assistant</b><p>Ask Tax Elevate to work for you.</p></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">WORKSPACE</span><h1>{active}</h1></div><div className="topActions"><button className="iconBtn">?</button><button className="profile">S<span>Admin</span></button></div></header>

        {active === "Overview" && (
          <>
            <section className="hero">
              <div><div className="heroIcon"><Bot size={22} /></div><div><p className="eyebrow">TAX ELEVATE AI</p><h2>What would you like to do?</h2><p className="muted">Ask naturally. Tax Elevate understands your business and prepares the action for your approval.</p></div></div>
              <div className="promptBox"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runAssistant(); } }} placeholder='Try “Create a bill for 10 pens for Rahul Traders”' /><button onClick={runAssistant} disabled={loading || !prompt.trim()}>{loading ? <span className="spinner" /> : <Send size={18} />}</button></div>
              <div className="suggestions"><button onClick={() => setPrompt("Create a bill for 10 pens for Rahul Traders")}>Create a bill</button><button onClick={() => setPrompt("Show me this month's sales")}>Show sales</button><button onClick={() => setPrompt("Record an expense of ₹2,500")}>Record expense</button><button onClick={() => setPrompt("Which products are low in stock?")}>Low stock</button></div>
            </section>

            <div className="stats">
              <Stat title="Total Revenue" value="₹8,42,650" change="+12.8%" up />
              <Stat title="Total Expenses" value="₹3,18,420" change="+4.6%" up={false} />
              <Stat title="Net Profit" value="₹5,24,230" change="+18.4%" up />
              <Stat title="Receivables" value={inr0(receivables)} change={`${pendingCount} invoices`} up={false} />
            </div>

            <div className="grid2">
              <section className="card">
                <div className="cardHead"><div><h3>Financial overview</h3><p>Revenue vs expenses · Last 6 months</p></div><button className="select">Last 6 months⌄</button></div>
                <div className="chart"><div className="bars">{monthly.revenue.map((v, i) => { const h = (v / 180000) * 100; return <div className="barGroup" key={i} title={`${monthly.labels[i]}: ${inr0(v)}`}><div className="bar revenue" style={{ height: `${h}%` }} /><div className="bar expense" style={{ height: `${h * 0.48}%` }} /><span>{monthly.labels[i]}</span></div>; })}</div></div>
              </section>
              <section className="card">
                <div className="cardHead"><div><h3>Recent transactions</h3><p>Latest business activity</p></div><button className="linkBtn" onClick={() => setActive("Invoices")}>View all</button></div>
                {invoices.slice(0, 2).map(i => <Transaction key={i.id} name={`Invoice #${i.id}`} sub={i.customer} amount={`+${inr0(i.amount)}`} positive />)}
                <Transaction name={`Purchase #${purchases[0].id}`} sub={purchases[0].supplier} amount={`-${inr0(purchases[0].amount)}`} />
                <Transaction name={`Expense #${expenses[0].id}`} sub={expenses[0].category} amount={`-${inr0(expenses[0].amount)}`} />
              </section>
            </div>

            <section className="card inventoryCard">
              <div className="cardHead"><div><h3>Inventory snapshot</h3><p>{lowCount} products need restocking</p></div><button className="linkBtn" onClick={() => setActive("Inventory")}>View inventory <ArrowUpRight size={15} /></button></div>
              <div className="table">{inventory.slice(0, 4).map(r => <ProductRow key={r.sku} p={r} s={status(r)} />)}</div>
            </section>
          </>
        )}

        {active === "Inventory" && (
          <section className="card full">
            <div className="cardHead"><div><p className="eyebrow">PRODUCT MANAGEMENT</p><h2>Inventory</h2><p>{inventory.length} products · {lowCount} low on stock</p></div><button className="primary"><Plus size={16} /> Add product</button></div>
            <div className="table inventoryTable">{inventory.map(r => <ProductRow key={r.sku} p={r} s={status(r)} />)}</div>
          </section>
        )}

        {active === "Invoices" && (
          <DataCard title="Invoices" sub={`${invoices.length} invoices · ${inr0(receivables)} outstanding`} cols="1fr 1.6fr 1fr 1fr 0.8fr"
            rows={invoices.map(i => [<b key="a">{i.id}</b>, i.customer, i.date, inr(i.amount), <Pill key="s" tone={i.status === "Paid" ? "good" : i.status === "Pending" ? "pending" : "low"}>{i.status}</Pill>])} />
        )}

        {active === "Purchases" && (
          <DataCard title="Purchases" sub="Orders placed with your suppliers" cols="1fr 1.6fr 1fr 1fr 0.8fr"
            rows={purchases.map(p => [<b key="a">{p.id}</b>, p.supplier, p.date, inr(p.amount), <Pill key="s" tone={p.status === "Received" ? "good" : "pending"}>{p.status}</Pill>])} />
        )}

        {active === "Customers" && (
          <DataCard title="Customers" sub={`${customers.length} customers`} cols="1.6fr 1fr 0.8fr 1fr"
            rows={customers.map(c => [<b key="a">{c.name}</b>, c.city, `${c.invoices} invoices`, c.outstanding ? <span key="o" className="negative">{inr0(c.outstanding)} due</span> : <Pill key="o" tone="good">Settled</Pill>])} />
        )}

        {active === "Suppliers" && (
          <DataCard title="Suppliers" sub={`${suppliers.length} suppliers`} cols="1.6fr 1fr 0.8fr 1fr"
            rows={suppliers.map(s => [<b key="a">{s.name}</b>, s.city, `${s.orders} orders`, s.payable ? <span key="o" className="negative">{inr0(s.payable)} payable</span> : <Pill key="o" tone="good">Settled</Pill>])} />
        )}

        {active === "Expenses" && (
          <DataCard title="Expenses" sub={`${inr0(expenses.reduce((s, e) => s + e.amount, 0))} spent recently`} cols="1fr 1.6fr 1fr 1fr 1fr"
            rows={expenses.map(e => [<b key="a">{e.id}</b>, e.category, e.date, e.method, inr(e.amount)])} />
        )}

        {active === "Banking" && (
          <DataCard title="Banking" sub="HDFC Current A/c ····4821 · Balance ₹6,48,320" cols="0.6fr 2fr 1fr"
            rows={bankTxns.map(t => [t.date, t.desc, <strong key="a" className={t.amount > 0 ? "positive" : ""}>{t.amount > 0 ? "+" : "-"}{inr(Math.abs(t.amount))}</strong>])} />
        )}

        {active === "Reports" && (
          <>
            <div className="stats">
              <Stat title="Gross Margin" value="38.4%" change="+2.1%" up />
              <Stat title="Avg. Invoice Value" value="₹15,937" change="+6.3%" up />
              <Stat title="Payables" value="₹38,500" change="3 suppliers" up={false} />
              <Stat title="Stock Value" value={inr0(inventory.reduce((s, p) => s + p.stock * p.price, 0))} change={`${inventory.length} products`} up />
            </div>
            <DataCard title="Monthly revenue" sub="Last 6 months" cols="1fr 1fr"
              rows={monthly.labels.map((m, i) => [m + " 2026", inr0(monthly.revenue[i])])} />
          </>
        )}
      </section>

      {loading && <div className="loadingOverlay"><div className="loadingCard"><div className="aiPulse"><Sparkles /></div><h3>Tax Elevate is thinking…</h3><p>Understanding your request and preparing the action.</p><div className="progress"><i /></div></div></div>}

      {action && <div className="modalBackdrop"><div className="modal"><button className="close" onClick={() => setAction(null)}><X /></button><div className="confirmIcon"><Check /></div><span className="eyebrow">READY FOR CONFIRMATION</span><h2>{action.title}</h2><p className="muted">{action.subtitle}</p>{action.items && <div className="actionItems">{action.items.map((i) => <div className="actionItem" key={i.sku}><div><b>{i.name}</b><small>{i.qty} × {inr(i.price)}</small></div><strong>{inr(i.qty * i.price)}</strong></div>)}</div>}<div className="total"><span>Total</span><b>{inr(action.amount)}</b></div><div className="modalNote">After confirmation, Tax Elevate will update the relevant records, inventory and financial reports.</div><div className="modalButtons"><button className="secondary" onClick={() => setAction(null)}>Cancel</button><button className="primary" onClick={confirm}><Check size={17} /> Confirm & Create</button></div></div></div>}

      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </main>
  );
}

/* ---------- Components ---------- */
function Stat({ title, value, change, up }: { title: string; value: string; change: string; up: boolean }) {
  return <div className="stat"><span>{title}</span><h3>{value}</h3><small className={up ? "positive" : "negative"}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change} <i>vs last month</i></small></div>;
}

function Transaction({ name, sub, amount, positive }: { name: string; sub: string; amount: string; positive?: boolean }) {
  return <div className="transaction"><div className="txIcon"><FileText size={16} /></div><div><b>{name}</b><small>{sub}</small></div><strong className={positive ? "positive" : ""}>{amount}</strong></div>;
}

function ProductRow({ p, s }: { p: Product; s: "Low" | "Good" }) {
  return <div className="row"><div><b>{p.name}</b><small>{p.sku}</small></div><span>{p.stock} units</span><span>{inr(p.price)}</span><em className={s === "Low" ? "low" : "good"}>{s}</em></div>;
}

function Pill({ tone, children }: { tone: "good" | "low" | "pending"; children: React.ReactNode }) {
  // "good" and "low" reuse your existing styles; "pending" is a small addition (see extra CSS below)
  return <em className={tone}>{children}</em>;
}

function DataCard({ title, sub, cols, rows }: { title: string; sub: string; cols: string; rows: React.ReactNode[][] }) {
  return (
    <section className="card full">
      <div className="cardHead"><div><p className="eyebrow">{title.toUpperCase()}</p><h2>{title}</h2><p>{sub}</p></div><button className="primary"><Plus size={16} /> Add new</button></div>
      <div className="table">
        {rows.map((cells, i) => (
          <div className="row" key={i} style={{ gridTemplateColumns: cols }}>
            {cells.map((c, j) => <span key={j}>{c}</span>)}
          </div>
        ))}
      </div>
    </section>
  );
}

/*
  Extra CSS to add to globals.css (only needed for the "Pending" pill and red "due" text):

  em.pending { background: #fef3c7; color: #b45309; font-style: normal; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .negative { color: #dc2626; font-weight: 600; }
*/