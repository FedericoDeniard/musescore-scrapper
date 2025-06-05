// src/middleware/auth.ts
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'src/utils/response';

interface CognitoJWTPayload extends JWTPayload {
    sub: string;
    email?: string;
    'cognito:username'?: string;
    token_use?: string;
    aud?: string;
}

interface AuthenticatedRequest extends Request {
    user?: CognitoJWTPayload;
}

// Configuración del JWKS remoto usando jose
const JWKS = createRemoteJWKSet(
    new URL(`https://cognito-idp.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`)
);

export const validateJWT = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpError('Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];
    // Verificar que el token no esté vacío
    if (!token) {
        throw new HttpError('Token vacío', 401);
    }

    // Verificar el token usando jose
    const { payload } = await jwtVerify(token, JWKS, {
        audience: process.env.AWS_USER_POOL_CLIENT_ID,
        issuer: `https://cognito-idp.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}`,
    });

    const decodedToken = payload as CognitoJWTPayload;

    // Verificar que sea un ID token
    if (decodedToken.token_use !== 'id') {
        throw new HttpError('Tipo de token incorrecto', 401);
    }

    // Agregar información del usuario al request
    req.user = decodedToken;
    console.log("Token validado correctamente")
    next();

};

export type { AuthenticatedRequest };