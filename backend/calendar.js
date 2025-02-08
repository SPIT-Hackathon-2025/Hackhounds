const { google } = require("googleapis");
const { readFileSync } = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000; // Change the port to 3000

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Load service account key JSON
const credentials = JSON.parse(readFileSync("../calendar.json")); // Update the path if necessary

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
      dateTime: startDateTime,
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/Los_Angeles",
    },
  };

  calendar.events.insert(
    {
      calendarId: "primary",
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});