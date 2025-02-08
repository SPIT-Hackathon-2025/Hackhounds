const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
require('dotenv').config();
const User = require('./models/FUser'); // User model (defined below)
const axios = require('axios');// User model (defined below)
const Razorpay = require('razorpay');
const app = express();
const port = process.env.PORT || 3000;
const Workflow = require('./models/Workflow');
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        console.log(user);
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// MongoDB connection
mongoose
  .connect('mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_05d?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));
  
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


// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

app.post('/auth/google', async (req, res) => {
  // const { googleId, username, email} = req.body;
  // console.log(req.body);
  try {
//     // Check if user already exists
//     let user = await User.findOne({ googleId });
// console.log(user);
//     if (!user) {
//       // Create a new user if not found
//       user = new User({
//         googleId: googleId,
//         username: username,
//         email: email, // This is optional
//       });
//       await user.save();
//     }

    res.status(200).json({ message: 'Google login successful', redirectUrl: '/dashboard' });
  } catch (error) {
    console.error('Error during user signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/api/save', async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json({ message: 'Workflow saved successfully' });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Webhook route
app.post('/webhook/site1', async (req, res) => {
  console.log('Webhook received:', req.body);

  try {
    const workflow = await Workflow.findOne({ trigger: "orderplaced" });
console.log(workflow);
    if (workflow && workflow.slack && workflow.slack.length > 0) {
      for (const slack of workflow.slack) {
        console.log(slack);
        await axios.post('https://slack.com/api/chat.postMessage', {
          channel: slack.channel,
          text: slack.text,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`, // Replace with your Slack bot token
          },
        });
      }
    }
   
    res.status(200).send('Webhook received and processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));