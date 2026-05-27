export type Role = "ADMIN" | "CLIENTE";

export type ProjectStatus =
  | "CONSULTA"
  | "DISENO"
  | "DESARROLLO"
  | "REVISION"
  | "OPTIMIZACION"
  | "ENTREGADO";

export type PaymentType = "ANTICIPO" | "SALDO_FINAL" | "GENERAL";
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface ClientListItem {
  id: string;
  company?: string | null;
  phone?: string | null;
  user?: ClientUser | null;
  createdAt?: string;
}

export interface ClientDetail extends ClientListItem {
  address?: string | null;
  notes?: string | null;
  projects?: ProjectItem[];
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
  order: number;
  extras: ExtraItem[];
  createdAt?: string;
}

export interface OfferItem {
  id: string;
  title: string;
  description?: string | null;
  discount: number;
  active: boolean;
  featured: boolean;
  endDate?: string | null;
  service?: { id: string; name: string } | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  originalName: string;
  key: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectClient {
  id: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  url: string;
  title: string;
  createdAt: string;
}

export interface ProjectPayment {
  id: string;
  projectId: string;
  type: PaymentType;
  amount: number;
  date: string;
  status: PaymentStatus;
  note?: string | null;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  progress: number;
  cost?: number | null;
  totalPaid: number;
  serviceId?: string | null;
  service?: { id: string; name: string } | null;
  extras?: Array<{ id: string; name: string; price: number }> | null;
  features: string[];
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  client?: ProjectClient | null;
  files?: ProjectFile[];
  links?: ProjectLink[];
  payments?: ProjectPayment[];
  activityLogs?: ActivityLogItem[];
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  project?: { id: string; name: string } | null;
  client?: { user?: { id: string; name: string; email: string } | null } | null;
  messages: MessageItem[];
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  userId?: string | null;
}

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  unreadMessages: number;
  activeOffers: number;
  totalRevenue: number;
  pendingPayments: number;
}
