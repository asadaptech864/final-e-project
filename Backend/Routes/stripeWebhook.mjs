import express from 'express';
import Stripe from 'stripe';
import Reservation from '../Modals/ReservationModal.mjs';
import Notification from '../Modals/NotificationModal.mjs';

const router = express.Router();
const stripe = new Stripe('sk_test_51RmUqCAc6iSEn4j4BlS1f0vFxife2xgdltiGt9WuQtGCPcahBTb1GpGxN7jsteoZ8LaRLorE3ZLtKhPw1YPy3W4Wk90UjDbFH7i'); // test secret key

// Use environment variable for webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'your_webhook_secret_here';

router.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('Stripe webhook endpoint hit');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata.reservationId;
    console.log('Webhook received for reservationId:', reservationId);
    if (reservationId) {
      try {
        const result = await Reservation.findOneAndUpdate(
          { reservationId },
          { status: 'Confirmed' }
        );
        if (result) {
          console.log('Reservation confirmed for:', reservationId);
          
          // Create notification for successful payment
          try {
            await Notification.create({
              userId: result.guestId,
              type: 'reservation',
              message: `Payment successful! Reservation ${reservationId} has been confirmed.`,
              data: { 
                reservationId, 
                status: 'Confirmed',
                roomId: result.room,
                checkin: result.checkin,
                checkout: result.checkout,
                price: result.price
              },
            });
          } catch (e) {
            console.error('Notification creation error:', e);
          }
        } else {
          console.log('No reservation found for:', reservationId);
        }
      } catch (e) {
        console.error('Error updating reservation status:', e);
      }
    } else {
      console.log('No reservationId found in session metadata.');
    }
  }

  res.json({received: true});
});

export default router; 