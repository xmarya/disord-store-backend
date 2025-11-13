import createNewInvoice from "@services/auth/invoiceServices/createNewInvoice";
import updateStoreStats from "@services/auth/storeServices/storeStats/updateStoreStats";
import { OrderCreated } from "@Types/events/OrderEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { format } from "date-fns";

async function createNewInvoiceConsumer(event: OrderCreated) {
  const {
    invoice: { orderId, buyer, paymentMethod, productsPerStore, status, invoiceTotal, shippingAddress, billingAddress, shippingCompany, shippingFees },
  } = event.payload;

  if (!orderId || !buyer || !paymentMethod?.trim() || !productsPerStore.length || !status || !invoiceTotal)
    return new Failure("some invoice data are missing", { serviceName: "invoicesCollection", ack: false });

  const operationType = status === "successful" || status === "processed" ? "new-purchase" : "cancellation";
  const releasedAt = new Date();
  const invoiceId = format(releasedAt, "yyMMdd-HHmmssSSS");

  const fullData = { releasedAt, invoiceId, ...event.payload.invoice };
  await updateStoreStats(fullData, operationType);
  const newInvoice = await createNewInvoice(fullData);

  if(newInvoice.ok) return new Success({ serviceName: "invoicesCollection", ack: true });
  return new Failure(newInvoice.message, { serviceName: "invoicesCollection", ack: false });
}

export default createNewInvoiceConsumer;
