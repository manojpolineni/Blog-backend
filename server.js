import express  from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import UserRoutes from './routes/userRoutes.js';
import NotesRoutes from './routes/notesRoutes.js';
import BlogRoutes from './routes/blogRoutes.js';
import path from 'path';

const __dirname = path.resolve();

dotenv.config();

const { PORT, MONGO_URL }= process.env;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", UserRoutes);
app.use("/api/notes", NotesRoutes);
app.use('/api/blogs', BlogRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/blogimages", express.static(path.join(__dirname, "blogimages")));


app.get('/', async(req, res) => {
   await res.status(200).json({ message: "server listening your requests" });
})
mongoose.connect(MONGO_URL).then(() => console.log("DB Connected!")).catch(() => { console.log("error"); });

app.listen(process.env.PORT, () => {
  console.log(`Server runnig on PORT ${PORT}`);
});
