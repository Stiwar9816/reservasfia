'use strict';
var moment = require('moment');
var _ = require('lodash');
var Actividad = require('./actividad.model');
var Representante = require('../representante/representante.model');
var Reserva = require('../reserva/reserva.model');
var Docente = require('../docente/docente.model');
var Turno = require('../turno/turno.model');
var Clase = require('../clase/clase.model');


// Obtiene Lista de todas las actividades
exports.index = function(req, res) {
  Actividad
    .find()
    .populate('materia')
    .populate('creadoPor')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, docs) {
      if (err) return handleError(res, err);
      Actividad.populate(docs, {
        path: 'turnos.aulas',
        model: 'Aula',
        select: 'nombre'
      }, function(err, actividades) {
        if (err) return handleError(res, err);
        return res.status(200).json(actividades);
      });
    });
};

exports.prueba =  function(req, res){
 console.log(req.query.estado);
 Actividad
   .find({estado: req.query.estado})
   .populate('materia', 'nombre')
   .populate('encargado')
   .populate('escuela')
   .exec(function(err, actividades) {
     if (err) return handleError(res, err);
     return res.status(200).json(actividades);
   });
}
//obtiene todas actividades aprobadas
exports.indexAprobados = function(req, res) {
  Actividad
    .find({estado: 'aprobado'})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
     console.log(actividades);
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

//Obtiene todas las actividades aprobadas donde el encargado sea un usuario
exports.indexMisAprobados = function(req, res) {
  Actividad
    .find({estado: 'aprobado', encargado: req.user._id})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

exports.indexMisCancelados = function(req, res) {
  console.log(req.user);
  Actividad
    .find({estado: 'cancelado', encargado: req.user._id})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

//Obtiene las actividades desaprobadas por el admin
exports.indexDesaprobados = function(req, res) {
  Actividad
    .find({estado: 'desaprobado'})
    // populate('turnos')
    // .populate('aulas')
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

exports.indexCancelados = function(req, res) {
  Actividad
    .find({estado: 'cancelado'})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};
exports.indexToEscuelaAdmin = function(req, res) {
  Actividad
    .find({estado: 'espera_escuela', creadoPor: req.user._id})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};


// obtiene las actividades desaprobadas ya sean por la escuela o por el admin
exports.indexMisDesaprobados = function(req, res) {
  Actividad
    .find({
           $and:[{
                   $or: [{
                          estado: 'desaprobado'
                         },
                         {
                           estado: 'desaprobado_escuela'
                         }]
                 },
                 {
                   encargado: req.user._id
                 }]
          })
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

// obtiene todas las reservas que estan en espera para el administrador (aprobados por la escuela)
exports.indexEspera = function(req, res) {
  Actividad
    .find({estado: 'espera_admin'})
    .populate('materia', 'nombre')
    .populate('encargado')
    .populate('escuela')
    .exec(function(err, actividades) {
      if (err) return handleError(res, err);
      return res.status(200).json(actividades);
    });
};

// obtiene todas las reservas que son parte de una escuela y estan en espera
exports.indexEsperaEscuelaB = function(req, res) {
  Representante
    .findOne({
      usuario: req.user._id
    }, function(err, representante) {
      Actividad
        .find({ estado: 'espera_escuela',escuela: representante.escuela})
        .populate('materia', 'nombre')
        .populate('encargado')
        .populate('escuela')
        .exec(function(err, actividades) {
          if (err) return handleError(res, err);
          return res.status(200).json(actividades);
        });
    })
};

//Obtiene las reservas que han sido desaprobadas por x escuela
exports.indexDesaprobadosByEscuela = function(req, res) {
  Representante
    .findOne({
      usuario: req.user._id
    }, function(err, representante) {
      Actividad
        .find({estado: 'desaprobado_escuela', escuela: representante.escuela})
        .populate('materia', 'nombre')
        .populate('encargado')
        .populate('escuela')
        .exec(function(err, actividades) {
          if (err) return handleError(res, err);
          return res.status(200).json(actividades);
        });

    })
};

//Obtiene las reservas que han sido cancelados por x escuela
exports.indexCanceladosByEscuela = function(req, res) {
  Representante
    .findOne({
      usuario: req.user._id
    }, function(err, representante) {
      Actividad
        .find({
          estado: 'cancelado',
          escuela: representante.escuela
        })
        .populate('materia', 'nombre')
        .populate('encargado')
         .populate('escuela')
        .exec(function(err, actividades) {
          if (err) {
            return handleError(res, err);
          }
          return res.status(200).json(actividades);
        });

    })
};
// obtiene las actividades que han sido aprobadas por x escuela que actualmente estan en los estados del admin
exports.indexByEscuela = function(req, res) {
 console.log(req.user);
  Representante
    .findOne({
      usuario: req.user._id
    }, function(err, representante) {
     console.log("esto " + representante);
      Actividad
        .find({
          $and: [{
            $or: [{
              estado: 'espera_admin'
            }, {
              estado: 'aprobado'
            }, {
              estado: 'desaprobado'
            }]
          }, {
            escuela: representante.escuela
          }]
        })
        .populate('materia', 'nombre')
        .populate('encargado')
        .populate('escuela')
        .exec(function(err, actividades) {
          if (err) {
            return handleError(res, err);
          }
          return res.status(200).json(actividades);
        });

    })
};

// obtiene las actividades que estan en espera (en escuela o en administracion) y pertenecen a x usuario
exports.indexMisEspera = function(req, res) {
 Docente.findOne({usuario: req.user.id}, function(err, docente){
  Actividad
    .find({
     $and: [ {
      $or: [{
        estado: 'espera_escuela'
      }, {
        estado: 'espera_admin'
      }]
     }, {
      $or:[ { creadoPor: req.user._id }, { encargado: docente._id}]
     }]
    })
    .populate('materia', 'nombre')
    .populate('encargado')
    .exec(function(err, actividades) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(actividades);
    });

 })

};

//Renderiza HTML de un comprobante  de una actividad
exports.comprobante = function(req, res) {

    Actividad
      .findById(req.params.id)
      .populate('materia')
      .populate('escuela')
      .populate('creadoPor')
      .populate('encargado')
      .exec(function(err, actividad) {
       if (err) {
         return handleError(res, err);
       }
       if(actividad.estado === 'aprobado'){
        Turno.find({
            actividad: req.params.id
          })
          .populate('aulas')
          .exec(function(err, turnos) {
            if (err) {
              return handleError(res, err);
            }
            res.render('comprobante', {
              title: 'ejs',
              actividad: actividad,
              turnos: turnos,
              moment: moment
            });

          });
       }else{
          return handleError(res, 'Error, la actividad no esta aprobada');
       }
      });


  }
  // Get a single actividad
exports.show = function(req, res) {

  Actividad
    .findById(req.params.id)
    .populate('materia', 'nombre')
    .populate('encargado')
    .exec(function(err, actividad) {
      if (err) {
        return handleError(res, err);
      }
      if (!actividad) {
        return res.status(404).send('Not Found');
      }
      return res.json(actividad);
    });
};

// Creates a new actividad in the DB.
exports.create = function(req, res) {
 req.body.actividad.fechaCreacion = Date.now();
 Actividad.create(req.body.actividad, function(err, actividad) {
   if(err) { return handleError(res, err);}
    var nuevaActividad = new Actividad(actividad);
    nuevaActividad.crearTurnos(req.body.turnos,function(err) {
      if (err) {
       Actividad.findByIdAndRemove(actividad._id, function(){
         return handleError(res, err);
       });
      }else{
          Actividad.populate(actividad,{path: 'materia', select: 'nombre'}, function(err, actividadPop){
           res.render('nueva_actividad', {actividad: actividadPop},function(err, html) {
                    if(err) console.log(err);
                    /* else
                    Actividad.correoNuevaActividad(actividad, html);*/
           });
       });
       return res.status(201).json(actividad);
      }
     });
 });
};

// Updates an existing actividad in the DB.
exports.update = function(req, res) {
  if (req.body._id) delete req.body._id;
  Actividad.findById(req.params.id, function(err, actividad) {
    if (err) return handleError(res, err);
    if (!actividad) return res.status(404).send('Not Found');
    req.body.fechaEdicion = Date.now();
    var updated = _.merge(actividad, req.body);
    updated.save(function(err) {
      if (err) return handleError(res, err);
      if(actividad.tipo === 1) actualizarClase(actividad);
      return res.status(200).json(actividad);
    });
  });
};

// Deletes a actividad from the DB.
exports.destroy = function(req, res) {
  Reserva.find({
    actividad: req.params.id
  }).remove(function() {
    Turno.find({
      actividad: req.params.id
    }).remove(function() {
      Actividad.findById(req.params.id, function(err, actividad) {
        if (err) return handleError(res, err);
        if (!actividad)  return res.status(404).send('Not Found');
        actividad.remove(function(err) {
          if (err) return handleError(res, err);
          return res.status(204).send('No Content');
        });
      });
    })
  });

};

function handleError(res, err) {
  return res.status(500).send(err);
}

function actualizarClase(actividad){
 Clase.findOne({actividad: actividad._id}, function(err, clase){
    if(!err && clase){
        if(actividad.estado === 'aprobado'){
          Clase.update({_id: clase._id}, {aprobado: true}, function(err){
           if(err) console.log(err);
          })
        }
        else { Clase.update({_id: clase._id}, {aprobado: false}, function(err){
         if(err) console.log(err);
         console.log('actualiza');
        });}
    }
 });
}
