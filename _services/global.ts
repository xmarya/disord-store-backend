import mongoose from "mongoose";
import type {Request} from "express";
import { buildQuery } from "../_utils/buildRequestQuery";

export async function createDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, data: any, locals?: any): Promise<T> {
  console.log("inside createDoc");
  /* OLD CODE (kept for reference): 
    const newDoc = await Model.create(data);
    // newDoc.calculateRatingsAverage(Model); it'll be called from a post("save") hook
  */

  const newDoc = new Model(data);
  if (locals) newDoc.$locals.modelId = locals;

  await newDoc.save();
  return newDoc;
}

export async function getAllDocs<T extends mongoose.Document>(Model: mongoose.Model<T>, request:Request): Promise<T[]> {
  const query = buildQuery(request, Model); /*REQUIRES TESTING: ✅*/
  const docs = await query.find();
  return docs;
}
export async function getOneDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId): Promise<T | null> {
  const doc = await Model.findById(id);
  return doc;
}
export async function updateDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId, data: any, locals?: any): Promise<T | null> {
  /* OLD CODE (kept for reference): 
  const updatedDoc = await Model.findByIdAndUpdate(id, data).setOptions(locals);
  */
  const query = Model.findByIdAndUpdate(id, data, { runValidators: true, new:true });
  if (locals) query.setOptions(locals); /*REQUIRES TESTING*/
  const updatedDoc = await query;
  return updatedDoc;
}
export async function deleteDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId, locals?: any): Promise<T | null> {
  const query = Model.findByIdAndDelete(id);
  if (locals) query.setOptions(locals);
  const deletedDoc = await query;
  return deletedDoc;
}

export async function deleteMongoCollection(collection: string) {
  console.log("deleteProductsCollection", collection);
  await mongoose.connection.db?.dropCollection(collection);
}
