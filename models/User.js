/**
 * User model
 * Defines the schema for users in our application
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  //creates username attribute
  username: {
    type: String,
    required: [true, 'Username is required'],
    // Removed index to avoid creation issues
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  //creates email attribute
  email: {
    type: String,
    required: [true, 'Email is required'],
    // Removed index to avoid creation issues
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  //creates password attribute
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  //creates image boolean attribute
  hasProfileImage: {
    type: Boolean,
    default: false
  },
  //creates a date attribute
  createdAt: {
    type: Date,
    default: Date.now
  },
  //Adds an ArrayList of type movie to store users favorite movies
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie' 
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review' 
  }]
}, {
  // Add virtual properties when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Password hashing middleware
 * Automatically hashes the password before saving to the database
 */
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare passwords
 * Used during login to verify the provided password
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);