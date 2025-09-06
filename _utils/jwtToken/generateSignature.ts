import { UserTypes } from "@Types/Schema/Users/BasicUserTypes";
import jwt from "jsonwebtoken";


export default function jwtSignature(id:string, userType:UserTypes, expiresIn: "1h" | "5m" ) {
    if (!process.env.JWT_SALT) {
        throw new Error("JWT_SALT is not defined");
    }
    return jwt.sign({id, userType}, process.env.JWT_SALT, { expiresIn });
}