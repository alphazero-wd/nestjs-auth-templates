import { Request } from 'express';
import { User } from '../../users/entities';

export interface MyContext {
  req: Request & { user: User };
}

export interface JwtTokenPayload {
  userId: string;
}
