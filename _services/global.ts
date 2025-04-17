import mongoose from "mongoose";

export async function createDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, data: any): Promise<T> {
  console.log("inside createReview aka the future global create service");
  const newDoc = await Model.create(data);
  // newDoc.calculateRatingsAverage(Model); it'll be called from a post("save") hook
  return newDoc;
}

export async function getAllDocs<T extends mongoose.Document>(Model: mongoose.Model<T>): Promise<T[]> {
  //TODO: handle filtering functionality
  const docs = await Model.find();
  return docs;
}
export async function getOneDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId): Promise<T | null> {
  const doc = await Model.findById(id);
  return doc;
}
export async function updateDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId, data: any): Promise<T | null> {
  const updatedDoc = await Model.findByIdAndUpdate(id, {
    data,
    updatedAt: new Date(),
  });
  return updatedDoc;
}
export async function deleteDoc<T extends mongoose.Document>(Model: mongoose.Model<T>, id: string | mongoose.Types.ObjectId): Promise<T | null> {
  const deletedDoc = await Model.findByIdAndDelete(id);
  return deletedDoc;
}
