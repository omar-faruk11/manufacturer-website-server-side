const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.razje.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 const run = async() =>{
    try{
        await client.connect();
        const userCollection = client.db('parts_master').collection('users');
        const partCollection = client.db('parts_master').collection('parts');
        const reviewCollection = client.db('parts_master').collection('reviews');
        console.log("i am running");
        // review area 
        app.get('/reviews',async(req, res)=>{
          const reviews = (await reviewCollection.find().toArray()).reverse();
          res.send(reviews)
        })
        // --------part area---------

        // get all parts 
        app.get('/parts',async(req, res)=>{
          const parts = (await partCollection.find().toArray()).reverse()
          res.send(parts);
        });
        
        // get one part by id 
        app.get('/parts/:id',async(req, res)=>{
          const id = req.params.id;
          const find = {_id:ObjectId(id)};
          const result = await partCollection.findOne(find);
          res.send(result);
        })

        // user area 
        app.get('/users', async(req,res)=>{
          const users = await userCollection.find().toArray();
          res.send(users)
        });

        app.put('/user/:email', async(req, res)=>{
          const email = req.params.email;
          const user = req.body;
          const filter = {email:email}
          const options = { upsert: true };
          const updateDoc = {
            $set: user
      
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1d'})
          res.send({result, token});
        });

        
    }
    finally{

    }

};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  })