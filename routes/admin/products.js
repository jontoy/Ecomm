const express = require('express');
const multer = require('multer');
const { handleErrors, requireAuth } = require('./middlewares');

const productsRepo = require('../../repositories/products');
const {requireProductTitle, requireProductPrice } = require('./validators');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage()});

// SHOW PRODUCTS ROUTE
router.get('/admin/products', 
    requireAuth,
    async (req, res) => {
    const products = await productsRepo.getAll();
    res.render('admin/products/index', {req, products});
    }
);

// NEW PRODUCT ROUTE
router.get('/admin/products/new', 
    requireAuth,
    (req, res) => {
    res.render('admin/products/new', {req});
    }
);

// CREATE PRODUCT ROUTE
router.post(
    '/admin/products',
    requireAuth, 
    upload.single('image'),
    [requireProductTitle, requireProductPrice],
    handleErrors('admin/products/new'),
    async (req, res) => {
        const image = req.file ? req.file.buffer.toString('base64'): "";
        const {title, price} = req.body;
        const productID = await productsRepo.create({ title, price, image });
        return res.redirect('/admin/products')  
    }
);

// EDIT ROUTE
router.get(
    '/admin/products/:id/edit',
    requireAuth,
    async (req, res) => {
    const product = await productsRepo.getOne(req.params.id);
    if (!product) {
        console.log('product not found');
        return res.redirect('/admin/products');
    }
    // console.log(product)  
    return res.render('admin/products/edit', {req, product})
    }
);

// UPDATE ROUTE
router.put(
    '/admin/products/:id',
    requireAuth,
    upload.single('image'),
    [requireProductTitle, requireProductPrice],
    handleErrors(`admin/products/edit`, async (req) => {
        const product = await  productsRepo.getOne(req.params.id);
        return {product}
    }),

    async (req, res) => {
        const changes = req.body;
        if(req.file){
            changes.image = req.file.buffer.toString('base64');
        }
        try {
            await productsRepo.update(req.params.id, changes);
        } catch (err) {
            console.log('could not find item');
        }

        return res.redirect('/admin/products');
    }
);

// DESTROY ROUTE
router.delete('/admin/products/:id',
    requireAuth,
    async(req, res) => {
        const product = await productsRepo.getOne(req.params.id);
        if (!product) {
            console.log('product not found');
        } else{
            await productsRepo.delete(req.params.id);
        }
        return res.redirect('/admin/products');
    }
);

module.exports = router;