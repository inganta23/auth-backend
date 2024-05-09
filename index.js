const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");
const app = express();
const config = require("./config");

// Middleware
app.use(
  cookieSession({
    name: "session",
    keys: ["lama"],
    maxAge: 24 * 60 * 60 * 1000, // Corrected maxAge calculation
    // secure: true, // Enable this if using HTTPS in production
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: config.clientUrl,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoute);

// Health check route
app.get("/", (req, res) => res.send("healthy"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
