import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();
  const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

  const JWT_CREDENTIAL = jwt.sign(
    { data: apiKey },
    JWT_SECRET,
    { expiresIn: "90h" }
  );

  const response = NextResponse.json({ message: "Token generated" });

  response.cookies.set({
    name: "credential",
    value: JWT_CREDENTIAL,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 90 * 60 * 60, 
  });

  return response;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("credential")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ token, decoded });
  } catch (err) {
    console.log(err);
    
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Token deleted" });
  
  response.cookies.delete("credential");
  
  return response;
}
