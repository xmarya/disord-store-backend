import mongoose from "mongoose";
import Order from "../../models/orderModel";
import Coupon from "../../models/couponModel";
import { validateCoupon } from "../coupon/couponService";
import { RoundToTwo } from "../../_utils/common";
import { CreateOrderParams, IOrder, IOrderItem, IOrderItemCheck, Address } from "../../_Types/Order";
import Product from "../../models/productModel";

export const ProcessOrderItems = async (
  items: IOrderItemCheck[],
  session: mongoose.ClientSession
): Promise<{
  processedItems: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
  hasDigitalProducts: boolean;
  hasMixedProducts: boolean;
  totalWeight: number;
}> => {
  let totalWeight = 0;
  let subtotal = 0;
  let totalDiscount = 0;
  const processedItems: IOrderItem[] = [];
  let hasDigitalProducts = false;
  let hasPhysicalProduct = false; // Temporary flag during processing

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).session(session); // the store field is populated. check productSchema.pre(/^find/ hook.

  const productMap = new Map(products.map((p) => [p.id, p])); // changed from p._it.tostring() to the id, which is the string version. _id is Object and id is string

  if (products.length === 0) throw new Error("No products found");

  const bulkOps: any[] = [];
  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }

    if (product.stock !== null) {
      bulkOps.push({
        updateOne: {
          filter: { _id: product._id, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    if (product.productType === "digital") {
      hasDigitalProducts = true;
    } else if (product.productType === "physical") {
      hasPhysicalProduct = true;
    }

    const itemPrice = product.price * item.quantity;
    const itemDiscount = product.price * (product.discount / 100) * item.quantity;
    const discountedPrice = itemPrice - itemDiscount;

    subtotal += itemPrice;
    totalDiscount += itemDiscount;

    if (product.productType === "physical" && product.weight) {
      totalWeight += product.weight * item.quantity;
    }

    processedItems.push({
      productId: product.id, // changed from _id to id, which is the string version
      storeId: product.store,// the store is not populated so it's safe to use it without specifying the id. still needs testing though
      name: product.name,
      price: product.price,
      discountedPrice: RoundToTwo(discountedPrice / item.quantity),
      quantity: item.quantity,
      productType: product.productType,
      image: product.image,
      description: product.description || "",
    });
  }

  if (bulkOps.length > 0) {
    const bulkResult = await Product.bulkWrite(bulkOps, { session });
    if (bulkResult.modifiedCount !== bulkOps.length) {
      throw new Error("Failed to update stock for some products");
    }
  }

  const hasMixedProducts = hasDigitalProducts && hasPhysicalProduct;
  return {
    processedItems,
    subtotal: RoundToTwo(subtotal),
    totalDiscount: RoundToTwo(totalDiscount),
    hasDigitalProducts,
    hasMixedProducts,
    totalWeight,
  };
};

export const ApplyCoupon = async (
  couponCode: string | undefined,
  userId: string | mongoose.Types.ObjectId,
  items: IOrderItem[],
  subtotal: number,
  session: mongoose.ClientSession
): Promise<{
  couponDiscount: number;
  appliedCoupon: any;
  eligibleSubtotal: number;
}> => {
  let couponDiscount = 0;
  let appliedCoupon = null;
  let eligibleSubtotal = 0;

  if (couponCode !== undefined && couponCode.trim() !== "") {
    const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const { coupon, discountAmount, eligibleSubtotal: calculatedEligibleSubtotal } = await validateCoupon(couponCode, userObjectId, items, session);
    couponDiscount = RoundToTwo(discountAmount);
    appliedCoupon = coupon;
    eligibleSubtotal = calculatedEligibleSubtotal;
  } else if (couponCode === "") {
    throw new Error("Coupon code cannot be empty if provided");
  }

  return { couponDiscount, appliedCoupon, eligibleSubtotal };
};

export const CreateOrder = (params: CreateOrderParams & { hasMixedProducts: boolean }): IOrder => {
  const { userId, orderNumber, processedItems, subtotal, productDiscount, couponDiscount, appliedCoupon, paymentMethod, shippingAddress, billingAddress, hasDigitalProducts, totalWeight } = params;
  let status = "Pending";
  if (hasDigitalProducts) {
    status = "Available";
  } else if (paymentMethod === "COD") {
    status = "Pending";
  }
  const calculatedTotalPrice = RoundToTwo(subtotal - productDiscount - couponDiscount);
  const calculatedTotalDiscount = RoundToTwo(productDiscount + couponDiscount);

  const newOrder = new Order({
    userId,
    orderNumber,
    items: processedItems,
    shippingAddress: hasDigitalProducts ? undefined : shippingAddress,
    billingAddress,
    subtotal: RoundToTwo(subtotal),
    productDiscount: RoundToTwo(productDiscount),
    couponDiscount: RoundToTwo(couponDiscount),
    totalDiscount: calculatedTotalDiscount,
    totalPrice: calculatedTotalPrice,
    couponCode: appliedCoupon?.code,
    paymentMethod,
    status,
    isDigital: hasDigitalProducts,
    totalWeight,
  });

  // Validate consistency
  if (newOrder.totalPrice !== calculatedTotalPrice || newOrder.totalDiscount !== calculatedTotalDiscount) {
    throw new Error("Inconsistent order pricing detected");
  }

  return newOrder;
};

export const UpdateCouponUsage = async (appliedCoupon: any, session: mongoose.ClientSession): Promise<void> => {
  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } }, { session });
  }
};
