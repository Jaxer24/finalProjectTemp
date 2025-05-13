/**
 * Review Controller
 */
const { validationResult } = require('express-validator');
const Image = require('../models/Image');
const MovieImage = require('../models/MovieImage');
const Review = require('../models/Review');
const User = require('../models/User');
const Movie = require('../models/Movie');
const upload = require('../middlewares/upload');

/**
 * Get Review Submition page
 */
exports.getReviewSubmit = (req, res) => {
  // Get flash message from session if it exists
  const flashMessage = req.session.flashMessage;
  // Clear flash message from session
  delete req.session.flashMessage;
    
   res.render('review/submit', {
    title: 'Submit',
    errors: [],
    flashMessage
  });
};

/**
 * Post Review submission
 */
exports.postReview =[ async (req, res, next) => {
  try {
    
    upload.single('movieImage')(req, res, async (err) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('review/submit', {
          title: 'Submit',
          errors: errors.array(),
          formData: {
              title: req.body.title,
              message: req.body.message,
              rating: req.body.rating
          }
        });
      }
          if (err) {
            // Handle file upload error
            return res.status(400).render('review/submit', {
              title: 'Submit',
              errors: [{ msg: err.message || 'File upload error' }],
          formData: {
              title: req.body.title,
              message: req.body.message,
              rating: req.body.rating
          }
            });
          }

      try {
            // Get user ID from session
            const userId = req.session.user.id;
            // Find user in database
            const user = await User.findById(userId);

            let movie = await Movie.findOne({ title: req.body.title });

            if (!user) {
              const error = new Error('User not found');
              error.statusCode = 404;
              throw error;
            }

        if(!movie){

          // Create new movie
            movie = new Movie({
            title: req.body.title,
            year: req.body.year,
            message: req.body.message,
            userID: userId,
          });
        }
  // Process profile image if uploaded
            if (req.file) {
              console.log("uploading file detected");
              try {
                // Check if user already has a profile image
                const existingImage = await MovieImage.findById(movie._id);

                if (existingImage) {
                  // Update existing image
                  existingImage.data = req.file.buffer;
                  existingImage.contentType = req.file.mimetype;
                  await existingImage.save();
                  // Update user to indicate they have a profile image
                  movie.hasCoverImage = true;
                } else {
                  // Create new image document
                  const newImage = new MovieImage({
                    movieId: movie._id,
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                  });
                  await newImage.save();

                  // Update user to indicate they have a profile image
                  movie.hasCoverImage = true;
                }

              } catch (imageError) {
                console.error('Error handling cover image:', imageError);
                return res.status(500).render('review/submit', {
                  title: 'Submit',
                  errors: [{ msg: 'Error saving cover image' }]
                });
              }
            }
        
      // Save user to database
      await movie.save();
         const movieRevs = await Movie.findById(movie._id).populate({
      path:'reviews', 
      populate: {
      path: 'userID',  // nested populate if you also want user info in each review
    }
    });
      // Create new review
      const review = new Review({
        title: req.body.title,
        message: req.body.message,
        rating: req.body.rating,
        userID: userId,
        movieID: movie._id
      });
        
      if(!movie.genre.includes(req.body.genre)){
        movie.genre.push(req.body.genre);
      }
      movie.reviews.push(review);
      movie.rating.push(req.body.rating);
      const sum = movie.rating.reduce((partialSum, a) => partialSum + a, 0);
      movie.ratingAvg = (sum/movie.rating.length).toFixed(2);
        
        // Check if any review is by that user:
const hasReviewByUser = movieRevs.reviews.some(review =>
  review.userID.equals(userId)
); 
        let movieHasUserReview = false;
        for (let review of movieRevs.reviews) {
          if(review.userID._id.equals(userId)){
            movieHasUserReview = true;
          }
        }
        if(movieHasUserReview){
            console.log("This review already exists, please delete the original to post again");
        }else{
      // Save user to database
      await movie.save();
      // Save user to database
      await review.save();
        }




      // Redirect to login page with success message
      req.session.flashMessage = { 
        type: 'success', 
        text: 'Review successful! Your opinion matter!' 
      };

      res.redirect('/review/submit');


      } catch (error) {
        next(error);
        console.log("error, Bro");
      }
    });
  } catch (error) {
    next(error);
  }
}];

