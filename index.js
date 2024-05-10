const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const { google } = require("googleapis");
const config = require("./config");
const path = require("path")

const app = express();

// Middleware
const oauth2Client = new google.auth.OAuth2(
  config.googleClientId,
  config.googleClientSecret,
  'https://auth-backend.adaptable.app/auth/google/callback'
);
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true,
});

app.use(express.json());
app.use(cors({
  origin: config.clientUrl,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './build')));

// Routes
app.get("/", (req, res) => res.send("healthy"));

app.get('/auth/google', (req, res) => {
  res.redirect(authorizationUrl);
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
    req.user = decoded;
    next();
  });
};

app.get('/auth/google/user-info', authenticateToken, (req, res) => {
  return res.json({ user: req.user || 'None' });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.name) {
      return res.json({ data });
    }

    const payload = {
      name: data.name,
      email: data.email
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      domain: ".vercel.app",
      maxAge: 3600000,
    });

    res.redirect(config.clientUrl);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
