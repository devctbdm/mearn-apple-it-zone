import Courier from '../models/Courier.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';
import { pathaoService } from '../services/pathaoService.js';

// @desc    List couriers (admin)
// @route   GET /api/couriers
export const listCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find().sort({ createdAt: 1 });
    res.json({ success: true, couriers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a courier (admin)
// @route   POST /api/couriers
export const createCourier = async (req, res) => {
  try {
    const { name, slug, active, description, color, config } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'name and slug are required' });
    }
    const exists = await Courier.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Courier slug already exists' });
    }
    const courier = await Courier.create({
      name,
      slug,
      active: active !== undefined ? active : true,
      description: description || '',
      color: color || '#C2410C',
      config: config || {},
    });
    res.status(201).json({ success: true, courier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a courier (admin)
// @route   PUT /api/couriers/:id
export const updateCourier = async (req, res) => {
  try {
    const { name, active, description, color, config } = req.body;
    const courier = await Courier.findById(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Courier not found' });
    }
    if (name !== undefined) courier.name = name;
    if (active !== undefined) courier.active = active;
    if (description !== undefined) courier.description = description;
    if (color !== undefined) courier.color = color;
    if (config !== undefined) courier.config = config;
    await courier.save();
    res.json({ success: true, courier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a courier (admin)
// @route   DELETE /api/couriers/:id
export const deleteCourier = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Courier not found' });
    }
    await courier.deleteOne();
    res.json({ success: true, message: 'Courier deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Best-effort: build a Pathao delivery for an order, resolving location by name.
async function createPathaoForOrder(order, user) {
  const addr = order.shippingAddress || {};
  const recipientName = order.user?.name || (user && user.name) || 'Customer';
  const recipientPhone = order.user?.phone || '';
  const recipientAddress = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');

  let cityId = null;
  let zoneId = null;
  let areaId = null;
  let cityName = '';
  let zoneName = '';
  let areaName = '';
  let stores = [];
  try {
    stores = await pathaoService.getStores();
  } catch {
    stores = [];
  }

  try {
    const cities = await pathaoService.getCities();
    const matchCity = (q) =>
      cities.find((c) => c.name && q && c.name.toLowerCase().includes(q.toLowerCase()));
    const city = matchCity(addr.city) || matchCity(addr.state);
    if (city) {
      cityId = city.id;
      cityName = city.name;
      const zones = await pathaoService.getZones(city.id);
      const hay = `${addr.street} ${addr.state} ${addr.city}`.toLowerCase();
      for (const z of zones) {
        const areas = await pathaoService.getAreas(z.id);
        const a = areas.find((ar) => hay.includes(ar.name.toLowerCase()));
        if (a) {
          zoneId = z.id;
          areaId = a.id;
          zoneName = z.name;
          areaName = a.name;
          break;
        }
      }
    }
  } catch {
    // location lookup failed — fall through to a draft
  }

  const storeId = stores.length ? stores[0].id : null;
  const base = {
    order: order._id,
    merchantOrderId: order.orderNumber || order._id.toString(),
    storeId,
    recipient: {
      name: recipientName,
      phone: recipientPhone,
      address: recipientAddress,
      cityId,
      zoneId,
      areaId,
      cityName,
      zoneName,
      areaName,
    },
    deliveryType: 48,
    itemType: 2,
    itemQuantity: 1,
    itemWeight: 0.5,
    amountToCollect: Number(order.advanceAmount || 0),
    status: 'pending',
  };

  // If we have everything, try to create the real Pathao consignment.
  if (cityId && zoneId && areaId && storeId) {
    try {
      const payload = {
        store_id: storeId,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        recipient_city: cityId,
        recipient_zone: zoneId,
        recipient_area: areaId,
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: Number(order.advanceAmount || 0),
        merchant_order_id: base.merchantOrderId,
      };
      const pathaoData = await pathaoService.createOrder(payload);
      const consignmentId = pathaoData?.consignment_id || pathaoData?.consignmentId || '';
      const pathaoStatus = pathaoData?.order_status || 'Pending';
      const delivery = await Delivery.create({
        ...base,
        consignmentId,
        pathaoStatus,
        history: [{ status: 'pending', note: `Auto-created (${pathaoStatus})` }],
        createdBy: user?._id || null,
      });
      return { autoCreated: true, delivery, needsLocation: false };
    } catch (e) {
      const delivery = await Delivery.create({
        ...base,
        consignmentId: '',
        history: [
          { status: 'pending', note: 'Draft — Pathao create failed; complete in Delivery Management' },
        ],
        createdBy: user?._id || null,
      });
      return {
        autoCreated: false,
        delivery,
        needsLocation: true,
        message: 'Created draft; complete zone/area in Delivery Management.',
      };
    }
  }

  // Not enough location info — create a draft for the admin to complete.
  const delivery = await Delivery.create({
    ...base,
    consignmentId: '',
    history: [{ status: 'pending', note: 'Draft — complete location in Delivery Management' }],
    createdBy: user?._id || null,
  });
  return {
    autoCreated: false,
    delivery,
    needsLocation: true,
    message: 'Location not auto-resolved; complete in Delivery Management.',
  };
}

// @desc    Assign a courier to an order. For Pathao, best-effort auto-creates a delivery.
// @route   POST /api/orders/:id/courier
export const assignCourier = async (req, res) => {
  try {
    const { courier: slug } = req.body;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Courier slug is required' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name phone email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.courier = slug;
    order.orderStatus = 'send_courier';
    await order.save();

    if (slug !== 'pathao') {
      return res.json({
        success: true,
        order,
        autoCreated: false,
        message: `Courier set to ${slug}`,
      });
    }

    const result = await createPathaoForOrder(order, req.user);
    return res.json({ success: true, order, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
