export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;

  constructor(message = "Error de validación", fields?: Record<string, string[]>) {
    super(message, 400, fields);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message = "El recurso ya existe") {
    super(message, 409);
    this.name = "ConflictError";
  }
}
