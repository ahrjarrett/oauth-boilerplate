const providers = ["google", "facebook", "github"];

const callbacks = providers.map(provider => {
  return process.env.NODE_ENV === "production"
    ? // FIX!
      `https://PRODUCTION-SERVER.com/${provider}/callback`
    : `https://localhost:8080/${provider}/callback`;
});

const [googleURL, facebookURL, githubURL] = callbacks;

exports.CLIENT_ORIGIN =
  process.env.NODE_ENV === "production"
    ? `https://PRODUCTION-CLIENT.com`
    : ["https://127.0.0.1:3000", "https://localhost:3000"];

exports.GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: googleURL
};

exports.FACEBOOK_CONFIG = {
  clientID: process.env.FACEBOOK_KEY,
  clientSecret: process.env.FACEBOOK_SECRET,
  profileFields: ["id", "emails", "name", "picture.width(250)"],
  callbackURL: facebookURL
};

exports.GITHUB_CONFIG = {
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: githubURL
};
