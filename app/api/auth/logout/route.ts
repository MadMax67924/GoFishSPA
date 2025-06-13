import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Eliminar cookie de autenticación
  cookies().set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  })

  return NextResponse.json({ success: true })
}
