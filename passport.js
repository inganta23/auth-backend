const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");
const config = require("./config");

const GOOGLE_CLIENT_ID = config.googleClientId;
const GOOGLE_CLIENT_SECRET = config.googleClientSecret;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(accessToken, refreshToken)
      done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: "386805881017470",
      clientSecret: "dd2de6f1dd64f5a38712a3b685b2a0b0",
      callbackURL: "/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
