const productsRoutes = require("./products");
const cartRoutes = require("./cart");
const authRoutes = require("./auth");
const supplyChainRoutes = require("./supplyChain");
const addressesRoutes = require("./addresses");
const ordersRoutes = require("./orders");
const reviewsRoutes = require("./reviews");

function routes(app) {
  app.use("/api/products", productsRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/supply-chain", supplyChainRoutes);
  app.use("/api/addresses", addressesRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/reviews", reviewsRoutes);
}

module.exports = routes;
