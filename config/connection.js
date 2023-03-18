dotenv = require('dotenv')
dotenv.config();
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_USERNAME  = process.env.MONGO_USERNAME ;
const MONGO_URI = process.env.MONGO_URI 

const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url=MONGO_URI
    // const url='mongodb://0.0.0.0:27017'
    const dbname='shopping'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}
