const express = require('express');
const usersRepo = require('../../repositories/users')
const { check, validationResult } = require('express-validator');
const { 
    requireEmail, 
    requirePassword, 
    requirePassword2,
    requireEmailSignIn,
    requirePasswordSignIn } = require('./validators');

const router = express.Router();
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
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.render('admin/auth/signup', {req, errors:errors.mapped()});
    }

    const { email, password} = req.body;
    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.redirect('/');
  }
);

router.get('/signout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

router.get('/signin', (req, res) => {
  res.render('admin/auth/signin', {req});
});

router.post('/signin', [
  requireEmailSignIn,
  requirePasswordSignIn
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.render('admin/auth/signin', {req, errors:errors.mapped()});
  }


  const {email} = req.body;

  const returningUser = await usersRepo.getOneBy({email});

  req.session.userId = returningUser.id;
  return res.redirect('/');

});

module.exports = router;