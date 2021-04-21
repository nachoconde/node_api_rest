const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed')

const { body } = require('express-validator')

//GET /feed/post
router.get('/post', feedController.getPost);

router.post('/post', [
    body('title').
        trim().
        isLength({ min: 5 }),
    body('content').
        trim().
        isLength({ min: 5 })
], feedController.postPost);

module.exports = router;