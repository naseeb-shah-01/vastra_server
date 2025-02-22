import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import passport from "passport";
// import session from "express-session";
import connectDB from "../config/database";
import authRoutes from "../routes/auth.routes";
import emailRoutes from "../routes/email.routes";
import queryRoutes  from "../routes/req.routes"

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/add", queryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
