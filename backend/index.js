const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const upload = multer(); 
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));



mongoose.connect('mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_03d?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));



    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });