import stripe from "../config/stripe";

export const stripeService = {
  createCheckoutSession: async (appointmentId: string, amount: number, customerEmail: string) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
          price_data: {
            currency: "inr",
            product_data: { name: "Doctor Consultation Fee" },
            unit_amount: amount * 100, // Stripe uses paise
          },
          quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: customerEmail,
      client_reference_id: appointmentId, // 🟢 Links payment to Appointment ID
      
      // 🟢 EXPIRES IN 3 HOURS: Current time + (3 * 3600 seconds)
      expires_at: Math.floor(Date.now() / 1000) + (3 * 60 * 60), 
    });

    return session;
  }
};