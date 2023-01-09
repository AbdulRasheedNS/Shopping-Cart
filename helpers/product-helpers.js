var db = require('../config/connection')
var collection = require('../config/collections')
const { promise, reject } = require('bcrypt/promises')
const { PRODUCT_COLLECTION } = require('../config/collections')
const { response, get } = require('../app')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
module.exports = {

    addProduct: (product,imageFile, callback) => {
        product.image=imageFile
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (prodId) => {
        return new Promise(async(resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) })
            console.log(product.image);
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then(() => {
                //console.log(response);
                resolve(product.image)
            })
        })
    },
    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            console.log(proId);
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: proDetails.Name,
                        Description: proDetails.Description,
                        Price: proDetails.Price,
                        Category: proDetails.Category
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    }
}