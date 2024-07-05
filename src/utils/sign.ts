import jwt from "jsonwebtoken";

export function signToken(secret: string, payload: any) {
  return jwt.sign(payload, secret);
}
