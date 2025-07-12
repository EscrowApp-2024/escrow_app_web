import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
const crypto = require("crypto");

// Helper function to construct the backend URL with query parameters
const getBackendUrl = (path: string[]) => `http://localhost:8000/${path.join("/")}`;


// Proxy handler for all methods
async function proxyRequest(request: NextRequest, path: string[]) {
  console.log(request.url, "hello");
  // Get query parameters from the request
  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  const url = getBackendUrl(path);
  // Prepare headers (remove problematic ones like 'host')
  const headers = {
    ...Object.fromEntries(request.headers.entries()),
    host: undefined, // Avoid host header issues
    "content-type": "application/json",
  };

  try {
    const response = await axios({
      method: request.method,
      url,
      // Pass query params explicitly for GET requests
      params: request.method === "GET" || request.method === "HEAD" 
        ? Object.fromEntries(searchParams) 
        : undefined,
      data: request.method !== "GET" && request.method !== "HEAD"
        ? (request.headers.get("content-length") && Number(request.headers.get("content-length")) > 0
            ? await request.json()
            : undefined)
        : undefined,
      headers,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.log(error);
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;
    const data = axiosError.response?.data || { 
      message: "An unexpected server error occurred. Please try again later or contact support if the issue persists.", 
      error: error 
    };
    return NextResponse.json(data, { status });
  }
}

// Define all HTTP methods
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return await proxyRequest(request, path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return await proxyRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return await proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return await proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path);
}

export async function HEAD(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path);
}

export async function OPTIONS(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path);
}