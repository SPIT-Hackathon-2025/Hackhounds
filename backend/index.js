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
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));



mongoose.connect('mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_03d?retryWrites=true&w=majority&appName=Cluster0')
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


    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });