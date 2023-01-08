// const mongoClient=require('mongodb').MongoClient
// const state={
//     db:null
// }

// module.exports.connect=function(done){
//     const url='mongodb+srv://AbdulRasheedNS:66252442@cluster0.ftsizz2.mongodb.net/?retryWrites=true&w=majority'
//     // const url='mongodb://0.0.0.0:27017'
//     const dbname='shopping'

//     mongoClient.connect(url,(err,data)=>{
//         if(err) return done(err)
//         state.db=data.db(dbname)
//         done()
//     })
// }

// module.exports.get=function(){
//     return state.db
// }

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://AbdulRasheedNS:66252442@cluster0.ftsizz2.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   db="sample_analytics"
//   db.get().collection('accounts').find().toArray().then((result)=>{
//     console.log(result);
//   })
//   client.close();
// });
// const mongoClient = require('mongodb').MongoClient
// const state = {
//     db: 'shopping'
// }

// module.exports.connect = function (done) {
//     const url = `mongodb+srv://AbdulRasheedNS:66252442@cluster0.ftsizz2.mongodb.net/?retryWrites=true&w=majority`;

//     const connectionParams = {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }
//     mongoClient.connect(url, connectionParams)
//         .then(() => {
//             console.log('Connected to the database ')
//         })
//         .catch((err) => {
//             console.error(`Error connecting to the database. n${err}`);
//         })
// }
// module.exports.get = function () {
//     return state.db
// }