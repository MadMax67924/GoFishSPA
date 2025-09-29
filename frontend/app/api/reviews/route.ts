import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

//Consigue el nombre del archivo, ingresa a los archivos internos la imagen como un FILE y despues devuelve la url del archivo
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const fileName = `${Date.now()}-${file.name}`
  const filePath = path.join(process.cwd(), "public", "reviews", fileName)

  await writeFile(filePath, buffer)

  return NextResponse.json({ url: `/reviews/${fileName}` })
}