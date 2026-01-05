require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Configure Multer for PDF Uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'));
        }
    }
});

// DB Configuration
let usingMongo = true;
const DB_FILE = path.join(__dirname, 'rca_db.json');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rca_db')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Failed. Switching to Local File Storage Mode.');
        usingMongo = false;
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
        }
    });

const RCA = require('./models/RCA');

// Helper for File DB
const getFileDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveFileDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Helper: Parse PDF Text to RCA Fields
const parseRCAText = (text) => {
    const rca = {
        problem: "Imported Incident",
        description: "",
        rootCauses: [],
        actions: [],
        tags: ["imported"]
    };

    // Naive Heuristics / Regex
    // 1. Try to find "Problem" or "Incident"
    const problemMatch = text.match(/(?:Problem|Incident|Issue):\s*(.*)(?:\n|$)/i);
    if (problemMatch && problemMatch[1]) rca.problem = problemMatch[1].trim();

    // 2. Try to find Root Causes
    if (text.match(/root cause/i)) {
        // Look for bullet points or lines after "Root Cause"
        const chunks = text.split(/root cause/i);
        if (chunks[1]) {
            const causeSection = chunks[1].split(/(?:action|correction|fix)/i)[0]; // take util next section
            const lines = causeSection.split('\n').filter(l => l.trim().length > 5);
            if (lines.length > 0) rca.rootCauses = lines.slice(0, 3).map(l => l.trim().replace(/^[-*•]\s*/, ''));
        }
    }

    // 3. Actions
    if (text.match(/(?:action|fix|resolution)/i)) {
        const chunks = text.split(/(?:action|fix|resolution)/i);
        if (chunks[1]) {
            const actionSection = chunks[1].split(/(?:lesson|tag|meta)/i)[0];
            const lines = actionSection.split('\n').filter(l => l.trim().length > 5);
            if (lines.length > 0) rca.actions = lines.slice(0, 3).map(l => l.trim().replace(/^[-*•]\s*/, ''));
        }
    }

    // Fallback: Description
    rca.description = text.substring(0, 500) + "... (Full text in 'Raw Data')";
    return rca;
};

// Routes

// Upload PDF
app.post('/api/rca/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const dataBuffer = req.file.buffer;
        const pdfData = await pdf(dataBuffer);
        const text = pdfData.text;

        const extractedData = parseRCAText(text);

        // Save as Draft
        const newRCAObj = {
            ...extractedData,
            source: 'pdf',
            rawText: text,
            status: 'Draft'
        };

        if (usingMongo) {
            const newRCA = new RCA(newRCAObj);
            const savedRCA = await newRCA.save();
            res.json(savedRCA);
        } else {
            const data = getFileDB();
            const newRCA = {
                _id: uuidv4(),
                ...newRCAObj,
                createdAt: new Date(),
            };
            data.unshift(newRCA);
            saveFileDB(data);
            res.json(newRCA);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update RCA (Edit)
app.put('/api/rca/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (usingMongo) {
            const updatedRCA = await RCA.findByIdAndUpdate(id, req.body, { new: true });
            res.json(updatedRCA);
        } else {
            const data = getFileDB();
            const index = data.findIndex(i => i._id === id);
            if (index === -1) return res.status(404).json({ error: "RCA not found" });

            data[index] = { ...data[index], ...req.body };
            saveFileDB(data);
            res.json(data[index]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create RCA
app.post('/api/rca', async (req, res) => {
    try {
        if (usingMongo) {
            const newRCA = new RCA(req.body);
            const savedRCA = await newRCA.save();
            res.json(savedRCA);
        } else {
            const data = getFileDB();
            const newRCA = {
                _id: uuidv4(),
                ...req.body,
                createdAt: new Date(),
                status: 'Draft'
            };
            data.unshift(newRCA); // prepend
            saveFileDB(data);
            res.json(newRCA);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get All RCAs (Search)
app.get('/api/rca', async (req, res) => {
    try {
        const { search } = req.query;

        if (usingMongo) {
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { problem: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { rootCauses: { $regex: search, $options: 'i' } },
                        { rawText: { $regex: search, $options: 'i' } } // Search raw text from PDFs too
                    ]
                };
            }
            const rcas = await RCA.find(query).sort({ createdAt: -1 });
            res.json(rcas);
        } else {
            let data = getFileDB();
            if (search) {
                const lowerSearch = search.toLowerCase();
                data = data.filter(item =>
                    (item.problem && item.problem.toLowerCase().includes(lowerSearch)) ||
                    (item.description && item.description.toLowerCase().includes(lowerSearch)) ||
                    (item.rootCauses && item.rootCauses.some(rc => rc.toLowerCase().includes(lowerSearch))) ||
                    (item.rawText && item.rawText.toLowerCase().includes(lowerSearch))
                );
            }
            res.json(data);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Single RCA
app.get('/api/rca/:id', async (req, res) => {
    try {
        if (usingMongo) {
            const rca = await RCA.findById(req.params.id);
            if (!rca) return res.status(404).json({ error: 'RCA not found' });
            res.json(rca);
        } else {
            const data = getFileDB();
            const rca = data.find(item => item._id === req.params.id);
            if (!rca) return res.status(404).json({ error: 'RCA not found' });
            res.json(rca);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
