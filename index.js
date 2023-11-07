const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://dreamAdmin:zSasI4AlU9xeuCLP@mern-cluster.voqlfwt.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware started
app.use(cors());
app.use(express.json());

//....middle end

async function run() {
  try {
    await client.connect();

    const database = client.db("dream-eleven-db");
    const countryCollection = database.collection("countries");
    const playerCollection = database.collection("players");
    const squadCollection = database.collection("squad");

    app.get("/countries", async (req, res) => {
      try {
        const countries = await countryCollection.find().toArray();
        res.send(countries);
      } catch (err) {
        console.log(err);
      }
    });

    app.get("/players", async (req, res) => {
      try {
        const query = req.query;
        const players = await playerCollection.find(query).toArray();
        res.send(players);
      } catch (err) {
        console.log(err);
      }
    });

    app.get("/player/:id", async (req, res) => {
      try {
        console.log(req.params.id);
        if (req.params?.id?.length == 24) {
          const query = { _id: new ObjectId(req.params.id) };
          console.log(query);
          const singlePlayer = await playerCollection.findOne(query);
          res.send(singlePlayer);
        } else {
          res.send({
            err: "input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    // app.get("/players/:country", async (req, res) => {
    //   try {
    //     // console.log(req.params);
    //     const country = { country: req.params.country };
    //     const players = await playerCollection.find(country).toArray();
    //     res.send(players);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
    app.get("/mySquad", async (req, res) => {
      try {
        const query = { ownerEmail: req.query?.email };

        if (req.query?.email) {
          const players = await squadCollection.find(query).toArray();
          res.send(players);
        } else {
          res.send([]);
        }
      } catch (err) {
        console.log(err);
      }
    });

    app.post("/addToSquad", async (req, res) => {
      const body = req.body;
      console.log(body);
      //   res.send({ res: body });
      const result = await squadCollection.insertOne(body);
      res.send(result);
    });

    app.post("/addPlayer", async (req, res) => {
      const body = req.body;
      console.log(body);
      //   res.send({ res: body });
      const result = await playerCollection.insertOne(body);
      res.send(result);
    });

    app.delete("/squad/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await squadCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/player/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const query = { _id: new ObjectId(id) };
      const data = {
        $set: {
          ...updatedData,
        },
      };
      const result = await playerCollection.updateOne(query, data);
      res.send(result);
    });

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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
