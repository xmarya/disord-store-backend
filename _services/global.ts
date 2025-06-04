import mongoose from "mongoose";
import type { Request } from "express";
import { KnownKeys } from "../_Types/TypeKeys";
import { QueryOptions } from "../_Types/QueryOptions";
import { MongoId } from "../_Types/MongoId";
import { buildQuery } from "../_utils/queryModifiers/buildRequestQuery";

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

export async function getAllDocs<T extends mongoose.Document>(Model: mongoose.Model<T>, request: Request, options?:QueryOptions<T>): Promise<T[]> {
  const query = buildQuery(request, Model); /*✅*/

  const fields = options?.select ? options.select.join(" ") : ""; /*✅*/
  const filter = options?.condition ?? {};

  const docs = await query.find(filter).select(fields);
  return docs;
}
export async function getOneDocById<T extends mongoose.Document>(Model: mongoose.Model<T>, id: MongoId, options?:QueryOptions<T>): Promise<T | null> {
  const fields = options?.select ? options.select.join(" ") : "";/*✅*/
  const doc = await Model.findById(id).select(fields);
  return doc;
}

export async function getOneDocByFindOne<T extends mongoose.Document>(Model:mongoose.Model<T>, options?:QueryOptions<T>):Promise<T | null> {
  const fields = options?.select ? options.select.join(" ") : ""; /*✅*/
  console.log("options?.condition!", options?.condition!);
  const doc = await Model.findOne(options?.condition!, fields);
  return doc;
}
export async function updateDoc<T extends mongoose.Document>(
  Model: mongoose.Model<T>,
  id: MongoId,
  data: any,
  updateOptions: { locals?: any; session?: mongoose.ClientSession } = {}
): Promise<T | null> {
  /* OLD CODE (kept for reference): 
  const updatedDoc = await Model.findByIdAndUpdate(id, data).setOptions(locals);
  */
  const { locals, session } = updateOptions;
  const query = Model.findByIdAndUpdate(id, data, { runValidators: true, new: true, session });
  if (locals) query.setOptions(locals); /*REQUIRES TESTING*/
  const updatedDoc = await query;
  return updatedDoc;
}
export async function deleteDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: MongoId, locals?: any): Promise<T | null> {
  const query = Model.findByIdAndDelete(id);
  if (locals) query.setOptions(locals);
  const deletedDoc = await query;
  return deletedDoc;
}

export async function deleteMongoCollection(collection: string) {
  console.log("deleteProductsCollection", collection);
  await mongoose.connection.db?.dropCollection(collection);
}
