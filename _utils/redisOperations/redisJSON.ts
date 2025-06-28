import redis from "../../_config/redis";
import { REDIS_LONG_TTL, REDIS_SHORT_TTL } from "../../_data/constants";

export async function setJSON(key: string, data: any) {
  try {
    await redis.call("JSON.SET", key, "$", JSON.stringify({ ...data }));

    await redis.expire(key, 300);
  } catch (error) {
    console.log("setJSON", error);
  }
}
export async function getJSON(key: string, path?: `$.${string}`) {
  const resultString = (await redis.call("JSON.GET", key, path ?? "$")) as any;

  return JSON.parse(resultString);
}

export async function deleteJSON(key: string) {
  await redis.call("JSON.CLEAR ", key, "$");
}

/*
  {
    "productsPerStore": [{
        "storeId": "68496b905d52a02a2146e19c",
        "products": [
            {
                "productId": "684ac4c648085d1348231248",
                "quantity": 1,
                "unitPrice": 12.99,
                "productTotal": 12.99
            },
            {
                "productId": "684ac76f9e4ba6351f4fa887",
                "quantity": 2,
                "unitPrice": 12.99,
                "productTotal": 25.98
            },
            {
                "productId": "684ac6ed0d7b4453cf566bc5",
                "quantity": 2 ,
                "unitPrice":12.99 ,
                "productTotal":25.98
            }
        ]
    }, {
        "storeId": "684972e2682e1eae8bbe4026",
        "products": [
            {
                "productId": "684ac4c648085d1348231248",
                "quantity": 1,
                "unitPrice": 12.99,
            },
        ]
    }],
    "invoiceTotal": 77.49,
    "status": "successful",
*/