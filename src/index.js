const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const route = require("./routes");
const corsOptions = require("./config/corsOptions"); 

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "DNC-Trace Backend is running!" });
}); 

route(app); // Sử dụng route từ thư mục routes.js

app.listen(PORT, () => {
  console.log(`Server dang chay tai: http://localhost:${PORT}`);
});

module.exports = app;
