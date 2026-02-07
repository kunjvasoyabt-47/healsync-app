import { Request, Response } from "express";
import stripe from "../config/stripe";
import * as PaymentService from "../services/payment.service";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    // 🟢 Security: Construct the event using the RAW body
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(` Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🟢 Handle the 'checkout.session.completed' event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Retrieve the IDs we passed during session creation
    const appointmentId = session.client_reference_id;
    const stripeSessionId = session.id;

    if (!appointmentId) {
      console.error(" No appointmentId found in session metadata");
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      await PaymentService.fulfillOrderService(stripeSessionId, appointmentId);
      console.log(`✅ Appointment ${appointmentId} confirmed and paid.`);
    } catch (error) {
      console.error(` Database Update Error:`, error);
      // Return 500 so Stripe retries later if your DB is down
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  else if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;
    const appointmentId = session.client_reference_id;

    try {
      // Create this function in your PaymentService (see below)
      await PaymentService.cancelExpiredOrderService(appointmentId);
      console.log(`❌ Appointment ${appointmentId} cancelled due to expiry.`);
    } catch (error) {
      console.error(`Database Update Error (Expiry):`, error);
    }
  }

  // Return a 200 to Stripe to stop them from retrying
  res.status(200).json({ received: true });
};