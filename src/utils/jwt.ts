import { config } from "dotenv";
import { jwtVerify, SignJWT, JWTPayload } from "jose";

config();

/**
 * Defines the essential user claims embedded in the JWT for authorization.
 */
export interface TokenPayload extends JWTPayload {
  id: number;
  user_code: string;
  employee_code?: string | null;
  role: "admin" | "employee";
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Generates a signed JWT for the given payload.
 */
export const generateToken = async (payload: TokenPayload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
};

/**
 * Verifies a token's signature and expiration, returning the decoded payload.
 */
export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS512"],
  });

  // Assert the decoded object matches the expected type
  return payload as TokenPayload;
};
