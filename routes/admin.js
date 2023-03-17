var express = require('express');
const { response, resource } = require('../server');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const async = require('hbs/lib/async');
const userHelpers = require('../helpers/user-helpers');
const fileUpload = require('express-fileupload');
var fs = require('fs')

const verifyLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET admins listing. */
router.get('/',verifyLogin, function (req, res, next) {
  let admin=req.session.admin
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', {admin, products})
  })
});
router.get('/add-product',verifyLogin, function (req, res) {
  res.render('admin/add-product', { admin:req.session.admin })
})
router.post('/add-product', (req, res) => {
  let imageFile
  if(req.files){
    imageFile=true
  }else{
    imageFile=false
  }
  productHelpers.addProduct(req.body,imageFile, (id) => {
    if(req.files){
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product", { admin:req.session.admin})
      } else {
        console.log(err);
      }
    })
  }else{
    res.render("admin/add-product", { admin:req.session.admin})
  }
  })
})
//delete product
router.get('/delete-product/:id',verifyLogin, (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((image) => {
    res.redirect('/admin')
    if (image) {
      fs.unlinkSync('./public/product-images/' + proId + '.jpg')
    }
  })
})
//edit product
router.get('/edit-product/:id',verifyLogin, async (req, res) => {
  let proId = req.params.id
  let product = await productHelpers.getProductDetails(proId)
  console.log(product);
  res.render('admin/edit-product', { product,admin:req.session.admin })
})
router.post('/edit-product/:id',verifyLogin, (req, res) => {
  console.log(req.params.id);
  let id=req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then((product) => {
    console.log(product);
    res.redirect('/admin')
    if (req.files) {
      let image=req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
//Login
router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { err: req.session.err })
    req.session.err = false
  }
})
router.post('/login', (req, res) => {
  adminHelpers.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    } else {
      req.session.err = "Invalid Name or Password"
      res.redirect('/admin/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin')
})
router.get('/view-orders',verifyLogin,async(req,res)=>{
  let orders=await adminHelpers.getAllOrders()
  res.render('admin/view-orders',{orders,admin:req.session.admin})
})
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let Products=await userHelpers.getOrderProducts(req.params.id)
  res.render('admin/view-order-products',{admin:req.session.admin,Products})
})
router.get('/ship-products/:id',verifyLogin,(req,res)=>{
  adminHelpers.shipProduct(req.params.id).then(()=>{
    res.redirect('/admin/view-orders')
  })
})
router.get('/edit-profile', verifyLogin, (req, res) => {
  adminHelpers.getAdminDetailes(req.session.admin._id).then((admin) => {
    res.render('admin/edit-profile', { admin })
  })
})
router.post('/edit-profile', (req, res) => {
  adminHelpers.updateAdminProfile(req.body, req.session.admin._id).then((admin) => {
    req.session.admin = admin
    res.redirect('/admin')
    if (req.files) {
      let image = req.files.Image
      image.mv('./public/admin-images/' + admin._id + '.jpg')
    }
  })
})
router.get('/change-password', verifyLogin, (req, res) => {
  res.render('admin/change-password', { admin: req.session.admin })
})
router.post('/change-password',verifyLogin, (req, res) => {
  if (req.body.newPassword === req.body.confirmPassword) {
    if (req.body.existingPassword == req.body.newPassword) {
      match = "Please Enter different Password"
      res.render('admin/change-password', { match, admin: req.session.admin })
    } else {
      adminHelpers.changePassword(req.body, req.session.admin._id).then((status) => {
        if (status) {
          res.redirect('/admin')
        } else {
          err = 'Incorrect Password'
          res.render('admin/change-password', { err, admin: req.session.admin })
        }
      })
    }
  } else {
    mismatch = 'Please Enter Confirm Password Correctly'
    res.render('admin/change-password', { mismatch, admin: req.session.admin })
    err = null
  }
})
router.get('/view-users',verifyLogin,async(req,res)=>{
  let users=await adminHelpers.getAllUsers()
  res.render('admin/view-users',{users,admin:req.session.admin})
})


module.exports = router;
