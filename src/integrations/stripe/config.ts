
// Configuration Stripe pour le frontend
export const STRIPE_PUBLIC_KEY = "pk_test_51RDpdtQKGqePiKGPc6P7yMe6HGfG3QWRRZ2L8uk3UhDJSpXfZHNZ5USiHqpqnCk3D3BMgCzxtUv76n7QtdimpU9V00XhM9LCHR";

// URLs pour les redirection après paiement
export const getPaymentUrls = () => {
  const origin = window.location.origin;
  return {
    successUrl: `${origin}/payment-success`,
    cancelUrl: `${origin}/payment-canceled`
  };
};
