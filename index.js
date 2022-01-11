// Initialize library
const express = require("express");
const cors = require("cors");
const bearerToken = require("express-bearer-token");
require("dotenv").config();

const app = express();

// Initialize cors
app.use(cors());

// Initialize body parser
app.use(express.json());

// Initialize bearer token
app.use(bearerToken());

app.use(express.static("Public"));

// Initialize port
const PORT = 2003;

// Import Router
const UserRouter = require("./Routers/UserRouters");
const CartRouters = require("./Routers/CartRouters");
const TransactionRouter = require("./Routers/TransactionRouters");
const UploaderRouter = require("./Routers/UploaderRouter");

app.get("/", (req, res) => {
  res.status(200).send("<h1>Group 3 - Warehouse System API</h1>");
});

app.use("/users", UserRouter);
app.use("/carts", CartRouters);
app.use("/transaction", TransactionRouter);
app.use("/upload", UploaderRouter);

app.listen(PORT, () => {
  console.log("API RUNNING ON PORT " + PORT);
});
