import { useState } from "react";

const mockTransactions = [
  {
    id: "txn_001",
    date: "2025-04-01",
    description: "Be The Boss of WordPress - Course Sale",
    platform: "stripe",
    grossUSD: 297.00,
    feeUSD: 9.02,
    netUSD: 287.98,
    audAmount: 456.23,
    exchangeRate: 1.5839,
    payout: "PO-2025-0401-A",
    status: "synced",
    qboAccount: "Course Sales",
  },
  {
    id: "txn_002",
    date: "2025-04-01",
    description: "WP Mavens Membership - Monthly",
    platform: "stripe",
    grossUSD: 47.00,
    feeUSD: 1.66,
    netUSD: 45.34,
    audAmount: 72.19,
    exchangeRate: 1.5891,
    payout: "PO-2025-0401-A",
    status: "synced",
    qboAccount: "Membership Income",
  },
  {
    id: "txn_003",
    date: "2025-04-02",
    description: "Web Business Boss - Course Sale",
    platform: "paypal",
    grossUSD: 397.00,
    feeUSD: 11.91,
    netUSD: 385.09,
    audAmount: 612.84,
    exchangeRate: 1.5437,
    payout: "PO-2025-0402-B",
    status: "draft",
    qboAccount: "Course Sales",
  },
  {
    id: "txn_004",
    date: "2025-04-02",
    description: "WP Mavens Membership - Monthly",
    platform: "paypal",
    grossUSD: 47.00,
    feeUSD: 1.84,
    netUSD: 45.16,
    audAmount: 71.89,
    exchangeRate: 1.5934,
    payout: "PO-2025-0402-B",
    status: "draft",
    qboAccount: "Membership Income",
  },
  {
    id: "txn_005",
    date: "2025-04-03",
    description: "Be The Boss of WordPress - Course Sale",
    platform: "stripe",
    grossUSD: 297.00,
    feeUSD: 9.02,
    netUSD: 287.98,
    audAmount: 459.10,
    exchangeRate: 1.5460,
    payout: "PO-2025-0403-C",
    status: "pending",
    qboAccount: "Course Sales",
  },
];

const payouts = [
  { id: "PO-2025-0401-A", date: "2025-04-01", platform: "stripe", audTotal: 528.42, txnCount: 2, status: "synced" },
  { id: "PO-2025-0402-B", date: "2025-04-02", platform: "paypal", audTotal: 684.73, txnCount: 2, status: "draft" },
  { id: "PO-2025-0403-C", date: "2025-04-03", platform: "stripe", audTotal: 459.10, txnCount: 1, status: "pending" },
];

const qboAccounts = ["Course Sales", "Membership Income", "Summit Income", "Refunds", "Other Income"];

const StatusBadge = ({ status }) => {
  const styles = {
    synced: { bg: "#d1fae5", color: "#065f46", label: "Synced to QBO" },
    draft: { bg: "#fef3c7", color: "#92400e", label: "Draft — Review" },
    pending: { bg: "#e0e7ff", color: "#3730a3", label: "Pending Sync" },
    error: { bg: "#fee2e2", color: "#991b1b", label: "Error" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      fontFamily: "'DM Mono', monospace",
      whiteSpace: "nowrap", display: "inline-block",
    }}>{s.label}</span>
  );
};

const PlatformIcon = ({ platform, size = 20 }) => {
  if (platform === "stripe") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#635BFF"/>
        <path d="M10.5 9.5c0-.83.67-1.5 1.5-1.5.55 0 1.04.3 1.3.74L15 7.3A4 4 0 0 0 8 9.5c0 2.5 2.5 3 3.5 3.5.67.33 1 .67 1 1.1 0 .72-.6 1.4-1.5 1.4-.7 0-1.3-.4-1.6-1L7.7 15.6A4.02 4.02 0 0 0 12 18a4 4 0 0 0 4-4c0-2.3-2.5-2.9-3.5-3.4-.67-.34-1-.65-1-1.1z" fill="#fff"/>
      </svg>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#635BFF", fontWeight: 600 }}>Stripe</span>
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#003087"/>
        <path d="M7 8h5.5c2 0 3 1 2.7 3-.3 2-2 3-4 3H10l-.7 4H7L8.5 8z" fill="#009cde"/>
        <path d="M9 8h5c1.8 0 2.8.9 2.5 2.8-.3 2-1.8 2.8-3.7 2.8H11.5l-.7 4H9L10.5 8z" fill="#fff"/>
      </svg>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#003087", fontWeight: 600 }}>PayPal</span>
    </span>
  );
};

