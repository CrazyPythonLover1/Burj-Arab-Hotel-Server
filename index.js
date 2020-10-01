const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgaci.mongodb.net/BurjALArab?retryWrites=true&w=majority`;

const app = express()
const port = 5000

app.use(cors());
app.use(bodyParser.json())


var serviceAccount = require("./configs/burj-al-arab-restaurant-firebase-adminsdk-p1q4o-b867e98223.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-restaurant.firebaseio.com"
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("BurjALArab").collection("booking");

  app.post('/addbooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      // idToken comes from the client app
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents)
              })
          }
          else{
            res.status(401).send("Unauthorized access")
          }
        })
        .catch(function (error) {
          res.status(401).send("Unauthorized access")
        });
    }else{
      res.status(401).send("Unauthorized access")
    }
  })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


