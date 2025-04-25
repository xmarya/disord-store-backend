import mongoose, { Types } from "mongoose";
import { ProductBasic, ProductDocument } from "../../_Types/Product";
import Product from "../../models/productModel";

//TODO: delete the two below ONLY.

export async function createProduct(data:ProductBasic) {
    const newProd = await Product.create( data );
    return newProd;
}

export async function getAllProducts(storeId:string | Types.ObjectId) {
    const products = await Product.find({store: storeId});

    return products;
}

export async function deleteProductsCollection(collection:string) {
    console.log("deleteProductsCollection", collection);
    await mongoose.connection.db?.dropCollection(collection);
}

export async function getProductsByCategory() {

}
