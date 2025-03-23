// @/lib/authKeyGenerator.ts

// Define the return type for the key pair
interface KeyPair {
  publicKey: string;
  privateKey: string;
}

// Function to generate an ECDSA key pair using Web Crypto API
async function authKeyGenerator(): Promise<KeyPair> {
  try {
    // Generate the key pair using Web Crypto API
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256", // Same curve as in the original
      },
      true, // Extractable
      ["sign", "verify"] // Key usages
    );

    // Export the public key in SPKI format
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    // Export the private key in PKCS#8 format
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    // Convert the exported keys to Base64
    const base64PublicKey = Buffer.from(publicKey).toString("base64");
    const base64PrivateKey = Buffer.from(privateKey).toString("base64");

    return {
      publicKey: base64PublicKey,
      privateKey: base64PrivateKey,
    };
  } catch (error) {
    throw new Error(`Failed to generate key pair: ${(error as Error).message}`);
  }
}

export default authKeyGenerator;