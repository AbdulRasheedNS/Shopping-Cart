var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const e = require('express')
const { reject } = require('bcrypt/promises')
const { Db, Collection } = require('mongodb')
const { response } = require('../app')
const async = require('hbs/lib/async')
const { resolve } = require('promise')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_yXozX9Hm96gGsV',
    key_secret: 'DY4FjRzwJdxXQVPPhTkdKyHP',
});

module.exports = {
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Incorrect Password");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Admin Not found");
                resolve({ status: false })
            }
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                }
            ]).toArray()
            resolve(orders)
        })
    },
    shipProduct:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'Shipped'
                }
            })
            resolve()
        })
    },
    getAdminDetailes:(adminId)=>{
        return new Promise(async(resolve,reject)=>{
            admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            resolve(admin)
        })
    },
    updateAdminProfile:(adminDetails,adminId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},
            {
                $set:{
                    Name:adminDetails.Name
                }
            }).then((admin)=>{
                db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)}).then((admin)=>{
                    resolve(admin)
                })
            })
        })
    },
    changePassword:(password,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            bcrypt.compare(password.existingPassword, admin.Password).then(async(status) => {
                if (status) {
                    console.log(password.newPassword);
                    let newPassword = await bcrypt.hash(password.newPassword, 10)
                    db.get().collection(collection.ADMIN_COLLECTION).updateOne({_id:objectId(adminId)},
                    {
                        $set:{
                            Password:newPassword
                        }
                    })
                    success=true
                    resolve(success)
                } else {
                    success=false
                    resolve(success)
                }
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    }
}
