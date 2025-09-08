import express from 'express'
import dotenv from "dotenv";
import {connectDB} from "./config/db.js"
import authRoutes from "./routes/authRoutes.js";
import cors from "cors"

dotenv.config();

const PORT=process.env.PORT||5001

connectDB(process.env.MONGO_URI_COMPASS)

const app=express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT,() => console.log("Server Listening to port:",PORT));




// connectDB().then(()=>{
//     app.listen(PORT,() => {
//     console.log("Server Listening to port:",PORT);
//   });
// });