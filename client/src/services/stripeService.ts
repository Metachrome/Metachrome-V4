import { loadStripe, Stripe } from '@stripe/stripe-js';

class StripeService {
  private stripe: Promise<Stripe | null>;
  private publishableKey: string;

  constructor() {
    // In production, this should come from environment variables
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

    // Only initialize Stripe if we have a valid publishable key
    if (this.publishableKey && this.publishableKey !== 'pk_test_your_key_here') {
      this.stripe = loadStripe(this.publishableKey);
    } else {
      this.stripe = Promise.resolve(null);
    }
  }

  async createPaymentIntent(amount: string, currency: string) {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod?: any) {
    try {
      const stripe = await this.stripe;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/wallet?payment=success`,
        },
        ...(paymentMethod && { paymentMethod })
      });

      return result;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  async createPaymentMethod(cardElement: any) {
    try {
      const stripe = await this.stripe;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      return paymentMethod;
    } catch (error) {
      console.error('Payment method creation failed:', error);
      throw error;
    }
  }

  async getStripe() {
    return await this.stripe;
  }
}

export const stripeService = new StripeService();
