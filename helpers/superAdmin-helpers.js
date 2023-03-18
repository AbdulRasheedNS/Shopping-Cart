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

    doSuperAdminSignup: () => {
        return new Promise(async (resolve, reject) => {
            let superAdminData = await db.get().collection(collection.SUPERADMIN_COLLECTION).findOne({ Email: 'superadmin@gmail.com' })
            if (!superAdminData) {
                let superAdmin = {
                    Name: 'SuperAdmin',
                    Email: 'superadmin@gmail.com',
                    Password: '123'
                }
                superAdmin.Password = await bcrypt.hash(superAdmin.Password, 10)
                db.get().collection(collection.SUPERADMIN_COLLECTION).insertOne(superAdmin).then((data) => {
                    console.log(data);
                    resolve()
                })
            } else {
                resolve()
            }
        })
    },
    doSuperAdminLogin: (superAdminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let superAdmin= await db.get().collection(collection.SUPERADMIN_COLLECTION).findOne({ Email: superAdminData.Email })
            if (superAdmin) {
                bcrypt.compare(superAdminData.Password, superAdmin.Password).then((status) => {
                    if (status) {
                        console.log('Login Success');
                        response.superAdmin = superAdmin
                        response.status = true
                        resolve(response)
                    } else {
                        response.status=false
                        resolve(response)
                    }
                })
            }else{
                response.status=false
                resolve(response)
            }
        })
    },
    addAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response={}
            let existAdmin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (!existAdmin) {
                adminData.Password = await bcrypt.hash(adminData.Password, 10)
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                    response.id=data.insertedId
                    resolve(response)
                })
            } else {
                response.err = 'Email is already Used'
                resolve(response)
            }
        })
    },
    getAllAdmins: () => {
        return new Promise(async (resolve, reject) => {
            let admins = await db.get().collection(collection.ADMIN_COLLECTION).find().toArray()
            resolve(admins)
        })
    },
    getAdminDetails: (adminId) => {
        return new Promise(async (resolve, reject) => {
            admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: objectId(adminId) })
            resolve(admin)
        })
    },
    removeAdmin: (adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).deleteOne({ _id: objectId(adminId) }).then(()=>{
                resolve()
            })
        })
    }

}