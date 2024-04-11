const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());

// MySQL database connection configuration
const db = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

// Handle upload
app.post('/upload', (req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const text = JSON.parse(body).text;

    // Insert into transcriptions table
    db.query('INSERT INTO transcriptions (text) VALUES (?)', [text], (err, result) => {
      if (err) {
        console.error('Error inserting text:', err.message);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Text inserted successfully');
        res.status(200).send('Text uploaded successfully');
      }
    });
  });
});

// Retrieve recordings list
app.get('/recordings', (req, res) => {
  // Select all rows from transcriptions table
  db.query('SELECT * FROM transcriptions', (err, rows) => {
    if (err) {
      console.error('Error retrieving recordings:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).json(rows);
    }
  });
});

// Delete a recording
app.delete('/recordings/:id', (req, res) => {
  const id = req.params.id;

  // Delete from transcriptions table where id matches
  db.query('DELETE FROM transcriptions WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting recording:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Recording deleted successfully');
      res.status(200).send('Recording deleted successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
