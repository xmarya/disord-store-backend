import { promisify } from "util";

import { gzip, gunzip } from "zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export async function compressJSON(data: object): Promise<string> {
  const stringifiedData = JSON.stringify(data);
  const compressed = await gzipAsync(stringifiedData);
  return compressed.toString("base64");
}


export async function decompressJSON(compressedData: string):Promise<object> {
    const buffer = Buffer.from(compressedData, "base64");
    const decompressed = await gunzipAsync(buffer);
    const originalData = JSON.parse(decompressed.toString());

    return originalData;
}

