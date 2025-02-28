const express = require("express");
const cors = require("cors");
const db = require("./models");
const app = express();
require("dotenv").config();
const path = require("path");

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:;"
  );
  next();
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Test database connection
db.sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Sync database (in development)
db.sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
// app.use('/api/supervisors', require('./routes/supervisor'));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/supervisors", require("./routes/supervisors"));
app.use("/api/proposals", require("./routes/proposals"));
app.use("/api/thesis", require("./routes/thesis"));
app.use("/file", express.static(path.join(__dirname, "uploads/thesis")));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
