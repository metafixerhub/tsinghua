const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve uploaded logos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage setup for logo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// In-memory database for participants
const participants = [];

// API Endpoint to register a participant
app.post('/api/register', upload.single('logo'), (req, res) => {
    try {
        const { name, university, location, percentage, phone } = req.body;
        
        const participant = {
            id: Date.now().toString(),
            name,
            university,
            location,
            percentage,
            phone,
            logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
            registrationDate: new Date().toISOString()
        };

        participants.push(participant);
        console.log('New participant registered:', participant.name);
        
        res.status(201).json({ message: 'Registration successful!', participant });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// API Endpoint to get all participants for the Admin view
app.get('/api/participants', (req, res) => {
    res.json(participants);
});

// Route for serving the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
