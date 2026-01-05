const mongoose = require('mongoose');

const RCASchema = new mongoose.Schema({
    problem: { type: String, required: true },
    description: String,
    rootCauses: [{ type: String }],
    actions: [{ type: String }],
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    searchEmbedding: [Number], // Placeholder for future vector search
    source: { type: String, default: 'manual' }, // manual, pdf
    rawText: String, // For PDF dumps
    status: { type: String, default: 'Draft' }, // Draft, Final
});

module.exports = mongoose.model('RCA', RCASchema);
