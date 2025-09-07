import mongoose from "mongoose";
import { QueryOptions } from "@Types/helperTypes/QueryOptions";
import { MongoId } from "@Types/Schema/MongoId";
import { buildQuery } from "@utils/queryModifiers/buildRequestQuery";
import { QueryParams } from "@Types/helperTypes/Request";

export async function createDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, data: any /*locals?: any*/): Promise<T> {
  const newDoc = await Model.create(data);

  /* OLD CODE (kept for reference): 
    const newDoc = new Model(data);
    if (locals) newDoc.$locals.modelId = locals;
    
    await newDoc.save();
    */
  return newDoc;
}

export async function getAllDocs<T extends mongoose.Document>(Model: mongoose.Model<T>, query: QueryParams, options?: QueryOptions<T>): Promise<T[]> {
  const formattedQuery = buildQuery(query, Model, options?.select);

  const filter = options?.condition ?? {};

  const docs = await formattedQuery.find(filter);
  return docs;
}
export async function getOneDocById<T extends mongoose.Document>(Model: mongoose.Model<T>, id: MongoId, options?: QueryOptions<T>): Promise<T | null> {
  const fields = options?.select ? options.select.join(" ") : "";
  const session = options?.session ?? null;
  const doc = await Model.findById(id).select(fields).session(session);
  return doc;
}

export async function getOneDocByFindOne<T extends mongoose.Document>(Model: mongoose.Model<T>, options?: QueryOptions<T>): Promise<T | null> {
  const fields = options?.select ? options.select.join(" ") : "";
  const doc = await Model.findOne(options?.condition!, fields);
  return doc;
}

export async function updateDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: MongoId, data: any, options?: QueryOptions<T>): Promise<T | null> {
  const session = options?.session ?? null;
  const updatedDoc = await Model.findOneAndUpdate({ _id: id, ...options?.condition }, data, { runValidators: true, new: true, session });
  return updatedDoc;
}
export async function deleteDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: MongoId, options?: QueryOptions<T>): Promise<T | null> {
  const deletedDoc = Model.findByIdAndDelete(id, { session: options?.session });
  return deletedDoc;
}

export async function isExist<T extends mongoose.Document>(Model: mongoose.Model<T>, condition: mongoose.RootFilterQuery<T>): Promise<boolean> {
  const result = await Model.exists(condition);

  return !!result;
}
