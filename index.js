const express = require('express')
const app = express()
const cors= require('cors');
const admin = require('firebase-admin');
const port = 5000;
require('dotenv').config()
var serviceAccount = require("./configs/burj-al-arab0-c8171-firebase-adminsdk-kbv6s-b3546383f2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
//console.log(process.env.DB_USER,process.env.DB_PASS);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.he6ho.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  console.log('success');
  app.post('/addBooking',(req, res)=>{
    const newBooking=req.body;
    bookingCollection.insertOne(newBooking)
    .then(result=>{
        res.send(result.insertedCount>0)
    })
    
  })
  app.get('/booking', (req, res) => {
    // idToken comes from the client app
    const bearer=req.headers.authorization
    if(bearer&&bearer.startsWith('Bearer ')){
        const idToken=bearer.split(' ')[1]
        
        admin.auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        const queryEmail=req.query.email;
        
        if(tokenEmail==queryEmail){
            bookingCollection.find({email:queryEmail})
            .toArray((err,documents)=>{
            res.status(200).send(documents)
            })
        }
        else{
          res.status(401).send('un-authorize access')
        }
        // ...
      })
      .catch((error) => {
        // Handle error
        res.status(401).send('un-authorize access')
      });
    }else{
      res.status(401).send("un-authorize access");
    }
  })
});

app.listen(port)