import mongoose from "mongoose";
import { IStoreAddress } from "../../_Types/Store";
import { IShippingAddress, IOrderItem } from "../../_Types/Order";

export const CreateShipment = async (
  orderId: mongoose.Types.ObjectId,
  warehouseAddress: IStoreAddress,
  userAddress: IShippingAddress,
  totalWeight: number,
  items: IOrderItem[],
  shipmentCompany: string,
  accountNumber: string,
  serviceType: string,
  session: mongoose.ClientSession,
): Promise<string> => {
  try {
    // Mock API call 
    console.log("Sending shipment request:", {
        orderId,
        warehouseAddress,
        userAddress,
        totalWeight,
        items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        })),
        shipmentCompany,
        accountNumber,
        serviceType,
        session
    });

    // Mock tracking number for now
    const mockTrackingNumber = `${shipmentCompany.toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    return mockTrackingNumber;
  } catch (error) {
    console.error("Shipment creation failed:", error);
    throw new Error("Failed to create shipment with " + shipmentCompany);
  }
};

 /*
    // Example real DHL API call (uncomment when ready)
    const axios = require('axios');
    const response = await axios.post(
      'https://api.dhl.com/shipment',
      {
        plannedShippingDateAndTime: new Date().toISOString(),
        productCode: 'EXP',
        accounts: [{ typeCode: 'shipper', number: accountNumber }],
        shipper: {
          postalAddress: {
            street: warehouseAddress.street,
            city: warehouseAddress.city,
            postalCode: warehouseAddress.postalCode,
            countryCode: warehouseAddress.country,
          },
          contactInformation: { phone: warehouseAddress.phone || '' },
        },
        receiver: {
          postalAddress: {
            street: userAddress.street,
            city: userAddress.city,
            postalCode: userAddress.postalCode,
            countryCode: userAddress.country,
          },
          contactInformation: { phone: userAddress.phone || '' },
        },
        packages: [
          {
            weight: totalWeight,
            description: items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
            items: items.map((i) => ({ description: i.name, quantity: i.quantity })),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DHL_API_KEY}`,
        },
      }
    );
    return response.data.shipmentTrackingNumber;

    interface CarrierConfig {
  endpoint: string;
  apiKeyEnv: string;
  serviceTypes: string[];
}

const CARRIERS: Record<string, CarrierConfig> = {
  DHL: {
    endpoint: "https://api.dhl.com/shipment",
    apiKeyEnv: "DHL_API_KEY",
    serviceTypes: ["EXP", "ECO"],
  },
  FedEx: {
    endpoint: "https://api.fedex.com/ship",
    apiKeyEnv: "FEDEX_API_KEY",
    serviceTypes: ["EXPRESS", "ECONOMY"],
  },
};
    */