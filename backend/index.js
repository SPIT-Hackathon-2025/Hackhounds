const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
require('dotenv').config();
const axios = require('axios');
const Razorpay = require('razorpay');
const { google } = require('googleapis');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // Import pdfkit
const Workflow = require('./models/Workflow');
const User = require('./models/FUser'); // User model
const multer = require("multer");
const app = express();
const port = process.env.PORT || 3000;
const readline = require("readline");
const schedule = require("node-schedule");
const Email = require('./models/Email'); // Import the Email model
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
const {authenticate} = require('@google-cloud/local-auth');
app.use(passport.initialize());
app.use(passport.session());
const path=require('path');
const nodemailer = require('nodemailer');
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
  try {
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
const upload = multer({ dest: "uploads/" });
const driveAuth = new google.auth.GoogleAuth({
  keyFile: "./driveFile.json", // Path to Drive service account JSON
   scopes: ["https://www.googleapis.com/auth/drive.file"],
 });
 
 const drive = google.drive({ version: "v3", auth: driveAuth });


 app.post("/webhook/site1", async (req, res) => {
  console.log("Webhook received:", req.body);

  try {
    // 🔍 Find workflow with trigger "orderplaced"
    const workflow = await Workflow.findOne({ trigger: "orderplaced" });
    console.log(workflow);

    // 📢 Send messages to Slack if Slack settings exist
    if (workflow && workflow.slack && workflow.slack.length > 0) {
      for (const slack of workflow.slack) {
        console.log(slack);
        await axios.post(
          "https://slack.com/api/chat.postMessage",
          {
            channel: slack.channel,
            text: slack.text,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            },
          }
        );
      }
    }

    // 📄 Generate PDF
    const doc = new PDFDocument();
    const filePath = `./pdfs/order_${Date.now()}.pdf`;
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // 📝 Add header
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Order Details", { align: "center" })
      .moveDown()
      .fontSize(10)
      .text("Order Management System", { align: "center" })
      .text("1234 Main Street", { align: "center" })
      .text("Anytown, USA 12345", { align: "center" })
      .moveDown();

    // 📆 Add customer details
    doc
      .fillColor("#444444")
      .fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, 50, 160)
      .text(`Order ID: ${Date.now()}`, 50, 175)
      .moveDown();

    // 📊 Add table headers
    doc
      .fontSize(12)
      .text("Order Summary", { underline: true })
      .moveDown()
      .fontSize(10)
      .text("", 50, 210)
      .text("Amount", 200, 210)
      .text("Cost", 300, 210)
      .moveDown();

    // 📦 Add order items
    let y = 230;
    req.body.orders.forEach((order, index) => {
      doc
        .fontSize(10)
        .text(order.name, 50, y)
        .text(order.amount, 200, y)
        .text(`$${order.cost.toFixed(2)}`, 300, y);
      y += 20;
    });

    // 🔚 Add footer
    doc
      .fontSize(10)
      .text("Thank you for your order!", 50, y + 40)
      .text("If you have any questions, please contact us at support@example.com.", 50, y + 55)
      .moveDown();

    doc.end();

    writeStream.on("finish", async () => {
      console.log("PDF generated successfully:", filePath);

      // 📤 Upload PDF to Google Drive
      const fileMetadata = {
        name: `order_${Date.now()}.pdf`,
        parents: ["19VIVpgJWS9r89dgVpkIUYiF7q3q5RTw8"], // 🔹 Change to your Drive folder ID
      };

      const media = {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, parents",
      });

      console.log("File uploaded to Drive:", response.data.id);

      // ✅ Share the uploaded file with a specific email
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader", // Change to "writer" if you want edit access
          type: "user",
          emailAddress: "japsareayushi@gmail.com", // 🔹 Change this to the recipient email
        },
      });

      console.log("File shared successfully.");
    });

    res.status(200).send("Webhook received and processed.");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal server error");
  }
});

const credentials = JSON.parse(fs.readFileSync("./calendar.json")); // Update the path if necessary

