// Initialize library
const express = require("express");
const cors = require("cors");
const bearerToken = require("express-bearer-token");

const app = express();

// Initialize cors
app.use(cors());

// Initialize body parser
app.use(express.json());

// Initialize bearer token
app.use(bearerToken());

// Initialize port
const PORT = 2003;

// Import Router
const UserRouter = require("./Routers/UserRouters");

app.get("/", (req, res) => {
  res.status(200).send("<h1>Group 3 - Warehouse System API</h1>");
});

app.use("/users", UserRouter);

app.listen(PORT, () => {
  console.log("API RUNNING ON PORT " + PORT);
});
