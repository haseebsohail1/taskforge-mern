import mongoose from 'mongoose';

import { BadRequestError } from './errors';

export const validateObjectId = (id: string, field = 'id'): void => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError(`Invalid ${field}`);
  }
};
