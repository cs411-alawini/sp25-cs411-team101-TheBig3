var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
  host: '34.45.188.75',
  user: 'root',
  password: 'root',
  database: 'images'
});


connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL correctly!');
});



var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



var pagesRouter = require('./routes/pages');
// console.log('Pages router loaded:', pagesRouter);

app.use('/', pagesRouter);

// app.get('/', function(req, res) {
//   res.render('index', { title: 'Odyssey' });
// });


app.get('/tables', (req, res) => {
  connection.query('SHOW TABLES', function (err, results) {
    if (err) {
      console.error("Error fetching tables:", err);
      return res.status(500).json({ error: 'Failed to retrieve tables' });
    }

    const tableNames = results.map(row => Object.values(row)[0]);
    res.json({ tables: tableNames });
  });
});

app.get('/users/top10', (req, res) => {
  const query = 'SELECT * FROM UserAccounts LIMIT 10';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }

    res.json({ users: results });
  });
});


app.get('/search', (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: 'Missing keyword for search' });
  }

  const query = `SELECT VacationSpotName, CityId FROM VacationSpots WHERE VacationSpotName LIKE ?`;

  connection.query(query, [`%${keyword}%`], (err, results) => {
    if (err) {
      console.error('Error searching for vacation spot', err);
      return res.status(500).json({ error: 'Failed to search for vacation spot' });
    }

    res.json({ searchResults: results });
  });
});

app.get('/getUserInfo', (req, res) => {
  const query = `SELECT * FROM UserAccounts LIMIT 1`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user info', err);
      return res.status(500).json({ error: 'Failed to fetch user info' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No user found' });
    }

    res.json({ user: results[0] });
  });
});



app.post('/updateUserInfo', (req, res) => {
  const { Username, ProfileDescription, Gender, Country, Age } = req.body;

  if (!Username) {
    return res.status(400).json({ error: 'Username is required for update.' });
  }

  const query = `
    UPDATE UserAccounts
    SET 
      ProfileDescription = ?,
      Gender = ?,
      Country = ?,
      Age = ?
    WHERE Username = ?
  `;

  const values = [ProfileDescription, Gender, Country, Age, Username];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating user info', err);
      return res.status(500).json({ error: 'Failed to update user info' });
    }

    res.json({ message: 'User info updated successfully!' });
  });
});

app.post('/likeReview', (req, res) => {
  const { ReviewID } = req.body;

  if (!ReviewID) {
    return res.status(400).json({ error: 'ReviewID is required.' });
  }

  const query = `
    UPDATE Reviews
    SET LikeCount = LikeCount + 1
    WHERE ReviewID = ?
  `;

  connection.query(query, [ReviewID], (err, results) => {
    if (err) {
      console.error('Error updating LikeCount', err);
      return res.status(500).json({ error: 'Failed to update like count' });
    }

    // After updating, fetch the updated LikeCount to send back
    connection.query(
      'SELECT LikeCount FROM Reviews WHERE ReviewID = ?',
      [ReviewID],
      (err, likeResults) => {
        if (err || likeResults.length === 0) {
          console.error('Error fetching updated LikeCount', err);
          return res.status(500).json({ error: 'Failed to fetch updated like count' });
        }

        res.json({ updatedLikeCount: likeResults[0].LikeCount });
      }
    );
  });
});

app.get('/getLocation', (req, res) => {
  const { cityId } = req.query;

  if (!cityId) {
    return res.status(400).json({ error: 'cityId is required.' });
  }

  const query = `
    SELECT lat, lng
    FROM WorldCities
    WHERE id = ?
  `;

  connection.query(query, [cityId], (err, results) => {
    if (err) {
      console.error('Error fetching location', err);
      return res.status(500).json({ error: 'Failed to fetch location' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'City not found.' });
    }


    const { lat, lng } = results[0];
    res.json({ lat, lng });

  });
});



app.get('/getUserFeed', (req, res) => {
  const query = `
    SELECT ReviewID, Username, ReviewText, ReviewRating, CreatedAt, LikeCount
    FROM (
        SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
        FROM Reviews r
        JOIN Follows f ON r.Username = f.followeeUsername
        WHERE f.followerUsername = 'nancy57'

        UNION

        SELECT r.ReviewID, r.Username, r.ReviewText, r.ReviewRating, r.CreatedAt, r.LikeCount
        FROM Reviews r
        JOIN (
            SELECT f.followeeUsername
            FROM Follows f
            GROUP BY f.followeeUsername
            ORDER BY COUNT(DISTINCT f.followerUsername) DESC
            LIMIT 20
        ) AS TopUsers
        ON r.Username = TopUsers.followeeUsername
    ) AS ReviewFeed
    ORDER BY CreatedAt DESC
    LIMIT 15
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user feed:', err);
      return res.status(500).json({ error: 'Failed to fetch user feed' });
    }

    res.json({ feed: results });
  });
});





app.listen(3008, '0.0.0.0', function () {
  console.log('Node app is running on port 3008');
  console.log("Open at http://localhost:3008");
});


