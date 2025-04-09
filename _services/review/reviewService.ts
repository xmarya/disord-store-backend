import mongoose from 'mongoose';
import { ReviewDataBody, ReviewDocument, } from "../../_Types/Reviews";


export async function createReview<T extends mongoose.Document>(Model:mongoose.Model<T>, data:ReviewDataBody):Promise<T> {
    const newDoc = await Model.create(data);
    return newDoc
}

export async function getAllReviews<T extends mongoose.Document>(Model:mongoose.Model<T> ):Promise<T[]> {
    const docs = await Model.find();
    return docs;
}
export async function getOneReview<T extends mongoose.Document>(Model:mongoose.Model<T>, id:string):Promise<T | null> {
    const doc = await Model.findById(id);
    return doc;
}
export async function updateReview<T extends mongoose.Document>(Model:mongoose.Model<T>, id:string, data:any):Promise<T | null> {
    const updatedDoc = await Model.findByIdAndUpdate(id, {
        data,
        updatedAt: new Date(),
    });
    return updatedDoc;
}
export async function deleteReview<T extends mongoose.Document>(Model:mongoose.Model<T>, id:string):Promise<T | null> {
    const deletedDoc = await Model.findByIdAndDelete(id);
    return deletedDoc;
}

export async function confirmReviewAuthorisation<T extends mongoose.Document>(Model:mongoose.Model<T>, reviewId:string , userId:string):Promise<boolean> {
    const authorised = await Model.exists({_id: reviewId, user: userId});
    
    return !!authorised;
}