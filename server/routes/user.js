const express = require('express')
const {userLogin,userRegister,getActiveUser} = require('../controllers/user')
const validateToken = require('../middleware/jwtTokenHandler');
const router = express.Router();


router.post('/login',userLogin);

router.post('/register',userRegister);

router.get('/current',validateToken,getActiveUser);

module.exports = router;