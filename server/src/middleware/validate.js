/**
 * Zod validation middleware factory.
 * Validates request body, params, or query against a Zod schema.
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    // Replace request data with parsed/coerced values
    req[source] = result.data;
    next();
  };
};
