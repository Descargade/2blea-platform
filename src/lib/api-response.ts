import { NextResponse } from "next/server";
import { AppError, ValidationError } from "./app-error";
import { ZodError } from "zod";
import { apiLogger } from "./logger";

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
  fields?: Record<string, string[]>;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status }
  );
}

export function created<T>(data: T, message?: string): NextResponse<ApiSuccessResponse<T>> {
  return success(data, message ?? "Creado correctamente", 201);
}

export function error(
  error: unknown,
  fallbackMessage: string = "Error interno del servidor"
): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    const body: ApiErrorResponse & { details?: unknown; fields?: Record<string, string[]> } = {
      success: false,
      error: error.message,
    };
    if (error.details !== undefined) body.details = error.details;
    if (error instanceof ValidationError && error.fields) body.fields = error.fields;
    return NextResponse.json(body, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!fields[path]) fields[path] = [];
      fields[path].push(issue.message);
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error de validación",
        fields,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    apiLogger.error({ err: error }, "API Error");
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  apiLogger.error({ err: error }, "API Error");
  return NextResponse.json(
    { success: false, error: fallbackMessage },
    { status: 500 }
  );
}

export function unauthorized(message?: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message ?? "No autorizado" },
    { status: 401 }
  );
}

export function forbidden(message?: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message ?? "Acceso denegado" },
    { status: 403 }
  );
}

export function notFound(message?: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message ?? "Recurso no encontrado" },
    { status: 404 }
  );
}
