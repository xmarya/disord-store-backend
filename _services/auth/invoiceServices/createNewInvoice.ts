import Invoice from "@models/invoiceModel";
import { createDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { InvoiceDataBody } from "@Types/Schema/Invoice";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function createNewInvoice(data: InvoiceDataBody) {

    const safeCreate = safeThrowable(
        () => createDoc(Invoice, data),
        (error) => new Failure((error as Error).message)
    );

    return await extractSafeThrowableResult(()=> safeCreate);
}

export default createNewInvoice;