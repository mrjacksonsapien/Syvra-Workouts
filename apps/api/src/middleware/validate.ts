import type { RequestHandler } from 'express';
import { flattenError, type ZodType } from 'zod';
import { ValidationError } from '../errors/index.js';

interface Schemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

// Parsed (trimmed, converted) values are stored here, because Express 5 makes `req.query` read-only.
// Controllers read `res.locals.params`, `res.locals.query`, and `req.body` is replaced directly.
export const validate = (schemas: Schemas): RequestHandler => {
  return (req, res, next) => {
    const fieldErrors: Record<string, string[]> = {};

    for (const part of ['params', 'query', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (result.success) {
        if (part === 'body') req.body = result.data;
        else res.locals[part] = result.data;
      } else {
        const flat = flattenError(result.error);
        Object.assign(fieldErrors, flat.fieldErrors);
        if (flat.formErrors.length > 0) fieldErrors[part] = flat.formErrors;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError('Invalid request', { fieldErrors });
    }
    next();
  };
};
