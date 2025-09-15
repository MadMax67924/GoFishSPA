import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { executeQuery } from "../mysql"

export async function getSession() {
  try {
    const token = cookies().get("authToken")?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-development-jwt-secret-key")
    const { payload } = await jwtVerify(token, secret)

    return payload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()

    if (!session || !session.userId) {
      return null
    }

    const sql = "SELECT id, name, email, role FROM users WHERE id = ?"
    const users = await executeQuery(sql, [session.userId])

    if (!Array.isArray(users) || users.length === 0) {
      return null
    }

    const user = users[0] as any

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}
