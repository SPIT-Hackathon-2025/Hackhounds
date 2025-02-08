const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
  eventName: { type: String },
  bufferdate: { type: Date },
  buffertime: { type: Number },
  description: { type: String },
  order:{ type: Number },
});
const MailSchema = new mongoose.Schema({
    subject: { type: String },
    message: { type: String },
    description: { type: String },
    attachment: { 
      type: String,  // Store the file path or URL for the PDF 
    },
    csvFile: { 
      type: String,  // Store the file path or URL for the CSV 
    },
    order:{ type: Number },
  });

const SlackSchema = new mongoose.Schema({
    channel: { type: String },
    text: { type: String },
    order:{ type: Number },
  });

const WorkflowSchema = new mongoose.Schema({
  trigger: { type: String, required: true },
  calendar: [CalendarSchema],  // Array of calendar events
  slack: [SlackSchema],
  createdBy: { type:String, required: true },
  mail: [MailSchema],  // Array of emails
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Workflow', WorkflowSchema);
