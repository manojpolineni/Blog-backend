import express from 'express';
import validateToken from '../middleware/authenticateToken.js';

const router = express.Router();

import { getAllNotes, addNote, getNote } from '../controllers/notesController.js';

router.post("/add-note/:id", validateToken, addNote);
router.get("/", getAllNotes);
router.get("/:id", getNote);

export default router;