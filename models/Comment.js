/**
 * Comment model
 * Defines the schema for users in our application
 */
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  
    title: {
        type: String,
        required: [true, 'Tile is required'],
        // Removed index to avoid creation issues
        minlength: [1, 'Title must be at least 5 characters'],
        maxlength: [30, 'Title cannot exceed 30 characters']
    },
    message:{
        type: String,
        required: [true, 'Comment message is required']
    },
    reviewID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Review',
        required: [true, 'Tile is required']
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Must be logged into an account']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, 
{
  // Add virtual properties when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Comment', ReviewSchema);
