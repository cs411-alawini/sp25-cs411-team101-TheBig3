var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Homepage' });
});

// Explore page
router.get('/explore', (req, res) => {
  res.render('explore', { title: 'Explore' });
});

// Profile page
router.get('/profile', (req, res) => {
  res.render('profile', { title: 'Profile' });
});

// Browse page
router.get('/browse', (req, res) => {
  res.render('browse', { title: 'Browse Spots' });
});

router.get('/log', (req, res) => {
  res.render('log', { title: 'Trip Log' });
});

module.exports = router;
