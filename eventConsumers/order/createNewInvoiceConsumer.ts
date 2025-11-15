import createOutboxRecord from "@services/_sharedServices/outboxRecordServices/createOutboxRecord";
import createNewInvoice from "@services/auth/invoiceServices/createNewInvoice";
import { InvoiceCreated } from "@Types/events/InvoiceEvents";
import { OrderCreated } from "@Types/events/OrderEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import { format } from "date-fns";
import { startSession } from "mongoose";

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

  const session = await startSession();

  const newInvoice = await session.withTransaction(async() => {
    const newInvoice = await createNewInvoice(fullData);
    if(newInvoice) await createOutboxRecord<[InvoiceCreated]>([{type: "invoice-created", payload:{storesStats:fullData, operationType}}], session);
    return newInvoice;
  });

  await session.endSession();

  if(newInvoice.ok) return new Success({ serviceName: "invoicesCollection", ack: true });
  return new Failure(newInvoice.message, { serviceName: "invoicesCollection", ack: false });
}

export default createNewInvoiceConsumer;
