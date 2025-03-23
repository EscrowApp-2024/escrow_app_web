// @/lib/api_authKey_generator.ts
import { generateKeyPairSync, sign, verify } from "crypto";

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class ApiKeyGenerator {
  // Generate an ECDSA key pair using Node.js crypto
  generateKeyPair(): KeyPair {
    try {
      const { publicKey, privateKey } = generateKeyPairSync("ec", {
        namedCurve: "P-256", // Equivalent to the P-256 curve in Web Crypto
      });

      // Export keys as PEM, then convert to base64
      const publicKeyPem = publicKey.export({ type: "spki", format: "pem" });
      const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });

      const base64PublicKey = Buffer.from(publicKeyPem as string).toString("base64");
      const base64PrivateKey = Buffer.from(privateKeyPem as string ).toString("base64");

      return {
        publicKey: base64PublicKey,
        privateKey: base64PrivateKey,
      };
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${(error as Error).message}`);
    }
  }

  // Sign data with the private key using Node.js crypto
  signData(data: string, privateKey: string): string {
    try {
      // Decode the base64 private key (which is in PEM format)
      const privateKeyPem = Buffer.from(privateKey, "base64").toString("utf-8");

      // Sign the data
      const signObj = sign(undefined, Buffer.from(data), {
        key: privateKeyPem,
        dsaEncoding: "der", // Use DER encoding for compatibility
      });

      // Convert the signature to base64
      return signObj.toString("base64");
    } catch (error) {
      throw new Error(`Failed to sign data: ${(error as Error).message}`);
    }
  }

  // Verify the signature with the public key using Node.js crypto
  verifySignature(data: string, signature: string, base64PublicKey: string): boolean {
    try {
      // Decode the base64 public key (which is in PEM format)
      const publicKeyPem = Buffer.from(base64PublicKey, "base64").toString("utf-8");

      // Verify the signature
      const isValid = verify(
        undefined,
        Buffer.from(data),
        {
          key: publicKeyPem,
          dsaEncoding: "der", // Use DER encoding for compatibility
        },
        Buffer.from(signature, "base64")
      );

      return isValid;
    } catch (error) {
      throw new Error(`Failed to verify signature: ${(error as Error).message}`);
    }
  }
}

export default ApiKeyGenerator;