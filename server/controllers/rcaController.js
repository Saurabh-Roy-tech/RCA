const RCA = require('../models/RCA');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDBStatus } = require('../config/db');
const { analyzeErrorWithContext } = require('../services/aiService');

// File DB Path
const DB_FILE = path.join(__dirname, '..', 'rca_db.json');

// Helper for File DB
const getFileDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
};
const saveFileDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Helper: Parse PDF Text to RCA Fields
const parseRCAText = (text) => {
    const rca = {
        problem: "",
        description: "",
        rootCauses: [],
        actions: [],
        tags: [],
        status: "" // Initialize status
    };

    // Common pattern for the start of any new section. 
    // Matches a newline, optional space, one of the keywords, and a colon.
    // We use this as a lookahead to stop capturing content.
    const lookaheadPattern = "(?:\\n\\s*(?:Problem|Incident|Issue|Description|Root Cause|Cause|Action|Fix|Resolution|Tags?|Keywords|Status)\\s*:|$)";

    let hasMatch = false;

    // 1. Problem
    const problemRegex = new RegExp(`(?:Problem|Incident|Issue)\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const problemMatch = text.match(problemRegex);
    if (problemMatch && problemMatch[1]) {
        rca.problem = problemMatch[1].trim();
        hasMatch = true;
    }

    // 2. Description
    const descRegex = new RegExp(`Description\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const descMatch = text.match(descRegex);
    if (descMatch && descMatch[1]) {
        rca.description = descMatch[1].trim();
    }

    // 3. Status
    const statusRegex = new RegExp(`Status\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const statusMatch = text.match(statusRegex);
    if (statusMatch && statusMatch[1]) {
        rca.status = statusMatch[1].trim();
    }

    // 4. Root Causes
    const rcRegex = new RegExp(`(?:Root Cause|Cause)\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const rootCauseMatch = text.match(rcRegex);
    if (rootCauseMatch && rootCauseMatch[1]) {
        const lines = rootCauseMatch[1].split(/[;\n]/).filter(l => l.trim().length > 0);
        rca.rootCauses = lines.map(l => l.trim().replace(/^[-*•]\s*/, ''));
        if (rca.rootCauses.length > 0) hasMatch = true;
    } else if (text.match(/root cause/i) && !hasMatch) {
        // Fallback only if strict parsing failed to find ANY structure so far 
        // (This prevents mixing methods) - actually strict parsing is preferred.
        // If we found a problem using strict regex, we probably shouldn't fall back to loose for Root Cause 
        // unless strict RC failed.
        // Let's keep loose fallback for safety but make it obey the boundaries if possible.
        const chunks = text.split(/root cause/i);
        if (chunks[1]) {
            const causeSection = chunks[1].split(/(?:action|correction|fix|problem|incident|description|tag|status)/i)[0];
            const lines = causeSection.split('\n').filter(l => l.trim().length > 5);
            if (lines.length > 0) {
                rca.rootCauses = lines.slice(0, 3).map(l => l.trim().replace(/^[-*•]\s*/, ''));
                hasMatch = true;
            }
        }
    }

    // 5. Actions
    const actionRegex = new RegExp(`(?:Action|Fix|Resolution)\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const actionMatch = text.match(actionRegex);
    if (actionMatch && actionMatch[1]) {
        const lines = actionMatch[1].split(/[;\n]/).filter(l => l.trim().length > 0);
        rca.actions = lines.map(l => l.trim().replace(/^[-*•]\s*/, ''));
        if (rca.actions.length > 0) hasMatch = true;
    } else if (text.match(/(?:action|fix|resolution)/i)) {
        const chunks = text.split(/(?:action|fix|resolution)/i);
        if (chunks[1]) {
            const actionSection = chunks[1].split(/(?:problem|incident|description|root cause|tag|status)/i)[0];
            const lines = actionSection.split('\n').filter(l => l.trim().length > 5);
            if (lines.length > 0) {
                rca.actions = lines.slice(0, 3).map(l => l.trim().replace(/^[-*•]\s*/, ''));
                hasMatch = true;
            }
        }
    }

    // 5. Tags
    const tagsRegex = new RegExp(`(?:Tags?|Keywords)\\s*:\\s*(.*?)(?=${lookaheadPattern})`, 'is');
    const tagMatch = text.match(tagsRegex);
    if (tagMatch && tagMatch[1]) {
        const tags = tagMatch[1].split(/[,;\n]/).map(t => t.trim()).filter(t => t.length > 0);
        rca.tags = tags;
    } else {
        rca.tags = ["pdf-import"];
    }

    // Final Validation
    if (!hasMatch) {
        if (!text.match(/(?:problem|incident|issue|root cause|action|fix|resolution)/i)) {
            return null;
        }
        return null;
    }

    return rca;
};

// @desc    Get all RCAs
const getRCAs = async (req, res) => {
    try {
        const { search } = req.query;

        if (getDBStatus()) {
            // MongoDB
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { problem: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { rootCauses: { $regex: search, $options: 'i' } },
                        { rawText: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            const rcas = await RCA.find(query).sort({ createdAt: -1 });
            res.json(rcas);
        } else {
            // File DB
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
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get single RCA
const getRCAById = async (req, res) => {
    try {
        if (getDBStatus()) {
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
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create new RCA
const createRCA = async (req, res) => {
    try {
        if (getDBStatus()) {
            const newRCA = new RCA(req.body);
            const savedRCA = await newRCA.save();
            res.status(201).json(savedRCA);
        } else {
            const data = getFileDB();
            const newRCA = {
                _id: uuidv4(),
                ...req.body,
                createdAt: new Date(),
                status: 'Draft'
            };
            data.unshift(newRCA);
            saveFileDB(data);
            res.status(201).json(newRCA);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Upload and Process PDF
const uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const dataBuffer = req.file.buffer;

        // Suppress known PDF warnings (pdf-parse/pdf.js can be noisy)
        const originalWarn = console.warn;
        const originalLog = console.log;

        const suppress = (...args) => {
            const msg = args.map(a => String(a)).join(' ');
            if (msg.includes('TT: undefined function')) return;
            // Also suppress "Warning: TT: undefined function" which might come as a prefix
            if (msg.includes('Warning: TT:')) return;
            originalWarn.apply(console, args);
        };

        console.warn = suppress;
        console.log = suppress; // Sometimes these libs log to stdout

        let pdfData;
        try {
            pdfData = await pdf(dataBuffer);
        } finally {
            console.warn = originalWarn;
            console.log = originalLog;
        }

        const text = pdfData.text.trim();

        if (text.length === 0) {
            return res.status(400).json({ error: "PDF is blank." });
        }

        const extractedData = parseRCAText(text);

        if (!extractedData) {
            return res.status(400).json({
                error: "Fields are missing or irrelevant data found in PDF (Problem, Root Cause, or Action required)."
            });
        }

        // Ensure mandatory Schema field 'problem' exists if we matched others but not problem
        if (!extractedData.problem) extractedData.problem = "Imported RCA (Problem Not Detected)";

        const newRCAObj = {
            ...extractedData,
            source: 'pdf',
            rawText: text,
            status: extractedData.status || 'Draft'
        };

        if (getDBStatus()) {
            const newRCA = new RCA(newRCAObj);
            const savedRCA = await newRCA.save();
            res.status(201).json(savedRCA);
        } else {
            const data = getFileDB();
            const newRCA = {
                _id: uuidv4(),
                ...newRCAObj,
                createdAt: new Date(),
            };
            data.unshift(newRCA);
            saveFileDB(data);
            res.status(201).json(newRCA);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update RCA
const updateRCA = async (req, res) => {
    try {
        if (getDBStatus()) {
            const updatedRCA = await RCA.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedRCA) return res.status(404).json({ error: 'RCA not found' });
            res.json(updatedRCA);
        } else {
            const data = getFileDB();
            const index = data.findIndex(i => i._id === req.params.id);
            if (index === -1) return res.status(404).json({ error: "RCA not found" });

            data[index] = { ...data[index], ...req.body };
            saveFileDB(data);
            res.json(data[index]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Delete RCA
const deleteRCA = async (req, res) => {
    try {
        if (getDBStatus()) {
            const result = await RCA.findByIdAndDelete(req.params.id);
            if (!result) return res.status(404).json({ error: 'RCA not found' });
            res.json({ message: 'RCA deleted' });
        } else {
            const data = getFileDB();
            const newData = data.filter(i => i._id !== req.params.id);
            if (data.length === newData.length) return res.status(404).json({ error: 'RCA not found' });
            saveFileDB(newData);
            res.json({ message: 'RCA deleted' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Smart Debug/Analysis using LLM
const smartDebug = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        // Fetch all RCAs to use as context
        let allRCAs = [];
        if (getDBStatus()) {
            allRCAs = await RCA.find({}).select('problem rootCauses actions description tags');
        } else {
            const data = getFileDB();
            allRCAs = data.map(r => ({
                problem: r.problem,
                rootCauses: r.rootCauses,
                actions: r.actions,
                description: r.description,
                tags: r.tags
            }));
        }

        const rawAnalysis = await analyzeErrorWithContext(query, allRCAs);

        let analysisResult = { analysis: rawAnalysis, relatedRcaIds: [] };

        // Try to parse JSON
        try {
            // Sanitize potential markdown code blocks
            const jsonText = rawAnalysis.replace(/```json/g, '').replace(/```/g, '').trim();
            analysisResult = JSON.parse(jsonText);
        } catch (e) {
            console.error("AI returned non-JSON:", rawAnalysis);
            // Fallback: treat whole text as analysis
            analysisResult = { analysis: rawAnalysis, relatedRcaIds: [] };
        }

        // Fetch Related RCA Objects
        let relatedRCAs = [];
        if (analysisResult.relatedRcaIds && analysisResult.relatedRcaIds.length > 0) {
            if (getDBStatus()) {
                relatedRCAs = await RCA.find({ _id: { $in: analysisResult.relatedRcaIds } });
            } else {
                const data = getFileDB();
                relatedRCAs = data.filter(r => analysisResult.relatedRcaIds.includes(r._id));
            }
        }

        res.json({
            analysis: analysisResult.analysis,
            relatedRCAs
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to perform smart analysis." });
    }
};

module.exports = {
    getRCAs,
    getRCAById,
    createRCA,
    uploadPDF,
    updateRCA,
    deleteRCA,
    smartDebug
};
