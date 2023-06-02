const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//App
const app = express();

//Port
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Routes

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krgxiog.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("toyDB");
    const carsCollection = db.collection("carsCollection");

    //get all toys
    app.post("/toyslimit", async (req, res) => {
      try {
        const limit = req.query.limit;
        console.log(limit);
        const query = {};
        const result = await carsCollection
          .find(query)
          .limit(parseInt(limit))
          .toArray();
        res.status(200).send(result);
      } catch (err) {
        console.error("Error retrieving toys from MongoDB:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.get("/toys", async (req, res) => {
      const email = req.query.email;
      try {
        if (email) {
          const query = { sellerEmail: email };
          const result = await carsCollection.find(query).toArray();
          res.status(200).json(result);
        } else {
          const query = {};
          const result = await carsCollection.find(query).toArray();
          res.status(200).json(result);
        }
      } catch (err) {
        console.error("Error retrieving toys from MongoDB:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.get("/sort", async (req, res) => {
      const sortBy = req.query.sort;
      console.log(sortBy);
      if (sortBy === "asc") {
        const result = await carsCollection
          .find({})
          .sort({ price: 1 })
          .toArray();
        res.send(result);
      } else {
        const result = await carsCollection
          .find({})
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      }
    });

    //get single toy by id
    app.get("/toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ error: "Toy not found" });
        }

        res.send(result);
      } catch (err) {
        console.error("Error retrieving toy from MongoDB:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //Add Toy
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await carsCollection.insertOne(toy);
      res.status(201).send(result);
    });

    //Update
    app.patch("/toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const toy = req.body;
        const query = { _id: new ObjectId(id) };
        const updatedToy = {
          $set: {
            title: toy.title,
            category: toy.category,
            price: toy.price,
            rating: toy.rating,
            quantity: toy.quantity,
            description: toy.description,
            picture: toy.picture,
          },
        };
        // const options = { upsert: true };
        const result = await carsCollection.updateOne(query, updatedToy);
        res.send(result);
      } catch (err) {
        console.error("Error updating chocoletes in MongoDB:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.error("Error deleting Toy from MongoDB:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to toy marketplace");
});

app.listen(port, () => {
  console.log(`Server is running on port :${port}`);
});