/**
 * Get any movie's cover image by ID
 */
exports.getCoverImage = async (req, res, next) => {
  try {
    // Get user ID from params
    const movieId = req.params.movieId;
    
    // Find image in database
    const image = await MovieImage.findOne({ movieId: movieId });
    
    if (!image || !image.data) {
      return res.status(404).send('Image not found');
    }
    
    // Set the content type header and send the image data
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get movie Search page
 */

exports.getSearch = async (req, res) => {
  // Get flash message from session if it exists
  const flashMessage = req.session.flashMessage;
  // Clear flash message from session
  delete req.session.flashMessage;
    const listTitle = req.params.searchId;

    // Find user by email
    const movies = await Movie.find({ title: new RegExp(`^${listTitle}`, 'i') });
    console.log('User found in database:', !!movies);
    
     // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});  
   res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        sessionUser: user,
        listTitle: listTitle,
        specialList: true
        
    });
};

/**
 * Post movie Search submission
 */

exports.postSearch = async (req, res) => {
  try {
    console.log('Search attempted for Movie:', req.body.title);
    
      res.redirect(`/review/list/search/${req.body.title}`);
  } catch (error) {
    console.error('Review error:', error);
  }
};

  /**
 * Get any review by title
 */
exports.getReviewView = async (req, res) => {
  try {
    const title = req.params.title;
    const movie = await Movie.findOne({ title: title }).populate({
      path:'reviews', 
      populate: {
      path: 'userID',  // nested populate if you also want user info in each review
    }
    });
    
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
    if (!movie) {
      return res.status(404).send('Movie not found '+title);
    }
    
    res.render('review/view', {
      title: 'Movie View',
      movie: movie,
      user: user
  });
  } catch (error) {
    next(error);
  }
};

/**
 * Get default list of all movies
 */

