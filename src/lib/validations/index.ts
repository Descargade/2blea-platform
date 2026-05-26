import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const emailSchema = z.string().email("Email inválido").min(1, "Email requerido");

export const passwordSchema = z.string().min(6, "Mínimo 6 caracteres");

export const nameSchema = z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres");

export const phoneSchema = z.string().optional();

export const clientCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const clientUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const projectCreateSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  clientId: z.string().min(1, "Cliente requerido"),
  serviceId: z.string().optional(),
  cost: z.number().min(0).optional(),
  extras: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const projectUpdateSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  cost: z.number().min(0).optional(),
  totalPaid: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const serviceCreateSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  basePrice: z.number().min(0, "El precio no puede ser negativo"),
  order: z.number().int().min(0).optional(),
});

export const messageCreateSchema = z.object({
  conversationId: z.string().min(1, "Conversación requerida"),
  content: z.string().min(1, "Mensaje requerido").max(5000, "Máximo 5000 caracteres"),
});

export const offerCreateSchema = z.object({
  title: nameSchema,
  description: z.string().optional(),
  discount: z.number().min(0).max(100, "El descuento no puede superar 100%"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  serviceId: z.string().optional(),
});

export const offerUpdateSchema = offerCreateSchema.partial();

export const serviceUpdateSchema = z.object({
  id: z.string().min(1),
  basePrice: z.number().min(0, "El precio no puede ser negativo"),
  active: z.boolean(),
});

export const budgetCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  service: z.string().min(1, "Servicio requerido"),
  extras: z.array(z.string()).optional(),
  total: z.number().min(0, "El total no puede ser negativo"),
  message: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
