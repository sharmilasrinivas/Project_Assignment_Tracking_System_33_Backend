import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import dns from 'node:dns';
dns.setServers(['8.8.8.8','1.1.1.1']);

dotenv.config();
const port = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req,res) => {
    res.status(200).json({ msg: "server is running in port 8080"});
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assignments", assignmentRoutes);

app.listen(port, () =>{
    connectDB();
    console.log("your server is running in port",port);
})
