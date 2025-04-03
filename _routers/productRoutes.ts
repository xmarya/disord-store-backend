import express from 'express';
import {

  createProduct
} from '../controllers/productController';

const router = express.Router();

router.post('/create', createProduct); // NOTE: Needs storeId in body

export default router;