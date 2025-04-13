import mongoose from "mongoose";
import Product from "../../models/productModel";
import Order from "../../models/orderModel";
import Coupon from "../../models/couponModel";
import { validateCoupon } from "../coupon/couponService";
import { RoundToTwo } from "../../_utils/common";
import { IOrder, IOrderItem, IOrderItemCheck, IShippingAddress } from "../../_Types/Order";
import { IStoreAddress, StoreBasic } from "../../_Types/Store";

export const ProcessOrderItems = async (
  items: IOrderItemCheck[],
  session: mongoose.ClientSession
): Promise<{
  processedItems: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
  hasDigitalProducts: boolean;
  totalWeight: number;
  storeId: mongoose.Types.ObjectId;
  storeShipmentCompanies: { name: string; accountNumber: string }[];
  storeAddress?: IStoreAddress;
}> => {
  let totalWeight = 0;
  let subtotal = 0;
  let totalDiscount = 0;
  const processedItems: IOrderItem[] = [];
  let hasDigitalProducts = false;
  let allDigital = true;

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .session(session)
    .populate<{
      store: StoreBasic & { address?: IStoreAddress };
    }>({
      path: "store",
      select: "shipmentCompanies address",
    });

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  if (products.length === 0) throw new Error("No products found");

  const firstProduct = products[0];
  if (!firstProduct.store || !("_id" in firstProduct.store)) {
    throw new Error("Store not found for product");
  }
  const storeId = firstProduct.store._id;
  const storeShipmentCompanies = firstProduct.store.shipmentCompanies || [];
  const storeAddress = firstProduct.store.address;

  for (const product of products) {
    if (!product.store || product.store._id.toString() !== storeId.toString()) {
      throw new Error("All items in an order must come from the same store");
    }
    if (product.productType === "physical") {
      allDigital = false;
    }
  }

  const bulkOps: any[] = [];
  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: product._id, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    });

    if (product.productType === "digital") {
      hasDigitalProducts = true;
    }

    const itemPrice = product.price * item.quantity;
    const itemDiscount = (product.price * (product.discount / 100)) * item.quantity;
    const discountedPrice = itemPrice - itemDiscount;

    subtotal += itemPrice;
    totalDiscount += itemDiscount;

    if (product.productType === "physical" && product.weight) {
      totalWeight += product.weight * item.quantity;
    }

    processedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      discountedPrice: RoundToTwo(discountedPrice / item.quantity),
      quantity: item.quantity,
      productType: product.productType,
      image: product.image,
    });
  }

  if (bulkOps.length > 0) {
    const bulkResult = await Product.bulkWrite(bulkOps, { session });
    if (bulkResult.modifiedCount !== bulkOps.length) {
      throw new Error("Failed to update stock for some products");
    }
  }

  return {
    processedItems,
    subtotal: RoundToTwo(subtotal),
    totalDiscount: RoundToTwo(totalDiscount),
    hasDigitalProducts,
    totalWeight,
    storeId,
    storeShipmentCompanies,
    storeAddress: allDigital ? undefined : storeAddress,
  };
};

export const ApplyCoupon = async (
  couponCode: string | undefined,
  userId: string | mongoose.Types.ObjectId,
  subtotal: number,
  session: mongoose.ClientSession,
  storeId: mongoose.Types.ObjectId
): Promise<{
  couponDiscount: number;
  appliedCoupon: any;
}> => {
  let couponDiscount = 0;
  let appliedCoupon = null;

  if (couponCode !== undefined && couponCode.trim() !== "") {
    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    const { coupon, discountAmount } = await validateCoupon(
      couponCode,
      userObjectId,
      subtotal,
      session,
      storeId
    );
    couponDiscount = RoundToTwo(discountAmount);
    appliedCoupon = coupon;
  } else if (couponCode === "") {
    throw new Error("Coupon code cannot be empty if provided");
  }

  return { couponDiscount, appliedCoupon };
};

export interface CreateOrderParams {
  userId: string;
  orderNumber: string;
  processedItems: IOrderItem[];
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  appliedCoupon: any;
  paymentMethod: string;
  shippingAddress: IShippingAddress | undefined;
  hasDigitalProducts: boolean;
  totalWeight: number;
  storeId: mongoose.Types.ObjectId;
  shipmentCompany?: string;
  serviceType?: string;
}

export const CreateOrder = (params: CreateOrderParams): IOrder => {
  const {
    userId,
    orderNumber,
    processedItems,
    subtotal,
    productDiscount,
    couponDiscount,
    appliedCoupon,
    paymentMethod,
    shippingAddress,
    hasDigitalProducts,
    totalWeight,
    storeId,
    shipmentCompany,
    serviceType,
  } = params;

  const status = hasDigitalProducts ? "Available" : "Pending";

  return new Order({
    userId,
    orderNumber,
    items: processedItems,
    shippingAddress: hasDigitalProducts ? undefined : shippingAddress,
    subtotal: RoundToTwo(subtotal),
    productDiscount: RoundToTwo(productDiscount),
    couponDiscount: RoundToTwo(couponDiscount),
    totalDiscount: RoundToTwo(productDiscount + couponDiscount),
    totalPrice: RoundToTwo(subtotal - productDiscount - couponDiscount),
    couponCode: appliedCoupon?.code,
    paymentMethod,
    status,
    isDigital: hasDigitalProducts,
    totalWeight,
    storeId,
    shipmentCompany: hasDigitalProducts ? undefined : shipmentCompany,
    serviceType: hasDigitalProducts ? undefined : serviceType,
    trackingNumber: undefined,
  });
};

export const UpdateCouponUsage = async (
  appliedCoupon: any,
  session: mongoose.ClientSession
): Promise<void> => {
  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(
      appliedCoupon._id,
      { $inc: { usedCount: 1 } },
      { session }
    );
  }
};