const { check } = require('express-validator');
const usersRepo = require('../../repositories/users');
const productsRepo = require('../../repositories/products');

module.exports = {
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async email => {
            const existingUser = await usersRepo.getOneBy({ email });
            if (existingUser) {
                throw new Error('Email in use');
             }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 20 }).withMessage('Must be between 4 and 20 characters')
        .matches(/\d/).withMessage('must contain a number'),
    requirePassword2: check('password2')
        .trim()
        .isLength({ min: 4, max: 20 }).withMessage('Must be between 4 and 20 characters')
        .matches(/\d/).withMessage('must contain a number')
        .custom((password2, { req }) => {
            if (password2 !== req.body.password) {
                throw new Error('Passwords must match');
            } else {
                return true
            }
        }),
    requireEmailSignIn: check('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Must be a valid email address')
    .custom(async (email) => {
      const returningUser = await usersRepo.getOneBy({email});
      if(!returningUser){
        throw new Error('Invalid Email/Password');
      } else {
        return true
      }
    }),
    requirePasswordSignIn:   check('password')
    .trim()
    .custom(async (password, { req }) => {
      const returningUser = await usersRepo.getOneBy({email: req.body.email});
      if(!returningUser){
        throw new Error('Invalid Email/Password');
      }
      const validPassword = await usersRepo.passwordsMatch(password, returningUser.password);
      if(!validPassword){
        throw new Error('Invalid Email/Password');
      } else {
        return true
      }
    }),
    requireProductTitle: check('title')
    .trim()
    .isLength({ min: 4, max: 40 }).withMessage('Must be between 4 and 40 characters'),
    requireProductPrice: check('price')
    .trim()
    .toFloat()
    .isFloat({min: 0.01}).withMessage('Price must be at least 0.01')

};