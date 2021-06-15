const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

app.use(bodyParser.json());

//import routes
const postRoute = require('./routes/posts');

app.use('/posts', postRoute);

// routes
app.get('/', (req,res)=>{
    res.send('home');
});


//connection
mongoose.connect(process.env.DB_CONNECTION, { useUnifiedTopology: true , useNewUrlParser: true },()=>
console.log('connected to db'));

app.listen(3000);

// const { MongoClient } = require("mongodb");

// const uri ="mongodb+srv://rahmadila:KmIqaduJyHAtREpe@cluster0.vegi4.mongodb.net/test";
// const dbName ="TokoPakaian";

// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// client.connect((error, client)=>{
//     if (error) {
//         return console.log("koneksi gagal");
//     }
//     // pilih db
//     const db=client.db(dbName);
//   //menambahkan data
//   db.collection("Baju").insertOne(
//       {
//           nama:"dila dress"
//       },
//       (error, result)=>{
//           if(error){
//               return console.log("gagal");
//           }
//           console.log(result);
//       }
//   )
// });