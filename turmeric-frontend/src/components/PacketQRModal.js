import React, { useState, useCallback } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { X, ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';

/**
 * PacketQRModal
 * Props:
 *   packetIds  – string[]   list of packet IDs to show QRs for
 *   baseUrl    – string     app base URL (e.g. "http://localhost:3000")
 *   onClose    – () => void
 */
const PacketQRModal = ({ packetIds = [], baseUrl, onClose }) => {
  const [index, setIndex] = useState(0);

  const trackingUrl = useCallback(
    (id) => {
      const base = process.env.REACT_APP_QR_BASE_URL || baseUrl || window.location.origin;
      return `${base}/tracking?packetId=${encodeURIComponent(id)}`;
    },
    [baseUrl]
  );

  if (!packetIds.length) return null;

  const current = packetIds[index];
  const total = packetIds.length;

  /* ── Download current QR as PNG ─────────────────────────── */
  const handleDownload = () => {
    // We render a hidden QRCodeCanvas just to get the data URL
    const canvas = document.getElementById('qr-download-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-${current}.png`;
    a.click();
  };

  /* ── Print all QRs ──────────────────────────────────────── */
  const handlePrintAll = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    const rows = packetIds.map((id) => {
      const url = trackingUrl(id);
      // We'll use qrcode lib via a canvas drawn inline in the print window via an img tag.
      // Instead, we build img tags referencing the SVG rendered as data-uri via inline SVG + b64.
      return `
        <div class="qr-item">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" width="160" height="160" />
          <p class="pid">${id}</p>
          <p class="url">${url}</p>
        </div>`;
    }).join('');

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>HaldiChain – Packet QR Codes</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          h1 { font-size: 18px; margin-bottom: 16px; }
          .grid { display: flex; flex-wrap: wrap; gap: 20px; }
          .qr-item { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; width: 200px; }
          .pid { font-weight: 700; font-size: 12px; margin: 6px 0 2px; word-break: break-all; }
          .url { font-size: 9px; color: #666; word-break: break-all; }
        </style>
      </head>
      <body>
        <h1>HaldiChain – Packet QR Codes (${total} packets)</h1>
        <div class="grid">${rows}</div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div>
            <h2 className="text-white font-bold text-lg">Packet QR Codes</h2>
            <p className="text-blue-100 text-sm">{total} packet{total !== 1 ? 's' : ''} generated</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* QR display */}
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Visible SVG QR */}
          <div className="bg-white border-2 border-blue-100 rounded-xl p-4 shadow-inner">
            <QRCodeSVG
              value={trackingUrl(current)}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Hidden canvas for download */}
          <div className="hidden">
            <QRCodeCanvas
              id="qr-download-canvas"
              value={trackingUrl(current)}
              size={400}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Packet ID */}
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Packet ID</p>
            <p className="font-mono font-bold text-gray-800 text-sm break-all">{current}</p>
            <p className="text-xs text-gray-400 mt-1 break-all">{trackingUrl(current)}</p>
          </div>

          {/* Navigation */}
          {total > 1 && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600 font-medium min-w-[80px] text-center">
                {index + 1} / {total}
              </span>
              <button
                onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                disabled={index === total - 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            <Download size={18} /> Download PNG
          </button>
          <button
            onClick={handlePrintAll}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            <Printer size={18} /> Print All
          </button>
        </div>
      </div>
    </div>
  );
};

export default PacketQRModal;
