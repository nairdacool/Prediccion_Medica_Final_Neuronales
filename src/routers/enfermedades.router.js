const express = require('express')
const router = express.Router();
const enfermedadController = require('../controllers/enfermedades.controller');


router.get("/", enfermedadController.getData)
router.post("/enfermedades", enfermedadController.postData)

module.exports = router;