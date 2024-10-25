const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
require('dotenv').config();
const User = require('./models/User'); // Assuming User model is defined as shown before
const app = express();
const port = process.env.PORT || 3000;
const upload = multer(); 

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

mongoose.connect('mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_03d?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Sign Up Route with bcrypt password hashing
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route with bcrypt password comparison
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare provided password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Save user ID in session on successful login
    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout Route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
