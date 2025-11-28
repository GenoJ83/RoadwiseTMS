const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /predict - expects an image file upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));
    const flaskRes = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders(),
    });
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    res.json(flaskRes.data);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 