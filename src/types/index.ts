export type Role = "ADMIN" | "CLIENTE";

export type ProjectStatus =
  | "PENDIENTE"
  | "EN_PROGRESO"
  | "ESPERANDO_FEEDBACK"
  | "FINALIZADO"
  | "ENTREGADO";

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
  extras: ExtraItem[];
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

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  progress: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  client?: ProjectClient | null;
  files?: ProjectFile[];
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
}
