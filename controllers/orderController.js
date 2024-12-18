import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// @desc     Créer une nouvelle commande
// @method   POST
// @endpoint /api/v1/orders
// @access   Private
const addOrderItems = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!req.user) {
      res.status(401);
      throw new Error('User is not authenticated');
    }

    const taxPrice = 0;

    if (!cartItems || cartItems.length === 0) {
      res.status(400);
      throw new Error('No order items.');
    }

    const calculatedTotalPrice = totalPrice || itemsPrice + shippingPrice + taxPrice;

    const order = new Order({
      user: req.user._id,  // Ensure we use req.user which is set by the protect middleware
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: calculatedTotalPrice,
    });

    const createdOrder = await order.save({ session });

    // Réduire le stock des produits commandés
    for (const item of cartItems) {
      const product = await Product.findById(item._id).session(session);
      if (!product) {
        throw new Error(`Product with id ${item._id} not found`);
      }

      // Vérifier la quantité en stock
      if (product.countInStock < item.qty) {
        throw new Error(`Not enough stock for ${product.name}. Available stock: ${product.countInStock}`);
      }

      // Réduire le stock
      product.countInStock -= item.qty;
      await product.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc     Supprimer une commande
// @method   DELETE
// @endpoint /api/v1/orders/:id
// @access   Private (admin)
const deleteOrder = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found!' });
    }

    // Only allow deletion if the user is an admin or the owner of the order
    if (req.user.isAdmin || order.user.toString() === req.user._id.toString()) {
      await order.deleteOne();
      return res.status(200).json({ message: 'Order deleted successfully' });
    }

    return res.status(403).json({ message: 'You are not authorized to delete this order' });
  } catch (error) {
    next(error);
  }
};

// @desc     Obtenir toutes les commandes
// @method   GET
// @endpoint /api/v1/orders
// @access   Private (admin)
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'id name');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc     Obtenir les commandes de l'utilisateur connecté
// @method   GET
// @endpoint /api/v1/orders/my-orders
// @access   Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('user', 'id name');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc     Mettre à jour la commande pour la marquer comme payée
// @method   PUT
// @endpoint /api/v1/orders/:id/pay
// @access   Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { paidAt, paymentId, email } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    order.isPaid = true;
    order.paidAt = paidAt ? new Date(paidAt) : new Date();
    order.paymentResult = {
      paymentId,
      status: 'paid',
      email_address: email,
    };

    const updatedOrder = await order.save();

    const deliveryDate = new Date(updatedOrder.paidAt);
    deliveryDate.setDate(deliveryDate.getDate() + 1);

    updatedOrder.isDelivered = true;
    updatedOrder.deliveredAt = deliveryDate;

    const finalUpdatedOrder = await updatedOrder.save();

    res.status(200).json(finalUpdatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Mettre à jour la commande pour la marquer comme livrée
// @method   PUT
// @endpoint /api/v1/orders/:id/deliver
// @access   Private (admin)
const updateOrderToDeliver = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { deliveredAt } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      res.statusCode = 404;
      throw new Error('Order not found!');
    }

    order.isDelivered = true;
    order.deliveredAt = deliveredAt ? new Date(deliveredAt) : new Date();

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc     Obtenir une commande par ID
// @method   GET
// @endpoint /api/v1/orders/:id
// @access   Private
const getOrderById = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found!');
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export {
  addOrderItems,
  deleteOrder,
  getOrders,
  getMyOrders,
  updateOrderToPaid,
  updateOrderToDeliver,
  getOrderById,
};
