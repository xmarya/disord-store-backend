import jwt, { JwtPayload } from "jsonwebtoken";

const jwtVerify = async (token: string, salt: string): Promise<JwtPayload & { id: string }> => {
  // https://stackoverflow.com/questions/75398503/error-when-trying-to-promisify-jwt-in-typescript
  return new Promise((resolved, rejected) => {
    jwt.verify(token, salt, {}, (error, payload) => {
      if (error) rejected(error);
      else resolved(payload as JwtPayload & { id: string });
    });
  });
};

export default jwtVerify;