const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzfctdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("parcelDB");
    const parcelCollection = db.collection("parcels");

    // Routes
    app.get("/", (req, res) => {
      res.send("Parcel Server is running");
    });

    // pacels related APIs
    app.get("/parcels", async (req, res) => {
      try {
        const parcels = await parcelCollection.find().toArray();
        res.send(parcels);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch parcels" });
      }
    });

    app.get("/my-parcels", async (req, res) => {
      try {
        const { email } = req.query;

        const query = email ? { createdBy: email } : {};
        const parcels = await parcelCollection
          .find(query)
          .sort({ _id: -1 }) // Sort by latest first
          .toArray();

        res.send(parcels);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch parcels" });
      }
    });

    app.post("/parcels", async (req, res) => {
      try {
        const newParcel = req.body;
        const result = await parcelCollection.insertOne(newParcel);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting parcel:", error);
        res.status(500).send({ message: "Failed to create parcel" });
      }
    });

    app.delete("/parcels/:id", async (req, res) => {
      try {
        const parcelId = req.params.id;

        const result = await parcelCollection.deleteOne({
          _id: new ObjectId(parcelId),
        });

        res.send(result);
      } catch (error) {
        console.error("Error deleting parcel:", error);
        res
          .status(500)
          .send({ success: false, message: "Failed to delete parcel" });
      }
    });

    // Start server after DB connection
    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

run().catch(console.dir);
