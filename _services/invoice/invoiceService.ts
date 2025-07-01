import { InvoiceDataBody } from "../../_Types/Invoice";
import Invoice from "../../models/invoiceModel";

export async function createNewInvoices(data:Array<InvoiceDataBody> | InvoiceDataBody) {
    console.log("createNewInvoices");
    return await Invoice.create(data);
}