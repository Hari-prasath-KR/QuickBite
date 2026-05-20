import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import http from "http";
import { Server } from "socket.io";
import {connectDB} from "./config/db.js"
import authRoutes from "./routes/authRoutes.js";
import cateringRoutes from "./routes/cateringRoutes.js"
import adminRoutes from './routes/adminRoutes.js'
import analyticsRoutes from "./routes/analyticsRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import cors from "cors"
import cookieParser from "cookie-parser"
import { requireAuth } from './middleware/auth.js';
import staffRoutes from "./routes/staffRoutes.js"
import branchAnalyticsRoutes from "./routes/branchAnalyticsRoutes.js";
import cateringAdminRoutes from "./routes/cateringAdminRoutes.js";
import customerMenuRoutes from "./routes/customerMenuRoutes.js";


const PORT=process.env.PORT||5001

connectDB(process.env.MONGO_URI_COMPASS)

const app=express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


app.use("/api/auth",authRoutes);
app.use("/api/caterings",cateringRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/admin/analytics",analyticsRoutes);
app.use("/api/admin/feedback", feedbackRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/menuitem", menuItemRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/users", userRoutes);
app.get("/api/profile", (req, res) => {
  res.json({ msg: "Protected route", user: req.user });
});
app.use("/api/staff", staffRoutes);
app.use("/api/branch-analystics", branchAnalyticsRoutes);
app.use("/api/catering-admin", cateringAdminRoutes);
app.use("/api/catering-admin",menuItemRoutes);
app.use("/api/menu", customerMenuRoutes);

// app.get('/api/test', (req, res) => {
//   res.json({ message: 'API is working!' });
// });

app.listen(PORT,() => console.log("Server Listening to port:",PORT));


// connectDB().then(()=>{
//     app.listen(PORT,() => {
//     console.log("Server Listening to port:",PORT);
//   });
// });