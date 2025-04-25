import dotenv from 'dotenv';
dotenv.config();

export const paymobConfig = {
    secretKey: process.env.PAYMOB_SECRET_KEY || '',
    publicKey: process.env.PAYMOB_PUBLIC_KEY || '',
    baseUrl: process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com',
    cardIntegrationId: Number(process.env.PAYMOB_CARD_INTEGRATION_ID) || 0,
    walletIntegrationId: Number(process.env.PAYMOB_WALLET_INTEGRATION_ID) || 0,
    webhookUrl: process.env.PAYMOB_WEBHOOK_URL || '',
    hmacKey: process.env.PAYMOB_HMAC_KEY || '',
};

