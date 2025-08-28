import express from 'express'
import 'dotenv/config'
const app = express()
const port = process.env.PORT || 3000;
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("campus server is running")
})
app.listen(port, () => {
    console.log(`Our server running on ${port}`);
})
