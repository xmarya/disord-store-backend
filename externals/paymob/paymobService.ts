import axios, { AxiosError } from "axios";
import { Address } from "../../_Types/Order";
import { PaymobOrderData, PaymobBillingData } from "../../_Types/Paymob";
import { paymobIntentionResponseSchema } from "./zodSchemas/paymnetSchema";
import { paymobConfig } from "../../_config/config";

// Paymob API configuration
const PAYMOB_SECRET_KEY = paymobConfig.secretKey;
const PAYMOB_PUBLIC_KEY = paymobConfig.publicKey;
const PAYMOB_BASE_URL = paymobConfig.baseUrl;
const CARD_INTEGRATION_ID = paymobConfig.cardIntegrationId;
const WALLET_INTEGRATION_ID = paymobConfig.walletIntegrationId;
const WEBHOOK_URL = paymobConfig.webhookUrl;

async function createPaymentIntention(orderData: PaymobOrderData, billingData: PaymobBillingData, paymentType?: "card" | "wallet"): Promise<{ clientSecret: string; paymobOrderId: string }> {
  try {
    const payload = {
      amount: Math.round(orderData.totalPrice * 100),
      currency: "EGP",
      payment_methods: [CARD_INTEGRATION_ID, WALLET_INTEGRATION_ID],
      items: orderData.items.map((item) => ({
        name: item.name,
        amount: item.amount,
        description: item.description || "",
        quantity: item.quantity,
      })),
      billing_data: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        phone_number: billingData.phone,
        email: billingData.email,
        street: billingData.street,
        building: billingData.apartment || "NA",
        floor: "NA",
        apartment: billingData.apartment || "NA",
        city: billingData.city,
        state: billingData.state,
        country: billingData.country,
        postal_code: billingData.postalCode,
      },
      // TODO: Switch back to merchant_order_id if Paymob ever supports it
      // Current workaround: special_reference confirmed working
      special_reference: orderData.orderId, //merchant_order_id
      notification_url: WEBHOOK_URL,
    };
    const response = await axios.post(`${PAYMOB_BASE_URL}/v1/intention/`, payload, {
      headers: {
        Authorization: `Token ${PAYMOB_SECRET_KEY}`,
      },
    });

    const validatedResponse = paymobIntentionResponseSchema.parse(response.data);
    return {
      clientSecret: validatedResponse.client_secret,
      paymobOrderId: validatedResponse.id,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Paymob API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
    }
    throw error;
  }
}

export async function ProcessPaymobPayment(
  orderId: string,
  totalPrice: number,
  items: any[],
  billingAddress: Address,
  paymentType?: "card" | "wallet"
): Promise<{ checkoutUrl: string; paymobOrderId: string }> {
  const totalItemPriceBeforeDiscount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalPriceCents = Math.round(totalPrice * 100);
  const totalItemPriceBeforeDiscountCents = Math.round(totalItemPriceBeforeDiscount * 100);

  const priceRatio = totalItemPriceBeforeDiscountCents > 0 ? totalPriceCents / totalItemPriceBeforeDiscountCents : 1;

  let adjustedItems = items.map((item) => ({
    name: item.name,
    amount: Math.round(item.price * 100 * priceRatio),
    quantity: item.quantity,
    productType: item.productType,
    description: item.description || ``,
  }));

  let sumOfItemsCents = adjustedItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  if (sumOfItemsCents !== totalPriceCents && adjustedItems.length > 0) {
    const difference = totalPriceCents - sumOfItemsCents;
    const lastItem = adjustedItems[adjustedItems.length - 1];
    lastItem.amount += difference / lastItem.quantity;
    sumOfItemsCents = adjustedItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  }

  if (sumOfItemsCents !== totalPriceCents) {
    throw new Error(`Item prices do not match total price: ${sumOfItemsCents} cents vs ${totalPriceCents} cents`);
  }

  const { clientSecret, paymobOrderId } = await createPaymentIntention(
    {
      orderId,
      totalPrice,
      items: adjustedItems,
    },
    {
      ...billingAddress,
      amount_cents: totalPriceCents,
    },
    paymentType
  );

  const checkoutUrl = `${PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`;
  return { checkoutUrl, paymobOrderId };
}
