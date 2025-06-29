import { InvoiceDataBody } from "../../_Types/Invoice";
import Invoice from "../../models/invoiceModel";

// this service is for saving all invoices per day at once to the db
export async function createNewInvoices(data:Array<InvoiceDataBody> | InvoiceDataBody) {
    console.log("createNewInvoices");
    return await Invoice.create(data);
}