exports.getList = async (req, res) => {
  try {
    const movies = await Movie.find({
  $or: [
    { genre: 'Action' },
    { genre: 'Drama' },
    { genre: 'Comedy' },
    { genre: 'Horror' },
    { genre: 'Romance' },
    { genre: 'Sci-Fi' }
  ]
}).sort({ title: 1 });
    
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
  
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        sessionUser: user,
        listTitle: "All Movies",
        specialList: false
        
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get any user's favorite movie list page
 */

exports.getFavoriteList = async (req, res, next) => {
      console.log("getting favorite list of: ");
  
  try {
    
    // Get user ID from session
    const username = req.params.username;
    const targetUser = await User.findOne({username:username}).populate('favorites');
    const movies = targetUser.favorites; 
    
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
    console.log("target favs: "+ movies);
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        listTitle: targetUser.username+"'s Favorites",
        specialList: true
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 *  Get movie list by specified id in review/list/id/:listId
 *  Used for specialized top 10 list or any pre made special list of movies that may be wanted
 */

exports.getIdList = async (req, res) => {  
  try {
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
    // Get user ID from session
    const id = req.params.listId;
    let listTitle;
    let movies;
    
    switch(id){
      case "Comedy":
        listTitle = "Comedies Top 10";
        movies = await Movie.find({genre:'Comedy'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      case "Drama":
        listTitle = "Dramas Top 10";
        movies = await Movie.find({genre:'Drama'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      case "Action":
        listTitle = "Action Top 10";
        movies = await Movie.find({genre:'Action'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      case "Horror":
        listTitle = "Horror Top 10";
        movies = await Movie.find({genre:'Horror'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      case "Romance":
        listTitle = "Romance Top 10";
        movies = await Movie.find({genre:'Romance'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      case "Sci-Fi":
        listTitle = "Sci-Fi Top 10";
        movies = await Movie.find({genre:'Sci-Fi'}).sort({ ratingAvg: -1 }).limit(10);
        break;
      default:
        listTitle = "Top 10 Movies";
        movies = await Movie.find({
          $or: [
            { genre: 'Action' },
            { genre: 'Drama' },
            { genre: 'Comedy' },
            { genre: 'Horror' },
            { genre: 'Romance' },
            { genre: 'Sci-Fi' }
          ]
        }).sort({ ratingAvg: -1 }).limit(10);
        break;
    }
    
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        listTitle: listTitle,
        specialList: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  Get entire list of a certain genre 
 */

exports.getGenreList = async (req, res) => {  
  try {
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
    // Get user ID from session
    const id = req.params.genreId;
    let listTitle;
    let movies;
    
    switch(id){
      case "Comedy":
        listTitle = "Comedies";
        movies = await Movie.find({genre:'Comedy'}).sort({ ratingAvg: -1 });
        break;
      case "Drama":
        listTitle = "Dramas";
        movies = await Movie.find({genre:'Drama'}).sort({ ratingAvg: -1 });
        break;
      case "Action":
        listTitle = "Action";
        movies = await Movie.find({genre:'Action'}).sort({ ratingAvg: -1 });
        break;
      case "Horror":
        listTitle = "Horror";
        movies = await Movie.find({genre:'Horror'}).sort({ ratingAvg: -1 });
        break;
      case "Romance":
        listTitle = "Romance";
        movies = await Movie.find({genre:'Romance'}).sort({ ratingAvg: -1 });
        break;
      case "Sci-Fi":
        listTitle = "Sci-Fi";
        movies = await Movie.find({genre:'Sci-Fi'}).sort({ ratingAvg: -1 });
        break;
      default:
        listTitle = "All Movies";
        movies = await Movie.find({
          $or: [
            { genre: 'Action' },
            { genre: 'Drama' },
            { genre: 'Comedy' },
            { genre: 'Horror' },
            { genre: 'Romance' },
            { genre: 'Sci-Fi' }
          ]
        }).sort({ ratingAvg: -1 });
        break;
    }
    
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        listTitle: listTitle,
        specialList: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  Post entire movie list by title, only used to search movies from header.ejs
 * (searching a movie title gives you that movie, 
 *  searching letters gives all movies that start with those letterrs, case-insensitive)
 */

exports.postSearchList = async (req, res) => {  
  try {
  
    
    console.log('Search attempted for Movie:', req.body.title);
    

    // Find user by email
    const movies = await Movie.find({ title: new RegExp(`^${req.body.title}`, 'i') });
    console.log('User found in database:', !!movies);
    
    // Check if user exists
    if (!movies) {
      console.log('movie not found in database');
      return res.status(401).render('/', {
        title: 'Index',
        formData: {
          title: req.body.title
        }
      });
    }
     // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
  
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        sessionUser: user,
        listTitle: req.body.title,
        specialList: true
        
    });
  } catch (error) {
    console.error('Review error:', error);
  }
  
  try {
    // Get user ID from session
    const userId = req.session.user.id;
    const user = await User.findOne({_id:userId});
    // Get user ID from session
    const id = req.params.searchId;
    let listTitle;
    let movies;
    
    
      res.render('review/list', {
        title: 'list',
        movies,
        user: user,
        listTitle: listTitle,
        specialList: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review bt ID
 */
exports.deleteReview = async (req, res, next) => {
    try {
      const review = await Review.findByIdAndDelete(req.params.reviewId);
      
      if (!review) {
        return res.status(404).send("Review not found");
      } else{
        console.log(review);
        const movie = await Movie.findById(review.movieID);
        console.log(movie);
        
        movie.reviews = movie.reviews.filter(r => r._id.toString() !== req.params.reviewId);
        
        await movie.save();
        const url = req.get("Referrer");
        res.redirect(req.get("Referrer")|| "/");
      }
    } catch (error) {
      next(error);
    }
  };

