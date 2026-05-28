import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProjectItem } from "@/types";

interface PaymentForInvoice {
  id: string;
  amount: number;
  type: string;
  note?: string | null;
  status: string;
  date: string;
}

export function generateInvoicePdf(project: ProjectItem, payments: PaymentForInvoice[], totalPaid: number, pendingAmount: number): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const brandColor = "#6C3BD9";
  const textDark = "#1f2937";
  const textLight = "#6b7280";

  const rightX = pageWidth - margin;
  const bodyX = margin;

  let y = margin;

  doc.setFontSize(28);
  doc.setTextColor(brandColor);
  doc.text("2bleA", margin, y + 10);

  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Factura", rightX, y + 6, { align: "right" });
  doc.setFontSize(8);
  doc.text(`N° FCT-${project.id.slice(0, 8).toUpperCase()}`, rightX, y + 12, { align: "right" });
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, rightX, y + 18, { align: "right" });

  y += 28;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 12;

  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Cliente:", margin, y);
  doc.setTextColor(textDark);
  doc.setFontSize(11);
  doc.text(project.client?.user?.name || "---", margin + 30, y);

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Email:", margin, y);
  doc.setTextColor(textDark);
  doc.text(project.client?.user?.email || "---", margin + 30, y);

  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Proyecto:", margin, y);
  doc.setTextColor(textDark);
  doc.setFontSize(11);
  doc.text(project.name, margin + 30, y);

  if (project.service?.name) {
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(textLight);
    doc.text("Servicio:", margin, y);
    doc.setTextColor(textDark);
    doc.text(project.service.name, margin + 30, y);
  }

  y += 14;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const tableBody = payments.map((p) => [
    new Date(p.date).toLocaleDateString("es-AR"),
    p.type === "ANTICIPO" ? "Anticipo" : p.type === "SALDO_FINAL" ? "Saldo final" : "General",
    p.note || "-",
    `$${p.amount.toLocaleString("es-AR")}`,
    p.status === "PAID" ? "Pagado" : "Pendiente",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Tipo", "Nota", "Monto", "Estado"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: brandColor,
      textColor: "#ffffff",
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textDark,
    },
    alternateRowStyles: {
      fillColor: "#f9fafb",
    },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, finalY, pageWidth - margin, finalY);

  let summaryY = finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Total pagado:", margin, summaryY);
  doc.setTextColor("#10b981");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`$${totalPaid.toLocaleString("es-AR")}`, rightX, summaryY, { align: "right" });

  summaryY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.text("Pendiente:", margin, summaryY);
  const pendingColor = pendingAmount > 0 ? "#f59e0b" : "#10b981";
  doc.setTextColor(pendingColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`$${pendingAmount.toLocaleString("es-AR")}`, rightX, summaryY, { align: "right" });

  summaryY += 14;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, summaryY, pageWidth - margin, summaryY);

  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textLight);
  doc.text("2bleA - Soluciones Digitales", pageWidth / 2, footerY, { align: "center" });
  doc.text("Gracias por confiar en nosotros.", pageWidth / 2, footerY + 5, { align: "center" });

  doc.save(`factura-${project.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
