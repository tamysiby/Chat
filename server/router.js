const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('server is up and running');
});

// router.get('/hi', (req, res)=>{
//     res.send('hello');
// });

module.exports = router;