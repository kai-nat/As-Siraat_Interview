const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const pool = require("./db");
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.post("/score", (req, res) => {
  const { username, score } = req.body;
  pool.query(
    "INSERT INTO scores (username, score) VALUES ($1, $2)",
    [username, score],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

app.get("/scores", (req, res) => {
  pool.query(
    "SELECT * FROM scores ORDER BY score DESC LIMIT 10",
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result.rows);
    }
  );
});

async function createScoresTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE scores (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        score INTEGER NOT NULL
      )
    `);
    console.log("Created scores table");
  } finally {
    client.release();
  }
}

createScoresTable()
  .then(() => {
    app.listen(3001, () => {
      console.log("Express app listening on port 3001");
    });
  })
  .catch((err) => {
    console.error("Error creating scores table:", err);
  });
