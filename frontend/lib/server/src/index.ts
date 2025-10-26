// server/src/index.ts
import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // o global fetch según tu entorno

const app = express();
app.use(bodyParser.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-09-30.clover",
});

// Endpoint que el frontend llama para crear un PaymentIntent (ya deberías tener uno parecido)
app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency = "clp", customerEmail, metadata } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: customerEmail, // Stripe envía recibo automáticamente si está habilitado
      metadata, // aquí podemos guardar rut, tipo_documento, etc.
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando PaymentIntent" });
  }
});

/*
  Webhook para escuchar payment_intent.succeeded (o invoice.paid si usas Invoicing).
  En cuanto recibas confirmación de pago, generas la boleta electrónica:
    - Opción A: usar Stripe Invoice API para emitir algo parecido a una boleta/recibo
    - Opción B: enviar los datos al proveedor de boleta electrónica (SII)
*/
app.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;
  try {
    if (sig && webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } else {
      // Si no tienes secreto (solo para desarrollo), parsea normalmente
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.log("Payment succeeded:", pi.id);

    // Extrae metadata que el frontend haya enviado (ej: rut, tipo_documento)
    const metadata = pi.metadata || {};

    // Llamada a la función que genera la boleta electrónica (implementada abajo)
    try {
      await generateBoletaForPayment(pi, metadata);
    } catch (err) {
      console.error("Error generando boleta:", err);
      // Decide si quieres reintentar o marcar en DB
    }
  }

  // Otros eventos: invoice.paid, charge.succeeded, etc.
  res.json({ received: true });
});

/*
  Función que gestiona la generación de la boleta:
  - Si solo quieres enviar un recibo por email con Stripe: puedes crear un Invoice/InvoiceItem y finalizarla.
  - Si necesitas boleta oficial SII (Chile), aquí se muestra cómo enviar datos a un proveedor externo (ejemplo genérico).
*/
async function generateBoletaForPayment(pi: Stripe.PaymentIntent, metadata: Stripe.Metadata) {
  // Ejemplo A: crear Invoice en Stripe (opción simple)
  // Si quieres crear un invoice basado en el PaymentIntent, normalmente crearías un Customer y un Invoice.
  // Aquí suponemos que no necesitas esto y usas la opción B para SII.

  // Ejemplo B: enviar datos a PROVEEDOR_BOLETA_ELECTRONICA
  const providerUrl = process.env.EINV_PROVIDER_URL; // e.g. https://api.proveedor-ei.cl/v1/boletas
  const providerToken = process.env.EINV_PROVIDER_TOKEN;

  if (!providerUrl || !providerToken) {
    console.log("Proveedor boleta no configurado; se podría enviar recibo Stripe en su lugar.");
    return;
  }

  // Construye payload que el proveedor espera:
  const payload = {
    tipo_documento: metadata.tipo_documento || "BOLETA", // BOLETA / FACTURA
    rut_cliente: metadata.rut_cliente || "", // RUT sin dígito verificador o con DV según proveedor
    nombre_cliente: metadata.nombre_cliente || pi.receipt_email || "Consumidor",
    email: pi.receipt_email || metadata.email,
    monto: pi.amount_received ?? pi.amount, // en centavos
    moneda: pi.currency,
    referencia_pago: pi.id,
    items: [
      {
        descripcion: metadata.descripcion || "Compra en GoFishSPA",
        cantidad: 1,
        precio_unitario: pi.amount_received ?? pi.amount,
      },
    ],
    metadata: {
      stripe_payment_intent: pi.id,
    },
  };

  // Envío al proveedor (ejemplo)
  const resp = await fetch(providerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Proveedor EI error: ${resp.status} ${text}`);
  }

  const result = await resp.json();
  console.log("Boleta generada por proveedor:", result);
  // Guarda resultado en tu base de datos (folio, uuid, pdf, xml, etc.)
}

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));