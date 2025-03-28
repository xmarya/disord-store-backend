import jwt from "jsonwebtoken";


export default function jwtSignature(id:string) {
    if (!process.env.JWT_SALT) {
        throw new Error("JWT_SALT is not defined");
    }
    return jwt.sign({id}, process.env.JWT_SALT, { expiresIn: "1D" });
}