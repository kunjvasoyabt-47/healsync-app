import Stripe from 'stripe';

// Initialize Stripe with your secret key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover', // Use the latest API version
  typescript: true,
});

export default stripe;