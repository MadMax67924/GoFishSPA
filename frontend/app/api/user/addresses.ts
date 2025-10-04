import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { addresses } = req.body

    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: "Direcciones inválidas" })
    }

    try {
      // Simulación de almacenamiento en base de datos
      console.log("Direcciones guardadas:", addresses)

      return res.status(200).json({ message: "Direcciones guardadas correctamente" })
    } catch (error) {
      console.error("Error al guardar direcciones:", error)
      return res.status(500).json({ error: "Error interno del servidor" })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Método ${req.method} no permitido`)
  }
}