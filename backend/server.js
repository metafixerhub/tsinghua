const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hecoyi3863_db_user:JeVfbcymm6SF1bmI@cluster0.1qeihro.mongodb.net/competition?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

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

// Mongoose Schema for Participant
const participantSchema = new mongoose.Schema({
    name: String,
    age: Number,
    classGrade: String,
    school: String,
    address: String,
    cityState: String,
    phone: String,
    email: String,
    country: String,
    fieldOfInterest: String,
    logoUrl: String,
    unionId: String,
    projectFileUrl: String,
    registrationDate: { type: Date, default: Date.now }
});

const Participant = mongoose.model('Participant', participantSchema);

// API Endpoint to register a participant
app.post('/api/register', upload.single('logo'), async (req, res) => {
    try {
        const { 
            name, age, classGrade, school, address, cityState, 
            phone, email, country, fieldOfInterest
        } = req.body;
        
        // Generate 5-digit Union ID
        const unionId = Math.floor(10000 + Math.random() * 90000).toString();
        
        const participantData = {
            name, age, classGrade, school, address, cityState, 
            phone, email, country, fieldOfInterest,
            logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
            unionId: unionId
        };

        const newParticipant = new Participant(participantData);
        await newParticipant.save();
        
        console.log('New participant registered to MongoDB:', newParticipant.name, 'ID:', unionId);
        res.status(201).json({ message: 'Registration successful!', participant: newParticipant });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { unionId } = req.body;
        
        if (!unionId) {
            return res.status(400).json({ message: 'Union ID is required.' });
        }

        const participant = await Participant.findOne({ unionId });
        
        if (participant) {
            console.log('Participant logged in:', participant.name);
            res.json({ message: 'Login successful', participant });
        } else {
            res.status(404).json({ message: 'Invalid Union ID. Participant not found.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in.' });
    }
});

// Project Upload Route
app.post('/api/upload-project', upload.single('projectFile'), async (req, res) => {
    try {
        const { unionId } = req.body;
        
        if (!unionId) {
            return res.status(400).json({ message: 'Union ID is required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const projectFileUrl = `/uploads/${req.file.filename}`;
        
        const participant = await Participant.findOneAndUpdate(
            { unionId },
            { projectFileUrl },
            { new: true }
        );
        
        if (participant) {
            console.log('Project file uploaded for:', participant.name);
            res.json({ message: 'Project uploaded successfully', participant });
        } else {
            res.status(404).json({ message: 'Invalid Union ID. Participant not found.' });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading project.' });
    }
});

// Admin Route to fetch all participants for the Admin view
app.get('/api/participants', async (req, res) => {
    try {
        // Fetch all participants from MongoDB, sorted by newest first
        const participants = await Participant.find().sort({ registrationDate: -1 });
        res.json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'Error fetching participants' });
    }
});

// API Endpoint to delete a participant
app.delete('/api/participants/:id', async (req, res) => {
    try {
        await Participant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Participant deleted successfully' });
    } catch (error) {
        console.error('Error deleting participant:', error);
        res.status(500).json({ message: 'Error deleting participant' });
    }
});

// Route for serving the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
