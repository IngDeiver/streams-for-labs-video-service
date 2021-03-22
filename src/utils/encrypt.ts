import crypto from "crypto";
import { queryVault } from "./apivault";
import fs from "fs";
import { Response } from "express";
const AES_VAULT_URI = process.env.AES_VAULT_URI || "";
console.log("AES_VAULT_URI: ", AES_VAULT_URI);
const ALGORITHM = "aes-256-cbc";

export const encryptAndSaveFile = async (file: Buffer, path: string) => {
  console.log("File to encrypt: ", file);
  const keys: any = await queryVault(AES_VAULT_URI);

  let cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(keys.key, "base64"),
    Buffer.from(keys.iv, "base64")
  );
  let encrypted = cipher.update(file);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  fs.writeFileSync(path, encrypted);
  return encrypted;
};

export const decryptFile = async (path: string) => {
  const keys: any = await queryVault(AES_VAULT_URI);

  const fileEncrypted = fs.readFileSync(path);
  console.log("File to decrypt: ", fileEncrypted);

  let decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(keys.key, "base64"),
    Buffer.from(keys.iv, "base64")
  );
  let decrypted = decipher.update(fileEncrypted);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
};

export const decryptVideo = async (
  path: string,
  range: string,
  res: Response,
  videoSize: number
) => {
  const keys: any = await queryVault(AES_VAULT_URI);
  const fileEncrypted = fs.createReadStream(path);

  let decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(keys.key, "base64"),
    Buffer.from(keys.iv, "base64")
  );

  if (range) {
    // Parse Range
    // Example: "bytes=32324-"
    // const CHUNK_SIZE = 10 ** 6; // 1MB
    // const start = Number(range.replace(/\D/g, ""));
    // const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // // Create headers
    // const contentLength = end - start + 1;
    // res.set({
    //   "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    //   "Accept-Ranges": "bytes",
    //   "Content-Length": contentLength,
    //   "Content-Type": "video/mp4",
    // });

    fileEncrypted.pipe(decipher).pipe(res);
  } else {
    fileEncrypted.pipe(decipher).pipe(res);
  }
};
