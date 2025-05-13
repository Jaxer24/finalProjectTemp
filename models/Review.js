/**
 * Review model
 * Defines the schema for users in our application
 */
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  //creates review title attribute
  title: {
    type: String,
    required: [true, 'Tile is required'],
    // Removed index to avoid creation issues
    minlength: [1, 'Title must be at least 5 characters'],
    maxlength: [60, 'Title cannot exceed 30 characters']
  },
  //creates review message attribute
  message: {
    type: String,
    required: [true, 'Message is required'],
    // Removed index to avoid creation issues
  },
  //creates rating attribute
  rating: {
    type: Number, 
    required: [true, 'Rating is required'],
    max: 5
  },
  likes: {
    type: Number
  },
  //creates user attribute to connect the author to this review
  userID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  //creates movie attribute to connect the movie to this review
  movieID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie' 
  },
  //creates a date attribute
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add virtual properties when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Review', ReviewSchema);
