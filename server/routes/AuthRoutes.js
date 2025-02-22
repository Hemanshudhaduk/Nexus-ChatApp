// routes/AuthRoutes.js
import express from 'express';
import { checkUser, generateToken, getAllUsers, onBoardUser } from '../controllers/AuthController.js';  // Correct path to the controller

const router = express.Router();

// Handle POST request to check user
router.post('/check-user', checkUser);

router.post('/onboard-user' ,onBoardUser);

router.get('/get-contacts',getAllUsers);

router.get('/genrate-token/:userId',generateToken);

export default router;
// 