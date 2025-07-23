import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe('sk_test_51RmUqCAc6iSEn4j4biSI0vfVxife2xgdltiGt9WVQtGPcahBTb10PGxN7jSteoZ8LaRLorE3ZLtKhPw1YPy3W4Wk00UjDbFH7i'); // test secret key

router.post('/create-checkout-session', async (req, res) => {
  const { amount, reservationId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Room Booking' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/properties/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
      metadata: {
        reservationId: String(reservationId),
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stripe-session', async (req, res) => {
  const { session_id } = req.query;
  console.log('Received /stripe-session request with session_id:', session_id);
  if (!session_id) return res.status(400).json({ message: 'session_id required' });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Fetched Stripe session:', session);
    // Fallback: treat status 'complete' as paid if payment_status is not set
    let isPaid = session.payment_status === 'paid';
    if (!isPaid && session.status === 'complete') {
      isPaid = true;
      console.log('Treating session.status="complete" as paid');
    }
    res.json({
      status: isPaid ? 'paid' : session.payment_status,
      reservationId: session.metadata ? session.metadata.reservationId : undefined,
    });
  } catch (e) {
    console.error('Error fetching Stripe session:', e);
    res.status(500).json({ message: 'Error fetching session', error: e.message });
  }
});

export default router; 