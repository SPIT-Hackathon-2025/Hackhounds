import React, { useState } from 'react';
import axios from 'axios';

const Page2 = () => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const createEvent = async () => {
    try {
      const response = await axios.post("http://localhost:3000/create-event", { // Update the port to 3000
        summary,
        description,
        startDateTime,
        endDateTime
      });
      alert(response.data);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event");
    }
  };

  return (
    <div>
      <h1>Google Calendar Event</h1>
      <div>
        <label>
          Event Summary:
          <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Description:
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Start Date and Time:
          <input type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          End Date and Time:
          <input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} />
        </label>
      </div>
      <button onClick={createEvent}>Create Event</button>
    </div>
  );
};

export default Page2