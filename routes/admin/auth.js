const express = require('express');
const usersRepo = require('../../repositories/users')
const { 
    requireEmail, 
    requirePassword, 
    requirePassword2,
    requireEmailSignIn,
    requirePasswordSignIn } = require('./validators');
const {handleErrors} = require('./middlewares');

const router = express.Router();

//Signup routes
router.get('/signup', (req, res) => {
    res.render('admin/auth/signup', {req});
});

router.post(
  '/signup',
  [
    requireEmail,
    requirePassword,
    requirePassword2
  ],
  handleErrors('admin/auth/signup'),

  async (req, res) => {

    const { email, password} = req.body;
    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.redirect('/');
  }
);

//Signout Route
router.get('/signout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

//Signin Routes
router.get('/signin', (req, res) => {
  res.render('admin/auth/signin', {req});
});

router.post(
  '/signin', 
  [requireEmailSignIn, requirePasswordSignIn], 
  handleErrors('admin/auth/signin'),
  async (req, res) => {
    
  const {email} = req.body;

  const returningUser = await usersRepo.getOneBy({email});

  req.session.userId = returningUser.id;
  return res.redirect('/');

});

module.exports = router;