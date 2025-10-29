import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, orderNumber, total, items } = body

    if (!email || !orderNumber || !total) {
      return NextResponse.json({ error: "Faltan datos para enviar el correo" }, { status: 400 })
    }

    // ✉️ HTML del correo
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f8fa; color: #333;">
        <h2 style="color: #005f73;">¡Gracias por tu compra en GoFish SpA, ${name || "Cliente"}! 🐟</h2>
        <p>Tu pedido fue confirmado exitosamente.</p>
        <p><b>Número de orden:</b> ${orderNumber}</p>
        <h3>Resumen de tu compra:</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th align="left" style="border-bottom: 1px solid #ddd; padding: 8px;">Producto</th>
              <th align="center" style="border-bottom: 1px solid #ddd; padding: 8px;">Cantidad</th>
              <th align="right" style="border-bottom: 1px solid #ddd; padding: 8px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${items
              ?.map(
                (item: any) => `
                  <tr>
                    <td style="padding: 8px;">${item.name}</td>
                    <td align="center" style="padding: 8px;">${item.quantity}</td>
                    <td align="right" style="padding: 8px;">$${item.price.toLocaleString("es-CL")}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 16px;"><b>Total:</b> $${total.toLocaleString("es-CL")}</p>
        <hr style="margin: 20px 0;"/>
        <p>Pronto recibirás más información cuando tu pedido sea enviado.</p>
        <p>Atentamente,<br/>El equipo de GoFish SpA</p>
      </div>
    `

    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL || "GoFish SpA <noreply@gofishspa.cl>",
      to: email,
      subject: `Confirmación de compra #${orderNumber}`,
      html: htmlContent,
    })

    console.log("✅ Correo de confirmación enviado:", response)

    return NextResponse.json({ success: true, message: "Correo enviado con éxito" })
  } catch (error: any) {
    console.error("Error al enviar correo:", error)
    return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 })
  }
}
