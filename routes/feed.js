const express = require ('express');
const router =  express.Router();
const feedController = require ('../controllers/feed')

//GET /feed/post
router.get ('/post', feedController.getPost);
router.post ('/post', feedController.postPost);

module.exports = router;