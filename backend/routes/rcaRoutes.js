const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getRCAs, createRCA, uploadPDF, updateRCA, getRCAById, deleteRCA, smartDebug } = require('../controllers/rcaController');

// Multer Config for PDF Uploads
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

router.get('/', getRCAs);
router.post('/', createRCA);
router.post('/upload-pdf', upload.single('pdf'), uploadPDF);
router.get('/:id', getRCAById);
router.put('/:id', updateRCA);
router.delete('/:id', deleteRCA);
router.post('/smart-debug', smartDebug);

module.exports = router;
