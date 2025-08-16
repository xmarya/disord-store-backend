import crypto from "crypto";
import { paymobWebhookSchema } from "../externals/paymob/zodSchemas/paymnetSchema";
import { paymobConfig } from "../_config/config";

const PAYMOB_HMAC_KEY = paymobConfig.hmacKey;

export const generateHmacString = (data: any): string => {
  const obj = data.obj || {};
  const order = obj.order || {};
  const sourceData = obj.source_data || {};

  return [
    obj.amount_cents ?? "",
    obj.created_at ?? "",
    obj.currency ?? "",
    obj.error_occured ?? false,
    obj.has_parent_transaction ?? false,
    obj.id ?? "",
    obj.integration_id ?? "",
    obj.is_3d_secure ?? false,
    obj.is_auth ?? false,
    obj.is_capture ?? false,
    obj.is_refunded ?? false,
    obj.is_standalone_payment ?? false,
    obj.is_voided ?? false,
    order.id ?? "",
    obj.owner ?? "",
    obj.pending ?? false,
    sourceData.pan ?? "",
    sourceData.sub_type ?? "",
    sourceData.type ?? "",
    obj.success ?? false,
  ].join("");
};

export const verifyPaymobHmac = (data: any, receivedHmac: string): boolean => {
  const hmacString = generateHmacString(data);
  return crypto.createHmac("sha512", PAYMOB_HMAC_KEY).update(hmacString).digest("hex") === receivedHmac;
};

export const validatePaymobWebhook = (data: unknown) => {
  return paymobWebhookSchema.parse(data);
};
