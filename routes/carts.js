const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const router = express.Router();

// SHOW CART ROUTE
router.get('/cart', async (req, res) => {
    let cart;
    if(!req.session.cartId) {
        cart = await cartsRepo.create({items:[]});
        req.session.cartId = cart.id;
    } else {
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    for (let item of cart.items){
        const product = await productsRepo.getOne(item.id);
        item.product = product;
    }
    res.render('carts/show', {req, cart});
});

//ADD TO CART ROUTE
router.post('/cart/products/:id', async (req, res) => {
    // Determine if cart exists
    let cart;
    if(!req.session.cartId) {
        cart = await cartsRepo.create({items:[]});
        req.session.cartId = cart.id;
    } else {
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    // Determine if product exists in cart
    console.log(cart);
    const existingItem = cart.items.find((item) => item.id === req.params.id)
    if(existingItem){
        existingItem.quantity += 1;
    } else{
        cart.items.push({id: req.params.id, quantity: 1});
    }
    await cartsRepo.update(cart.id, {items: cart.items})
    console.log(cart);
    res.redirect('/');
});

router.delete('/cart/products/:id', async (req, res) => {
    const cart = await cartsRepo.getOne(req.session.cartId);
    const items = cart.items.filter((item) => item.id !== req.params.id);
    await cartsRepo.update(cart.id, {items});
    res.redirect('/cart');
})

module.exports = router