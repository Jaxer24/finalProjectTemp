/**
 * Image model
 * Defines the schema for storing user profile images
 */
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  //creates user attribute of type User to connect a user to this image
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  //creates a date attribute
  data: {
    type: Buffer,
    required: true
  },
  //creates content type attribute
  contentType: {
    type: String,
    required: true
  },
  //creates a date attribute, again I guess?? but different from date
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Image', ImageSchema);