// Authenticate
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/calendar"]
);

const calendar = google.calendar({ version: "v3", auth });

// Endpoint to create an event
app.post("/create-event", (req, res) => {
  const { summary, description, startDateTime, endDateTime } = req.body;

  const event = {
    summary,
    description,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: "Asia/Kolkata",
    },
  };

  calendar.events.insert(
    {
      calendarId: "1010hrishikesh@gmail.com",
      resource: event,
    },
    (err, event) => {
      if (err) {
        console.error("Error adding event:", err);
        res.status(500).send("Error adding event: " + err.message);
      } else {
        console.log("Event created:", event.data.htmlLink);
        res.status(200).send("Event created: " + event.data.htmlLink);
      }
    }
  );
});



// 📌 API Route to Upload File
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded!" });

    const folderId = req.body.folderId; // 🔹 Get folder ID from frontend

    const fileMetadata = {
      name: req.file.originalname, // Keep original name
      parents: [folderId], // ✅ Use dynamic folder ID
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, parents",
    });

    // ✅ Share the uploaded file with your email
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader", // Change to "writer" if you want edit access
        type: "user",
        emailAddress: "japsareayushi@gmail.com", // 🔹 Change this
      },
    });

    // Cleanup uploaded file from local storage
    fs.unlinkSync(req.file.path);

    console.log("✅ File uploaded successfully! File ID:", response.data.id);
    res.json({ fileId: response.data.id, message: "File uploaded successfully!" });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file." });
  }
});

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dcmaureenmiranda@gmail.com', // Replace with your email
    pass: 'dqnr qfzl nzmv eonz', // Replace with your email password
  },
});
authorize().then(listLabels).catch(console.error);
app.post('/submit-email', upload.single('attachment'), async (req, res) => {
  try {
    const { from, to, subject, message } = req.body;
    let attachmentUrl = null;
    console.log(req.body);
    // Check if the message contains the word "event"
    const cal = message.split(' ').includes('event');
    const hasAttachment = !!req.file;

    if (hasAttachment) {
      const folderId = '19VIVpgJWS9r89dgVpkIUYiF7q3q5RTw8'; // Replace with your Google Drive folder ID

      const fileMetadata = {
        name: req.file.originalname, // Keep original name
        parents: [folderId], // Use dynamic folder ID
      };

      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, parents, webViewLink',
      });

      // Share the uploaded file with your email
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader', // Change to 'writer' if you want edit access
          type: 'user',
          emailAddress: 'japsareayushi@gmail.com', // Change this
        },
      });

      // Cleanup uploaded file from local storage
      fs.unlinkSync(req.file.path);

      console.log('✅ File uploaded successfully! File ID:', response.data.id);
      attachmentUrl = response.data.webViewLink;

      const mailOptions = {
        from: 'dcmaureenmiranda@gmail.com', // Replace with your email
        to: from,
        subject: 'Attachment Received',
        text: 'We have received your attachment. Thank you!',
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    const email = new Email({
      from,
      to,
      subject,
      message,
      attachment: attachmentUrl,
    });

    await email.save();
    if (cal) {
      const summary = subject;
      const description = message;
      const startDateTime = new Date();
      startDateTime.setDate(startDateTime.getDate() + 1);
      startDateTime.setHours(9, 0, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(10, 0, 0, 0);

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
      };
      calendar.events.insert(
        {
          calendarId: '1010hrishikesh@gmail.com',
          resource: event,
        },
        (err, event) => {
          if (err) {
            console.error('Error adding event:', err);
            res.status(500).send('Error adding event: ' + err.message);
          } else {
            console.log('Event created:', event.data.htmlLink);
            res.status(200).send('Event created: ' + event.data.htmlLink);
          }
        }
      );
    } else {
      res.status(200).json({ message: 'Email details saved successfully!' });
    }
  } catch (error) {
    console.error('Error saving email details:', error);
    res.status(500).json({ error: 'Failed to save email details.' });
  }
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));