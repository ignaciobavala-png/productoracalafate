"use client";

import { useState } from "react";
import { exportGuestsData } from "./actions";

function toCSV(rows: Awaited<ReturnType<typeof exportGuestsData>>): string {
  const headers = [
    "ID", "Nombre", "Email", "Nacionalidad", "Fecha de nacimiento", "Teléfono",
    "WhatsApp", "Viene solo", "Dieta", "Detalle dieta", "Bio",
    "Factura", "Método de pago", "Estado", "Fecha registro", "Código invitación",
    "Acompañante — Nombre", "Acompañante — Email", "Acompañante — Nacionalidad",
    "Acompañante — Fecha nac.", "Acompañante — Teléfono", "Acompañante — Dieta",
  ];

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? v.join(", ") : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const lines = rows.map((g) => {
    const c = Array.isArray(g.companions) ? g.companions[0] : null;
    return [
      g.id, g.full_name, g.email, g.nationality ?? "", g.date_of_birth ?? "",
      g.phone ?? "", g.wants_whatsapp ? "Sí" : "No",
      g.is_coming_alone ? "Sí" : "No",
      g.dietary_restrictions ?? [], g.dietary_details ?? "", g.bio ?? "",
      g.needs_invoice ? "Sí" : "No", g.payment_method_id ?? "",
      g.status, new Date(g.submitted_at).toLocaleDateString("es-CL"),
      g.invitation_code ?? "",
      c?.full_name ?? "", c?.email ?? "", c?.nationality ?? "",
      c?.date_of_birth ?? "", c?.phone ?? "",
      c?.dietary_restrictions ?? [],
    ].map(escape).join(",");
  });

  return [headers.join(","), ...lines].join("\r\n");
}

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await exportGuestsData();
      const csv = "﻿" + toCSV(data); // BOM para que Excel abra con UTF-8
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registros-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 border border-black/15 text-xs text-black/60 hover:text-black hover:border-black/30 transition-colors rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6.5 1v8M6.5 9l-2.5-2.5M6.5 9l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 10v1a1 1 0 001 1h9a1 1 0 001-1v-1" strokeLinecap="round" />
      </svg>
      {loading ? "Exportando…" : "Exportar Excel"}
    </button>
  );
}
