/**
 * Movie model
 * Defines the schema for users in our application
 */
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  //creates a title attribute
    title: {
        type: String,
        required: [true, 'Tile is required'],
        // Removed index to avoid creation issues
        minlength: [1, 'Title must be at least 5 characters'],
        maxlength: [60, 'Title cannot exceed 30 characters']
    },
  //creates year attribute
    year: {
        type: Number
        
    },
  //creates genre attribute
    genre: [{
      type: String
    }],
  //creates an Array of type Review attribute to hold all the reviews for this movie
    reviews: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Review' 
    }],
    rating: [{
      type: Number
    }],
    ratingAvg: {
      type: Number
    },
  //creates image boolean attribute
  hasCoverImage: {
    type: Boolean,
    default: false
  },
  //creates a date attribute
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

module.exports = mongoose.model('Movie', MovieSchema);
