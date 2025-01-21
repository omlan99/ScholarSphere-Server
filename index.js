const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_admin}:${process.env.DB_pass}@cluster0.e6udf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    const shcholarshipCollection = client.db('ScholarshipDB').collection('Scholarship')

        // jwt related api
        app.post("/jwt", async (req, res) => {
          const user = req.body;
    
          const token = jwt.sign(user, process.env.access_token, {
            expiresIn: "1h",
          });
    
          res.send(token);
        });
    app.get('/scholarship', async(req, res)=>{
        const query ={}
        const search = req.query?.search
        if (search) {
          query.$or = [
            { university_name: { $regex: search, $options: "i" } }, // Match name
            { "university_location.city": { $regex: search, $options: "i" } }, // Match city
            { "university_location.country": { $regex: search, $options: "i" } }, // Match country
          ]
        }
        const result = await shcholarshipCollection.find(query).toArray()
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res) =>{
    res.send('Data coming soon')
})

app.listen(port, () =>{
    console.log('app is running at port :', port)
})