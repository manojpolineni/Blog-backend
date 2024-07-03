import User from "../models/users.js";
import Notes from "../models/notes.js";


export const getAllNotes = async (req, res) => {
    const notes = await Notes.find();
    res.status(200).json({ notes });
}


export const addNote = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { title, content, tags, isPinned } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message:"All Fields are Required" });
        }

        const newNote = await Notes.create({
          title,
          content,
          tags: tags || [],
          isPinned,
          userId: user.id,
        });
        return res.status(201).json({ message: "New Note Added Successfully", newNote });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}


export const getNote = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json({message:"No Notes Found"})
        }
        const notes = await Notes.find({ userId: user.id });

        return res.status(200).json( notes);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
     }
}
export default { addNote, getNote };