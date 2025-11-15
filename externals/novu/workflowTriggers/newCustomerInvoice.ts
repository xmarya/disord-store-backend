import novu from "@config/novu";
import { InvoiceCreated } from "@Types/events/InvoiceEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function novuNewCustomerInvoice(event: InvoiceCreated) {
  const {
    storesStats: { buyer, invoiceId, invoiceTotal, releasedAt },
  } = event.payload;

  const subscriberId = buyer.toString();
  const invoiceURL = "to/invoiceId/route";
  const payload = {
    invoiceId,
    invoiceURL,
    releasedAt,
    invoiceTotal,
  };
  const safeTrigger = safeThrowable(
    () => novu.trigger({ workflowId: "new-customer-invoice", to: { subscriberId }, payload }),
    (error) => new Failure((error as Error).message)
  );

  const triggerResult = await extractSafeThrowableResult(() =>  safeTrigger);

  if(!triggerResult.ok) return new Failure(triggerResult.message, {serviceName: "novu", ack:false});

  return new Success({serviceName: "novu", ack:true});
}

export default novuNewCustomerInvoice;
