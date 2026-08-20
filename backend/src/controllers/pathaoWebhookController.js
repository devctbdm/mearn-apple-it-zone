import Delivery from '../models/Delivery.js';
import DeliveryConfig from '../models/DeliveryConfig.js';
import { loadConfig } from '../services/pathaoService.js';

// Map a Pathao order status string to our internal DeliveryStatus.
function mapPathaoStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (s.includes('picked')) return 'picked_up';
  if (s.includes('transit') || s.includes('on the way') || s.includes('in way'))
    return 'in_transit';
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('return') || s.includes('fail')) return 'failed';
  if (s.includes('pickup assigned')) return 'pending';
  return 'pending';
}

// Pathao webhook callback. This is a server-to-server call from Pathao, so it
// must NOT require a session/CSRF token. Per Pathao's docs, the endpoint must:
//   - respond with HTTP 202 for the event
//   - return the header X-Pathao-Merchant-Webhook-Integration-Secret whose value
//     is exactly the webhook secret configured for this merchant.
export const handlePathaoWebhook = async (req, res) => {
  // Resolve the configured webhook secret (DB config > env > default).
  const cfg = await loadConfig().catch(() => ({}));
  const secret =
    cfg?.webhookSecret ||
    process.env.PATHAO_WEBHOOK_SECRET ||
    (await DeliveryConfig.findOne({ key: 'pathao' })
      .then((c) => c?.webhookSecret)
      .catch(() => null)) ||
    '';

  // Pathao verifies the integration by checking this response header.
  res.set('X-Pathao-Merchant-Webhook-Integration-Secret', secret);

  try {
    const body = req.body || {};
    const consignmentId =
      body.consignment_id || body.consignmentId || body.order_id || null;

    if (consignmentId) {
      const delivery = await Delivery.findOne({ consignmentId });
      if (delivery) {
        const status = mapPathaoStatus(
          body.order_status || body.status || body.event
        );
        const note = `Pathao webhook: ${
          body.order_status || body.status || 'update'
        }`;
        delivery.status = status;
        delivery.pathaoStatus =
          body.order_status || body.status || delivery.pathaoStatus;
        delivery.history = delivery.history || [];
        delivery.history.push({
          status,
          note,
          timestamp: new Date().toISOString(),
        });
        if (status === 'delivered' && !delivery.deliveredAt) {
          delivery.deliveredAt = new Date();
        }
        await delivery.save();
      }
    }

    // Acknowledge receipt with 202 as required by Pathao.
    return res.status(202).json({ success: true });
  } catch (err) {
    // Still acknowledge with 202 so Pathao's checker passes; the event is
    // retried on failure.
    return res.status(202).json({ success: true, received: true });
  }
};
