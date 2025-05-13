/**
 * Review routes
 */
const express = require('express');
const router = express.Router();

// Controller imports
const reviewController = require('../controllers/reviewController');


// GET /review/list - list of all movies
router.get('/list', reviewController.getList);

// GET /review/list/user/:username - list of all of a user's favorite movies
router.get('/list/user/:username', reviewController.getFavoriteList);

// GET /review/list/id/:listId - specialized list made by us
router.get('/list/id/:listId', reviewController.getIdList);

// GET /review/list/genre/:genreId - list all movies in a genre
router.get('/list/genre/:genreId', reviewController.getGenreList);

// GET /review/submit - review submission page
router.get('/submit', reviewController.getReviewSubmit);

// POST /review/submit - post review
router.post('/submit', reviewController.postReview);

//GET /review/delete/:reviewId - delete a review
router.get('/delete/:reviewId',reviewController.deleteReview);

// GET /review/cover-image/:movieId - Get any movie's cover image by ID
router.get('/cover-image/:movieId', reviewController.getCoverImage);


// GET /review/view/:title - individual movie page 
router.get('/view/:title', reviewController.getReviewView);

// GET /review/list/search/:searchId - list of movis queried through search bar in header
router.get('/list/search/:searchId', reviewController.getSearch);

// POST /list/search - post queried movie search
router.post('/list/search', reviewController.postSearch);

module.exports = router;