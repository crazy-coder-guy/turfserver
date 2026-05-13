export const validateRequest = (schema) => (req, res, next) => {
  const keys = ['params', 'query', 'body'];
  
  for (const key of keys) {
    if (schema[key]) {
      const { value, error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        }));
        return res.status(400).json({
          success: false,
          message: `Validation failed in ${key}`,
          errors: errorDetails,
        });
      }
      req[key] = value;
    }
  }

  next();
};
