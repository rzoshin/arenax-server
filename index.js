// Express server setup with CORS and MongoDB connection
const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Dotenv setup
const dotenv = require('dotenv');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));
const verifyToken = async (req, res, next) => {
  const header = req?.headers.authorization;
  if(!header) {
    return res.status(401).send({message: "Unauthorized"})
  }
  const token = header.split(" ")[1];
  if(!token) {
    return res.status(401).send({message: "Unauthorized"})
  }
  
  try {
    const {payload} = await jwtVerify(token, JWKS);
    console.log(payload);
    next()
  }
  catch (error) {
    return res.status(401).send({message: "Unauthorized"})
  }
   
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("arenax");
    const facilitiesCollection = db.collection("facilities");
    const bookingCollection = db.collection("bookings");

    // Get all facilities from the database according to some query parameters
    app.get('/facilities', async (req, res) => {
    const { ownerEmail, search, type } = req.query;
    const query = {};
    if (ownerEmail) query.ownerEmail = ownerEmail;
    if (search) query.facilityName = { $regex: search, $options: 'i' };
    if (type && type !== 'All') query.facilityType = { $regex: `^${type}$`, $options: 'i' };
    const facilities = await facilitiesCollection.find(query).toArray();
    res.send(facilities);
  });

    // Add new facility to the database
    app.post('/facilities', async (req, res) => {
      const facilityData = req.body;
      const result = await facilitiesCollection.insertOne(facilityData);

      res.send(result);
    })

    // Get a specific facility by ID
    app.get('/facilities/:id', verifyToken, async (req, res,) => {
      const id = req.params.id;

      const result = await facilitiesCollection.findOne(
        { _id: new ObjectId(id) }
      )
      res.send(result);
    })

    // Update a specific facility by ID
    app.patch('/facilities/:id', verifyToken, async(req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await facilitiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      )
      res.send(result);
    })

    // Delete a specific facility by ID
    app.delete('/facilities/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await facilitiesCollection.deleteOne(
        { _id: new ObjectId(id) }
      )
      res.send(result);
    })

    // Add new booking to the database
    app.post("/bookings", verifyToken, async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.send(result);
    })

    // Get bookings for a specific user by user ID
    app.get("/bookings/:userId", verifyToken, async (req, res) => {
      const userId = req.params.userId;
      const result = bookingCollection.find({ userId });
      const bookings = await result.toArray();
      res.send(bookings);
    })

    app.delete('/bookings/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await bookingCollection.deleteOne(
        { _id: new ObjectId(id) }
      )
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

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


