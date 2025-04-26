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
  console.log('Connected to MySQL!');
});



var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res) {
  res.render('index', { title: 'Odyssey' });
});

app.get('/tables', (req, res) => {
  connection.query('SHOW TABLES', function(err, results) {
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

  const query = `SELECT * FROM VacationSpots WHERE VacationSpotName LIKE ?`;

  connection.query(query, [`%${keyword}%`], (err, results) =>  {
    if (err) {
      console.error('Error searching for vacation spot', err);
      return res.status(500).json({ error: 'Failed to search for vacation spot' });
    }

    res.json({ searchResults: results });
  });
});
 


app.listen(3008, '0.0.0.0', function () {
  console.log('Node app is running on port 3008');
  console.log("Open at http://localhost:3008");
});


