import { model } from "mongoose";
import { Model } from "../_Types/Model";


export default async function getField(Model:Model, field:string) {
    const fields = await model(Model).find().select(field);
    
    return fields
}