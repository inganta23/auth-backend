const dotenv = require("dotenv");
dotenv.config();


module.exports = {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientUrl: process.env.CLIENT_URL,
    port: process.env.PORT
};