import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import { pathaoService } from '../services/pathaoService.js';

// Map a raw Pathao status string to our local delivery status.
export function mapPathaoStatus(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('deliver') && s.includes('fail')) return 'failed';
  if (s.includes('exception') || s.includes('return')) return 'failed';
  if (s.includes('delivered')) return 'delivered';
  if (s.includes('in_transit') || s.includes('transit')) return 'in_transit';
  if (s.includes('pick') && (s.includes('up') || s.includes('ed'))) return 'picked_up';
  if (s.includes('picked')) return 'picked_up';
  return 'pending';
}

// @desc    List deliveries (admin)
// @route   GET /api/deliveries
export const listDeliveries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { consignmentId: { $regex: q, $options: 'i' } },
        { merchantOrderId: { $regex: q, $options: 'i' } },
        { 'recipient.name': { $regex: q, $options: 'i' } },
        { 'recipient.phone': { $regex: q, $options: 'i' } },
      ];
    }
    const deliveries = await Delivery.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single delivery
// @route   GET /api/deliveries/:id
export const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a delivery via Pathao
// @route   POST /api/deliveries
export const createDelivery = async (req, res) => {
  try {
    const b = req.body;
    const recipient = b.recipient || {};
    if (!recipient.name || !recipient.phone || !recipient.address) {
      return res
        .status(400)
        .json({ success: false, message: 'Recipient name, phone and address are required' });
    }
    if (recipient.cityId == null || recipient.zoneId == null || recipient.areaId == null) {
      return res
        .status(400)
        .json({ success: false, message: 'Please select city, zone and area' });
    }

    const storeId = Number(b.storeId);
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'A Pathao store is required' });
    }

    let order = null;
    if (b.orderId) {
      order = await Order.findById(b.orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Linked order not found' });
      }
    }

    const merchantOrderId =
      b.merchantOrderId || (order ? order.orderNumber || order._id.toString() : `DLV-${Date.now()}`);

    const payload = {
      store_id: storeId,
      recipient_name: recipient.name,
      recipient_phone: recipient.phone,
      recipient_address: recipient.address,
      recipient_city: Number(recipient.cityId),
      recipient_zone: Number(recipient.zoneId),
      recipient_area: Number(recipient.areaId),
      delivery_type: Number(b.deliveryType || 48),
      item_type: Number(b.itemType || 2),
      item_quantity: Number(b.itemQuantity || 1),
      item_weight: Number(b.itemWeight || 0.5),
      amount_to_collect: Number(b.amountToCollect || 0),
      merchant_order_id: merchantOrderId,
    };
    if (recipient.secondaryPhone) payload.recipient_secondary_phone = recipient.secondaryPhone;
    if (b.specialInstruction) payload.special_instruction = b.specialInstruction;
    if (b.itemDescription) payload.item_description = b.itemDescription;

    let pathaoData;
    try {
      pathaoData = await pathaoService.createOrder(payload);
    } catch (e) {
      return res.status(e.status || 502).json({
        success: false,
        message: e.message || 'Failed to create Pathao order',
        raw: e.raw,
      });
    }

    const consignmentId = pathaoData?.consignment_id || pathaoData?.consignmentId || '';
    const pathaoStatus = pathaoData?.order_status || 'Pending';
    const localStatus = mapPathaoStatus(pathaoStatus);

    const delivery = await Delivery.create({
      order: order ? order._id : null,
      consignmentId,
      merchantOrderId,
      storeId,
      recipient: {
        name: recipient.name,
        phone: recipient.phone,
        secondaryPhone: recipient.secondaryPhone || '',
        address: recipient.address,
        cityId: Number(recipient.cityId),
        zoneId: Number(recipient.zoneId),
        areaId: Number(recipient.areaId),
        cityName: recipient.cityName || '',
        zoneName: recipient.zoneName || '',
        areaName: recipient.areaName || '',
      },
      deliveryType: Number(b.deliveryType || 48),
      itemType: Number(b.itemType || 2),
      itemQuantity: Number(b.itemQuantity || 1),
      itemWeight: Number(b.itemWeight || 0.5),
      amountToCollect: Number(b.amountToCollect || 0),
      specialInstruction: b.specialInstruction || '',
      itemDescription: b.itemDescription || '',
      status: localStatus,
      pathaoStatus,
      deliveryFee: Number(pathaoData?.delivery_fee || 0),
      history: [{ status: localStatus, note: `Created (${pathaoStatus})` }],
      createdBy: req.user?._id || null,
    });

    // Move the linked order to "send_courier" (handed to courier).
    if (order && order.orderStatus !== 'cancelled') {
      order.orderStatus = 'send_courier';
      await order.save();
    }

    res.status(201).json({ success: true, delivery, pathao: pathaoData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Manually update a delivery's local status
// @route   PUT /api/deliveries/:id/status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['pending', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    delivery.status = status;
    delivery.history.push({ status, note: note || 'Manual update' });
    await delivery.save();
    res.json({ success: true, delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Refresh a delivery's status from Pathao
// @route   POST /api/deliveries/:id/track
export const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (!delivery.consignmentId) {
      return res.status(400).json({ success: false, message: 'No consignment id to track' });
    }
    let info;
    try {
      info = await pathaoService.getOrderInfo(delivery.consignmentId);
    } catch (e) {
      return res.status(e.status || 502).json({
        success: false,
        message: e.message || 'Failed to fetch Pathao status',
        raw: e.raw,
      });
    }
    const rawStatus = info?.order_status || info?.status || delivery.pathaoStatus;
    const localStatus = mapPathaoStatus(rawStatus);
    delivery.pathaoStatus = rawStatus;
    if (localStatus !== delivery.status) {
      delivery.status = localStatus;
      delivery.history.push({ status: localStatus, note: `Pathao: ${rawStatus}` });
    }
    if (info?.delivery_fee) delivery.deliveryFee = Number(info.delivery_fee);
    await delivery.save();
    res.json({ success: true, delivery, pathao: info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complete a draft delivery (empty consignment) by sending it to Pathao
// @route   POST /api/deliveries/:id/push
export const pushDraft = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (delivery.consignmentId) {
      return res
        .status(400)
        .json({ success: false, message: 'Delivery already has a consignment' });
    }
    const { storeId, cityId, zoneId, areaId, cityName, zoneName, areaName } = req.body;
    if (!storeId || !cityId || !zoneId || !areaId) {
      return res
        .status(400)
        .json({ success: false, message: 'storeId, cityId, zoneId and areaId are required' });
    }

    const r = delivery.recipient;
    const payload = {
      store_id: Number(storeId),
      recipient_name: r.name,
      recipient_phone: r.phone,
      recipient_address: r.address,
      recipient_city: Number(cityId),
      recipient_zone: Number(zoneId),
      recipient_area: Number(areaId),
      delivery_type: Number(delivery.deliveryType || 48),
      item_type: Number(delivery.itemType || 2),
      item_quantity: Number(delivery.itemQuantity || 1),
      item_weight: Number(delivery.itemWeight || 0.5),
      amount_to_collect: Number(delivery.amountToCollect || 0),
      merchant_order_id: delivery.merchantOrderId,
    };

    let pathaoData;
    try {
      pathaoData = await pathaoService.createOrder(payload);
    } catch (e) {
      return res
        .status(e.status || 502)
        .json({ success: false, message: e.message || 'Failed to create Pathao order', raw: e.raw });
    }

    delivery.storeId = Number(storeId);
    delivery.recipient.cityId = Number(cityId);
    delivery.recipient.zoneId = Number(zoneId);
    delivery.recipient.areaId = Number(areaId);
    if (cityName) delivery.recipient.cityName = cityName;
    if (zoneName) delivery.recipient.zoneName = zoneName;
    if (areaName) delivery.recipient.areaName = areaName;
    delivery.consignmentId = pathaoData?.consignment_id || pathaoData?.consignmentId || '';
    delivery.pathaoStatus = pathaoData?.order_status || 'Pending';
    delivery.status = mapPathaoStatus(delivery.pathaoStatus);
    delivery.deliveryFee = Number(pathaoData?.delivery_fee || 0);
    delivery.history.push({ status: delivery.status, note: `Pushed to Pathao (${delivery.pathaoStatus})` });
    await delivery.save();

    res.json({ success: true, delivery, pathao: pathaoData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Pathao address / store lookups (admin)
export const pathaoStores = async (req, res) => {
  try {
    const stores = await pathaoService.getStores();
    res.json({ success: true, stores });
  } catch (e) {
    res.status(e.status || 502).json({ success: false, message: e.message, raw: e.raw });
  }
};

export const pathaoCities = async (req, res) => {
  try {
    const cities = await pathaoService.getCities();
    res.json({ success: true, cities });
  } catch (e) {
    res.status(e.status || 502).json({ success: false, message: e.message, raw: e.raw });
  }
};

export const pathaoZones = async (req, res) => {
  try {
    const cities = await pathaoService.getZones(req.params.cityId);
    res.json({ success: true, cities });
  } catch (e) {
    res.status(e.status || 502).json({ success: false, message: e.message, raw: e.raw });
  }
};

export const pathaoAreas = async (req, res) => {
  try {
    const areas = await pathaoService.getAreas(req.params.zoneId);
    res.json({ success: true, areas });
  } catch (e) {
    res.status(e.status || 502).json({ success: false, message: e.message, raw: e.raw });
  }
};
