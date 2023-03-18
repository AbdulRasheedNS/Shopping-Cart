var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
//home get
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let gustUser = true
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { gustUser, products, user, cartCount })
  })
});
//login get
router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { "err": req.session.err })
    req.session.err = false
  }
})
//signup get
router.get('/signup', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/signup', { "err": req.session.err })
    req.session.err = false
  }
})
//signup post
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true
      req.session.user = response.user
      user = req.session.user
      res.redirect('/?=' + user)
    } else {
      req.session.err = "Email Already Used"
      res.redirect('/signup')
    }
  })
})
//login post
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.err = "Invalid User Name or Password"
      res.redirect('/login')
    }
  })
})
//logout get
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})
//cart get
router.get('/cart', verifyLogin, async (req, res) => {
  let user = req.session.user
  let products = await userHelpers.getCartProducts(req.session.user._id)
  if (products.length > 0) {
    let total = await userHelpers.getTotalAmound(req.session.user._id)
    res.render('user/cart', { user, products, total })
  } else {
    res.render('user/empty-cart', { user: req.session.user })
  }
})

router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmound(req.body.user)
    res.json(response)

  })
})
router.post('/remove-cartProduct',verifyLogin, (req, res, next) => {
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response)

  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmound(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})
router.post('/place-order',verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmound(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }
  })
  router.get('/order-success',verifyLogin, (req, res) => {
    res.render('user/order-success', { user: req.session.user })
  })
})

router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
})
router.post('/verify-payment',verifyLogin, (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('Payment Successfull');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})
router.get('/edit-profile', verifyLogin, (req, res) => {
  userHelpers.getUserDetailes(req.session.user._id).then((user) => {
    res.render('user/edit-profile', { user })
  })
})
router.post('/edit-profile',verifyLogin, (req, res) => {
  userHelpers.updateUserProfile(req.body, req.session.user._id).then((user) => {
    req.session.user = user
    res.redirect('/')
    if (req.files) {
      let image = req.files.Image
      image.mv('./public/user-images/' + user._id + '.jpg')
    }
  })
})
router.get('/change-password', verifyLogin, (req, res) => {
  res.render('user/change-password', { user: req.session.user })
})
router.post('/change-password',verifyLogin, (req, res) => {
  if (req.body.newPassword === req.body.confirmPassword) {
    if (req.body.existingPassword == req.body.newPassword) {
      match = "Please Enter different Password"
      res.render('user/change-password', { match, user: req.session.user })
    } else {
      userHelpers.changePassword(req.body, req.session.user._id).then((status) => {
        if (status) {
          res.redirect('/')
        } else {
          err = 'Incorrect Password'
          res.render('user/change-password', { err, user: req.session.user })
        }
      })
    }
  } else {
    mismatch = 'Please Enter Confirm Password Correctly'
    res.render('user/change-password', { mismatch, user: req.session.user })
    err = null
  }
})

module.exports = router;
