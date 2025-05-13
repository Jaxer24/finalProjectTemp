/**
 * Review routes
 */
const express = require('express');
const router = express.Router();

// Controller imports
const reviewController = require('../controllers/reviewController');


// GET /user/profile - User profile page
router.get('/list', reviewController.getList);

// GET /user/profile - User profile page
router.get('/list/user/:username', reviewController.getFavoriteList);

// GET /user/profile - User profile page
router.get('/list/id/:listId', reviewController.getIdList);

// GET /user/profile - User profile page
router.get('/list/genre/:genreId', reviewController.getGenreList);

// GET /user/profile - User profile page
router.get('/submit', reviewController.getReviewSubmit);

// POST /review/submit - 
router.post('/submit', reviewController.postReview);

router.get('/delete/:reviewId',reviewController.deleteReview);

// GET /user/profile-image/:userId - Get any user's profile image by ID
router.get('/cover-image/:movieId', reviewController.getCoverImage);


// GET /user/profile - User profile page
router.get('/view/:title', reviewController.getReviewView);

// GET /user/profile - User profile page
router.get('/list/search/:searchId', reviewController.getSearch);

// GET /user/profile - User profile page
router.post('/list/search', reviewController.postSearch);

module.exports = router;