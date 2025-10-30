// lib/export.ts

export interface ExportData {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  filename?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData): void;
export function exportToCSV(
  rows: Array<Record<string, string | number | boolean | null>>,
  filename?: string
): void;
export function exportToCSV(
  arg1: ExportData | Array<Record<string, string | number | boolean | null>>,
  arg2?: string
) {
  // If called with ExportData shape
  if (
    typeof arg1 === "object" &&
    !Array.isArray(arg1) &&
    (arg1 as ExportData).headers !== undefined &&
    (arg1 as ExportData).rows !== undefined
  ) {
    const { headers, rows, filename = "export.csv" } = arg1 as ExportData;
    const csvContent = buildCSVContent(headers, rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename);
    return;
  }

  // If called with array of objects and optional filename
  const objects = arg1 as Array<
    Record<string, string | number | boolean | null>
  >;
  const filename = arg2 || "export.csv";
  const headersSet = new Set<string>();
  objects.forEach((obj) =>
    Object.keys(obj || {}).forEach((k) => headersSet.add(k))
  );
  const headers = Array.from(headersSet);
  const rows: (string | number)[][] = objects.map((obj) =>
    headers.map((h) => {
      const val = obj?.[h];
      if (val == null) return "";
      if (typeof val === "number") return val;
      if (typeof val === "boolean") return val ? "true" : "false";
      return String(val);
    })
  );

  const csvContent = buildCSVContent(headers, rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

function buildCSVContent(
  headers: string[],
  rows: (string | number)[][]
): string {
  return [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
}

/**
 * Export data to JSON format
 */
export function exportToJSON(
  data: Record<string, unknown> | Array<Record<string, unknown>>,
  filename = "export.json"
) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, filename);
}

/**
 * Export data to PDF format
 * Note: This is a placeholder. For full PDF support, install jsPDF:
 * npm install jspdf jspdf-autotable
 */
export function exportToPDF(data: ExportData) {
  const { title = "Export", headers, rows } = data;

  // Simple PDF generation using browser print
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for this website");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4F46E5; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Print/Save as PDF
        </button>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print current page
 */
export function printPage() {
  window.print();
}
