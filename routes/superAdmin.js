var express = require('express');
const async = require('hbs/lib/async');
const { Db } = require('mongodb');
const { response } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const superAdminHelpers = require('../helpers/superAdmin-helpers');
const { verifyPayment } = require('../helpers/user-helpers');
const { route } = require('./admin');

verifyLogin = (req, res, next) => {
    if (req.session.superAdminLoggedIn) {
        next()
    } else {
        res.redirect('/superAdmin/login')
    }
}

router.get('/', verifyLogin, (req, res) => {
    superAdminHelpers.getAllAdmins().then((admins) => {
        res.render('superAdmin/view-admins', { admins, superAdmin:req.session.superAdmin })
    })
})

// router.get('/Signup',(req,res)=>{
//     superAdminHelpers.doSuperAdminSignup()
//     res.render('',{superAdmin:true})
// })

router.get('/login', async (req, res) => {
    let err = req.session.superAdminLoginErr
    console.log(err);
    await superAdminHelpers.doSuperAdminSignup()
    res.render('superAdmin/login', { err, superAdmin:req.session.superAdmin, noHeader:true})
    err = null
})
router.post('/login', (req, res) => {
    superAdminHelpers.doSuperAdminLogin(req.body).then((response) => {
        if (response.status) {
            req.session.superAdmin=response.superAdmin
            req.session.superAdminLoggedIn = true
            res.redirect('/superAdmin')
        } else {
            req.session.superAdminLoginErr = 'Login Failed'
            res.redirect('/superAdmin/login')
        }
    })
})
router.get('/logout',(req,res)=>{
    req.session.superAdmin=null
    req.session.superAdminLoggedIn=false
    res.redirect('/superAdmin/login')
})
router.get('/add-admin', (req, res) => {
    res.render('superAdmin/add-admin',{superAdmin:req.session.superAdmin})
})
router.post('/add-admin',verifyLogin, (req, res) => {
    superAdminHelpers.addAdmin(req.body).then((response) => {
        if (!response.err) {
            console.log('Admin Added Successfully')
            if (req.files) {
                let image = req.files.Image
                image.mv('./public/admin-images/' + response.id + '.jpg', (err, done) => {
                    if (!err) {
                        res.redirect("/superAdmin")
                    } else {
                        console.log(err);
                    }
                })
            } else {
                res.redirect("/superAdmin")
            }
        } else {
            res.render('superAdmin/add-admin', {err:response.err})
            err = null
        }
    })
})
router.get('/remove-admin/:id',verifyLogin, async (req, res) => {
    await superAdminHelpers.removeAdmin(req.params.id)
    res.redirect('/superAdmin')
})
router.get('/view-products',verifyLogin,async(req,res)=>{
    let products=await productHelpers.getAllProducts()
    res.render('admin/view-products',{superAdmin:req.session.superAdmin,products})
})
router.get('/view-users',verifyLogin,async(req,res)=>{
    let users=await adminHelpers.getAllUsers()
    res.render('admin/view-users',{superAdmin:req.session.superAdmin,users})
})
router.get('/view-orders',verifyLogin,async(req,res)=>{
    let orders=await adminHelpers.getAllOrders()
    res.render('admin/view-orders',{superAdmin:req.session.superAdmin,orders})
})


// router.get('/edit-admin/:id',async(req,res)=>{
//     let admin=await superAdminHelpers.editAdmin(req.params.id)
// })

module.exports = router;