const router = require("express").Router();
const passport = require("passport");
const config = require("../config");

const CLIENT_URL = config.clientUrl;

// Success route
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: req.user,
    });
  } else {
    res.status(401).json({ message: "Not authorized" }); // Change status code to 401
  }
});

// Failure route
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Authentication failed",
  });
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

// Google OAuth route
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/auth/login/failed", // Change to full path
  })
);

// Facebook OAuth route
router.get("/facebook", passport.authenticate("facebook", { scope: ["profile"] }));

// Facebook OAuth callback route
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/auth/login/failed", // Change to full path
  })
);

module.exports = router;
