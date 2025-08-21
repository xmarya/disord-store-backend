import jwt from "jsonwebtoken";


export default function jwtSignature(id:string, expiresIn: "1h" | "1m" ) {
    if (!process.env.JWT_SALT) {
        throw new Error("JWT_SALT is not defined");
    }
    return jwt.sign({id}, process.env.JWT_SALT, { expiresIn });
}