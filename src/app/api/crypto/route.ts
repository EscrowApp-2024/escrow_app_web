import { NextRequest, NextResponse } from "next/server";
import { generateKeyPair } from "crypto"; // Use Node.js crypto module
import { promisify } from "util";

// Promisify the generateKeyPair function for cleaner async/await usage
const generateKeyPairAsync = promisify(generateKeyPair);

// Interface for the key pair response
interface KeyPair {
  publicKey: string; // Base64-encoded public key
  privateKey: string; // Base64-encoded private key
}

// Function to generate an ECDSA key pair (PEM format, then Base64-encoded)
async function generateKeyPairFn(): Promise<KeyPair> {
  try {
    const { publicKey, privateKey } = await generateKeyPairAsync("ec", {
      namedCurve: "P-256", // Curve for ECDSA
      publicKeyEncoding: { type: "spki", format: "pem" }, // PEM format for public key
      privateKeyEncoding: { type: "pkcs8", format: "pem" }, // PEM format for private key
    });

    // Convert the PEM keys to Base64
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

// POST handler for the /api/crypto endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body; // Expect an "action" field in the request body to determine what to do

    if (action === "generateKeyPair") {
      const keyPair = await generateKeyPairFn();
      return NextResponse.json(keyPair, { status: 200 });
    }

    // Placeholder for other actions (e.g., signing data)
    return NextResponse.json(
      { error: "Invalid action. Use 'generate' to create a key pair." },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Placeholder for the signData function (to be completed based on your instructions)
// async function signData(data: string, privateKey: string): Promise<string> {
//   // We'll implement this once you provide instructions
//   throw new Error("Sign data function not implemented yet");
// }