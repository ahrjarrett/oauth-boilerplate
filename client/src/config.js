export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://PRODUCTION-SERVER.com"
    : "https://localhost:8080";
