import mongoose from "mongoose";
import { MongoId } from "@Types/Schema/MongoId";
import Cart from "@models/cartModel";
import { CartDataBody } from "@Types/Schema/Cart";

export async function addProductToCart(data: CartDataBody) {
  const { user, store, product, quantity } = data;
  const cart = await Cart.findOneAndUpdate(
    { user, product },
    {
      $set: {
        store,
        quantity,
        product,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return cart;
}

export async function getUserCart(user: MongoId) {
  const cart = await Cart.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(user) } },

    // STEP 1) $lookup stage to populate the products:
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    // NOTE: any $lookup must be followed by a $unwind stage
    { $unwind: "$productDoc" },

    //STEP 2) use $addFields to shape the final document properties:
    {
      $addFields: {
        createdAt: "$createdAt",
        quantity: "$quantity",
        productId: "$productDoc._id",
        name: "$productDoc.name",
        unitPrice: "$productDoc.price",
        productType: "$productDoc.productType",
        image: "$productDoc.image",
        stock: "$productDoc.stock",
        weight: {
          $cond: [{ $eq: ["$productDoc.productType", "physical"] }, "$productDoc.weight", "$$REMOVE"],
        },
        priceAfterDiscount: {
          $cond: [
            { $gt: ["$productDoc.discount", 0] },
            {
              $round: [
                {
                  $multiply: ["$productDoc.price", { $subtract: [1, { $divide: ["$productDoc.discount", 100] }] }],
                },
                2,
              ],
            },
            "$$REMOVE",
          ],
        },
      },
    },

    // STEP 3) $sort stage to keep the same order in which products were added to the cart.
    //NOTE: the $sort stage must be before the $group, in order for $push to respect the order
    { $sort: { createdAt: 1 } },

    // STEP 4) $group the products depending on the store they belong to and use $push to create the products array:
    {
      $group: {
        _id: "$store",
        products: {
          $push: {
            productId: "$productId",
            quantity: "$quantity",
            name: "$name",
            unitPrice: "$unitPrice",
            productType: "$productType",
            image: "$image",
            stock: "$stock",
            priceAfterDiscount: "$priceAfterDiscount",
            weight: "$weight",
          },
        },
      },
    },

    // STEP 5) another $group stage to merge/collect the different documents
    // that each of them has an array of products per store that produced from the previous stage
    // into one single document based on the user and create the final array productsPerStore using $push:
    {
      $group: {
        _id: "$user",
        productsPerStore: {
          $push: {
            storeId: "$_id", // NOTE: remember that, I specified the _id to be the store itself in the previous stage in order to group the products
            products: "$products",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        productsPerStore: 1,
      },
    },
  ]);

  return cart;
}

export async function deleteProductFromCart(user: MongoId, product: MongoId) {
  await Cart.findOneAndDelete({ user, product });
}

export async function deleteCart(user: MongoId, session:mongoose.ClientSession) {
  return await Cart.deleteMany({user}, {session});
}

/* OLD CODE (kept for reference): 
// resource: How to flatten data of mongodb when it’s array of nested object and populated?
// https://www.mongodb.com/community/forums/t/how-to-flatten-data-of-mongodb-when-its-array-of-nested-object-and-populated/176740
export async function getUserCart(user: MongoId) {
  const cart = await Cart.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(user) } },
    // S 1) using $unwind, flatten both productsPerStore array and products which is a nested array:
    { $unwind: "$productsPerStore" },
    { $unwind: "$productsPerStore.products" },

    //ST 2) populate the product using $lookup:
    {
      $lookup: {
        from: "products",
        localField: "productsPerStore.products.product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    // NT: any $lookup must be followed by $unwind stage
    { $unwind: "$productDoc" },

    // S 3) use $addFields to merge wanted properties from product with cart's store and quantity properties.
    {
      $addFields: {
        _id: "$_id",
        user: "$user", // must be transferred to the next stage
        productId: "$productDoc._id",
        quantity: "$productsPerStore.products.quantity",
        name: "$productDoc.name",
        unitPrice: "$productDoc.price",
        productType: "$productDoc.productType",
        image: "$productDoc.image",
        stock: "$productDoc.stock",

        // Conditionally include weight only for physical products
        weight: {
          $cond: [{ $eq: ["$productDoc.productType", "physical"] }, "$productDoc.weight", "$$REMOVE"],
        },
        // Price after discount
        priceAfterDiscount: {
          $cond: [
            { $gt: ["$productDoc.discount", 0] },
            {
              $round: [
                {
                  $multiply: ["$productDoc.price", { $subtract: [1, { $divide: ["$productDoc.discount", 100] }] }],
                },
                2,
              ],
            },
            "$$REMOVE",
          ],
        },
      },
    },

    // S 4) use $group to rebuild the productsPerStore by pushing each enriched product into a products array under each storeId.
    // and to roup by storeId to reconstruct the original shape per store.
    {
      $group: {
        _id: {
          // NT: // I had to make both represent the _id of the group stage in order to preserve the original cart _id,
          // I was doing it like:
          // $group: {_id: "$productsPerStore.storeId"}
          // which led to discard the original card _id and any _id in the following stages gonna be the storeId which caused of wrong data shape
          cartId: "$_id",
          storeId: "$productsPerStore.storeId",
        },
        user: {
          $first: "$user", // must be transferred to the next stage
        },
        products: {
          $push: {
            productId: "$productId",
            quantity: "$quantity",
            name: "$name",
            unitPrice: "$unitPrice",
            productType: "$productType",
            image: "$image",
            stock: "$stock",
            priceAfterDiscount: "$priceAfterDiscount",
            weight: "$weight",
          },
        },
      },
    },

    // S 5) after creating the nested products array, now, it's the time to create the outer array, productsPerStore :
    {
      $group: {
        _id: "$_id.cartId",
        user: {
          $first: "$user", // must be transferred to the next stage
        },
        productsPerStore: {
          $push: {
            storeId: "$_id.storeId",
            products: "$products",
          },
        },
      },
    },

    {
      $project: {
        _id: 1,
        user: 1,
        productsPerStore: 1,
      },
    },
  ]);

  return cart;
}

*/
