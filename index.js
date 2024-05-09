const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");
const { google } = require("googleapis")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 

const config = require("./config");

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
})
app.use(cookieParser());
app.use(express.json())
// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["lama"],
//     maxAge: 24 * 60 * 60 * 1000, // Corrected maxAge calculation
//     // secure: true, // Enable this if using HTTPS in production
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
app.use(
  cors({
    origin: config.clientUrl,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Routes
// app.use("/auth", authRoute);

// Health check route
app.get("/", (req, res) => res.send("healthy"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.get('/auth/google', (req, res) => {
  res.redirect(authorizationUrl);
})

const authenticateToken = (req, res, next) => {
  if (!req.cookies) return res.status(404).json({ message: 'No cookies sent'})
  const token = req.cookies.accessToken
  if(!token) return res.status(401).json*{
    message: 'No token is provided'
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if(err) return res.status(403).json({ message: 'Failed to authenticate token'})
    req.user = decoded
    next();
  })

  next();
}

app.get('/auth/google/user-info', authenticateToken, (req, res) => {
  return res.json({ user: req.user || 'None' })
})

app.get('/auth/google/callback', async (req, res) => {
  const {code} = req.query

  const {tokens} = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
  })

  const {data} = await oauth2.userinfo.get();

  if(!data.email || !data.name){
      return res.json({
          data: data,
      })
  }


  const payload = {
      name: data?.name,
      email: data?.email
  }

  const secret = 'secret';

  const expiresIn = 60 * 60 * 1;

  const token = jwt.sign(payload, secret, {expiresIn: expiresIn})
  console.log(token)
  res.cookie('accessToken', token, { httpOnly: true, maxAge:3600000 })
  res.redirect(config.clientUrl)
})

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
