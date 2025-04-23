import { Types } from "mongoose";
import { ProductBasic } from "../../_Types/Product";
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

export async function getProductsByCategory() {

}
