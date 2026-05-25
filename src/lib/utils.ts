import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    EN_PROGRESO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ESPERANDO_FEEDBACK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    FINALIZADO: "bg-green-500/10 text-green-500 border-green-500/20",
    ENTREGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_PROGRESO: "En progreso",
    ESPERANDO_FEEDBACK: "Esperando feedback",
    FINALIZADO: "Finalizado",
    ENTREGADO: "Entregado",
  };
  return labels[status] || status;
}
