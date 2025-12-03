import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '36000';

export interface JwtPayload {
    userId: string;
    email: string;
    username: string;
}

export function signJwt(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: Number(JWT_EXPIRES_IN) };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt<T = JwtPayload>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
}
