const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((error) => console.error('MongoDB connection error:', error));

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
    experience: String,
    projectType: String,
    comfortableAI: String,
    onTheSpot: String,
    whyParticipate: String,
    agreement: String,
    logoUrl: String,
    registrationDate: { type: Date, default: Date.now }
});

const Participant = mongoose.model('Participant', participantSchema);

// API Endpoint to register a participant
app.post('/api/register', upload.single('logo'), async (req, res) => {
    try {
        const { 
            name, age, classGrade, school, address, cityState, 
            phone, email, country, fieldOfInterest, experience, 
            projectType, comfortableAI, onTheSpot, whyParticipate, agreement 
        } = req.body;
        
        const participantData = {
            name, age, classGrade, school, address, cityState, 
            phone, email, country, fieldOfInterest, experience, 
            projectType, comfortableAI, onTheSpot, whyParticipate, agreement,
            logoUrl: req.file ? `/uploads/${req.file.filename}` : null
        };

        const newParticipant = new Participant(participantData);
        await newParticipant.save();
        
        console.log('New participant registered to MongoDB:', newParticipant.name);
        res.status(201).json({ message: 'Registration successful!', participant: newParticipant });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// API Endpoint to get all participants for the Admin view
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
