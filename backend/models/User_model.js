
const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    team_id: {
        type: String, // No longer a reference, just a simple String
        required: false, // Only necessary for roles that need a team association
        trim: true
    },
    email_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['judge', 'admin', 'team_leader', 'player'],
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('User', userDataSchema);
