import cors from "cors";

export const corsConfig = () => {
  return cors({
    origin: (origin, callback) => {
      const allowedOrigin = ["http://localhost:5173"];
      if (!origin || allowedOrigin.indexOf(origin) != -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by cors"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    credentials: true,
  });
};
