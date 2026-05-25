import { prisma } from "@/lib/prisma";
import type { BudgetCreateInput } from "@/lib/validations";

export const budgetService = {
  async create(data: BudgetCreateInput) {
    const request = await prisma.budgetRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        service: data.service,
        extras: data.extras ? JSON.stringify(data.extras) : null,
        total: data.total,
        message: data.message || null,
      },
    });
    return request;
  },
};
