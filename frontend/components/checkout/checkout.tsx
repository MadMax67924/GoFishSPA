import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [rut, setRut] = useState("");
  const [docType, setDocType] = useState("BOLETA"); // BOLETA or FACTURA
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/checkout-success",
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      // El webhook del servidor gestionará la generación de la boleta.
      alert("Pago iniciado. Si todo sale bien, recibirás boleta por email o se generará vía SII.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT (sin puntos - con dígito)" />
      <select value={docType} onChange={(e) => setDocType(e.target.value)}>
        <option value="BOLETA">Boleta</option>
        <option value="FACTURA">Factura</option>
      </select>

      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pagar y solicitar boleta</button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Llamar endpoint backend para crear PaymentIntent y devolver client_secret
  React.useEffect(() => {
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000, // en la unidad menor (ej CLP centavos)
        currency: "clp",
        customerEmail: "cliente@ejemplo.cl",
        metadata: {
          // Podrías enviar rut, docType aquí si ya los recogiste antes de crear el PI
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <div>Preparando pago...</div>;

  const options = { clientSecret };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}