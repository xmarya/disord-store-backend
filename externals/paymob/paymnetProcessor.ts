import { verifyPaymobHmac, validatePaymobWebhook } from "@utils/paymobWebHookUtils";
import Order from "@models/orderModel";
import Product from "@models/productModel";

export const getPaymentSuccessHtml = (status: "success" | "error", errorMessage: string = ""): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Status</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
          transition: background-color 0.3s;
        }
        .container {
          text-align: center;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          transition: color 0.3s;
        }
        p {
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 id="title">Payment Status</h1>
        <p id="message"></p>
      </div>
      <script>
        const status = "${status}";
        const errorMessage = "${errorMessage}";

        const body = document.body;
        const title = document.getElementById("title");
        const message = document.getElementById("message");

        if (status === "success") {
          body.style.backgroundColor = "#e0f7fa";
          title.style.color = "#4CAF50";
          title.textContent = "Payment Complete!";
          message.textContent = "Thank you for your purchase. Your order has been successfully processed.";
        } else {
          body.style.backgroundColor = "#ffebee";
          title.style.color = "#f44336";
          title.textContent = "Payment Failed";
          message.textContent = errorMessage || "An error occurred during payment. Please try again.";
        }
      </script>
    </body>
    </html>
  `;
};

export const processPaymobWebhook = async (body: any, hmac?: string) => {
  // 1. Validate HMAC
  if (!hmac || !verifyPaymobHmac(body, hmac)) {
    throw new Error("Invalid HMAC signature");
  }
  // 2. Validate Schema
  const { obj } = validatePaymobWebhook(body);
  // 3. Find Order
  const order = await findOrderByIdentifier(obj.special_reference || obj.payment_key_claims?.next_payment_intention);
  // 4. Update Order
  if (obj.success) {
    order.status = "Paid";
    order.transaction_id = String(obj.id);
    await order.save();
    await updateProductPurchases(order.items);
  }
  return order;
};

const findOrderByIdentifier = async (identifier?: string) => {
  if (!identifier) throw new Error("No order identifier found");

  const order = await Order.findOne({
    $or: [{ orderNumber: identifier }, { paymentIntentionId: identifier }],
  });

  if (!order) throw new Error(`Order not found: ${identifier}`);
  return order;
};

const updateProductPurchases = async (items: any[]) => {
  const productIds = items.map((item) => item.productId);
  await Product.updateMany({ _id: { $in: productIds } }, { $inc: { numberOfPurchases: 1 } });
};
