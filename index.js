// Express server setup with CORS and MongoDB connection
const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Dotenv setup
const dotenv = require('dotenv');
dotenv.config();

// Load environment variables from .env file
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 8000;

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("arenax");
    const facilitiesCollection = db.collection("facilities");
    const bookingCollection = db.collection("bookings");
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Arena X Server is running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


