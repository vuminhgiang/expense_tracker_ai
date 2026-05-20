import { Expense, Category } from "@/types/expense";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/constants";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(expenses: Expense[]): void {
  exportCSV(expenses, `expenses-${new Date().toISOString().split("T")[0]}`);
}

export function exportCSV(expenses: Expense[], filename: string): void {
  const headers = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  triggerDownload(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

export function exportPDF(expenses: Expense[], filename: string, title = "Expense Report"): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const catTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  const rows = expenses
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (e) => `<tr>
        <td>${formatDate(e.date)}</td>
        <td><span style="color:${CATEGORY_COLORS[e.category as Category]}">${CATEGORY_ICONS[e.category as Category]} ${e.category}</span></td>
        <td class="num">${formatCurrency(e.amount)}</td>
        <td>${escapeHtml(e.description)}</td>
      </tr>`
    ).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;padding:40px;background:#fff}
  .header{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:20px;border-bottom:3px solid #1e40af;margin-bottom:24px}
  h1{font-size:24px;font-weight:800;color:#1e40af}
  .meta{font-size:12px;color:#6b7280;text-align:right;line-height:1.6}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .stat{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:12px;padding:14px}
  .stat label{font-size:11px;color:#0369a1;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:4px}
  .stat span{font-size:20px;font-weight:800;color:#0c4a6e}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead tr{background:#1e40af;color:#fff}
  th{padding:10px 14px;text-align:left;font-weight:600;font-size:12px;letter-spacing:.04em}
  td{padding:9px 14px;border-bottom:1px solid #f1f5f9}
  tr:nth-child(even) td{background:#f8fafc}
  .num{font-variant-numeric:tabular-nums;font-weight:600;text-align:right}
  tfoot td{border-top:2px solid #1e40af;font-weight:700;padding:12px 14px;background:#eff6ff}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="header">
  <div><h1>${title}</h1><p style="color:#6b7280;font-size:13px;margin-top:4px">${filename}</p></div>
  <div class="meta">
    <div>Generated ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
    <div>${expenses.length} records</div>
  </div>
</div>
<div class="stats">
  <div class="stat"><label>Total Amount</label><span>${formatCurrency(total)}</span></div>
  <div class="stat"><label>Transactions</label><span>${expenses.length}</span></div>
  <div class="stat"><label>Top Category</label><span>${topCat ? `${CATEGORY_ICONS[topCat[0] as Category]} ${topCat[0]}` : "—"}</span></div>
</div>
<table>
  <thead><tr><th>Date</th><th>Category</th><th style="text-align:right">Amount</th><th>Description</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="2">Total</td><td class="num">${formatCurrency(total)}</td><td></td></tr></tfoot>
</table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export function exportSnapshot(expenses: Expense[], reportTitle: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];
  const avgTx = expenses.length ? total / expenses.length : 0;
  const year = new Date().getFullYear();

  const bars = sorted.map(([cat, amt]) => {
    const pct = total > 0 ? (amt / total) * 100 : 0;
    const color = CATEGORY_COLORS[cat as Category] ?? "#6b7280";
    const icon = CATEGORY_ICONS[cat as Category] ?? "📦";
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>${icon} ${cat}</span>
        <span style="font-weight:700">${formatCurrency(amt)}</span>
      </div>
      <div style="background:rgba(255,255,255,0.2);border-radius:99px;height:8px;overflow:hidden">
        <div style="width:${pct.toFixed(1)}%;height:100%;background:${color};border-radius:99px;transition:width 0.6s"></div>
      </div>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Spending Snapshot ${year}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
  .card{background:linear-gradient(135deg,#1e3a8a 0%,#4f46e5 50%,#7c3aed 100%);border-radius:24px;padding:36px;width:100%;max-width:400px;color:white;box-shadow:0 40px 80px rgba(0,0,0,0.5)}
  .brand{font-size:12px;letter-spacing:.15em;text-transform:uppercase;opacity:.7;margin-bottom:28px}
  .year{font-size:56px;font-weight:900;line-height:1;margin-bottom:6px;background:linear-gradient(135deg,#fff,#a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .label{font-size:12px;opacity:.6;text-transform:uppercase;letter-spacing:.1em;margin-bottom:28px}
  .total{font-size:42px;font-weight:900;margin-bottom:4px}
  .total-label{font-size:13px;opacity:.7;margin-bottom:28px}
  .divider{height:1px;background:rgba(255,255,255,0.15);margin:24px 0}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .stat{background:rgba(255,255,255,0.12);border-radius:12px;padding:14px}
  .stat-val{font-size:22px;font-weight:800;margin-bottom:2px}
  .stat-label{font-size:11px;opacity:.6}
  .bars-title{font-size:12px;text-transform:uppercase;letter-spacing:.1em;opacity:.6;margin-bottom:12px}
  .footer{margin-top:28px;font-size:11px;opacity:.5;text-align:center}
  @media print{body{background:#fff}.card{box-shadow:none;max-width:100%}}
</style></head><body>
<div class="card">
  <div class="brand">Expense Tracker — Spending Snapshot</div>
  <div class="year">${year}</div>
  <div class="label">Year in Review</div>
  <div class="total">${formatCurrency(total)}</div>
  <div class="total-label">Total spent across all categories</div>
  <div class="stats">
    <div class="stat">
      <div class="stat-val">${expenses.length}</div>
      <div class="stat-label">transactions</div>
    </div>
    <div class="stat">
      <div class="stat-val">${formatCurrency(avgTx)}</div>
      <div class="stat-label">avg per transaction</div>
    </div>
    <div class="stat">
      <div class="stat-val">${topCat ? `${CATEGORY_ICONS[topCat[0] as Category]} ${topCat[0]}` : "—"}</div>
      <div class="stat-label">top category</div>
    </div>
    <div class="stat">
      <div class="stat-val">${topCat ? Math.round((topCat[1] / total) * 100) : 0}%</div>
      <div class="stat-label">of total spending</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="bars-title">Breakdown by category</div>
  ${bars}
  <div class="footer">Generated ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
