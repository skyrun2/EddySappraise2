import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 1800;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || 36000;

export interface JwtPayload {
    userId: string;
    email: string;
    username: string;
    role: string;
}

export interface RefreshTokenPayload {
    userId: string;
}

export function signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: Number(JWT_EXPIRES_IN) });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: Number(JWT_REFRESH_EXPIRES_IN) });
}

export function verifyAccessToken<T = JwtPayload>(token: string): T {
    return jwt.verify(token, JWT_SECRET) as T;
}

export function verifyRefreshToken<T = RefreshTokenPayload>(token: string): T {
    return jwt.verify(token, JWT_REFRESH_SECRET) as T;
}

// Legacy function for backward compatibility
export function signJwt(payload: JwtPayload): string {
    return signAccessToken(payload);
}

// Legacy function for backward compatibility
export function verifyJwt<T = JwtPayload>(token: string): T {
    return verifyAccessToken<T>(token);
}
