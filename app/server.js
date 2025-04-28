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

  let query;
  let values;

  if (!keyword) {
    // If no keyword, fetch all vacation spots
    query = `SELECT VacationSpotName, CityId FROM VacationSpots ORDER BY VacationSpotName ASC`;
    values = [];
  } else {
    query = `SELECT VacationSpotName, CityId FROM VacationSpots WHERE VacationSpotName LIKE ?`;
    values = [`%${keyword}%`];
  }

  connection.query(query, values, (err, results) => {
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

app.post('/createReview', (req, res) => {
  const { Username, VacationSpotName, ReviewText, ReviewRating } = req.body;

  if (!Username || !VacationSpotName || !ReviewText || !ReviewRating) {
    return res.status(400).json({ error: 'Missing required fields to create review.' });
  }

  // Step 1: Find current maximum ReviewID
  const findMaxReviewIdQuery = `SELECT MAX(ReviewID) AS maxReviewId FROM Reviews`;

  connection.query(findMaxReviewIdQuery, (err, maxResult) => {
    if (err) {
      console.error('Error finding max ReviewID:', err);
      return res.status(500).json({ error: 'Failed to get max ReviewID.' });
    }

    let newReviewId = (maxResult[0].maxReviewId || 1000) + 1; // Start at 1001 if table is empty

    // Step 2: Insert into Reviews with manually set ReviewID
    const insertReviewQuery = `
      INSERT INTO Reviews (ReviewID, Username, ReviewText, ReviewRating, CreatedAt, UpdatedAt, LikeCount)
      VALUES (?, ?, ?, ?, NOW(), NOW(), 0)
    `;
    const reviewValues = [newReviewId, Username, ReviewText, ReviewRating];

    connection.query(insertReviewQuery, reviewValues, (err, reviewResult) => {
      if (err) {
        console.error('Error inserting into Reviews:', err);
        return res.status(500).json({ error: 'Failed to insert into Reviews.' });
      }

      // Step 3: Insert into VacationSpotReviews
      const insertVacationSpotReviewQuery = `
        INSERT INTO VacationSpotReviews (ReviewId, VacationSpotName)
        VALUES (?, ?)
      `;
      const vacationSpotReviewValues = [newReviewId, VacationSpotName];

      connection.query(insertVacationSpotReviewQuery, vacationSpotReviewValues, (err, vacationSpotResult) => {
        if (err) {
          console.error('Error inserting into VacationSpotReviews:', err);
          return res.status(500).json({ error: 'Failed to insert into VacationSpotReviews.' });
        }

        res.json({ message: 'Review created successfully!', reviewId: newReviewId });
      });
    });
  });
});

app.post('/unfavoriteSpot', (req, res) => {
  const { username, vacationSpotName } = req.body;
  if (!username || !vacationSpotName)
    return res.status(400).json({ error: 'Missing data.' });

  const sql = `
    DELETE FROM FavoriteSpots
    WHERE Username = ? AND VacationSpotName = ?
  `;
  connection.query(sql, [username, vacationSpotName], (err, results) => {
    if (err)  return res.status(500).json({ error: 'DB error', details: err });
    if (!results.affectedRows)
      return res.status(404).json({ error: 'Favourite not found.' });
    res.json({ message: 'Un-favourited!' });
  });
});




app.post('/updateReview', (req, res) => {
  const { ReviewID, ReviewText, ReviewRating } = req.body;

  if (!ReviewID) {
    return res.status(400).json({ error: 'ReviewID is required for update.' });
  }

  const query = `
    UPDATE Reviews
    SET ReviewText = ?, ReviewRating = ?
    WHERE ReviewID = ?
  `;

  const values = [ReviewText, ReviewRating, ReviewID];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating review:', err);
      return res.status(500).json({ error: 'Failed to update review.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    res.json({ message: 'Review updated successfully!' });
  });
});


app.post('/deleteReview', (req, res) => {
  const { ReviewID } = req.body;

  if (!ReviewID) {
    return res.status(400).json({ error: 'ReviewID is required for deletion.' });
  }

  const query = `
    DELETE FROM Reviews
    WHERE ReviewID = ?
  `;

  connection.query(query, [ReviewID], (err, results) => {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Failed to delete review.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    res.json({ message: 'Review deleted successfully!' });
  });
});

app.get('/getReviews', (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const query = `
    SELECT 
      r.ReviewID, 
      vsr.VacationSpotName, 
      r.ReviewText, 
      r.ReviewRating, 
      r.CreatedAt
    FROM Reviews r
    JOIN VacationSpotReviews vsr ON r.ReviewID = vsr.ReviewId
    WHERE r.Username = ?
    ORDER BY r.CreatedAt DESC
  `;

  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching user reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews.' });
    }

    res.json({ reviews: results });
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


app.get('/favorite-top-spots', async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'username query-param is required' });
  }

  const conn = connection.promise();

  try {
    await conn.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `
      SELECT fs.Username, fs.VacationSpotName, c.city, v.LikeCount
      FROM   FavoriteSpots fs
      JOIN   VacationSpots  v ON fs.VacationSpotName = v.VacationSpotName
      JOIN   WorldCities    c ON v.CityId          = c.id
      WHERE  fs.Username = ?

      INTERSECT

      SELECT fs.Username, fs.VacationSpotName, c.city, v.LikeCount
      FROM   FavoriteSpots fs
      JOIN   VacationSpots  v ON fs.VacationSpotName = v.VacationSpotName
      JOIN   WorldCities    c ON v.CityId          = c.id
      WHERE  v.LikeCount >= ( SELECT AVG(LikeCount) FROM VacationSpots )
      ORDER  BY LikeCount DESC
      LIMIT  15
      `,
      [username, username]       
    );

    await conn.commit();
    return res.json({ topSpots: rows });

  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    console.error('favorite-top-spots TX failed:', err);
    return res.status(500).json({ error: 'Failed to fetch favourite spots' });
  }
});

app.get('/top-reviews', async (req, res) => {
  const spot = req.query.spot;
  if (!spot) {
    return res.status(400).json({ error: 'spot query-param is required' });
  }

  const conn = connection.promise();

  try {
    await conn.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `
      SELECT  r.ReviewID,
              r.Username,
              r.ReviewText,
              r.ReviewRating,
              r.CreatedAt,
              r.LikeCount,
              vsr.VacationSpotName,
              i.ImageURL
      FROM    Reviews             r
      JOIN    VacationSpotReviews vsr ON r.ReviewID = vsr.ReviewID
      LEFT    JOIN Images         i   ON r.ReviewID = i.ReviewID
      WHERE   vsr.VacationSpotName = ?
        AND   r.LikeCount >= (
                SELECT AVG(LikeCount)
                FROM   Reviews
                WHERE  ReviewID IN (
                        SELECT ReviewID
                        FROM   VacationSpotReviews
                        WHERE  VacationSpotName = ?
                      )
              )
      ORDER BY r.LikeCount DESC,
               r.CreatedAt DESC
      LIMIT 3
      `,
      [spot, spot]               
    );

    await conn.commit();
    return res.json({ reviews: rows });

  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    console.error('top-reviews TX failed:', err);
    return res.status(500).json({ error: 'Failed to fetch top reviews' });
  }
});





app.listen(3008, '0.0.0.0', function () {
  console.log('Node app is running on port 3008');
  console.log("Open at http://localhost:3008");
});


