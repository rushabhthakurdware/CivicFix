// Clean CSV cell values to avoid comma/quote injection
const escapeCsv = (str) => {
  if (str === null || str === undefined) return '""';
  const clean = String(str).replace(/"/g, '""');
  return `"${clean}"`;
};

export const exportToCSV = (complaints, filenamePrefix = 'CivicFix_WorkOrders') => {
  if (!complaints || complaints.length === 0) {
    alert('No complaints available to export.');
    return;
  }

  const headers = [
    'Report ID',
    'Title / Issue',
    'Category',
    'Severity',
    'Status',
    'AR Measured',
    'Estimated Area (sqm)',
    'Length (m)',
    'Width (m)',
    'Latitude',
    'Longitude',
    'Address',
    'Submitted Date',
  ];

  const rows = complaints.map((item) => {
    const id = item._id || item.id || 'N/A';
    const hasAr = Boolean(item.measured_via_ar || item.measuredViaAr);
    const area = item.estimated_area_sqm ?? item.estimatedAreaSqm ?? '';
    const length = item.estimated_length_m ?? item.estimatedLengthM ?? '';
    const width = item.estimated_width_m ?? item.estimatedWidthM ?? '';

    const lat =
      item.latitude ??
      item.lat ??
      (item.location?.coordinates ? item.location.coordinates[1] : '');
    const lng =
      item.longitude ??
      item.lng ??
      (item.location?.coordinates ? item.location.coordinates[0] : '');

    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';

    return [
      escapeCsv(id),
      escapeCsv(item.title || item.category || 'Defect'),
      escapeCsv(item.category || 'General'),
      escapeCsv(item.severity || 'LOW'),
      escapeCsv(item.status || 'SUBMITTED'),
      escapeCsv(hasAr ? 'YES' : 'NO'),
      escapeCsv(area),
      escapeCsv(length),
      escapeCsv(width),
      escapeCsv(lat),
      escapeCsv(lng),
      escapeCsv(item.address || 'Unrecorded'),
      escapeCsv(date),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printWorkOrderReport = (complaints, filters = {}) => {
  if (!complaints || complaints.length === 0) {
    alert('No complaints available to print.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const timestamp = new Date().toLocaleString();

  const tableRows = complaints
    .map((c, i) => {
      const area = c.estimated_area_sqm ?? c.estimatedAreaSqm;
      const lat =
        c.latitude ??
        c.lat ??
        (c.location?.coordinates ? c.location.coordinates[1] : '-');
      const lng =
        c.longitude ??
        c.lng ??
        (c.location?.coordinates ? c.location.coordinates[0] : '-');

      return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${c._id || c.id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>${c.title || c.category || 'Issue'}</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;"><span class="badge ${c.severity}">${c.severity || 'LOW'}</span></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.status || 'SUBMITTED'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${area ? `${Number(area).toFixed(2)} m²` : 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${c.address || 'Unrecorded'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 11px;">${lat !== '-' ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : '-'}</td>
      </tr>
    `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CivicFix Contractor Work Orders</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #111; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; letter-spacing: -0.5px; }
          .meta { font-size: 12px; color: #555; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px; }
          th { background: #f4f4f5; text-align: left; padding: 8px; border: 1px solid #ddd; text-transform: uppercase; font-size: 11px; }
          .badge { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .HIGH { color: #dc2626; background: #fee2e2; }
          .MEDIUM { color: #d97706; background: #fef3c7; }
          .LOW { color: #059669; background: #d1fae5; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">CIVICFIX INFRASTRUCTURE WORK ORDERS</div>
            <div class="meta">Generated: ${timestamp} | Scope: Severity: ${filters.severity || 'ALL'} | Status: ${filters.status || 'ALL'}</div>
          </div>
          <div>
            <span style="font-weight: bold; font-size: 14px;">Total Reports: ${complaints.length}</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task / Utility</th>
              <th>Severity</th>
              <th>Status</th>
              <th>AR Area</th>
              <th>Location Address</th>
              <th>GPS Pin</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};