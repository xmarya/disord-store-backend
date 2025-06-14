import bcrypt from "bcryptjs";

export async function comparePasswords(providedPassword: string, userPassword:string) {  /*✅*/
    const result = await bcrypt.compare(providedPassword, userPassword);
    return result;
}
