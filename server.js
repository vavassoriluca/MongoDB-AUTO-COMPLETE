// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas!");

    const db = client.db('sample_mflix');
    const moviesCollection = db.collection('movies');

    // Serve static files from the 'public' directory
    app.use(express.static(path.join(__dirname, 'public')));

    // Autocomplete API endpoint
    app.get('/api/autocomplete', async (req, res) => {
      try {
        const query = req.query.arg;
        if (!query || query.length < 3) {
          return res.json([]);
        }

        const pipeline = [
          {
            $search: {
              index: 'ix_autocomplete',
              autocomplete: {
                query: query,
                path: 'title',
                tokenOrder: 'any'
              }
            }
          },
          {
            $project: {
              title: 1,
              _id: 0,
              year: 1
            }
          },
          {
            $limit: 15
          }
        ];

        const results = await moviesCollection.aggregate(pipeline).toArray();
        res.json(results);
      } catch (error) {
        console.error('Error during autocomplete search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Full search API endpoint
    app.get('/api/search', async (req, res) => {
      try {
        const query = req.query.arg;
        if (!query) {
          return res.json([]);
        }

        const pipeline = [
          {
            $search: {
              index: "title_fullplot", // Use the correct index name
              compound: {
                should: [
                  {
                    text: {
                      query: query,
                      path: 'title',
                      score: { "boost": { "value": 5 } }
                    }
                  },
                  {
                    text: {
                      query: query,
                      path: 'fullplot',
                      score: { "boost": { "value": 1 } }
                    }
                  }
                ]
              }
            }
          },
          {
            $project: {
              title: 1,
              _id: 0,
              year: 1,
              fullplot: 1,
              score: { $meta: 'searchScore' }
            }
          },
          {
            $limit: 15
          }
        ];

        const results = await moviesCollection.aggregate(pipeline).toArray();
        res.json(results);
      } catch (error) {
        console.error('Error during full search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });

  } finally {
    // No need to close the connection here, as the server will keep it open.
  }
}

run().catch(console.dir);