const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
require('dotenv').config();

const Razorpay = require('razorpay');
const app = express();
const port = process.env.PORT || 3000;
const upload = multer(); 
app.use(express.json());

const User = require('./models/User_model.js'); // Assuming User model is defined as shown before



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

mongoose.connect('mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_05d?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));


    // Donation Schema
const donationSchema = new mongoose.Schema({
    name: String,
    email: String,
    amount: Number,
    payment_id: String,
});
  
const Donation = mongoose.model('Donation', donationSchema);

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: "rzp_test_TrzRx21MJ6LUPk",
    key_secret: "UwctxLjbAG3ouKFj3dJs0CtS",
});
  
// Donate Route
app.post('/donate', async (req, res) => {
    const { name, email, amount } = req.body;
  
    const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: 'receipt#1',
        payment_capture: 1,
    };

    try {
        const response = await razorpay.orders.create(options);
        const donation = new Donation({
            name,
            email,
            amount,
            payment_id: response.id,
        });
  
        await donation.save();
  
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });
// Sign Up Route with bcrypt password hashing
app.post('/api/signup', async (req, res) => {
  const { username, password, role, email_id, team_id } = req.body;

  try {
    // Check if user already exists by username or email
    const existingUser = await User.findOne({ $or: [{ username }, { email_id }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email ID already taken' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create and save new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      email_id,
      team_id: role === 'team_leader' || role === 'player' ? team_id : null
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route with bcrypt password comparison
app.post('/api/login', async (req, res) => {
  const { username, password, role, team_id } = req.body;

  try {
    // Find the user by username and role
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username, role, or password' });
    }

    // If role is player or team leader, ensure the team_id matches
    if ((role === 'player' || role === 'team_leader') && user.team_id !== team_id) {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    // Compare provided password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Save user ID in session on successful login
    req.session.userId = user._id;
    console.log('Logged in user ID:', req.session.userId);
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