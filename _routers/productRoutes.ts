import express from 'express';
import {createProduct} from '../controllers/productController';

const router = express.Router();

router.post('/create', createProduct); 

export default router;