export default function TransactBridge() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ruleModal, setRuleModal] = useState(false);
  const [rules, setRules] = useState([
    { id: 1, keyword: "WP Mavens", account: "Membership Income", platform: "all" },
    { id: 2, keyword: "Boss of WordPress", account: "Course Sales", platform: "stripe" },
    { id: 3, keyword: "Web Business Boss", account: "Course Sales", platform: "all" },
  ]);
  const [newRule, setNewRule] = useState({ keyword: "", account: "Course Sales", platform: "all" });
  const [syncingId, setSyncingId] = useState(null);

  const filtered = mockTransactions.filter(t =>
    (filterPlatform === "all" || t.platform === filterPlatform) &&
    (filterStatus === "all" || t.status === filterStatus)
  );

  const handleSync = (txnId) => {
    setSyncingId(txnId);
    setTimeout(() => setSyncingId(null), 1800);
  };

  const stats = {
    totalAUD: mockTransactions.reduce((s, t) => s + t.audAmount, 0),
    syncedCount: mockTransactions.filter(t => t.status === "synced").length,
    draftCount: mockTransactions.filter(t => t.status === "draft").length,
    pendingCount: mockTransactions.filter(t => t.status === "pending").length,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f6f3",
      fontFamily: "'DM Sans', sans-serif",
      color: "#1a1a1a",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #888; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #1a1a1a; border-bottom-color: #2563eb; }
        .tab-btn:hover { color: #1a1a1a; }
        .action-btn { cursor: pointer; border: none; border-radius: 8px; padding: 8px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; transition: all 0.15s; }
        .action-btn:hover { transform: translateY(-1px); }
        .row-hover:hover { background: #f0efeb !important; cursor: pointer; }
        .filter-select { border: 1.5px solid #e5e3de; border-radius: 8px; padding: 7px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; background: #fff; color: #1a1a1a; cursor: pointer; outline: none; }
        .filter-select:focus { border-color: #2563eb; }
        .rule-input { border: 1.5px solid #e5e3de; border-radius: 8px; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; background: #fff; width: 100%; outline: none; }
        .rule-input:focus { border-color: #2563eb; }
        .close-btn { background: none; border: none; cursor: pointer; font-size: 22px; color: #888; line-height: 1; }
        .close-btn:hover { color: #1a1a1a; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1.5px solid #e5e3de",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #c026d3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(124,58,237,0.35)",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L10.9 5.5H14.5L11.8 7.6L12.7 11.1L10 9L7.3 11.1L8.2 7.6L5.5 5.5H9.1L10 2Z" fill="white"/>
              <path d="M4 12L4.5 13.8H6.3L4.9 14.7L5.4 16.5L4 15.6L2.6 16.5L3.1 14.7L1.7 13.8H3.5L4 12Z" fill="white" opacity="0.85"/>
              <path d="M16 1L16.4 2.4H17.8L16.7 3.2L17.1 4.6L16 3.8L14.9 4.6L15.3 3.2L14.2 2.4H15.6L16 1Z" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #c026d3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alana Magic</span>
          <span style={{
            background: "#fef3c7", color: "#92400e",
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginLeft: 4,
          }}>DRAFT MODE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#888" }}>Connected: <strong style={{ color: "#16a34a" }}>Stripe ✓</strong> · <strong style={{ color: "#16a34a" }}>PayPal ✓</strong> · <strong style={{ color: "#16a34a" }}>QBO ✓</strong></span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#3730a3" }}>EK</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e5e3de", padding: "0 32px", display: "flex", gap: 4 }}>
        {[["transactions", "Transactions"], ["payouts", "Payouts"], ["rules", "Mapping Rules"], ["settings", "Settings"]].map(([key, label]) => (
          <button key={key} className={`tab-btn ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total AUD This Period", value: `A$${stats.totalAUD.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`, color: "#1a1a1a", sub: "5 transactions" },
                { label: "Synced to QBO", value: stats.syncedCount, color: "#16a34a", sub: "No action needed" },
                { label: "Awaiting Review", value: stats.draftCount, color: "#d97706", sub: "Draft mode — check & approve" },
                { label: "Pending Sync", value: stats.pendingCount, color: "#4f46e5", sub: "Ready to push to QBO" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "20px 22px", border: "1.5px solid #e5e3de" }}>
                  <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filters + Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <select className="filter-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                  <option value="all">All Platforms</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="synced">Synced</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="action-btn" style={{ background: "#f0f9ff", color: "#0369a1", border: "1.5px solid #bae6fd" }}>↓ Fetch Latest</button>
                <button className="action-btn" style={{ background: "#2563eb", color: "#fff" }}>↑ Push Approved to QBO</button>
              </div>
            </div>

            {/* Transactions Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e3de", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7f6f3", borderBottom: "1.5px solid #e5e3de" }}>
                    {["Date", "Description", "Platform", "Gross (USD)", "Fee (USD)", "AUD Amount", "Rate", "QBO Account", "Payout", "Status", ""].map((h, i) => (
                      <th key={i} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className="row-hover" onClick={() => setSelectedTxn(t)} style={{ borderBottom: "1px solid #f0efeb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#555" }}>{t.date}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, maxWidth: 180 }}>{t.description}</td>
                      <td style={{ padding: "12px 14px" }}><PlatformIcon platform={t.platform} /></td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>${t.grossUSD.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#dc2626" }}>−${t.feeUSD.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>A${t.audAmount.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#888" }}>{t.exchangeRate}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <select className="filter-select" style={{ fontSize: 12, padding: "4px 8px" }} value={t.qboAccount} onClick={e => e.stopPropagation()} onChange={() => {}}>
                          {qboAccounts.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#888" }}>{t.payout}</td>
                      <td style={{ padding: "12px 14px" }}><StatusBadge status={t.status} /></td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        {t.status === "draft" && (
                          <button className="action-btn" onClick={() => handleSync(t.id)} style={{ background: syncingId === t.id ? "#d1fae5" : "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", fontSize: 12, padding: "5px 12px" }}>
                            {syncingId === t.id ? "Syncing…" : "Approve"}
                          </button>
                        )}
                        {t.status === "pending" && (
                          <button className="action-btn" onClick={() => handleSync(t.id)} style={{ background: "#eff6ff", color: "#2563eb", border: "1.5px solid #bfdbfe", fontSize: 12, padding: "5px 12px" }}>
                            {syncingId === t.id ? "Syncing…" : "Sync"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transaction Detail Panel */}
            {selectedTxn && (
              <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: "#fff", borderLeft: "1.5px solid #e5e3de", padding: 28, overflowY: "auto", zIndex: 100, boxShadow: "-8px 0 24px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Transaction Detail</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{selectedTxn.description}</div>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedTxn(null)}>×</button>
                </div>
                <StatusBadge status={selectedTxn.status} />
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    ["Platform", <PlatformIcon platform={selectedTxn.platform} />],
                    ["Date", selectedTxn.date],
                    ["Payout Bundle", selectedTxn.payout],
                    ["Gross Amount (USD)", `$${selectedTxn.grossUSD.toFixed(2)}`],
                    ["Processing Fee (USD)", `−$${selectedTxn.feeUSD.toFixed(2)}`],
                    ["Net Amount (USD)", `$${selectedTxn.netUSD.toFixed(2)}`],
                    ["Exchange Rate", `1 USD = ${selectedTxn.exchangeRate} AUD`],
                    ["AUD Amount", `A$${selectedTxn.audAmount.toFixed(2)}`],
                    ["QBO Account", selectedTxn.qboAccount],
                  ].map(([label, value], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid #f0efeb" }}>
                      <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, fontFamily: typeof value === "string" && value.includes("$") ? "'DM Mono', monospace" : "inherit" }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 16, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>QBO Entry Preview</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
                    <strong>Sales Receipt</strong><br />
                    Account: {selectedTxn.qboAccount}<br />
                    Amount: A${selectedTxn.audAmount.toFixed(2)}<br />
                    Memo: {selectedTxn.platform.toUpperCase()} · USD {selectedTxn.grossUSD.toFixed(2)} @ {selectedTxn.exchangeRate}<br />
                    Fee Entry: A${(selectedTxn.feeUSD * selectedTxn.exchangeRate).toFixed(2)} → Merchant Fees
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === "payouts" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Payout Bundles</div>
              <p style={{ fontSize: 14, color: "#666" }}>Each payout below represents one bank deposit. Transactions inside are grouped to match exactly what arrives in your AUD bank account.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {payouts.map(p => (
                <div key={p.id} style={{ background: "#fff", border: "1.5px solid #e5e3de", borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <PlatformIcon platform={p.platform} size={22} />
                      <div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600 }}>{p.id}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{p.date} · {p.txnCount} transactions</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700 }}>A${p.audTotal.toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>Bank deposit total</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <div style={{ marginTop: 16, background: "#f7f6f3", borderRadius: 8, padding: "10px 14px" }}>
                    {mockTransactions.filter(t => t.payout === p.id).map(t => (
                      <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e3de", fontSize: 13 }}>
                        <span style={{ color: "#555" }}>{t.description}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>A${t.audAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* RULES TAB */}
        {activeTab === "rules" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Mapping Rules</div>
                <p style={{ fontSize: 14, color: "#666", maxWidth: 540 }}>Rules automatically assign transactions to the correct QuickBooks account based on keywords in the description. Your bookkeeper can manage these without any technical knowledge.</p>
              </div>
              <button className="action-btn" onClick={() => setRuleModal(true)} style={{ background: "#2563eb", color: "#fff" }}>+ Add Rule</button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e3de", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7f6f3", borderBottom: "1.5px solid #e5e3de" }}>
                    {["If description contains…", "Platform", "Then map to QBO account", ""].map((h, i) => (
                      <th key={i} style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f0efeb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{r.keyword}</span>
                      </td>
                      <td style={{ padding: "14px 18px", fontSize: 13, color: "#555" }}>{r.platform === "all" ? "All platforms" : r.platform.charAt(0).toUpperCase() + r.platform.slice(1)}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <select className="filter-select" value={r.account} onChange={() => {}}>
                          {qboAccounts.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <button className="action-btn" onClick={() => setRules(rules.filter(x => x.id !== r.id))} style={{ background: "#fff1f2", color: "#e11d48", border: "1.5px solid #fecdd3", fontSize: 12, padding: "4px 10px" }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ruleModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>New Mapping Rule</div>
                    <button className="close-btn" onClick={() => setRuleModal(false)}>×</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>If description contains…</label>
                      <input className="rule-input" placeholder="e.g. WP Mavens" value={newRule.keyword} onChange={e => setNewRule({ ...newRule, keyword: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Platform</label>
                      <select className="filter-select" style={{ width: "100%" }} value={newRule.platform} onChange={e => setNewRule({ ...newRule, platform: e.target.value })}>
                        <option value="all">All platforms</option>
                        <option value="stripe">Stripe only</option>
                        <option value="paypal">PayPal only</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Map to QBO account</label>
                      <select className="filter-select" style={{ width: "100%" }} value={newRule.account} onChange={e => setNewRule({ ...newRule, account: e.target.value })}>
                        {qboAccounts.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <button className="action-btn" onClick={() => { setRules([...rules, { ...newRule, id: Date.now() }]); setRuleModal(false); setNewRule({ keyword: "", account: "Course Sales", platform: "all" }); }} style={{ background: "#2563eb", color: "#fff", padding: "10px", fontSize: 14, marginTop: 4 }}>Save Rule</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Settings</div>
            {[
              { section: "Connections", items: [
                { label: "Stripe API Key", value: "sk_live_••••••••••••4821", status: "connected" },
                { label: "PayPal Client ID", value: "AXk3••••••••••••••••pQr", status: "connected" },
                { label: "QuickBooks Online", value: "Emma Kate (emmakate.co)", status: "connected" },
              ]},
              { section: "Sync Preferences", items: [
                { label: "Default QBO Income Account", value: "Course Sales", type: "select" },
                { label: "Default Fee Account", value: "Merchant Fees", type: "select" },
                { label: "Auto-sync approved transactions", value: "Enabled", type: "toggle" },
                { label: "Draft mode (preview before sync)", value: "Enabled", type: "toggle" },
              ]},
            ].map((group, gi) => (
              <div key={gi} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{group.section}</div>
                <div style={{ background: "#fff", border: "1.5px solid #e5e3de", borderRadius: 12, overflow: "hidden" }}>
                  {group.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: ii < group.items.length - 1 ? "1px solid #f0efeb" : "none" }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#555" }}>{item.value}</span>
                        {item.status === "connected" && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>● Connected</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
