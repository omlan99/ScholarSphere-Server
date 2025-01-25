const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.stripe_key);

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_admin}:${process.env.DB_pass}@cluster0.e6udf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    const shcholarshipCollection = client
      .db("ScholarshipDB")
      .collection("Scholarship");
    const userCollection = client.db("ScholarshipDB").collection("users");
    const reviewCollection = client.db("ScholarshipDB").collection("reviews");
    const applicationCollection  = client.db('ScholarshipDB').collection('applications')

    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.access_token, {
        expiresIn: "1h",
      });

      res.send(token);
    });

    // all sholarship data api
    app.get("/scholarship", async (req, res) => {
      const query = {};
      const search = req.query?.search;
      if (search) {
        query.$or = [
          { university_name: { $regex: search, $options: "i" } }, // Match name
          { subject_name: { $regex: search, $options: "i" } }, // Match city
          { scholarship_category: { $regex: search, $options: "i" } }, // Match country
        ];
      }
      const result = await shcholarshipCollection.find(query).toArray();
      res.send(result);
    });
    

    // post scholarship api
    app.post("/scholarship", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await shcholarshipCollection.insertOne(data);
      res.send(result);
    });

    // id specifice scholarship get api
    app.get("/scholarship/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shcholarshipCollection.findOne(query);
      res.send(result);
    });
  // scholarship delete api
    app.delete('/scholarship/:id', async (req, res) =>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await shcholarshipCollection.deleteOne(query)
      res.send(result)
    })
    // user get  api
    app.get("/users", async (req, res) => {
      const email = req.query?.email;
      if (email) {
        const query = { email: email };
        const result = await userCollection.findOne(query);
        if (result) {
          return res.send(result);
        }
      }
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    //  user post api 
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const listedUser = await userCollection.findOne(query);
      if (listedUser) {
        return res.send({ message: "User aleready existed" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
        // user delete api
        app.delete("/users/:id", async (req, res) => {
          const userId = req.params.id;
          const query = { _id: new ObjectId(userId) };
          const result = await userCollection.deleteOne(query);
          res.send(result);
        });
    
    // review collection
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews" , async(req,res) => {
      const reviewData = req.body
      const result = await reviewCollection.insertOne(reviewData)
    })

    // appliation api
    app.get('/applications', async (req, res) =>{
      const email = req.query?.email
      if(email){
        query ={email : email}
        const result = await applicationCollection.find(query).toArray
        res.send(result)
      }
        const result = await applicationCollection.find().toArray() 
        res.send(result)
    })

    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });


    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // ); 
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Data coming soon");
});

app.listen(port, () => {
  console.log("app is running at port :", port);
});
