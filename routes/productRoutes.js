import express from 'express';
import { body, param } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts
} from '../controllers/productController.js';
import validateRequest from '../middleware/validator.js';

const router = express.Router();

const validator = {
  getProducts: [
    body('limit').optional().isNumeric().withMessage('Limit parameter must be a number'),
    body('skip').optional().isNumeric().withMessage('skip parameter must be a number'),
    body('search').optional().trim().escape(),
  ],
  createProduct: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('image').notEmpty().withMessage('Image is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('countInStock').isNumeric().withMessage('Count in stock must be a number'),
  ],
  createProductReview: [
    param('id').notEmpty().isMongoId().withMessage('Invalid product ID format'),
    body('rating').isNumeric().withMessage('Rating must be a number'),
    body('comment').optional().trim().escape(),
  ],
  getProduct: [
    param('id').notEmpty().isMongoId().withMessage('Invalid product ID format')
  ],
  deleteProduct: [
    param('id').notEmpty().isMongoId().withMessage('Invalid product ID format')
  ],
  updateProduct: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('image').notEmpty().withMessage('Image is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('countInStock').isNumeric().withMessage('Count in stock must be a number'),
    param('id').notEmpty().isMongoId().withMessage('Invalid product ID format')
  ]
};

router.route('/')
  .post(validator.createProduct, validateRequest, createProduct)
  .get(validator.getProducts, validateRequest, getProducts);

router.get('/top', getTopProducts);
router.post('/reviews/:id', validator.createProductReview, validateRequest, createProductReview);

router.route('/:id')
  .get(validator.getProduct, validateRequest, getProduct)
  .put(validator.updateProduct, validateRequest, updateProduct)
  .delete(validator.deleteProduct, validateRequest, deleteProduct);

export default router;
