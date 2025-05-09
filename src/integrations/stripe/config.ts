
// Configuration Stripe pour le frontend
export const STRIPE_PUBLIC_KEY = "pk_test_51XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// URLs pour les redirection après paiement
export const getPaymentUrls = () => {
  const origin = window.location.origin;
  return {
    successUrl: `${origin}/payment-success`,
    cancelUrl: `${origin}/payment-canceled`
  };
};
