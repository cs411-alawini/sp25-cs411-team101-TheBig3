var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
                host: '34.45.188.75',
                user: 'root',
                password: 'root',
                database: 'odyssey-db-sp25'
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
app.use(express.static(__dirname + '../public'));

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res) {
  res.render('index', { title: 'Odssey' });
});
   

// Show all tables in the connected database
connection.query("SHOW TABLES", function(err, results) {
  if (err) {
    return console.error("Error fetching tables:", err);
  }
  console.log("Tables in the database:");
  results.forEach(row => console.log(Object.values(row)[0]));
});


app.listen(3008, function () {
    console.log('Node app is running on port 80');
});

