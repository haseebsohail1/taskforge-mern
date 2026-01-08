import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

import { BadRequestError } from '../utils/errors';

export const validate = (schema: ObjectSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    return next(new BadRequestError('Validation failed', error.details));
  }
  return next();
};
