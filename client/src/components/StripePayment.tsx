import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { stripeService } from '../services/stripeService';

// Only load Stripe if the publishable key is properly configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && stripeKey !== 'pk_test_your_key_here' ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  amount: string;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({ amount, currency, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const { clientSecret } = await stripeService.createPaymentIntent(amount, currency);
        setClientSecret(clientSecret);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, currency, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        onError(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
        toast({
          title: 'Payment Successful',
          description: `Successfully processed payment of ${amount} ${currency.toUpperCase()}`,
        });
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-gray-300 mb-2 block">Card Information</Label>
        <div className="p-3 border border-gray-600 rounded-lg bg-gray-700">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        <p>Amount: {amount} {currency.toUpperCase()}</p>
        <p className="mt-1">Your payment is secured by Stripe</p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? 'Processing...' : `Pay ${amount} ${currency.toUpperCase()}`}
      </Button>
    </form>
  );
}

interface StripePaymentProps {
  amount: string;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function StripePayment({ amount, currency, onSuccess, onError }: StripePaymentProps) {
  // If Stripe is not configured, show a message
  if (!stripePromise) {
    return (
      <div className="text-center p-4 text-gray-400">
        <p>Credit card payments are currently unavailable.</p>
        <p className="text-sm mt-2">Please use cryptocurrency deposits instead.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
