import { Expense } from "@/types/expense";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/constants";

export type ExportFormat = "csv" | "json" | "pdf";

function buildCSV(expenses: Expense[]): string {
  const headers = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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

export function exportCSV(expenses: Expense[], filename: string): void {
  triggerDownload(buildCSV(expenses), `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(
    JSON.stringify(data, null, 2),
    `${filename}.json`,
    "application/json"
  );
}

export function exportPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const rows = expenses
    .map(
      (e) => `
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>${CATEGORY_ICONS[e.category]} ${e.category}</td>
        <td class="amount">${formatCurrency(e.amount)}</td>
        <td>${e.description}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 40px; }
    header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #1e40af; }
    .meta { font-size: 12px; color: #6b7280; text-align: right; }
    .summary { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 32px; }
    .summary .stat label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .summary .stat span { font-size: 18px; font-weight: 700; color: #0369a1; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #1e40af; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr:hover { background: #eff6ff; }
    td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
    td.amount { font-weight: 600; font-variant-numeric: tabular-nums; }
    tfoot tr { background: #f0fdf4; font-weight: 700; }
    tfoot td { padding: 10px 12px; border-top: 2px solid #22c55e; }
    @media print { @page { margin: 1.5cm; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Expense Report</h1>
      <p style="font-size:13px;color:#6b7280;margin-top:4px">${filename}</p>
    </div>
    <div class="meta">
      <div>Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div>${expenses.length} record${expenses.length !== 1 ? "s" : ""}</div>
    </div>
  </header>
  <div class="summary">
    <div class="stat"><label>Total Records</label><span>${expenses.length}</span></div>
    <div class="stat"><label>Total Amount</label><span>${formatCurrency(total)}</span></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="2">Total</td><td class="amount">${formatCurrency(total)}</td><td></td></tr></tfoot>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}
