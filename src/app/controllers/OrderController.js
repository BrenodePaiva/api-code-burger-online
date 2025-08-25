import * as Yup from "yup";

import Order from "../models/Order.js";
import OrderItems from "../models/OrderItems.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

class OrderController {
  // information order
  async store(request, response) {
    const schema = Yup.object().shape({
      user: Yup.string().required(),
      products: Yup.array()
        .required()
        .of(
          Yup.object().shape({
            id: Yup.number().required(),
            price: Yup.number().required(),
            quantity: Yup.number().required(),
          })
        ),
    });

    // order is valid ?
    try {
      await schema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { user } = request.body;

    async function generateId(length) {
      const { nanoid } = await import("nanoid");
      return nanoid(length);
    }

    const orderId = await generateId(12);

    try {
      const order = await Order.create({
        id: orderId,
        user_id: user,
        status: "Pedido realizado",
      });

      const items = await Promise.all(
        request.body.products.map(async (product) => {
          const orderItems = await OrderItems.create({
            order_id: order.id,
            product_id: product.id,
            unit_price: product.price,
            quantity: product.quantity,
          });
          return orderItems;
        })
      );

      const allOrders = await Order.findOne({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name"],
          },
        ],
        where: { id: order.id },
      });

      const allItems = await OrderItems.findAll({
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name", "url", "path"],
          },
          {
            model: Order,
            as: "order",
            attributes: ["user_id"],
          },
        ],
        where: { order_id: order.id },
      });

      const io = request.app.get("io");

      io.to("kitchen").emit("new-order", {
        order: allOrders,
        items: allItems,
      });

      // io.to('kitchen').emit('updated-all-order', order)

      return response.status(200).json({ order, items });
    } catch (error) {
      return response.status(500).json(error);
    }
  }

  // ___________________________________________________________________

  // Find all prduct
  async index(request, response) {
    const { user } = request.params;
    let allOrders;
    let items;

    if (user !== "0") {
      try {
        allOrders = await Order.findAll({
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name"],
            },
          ],
          where: { user_id: user },
          order: [["created_at", "DESC"]],
        });

        items = await OrderItems.findAll({
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "url", "path"],
            },
            {
              model: Order,
              as: "order",
              attributes: ["user_id"],
            },
          ],
          where: { "$order.user_id$": user },
          order: [["created_at", "DESC"]],
        });
      } catch (error) {
        return response.status(500).json(error);
      }
    } else {
      try {
        allOrders = await Order.findAll({
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name"],
            },
          ],
          order: [["created_at", "DESC"]],
        });

        items = await OrderItems.findAll({
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "url", "path"],
            },
          ],
          order: [["created_at", "DESC"]],
        });
      } catch (error) {
        return response.status(500).json(error);
      }
    }

    return response.status(200).json({ allOrders, items });
  }

  // ____________________________________________________________________

  // Update product
  async update(request, response) {
    const { id } = request.params;
    const { status } = request.body;

    const schema = Yup.object().shape({
      status: Yup.string().required(),
    });

    try {
      await schema.validateSync(request.body);

      const hasOrder = await Order.update({ status }, { where: { id } });

      if (!hasOrder) {
        return response.status(404).json({ message: "Order not found" });
      }

      const order = await Order.findByPk(id);

      const io = request.app.get("io");
      io.to(`client-${order.user_id}`).emit("updated-order", order);

      io.to("kitchen").emit("updated-all-order", order);

      return response.json({ message: "status was updated" });
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  }

  // ____________________________________________________________________

  async del(request, response) {
    const { id } = request.params;

    try {
      await Order.destroy({ where: { id } });

      const io = request.app.get("io");

      io.to("kitchen").emit("delete-order", id);

      return response.status(200).json({ message: "Order deleted" });
    } catch (error) {
      return response.status(500).json(error);
    }
  }
}

export default new OrderController();
