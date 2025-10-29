import { MercadoPagoConfig, Preference, Payment, CardToken } from 'mercadopago';

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
});

export const mercadoPago = {
  preferences: new Preference(client),
  payments: new Payment(client),
  cards: new CardToken(client)
};

// Tipos para TypeScript
export interface PaymentPreference {
  items: Array<{
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer?: {
    email: string;
    name?: string;
    surname?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: string;
  statement_descriptor?: string;
  external_reference?: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
}

export interface CardTokenResponse {
  id: string;
  last_four_digits: string;
  expiration_month: number;
  expiration_year: number;
  cardholder: {
    name: string;
  };
  date_created: string;
}

// Crear preferencia de pago
export async function createPaymentPreference(preferenceData: PaymentPreference) {
  try {
    const preference = await mercadoPago.preferences.create({ body: preferenceData });
    return preference;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
}

// Obtener información de pago
export async function getPayment(paymentId: string) {
  try {
    const payment = await mercadoPago.payments.get({ id: paymentId });
    return payment;
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
}

// Tokenizar tarjeta para almacenamiento seguro
export async function tokenizeCard(cardData: {
  card_number: string;
  expiration_month: number;
  expiration_year: number;
  security_code: string;
  cardholder: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
}) {
  try {
    const token = await mercadoPago.cards.create({ body: cardData });
    return token;
  } catch (error) {
    console.error('Error tokenizing card:', error);
    throw error;
  }
}