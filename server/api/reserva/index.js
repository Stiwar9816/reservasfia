'use strict';

var express = require('express');
var controller = require('./reserva.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
//router.get('/porFecha',controller.showByFecha);
router.post('/', controller.create);
router.post('/choque',auth.isAuthenticated(),controller.choque);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;