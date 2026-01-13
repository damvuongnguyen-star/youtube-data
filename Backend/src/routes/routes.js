const express = require('express');
const router = express.Router(); 

const pricontroller = require('../controllers/Privatecontroller');
const publiccontroller = require('../controllers/Publiccontroller');

// private user
router.get('/auth/google', pricontroller.loginGoogle); 
router.get('/auth/google/callback', pricontroller.GoogleCallBack);

// public user
router.post('/publicscan', publiccontroller.getDataByUrl);

module.exports = router;