import express from 'express';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
 

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const writers = await User.find({ role: 'writer' });
        res.render('writers', { writers });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid writer ID');
        }

        const writer = await User.findById(req.params.id);
        if (!writer || writer.role !== 'writer') {
            return res.status(404).send('Writer not found');
        }
        res.render('writerProfile', { writer });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


export default router;
