import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import {userRouter} from "./routes/user";

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://lx530189283:<password>@ecommerce.vudzw2i.mongodb.net/");

app.listen(3001, () => console.log("SERVER STARTED"));
