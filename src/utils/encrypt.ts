import crypto from "crypto";
import { queryVault } from "./apivault";
import fs from "fs";
import { Response } from "express";
const AES_VAULT_URI = process.env.AES_VAULT_URI || "";
console.log("AES_VAULT_URI: ", AES_VAULT_URI);
const ALGORITHM = "aes-256-cbc";

export const decryptVideo = async (
  path: string,
  range: string,
  res: Response,
  videoSize: number
) => {
  const keys: any = await queryVault(AES_VAULT_URI);
  const fileEncrypted = fs.readFileSync(path);

  let decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(keys.key, "base64"),
    Buffer.from(keys.iv, "base64")
  );

  let decrypted = "";
  let chunk;
  decipher.on("readable", () => {
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk;
    }
  });
  decipher.on("end", () => {
    // Prints: some clear text data
  });

  // Encrypted with same algorithm, key and iv.

  await decipher.write(fileEncrypted);
  await decipher.end();

  if (range) {
    // Parse Range
    //Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 12; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    });

    decipher.pipe(res);
  } else {
    decipher.pipe(res);
  }
};
