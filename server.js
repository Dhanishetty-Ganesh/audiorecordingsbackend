const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const db = new sqlite3.Database('transcriptions.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS transcriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT)");
});

// Handle upload
app.post('/upload', (req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const text = JSON.parse(body).text;

    db.run('INSERT INTO transcriptions (text) VALUES (?)', [text], (err) => {
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
  db.all('SELECT * FROM transcriptions', (err, rows) => {
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

  db.run('DELETE FROM transcriptions WHERE id = ?', [id], (err) => {
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

