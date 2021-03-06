'use strict';

angular.module('reservasApp')
  .controller('RevisarSolicitudEscuelaCtrl', function($rootScope, $scope, $modal, $resource, NgTableParams, $filter, Actividad) {
    var actividades = [];
    $rootScope.enEspera = new NgTableParams({
      page: 1, // paginacion, primera en mostrar
      count: 15, // cantidad de elementos a mostrar por pagina
      sorting: {
        fechaCreacion: 'asc'
      }
    }, {
      total: 0,
      getData: function($defer, params) {
        Actividad.query({
            idActividad: 'espera_escuela_b'
          }).$promise
          .then(function(actividadesProm) {
            console.log(actividadesProm);
            actividades = actividadesProm;
            var orderedRecentActivity = params.filter() ?
              $filter('orderBy')(actividades, params.orderBy()) :
              actividades;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });
    $rootScope.desaprobados = new NgTableParams({
      page: 1, // paginacion, primera en mostrar
      count: 15, // cantidad de elementos a mostrar por pagina
      sorting: {
        fechaCreacion: 'asc'
      }
    }, {
      total: 0,
      getData: function($defer, params) {
        Actividad.query({
            idActividad: 'desaprobados_escuela'
          }).$promise
          .then(function(actividadesProm) {
            console.log(actividadesProm);
            actividades = actividadesProm;
            var orderedRecentActivity = params.filter() ?
              $filter('orderBy')(actividades, params.orderBy()) :
              actividades;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });

    $rootScope.cancelados = new NgTableParams({
      page: 1, // paginacion, primera en mostrar
      count: 15, // cantidad de elementos a mostrar por pagina
      sorting: {
        fechaCreacion: 'asc'
      }
    }, {
      total: 0,
      getData: function($defer, params) {
        Actividad.query({
            idActividad: 'cancelados_escuela'
          }).$promise
          .then(function(actividadesProm) {
            console.log(actividadesProm);
            actividades = actividadesProm;
            var orderedRecentActivity = params.filter() ?
              $filter('orderBy')(actividades, params.orderBy()) :
              actividades;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });
    $rootScope.aprobados = new NgTableParams({
      page: 1, // paginacion, primera en mostrar
      count: 15, // cantidad de elementos a mostrar por pagina
      sorting: {
        fechaCreacion: 'asc'
      }
    }, {
      total: 0,
      getData: function($defer, params) {
        Actividad.query({
            idActividad: 'aprobados_escuela'
          }).$promise
          .then(function(actividadesProm) {
            console.log(actividadesProm);
            actividades = actividadesProm;
            var orderedRecentActivity = params.filter() ?
              $filter('orderBy')(actividades, params.orderBy()) :
              actividades;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });

    $rootScope.desaprobados = new NgTableParams({
      page: 1, // paginacion, primera en mostrar
      count: 15, // cantidad de elementos a mostrar por pagina
      sorting: {
        fechaCreacion: 'asc'
      }
    }, {
      total: 0,
      getData: function($defer, params) {
        Actividad.query({
            idActividad: 'desaprobados_escuela'
          }).$promise
          .then(function(actividades) {

            var orderedRecentActivity = params.filter() ?
              $filter('orderBy')(actividades, params.orderBy()) :
              actividades;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });

    $scope.detalleReserva = function(idActividad, tipo) {
      $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'detalleReserva.html',
        controller: 'DetalleReservaEscuelaCtrl',
        size: 'lg',
        resolve: {
          actividad: function() {
            return Actividad.get({
              idActividad: idActividad
            }).$promise;
          },
          tipo: function() {
            return tipo;
          }
        }
      });
    };


  })



.controller('DetalleReservaEscuelaCtrl', function($rootScope, $scope, $resource, $modalInstance, actividad, tipo, Actividad, Turno, toaster) {
  console.log('entra al ctrl');
  $scope.cancelar = false;
  $scope.mensaje = {};
  $scope.actividad = actividad;
  $scope.tipo = tipo;
  // diferencia entre ahora y la fecha de creacion de la actividadEditada
  $scope.diferenciaMinutos = Math.round(((new Date() - new Date(actividad.fechaCreacion)) / 1000) / 60); // minutes
  console.log($scope.diferenciaMinutos);
  $scope.rechazarSolicitud = function() {
    $modalInstance.close(actividad);
    var actividadEditada = {};
    actividadEditada = nuevaActividad(actividad, 'desaprobado_escuela');
    actividadEditada.comentario = $scope.mensaje.descripcion;
    Actividad.update({
        idActividad: actividad._id
      }, actividadEditada).$promise
      .then(function() {
        console.log('mieyda');
        $rootScope.enEspera.reload();
        $rootScope.aprobados.reload();
        $rootScope.desaprobados.reload();
        toaster.pop('success', 'Actividad rechazada', 'La actividad ahora se ha movido a "Rechazados"');
      }, function(err) {
        console.error(err);
      });

  };
  $scope.cancelarSolicitud = function() {
    console.log($scope.mensaje.descripcion);
    $modalInstance.close(actividad);
    var actividadEditada = {};
    actividadEditada = nuevaActividad(actividad, 'cancelado');
    actividadEditada.comentario = $scope.mensaje.descripcion;
    Actividad.update({
        idActividad: actividad._id
      }, actividadEditada).$promise
      .then(function() {
        $rootScope.enEspera.reload();
        $rootScope.aprobados.reload();
        $rootScope.desaprobados.reload();
        $rootScope.cancelados.reload();
        toaster.pop('success', 'Actividad cancelada', 'La actividad ahora se ha movido a "Cancelados"');
      }, function(err) {
        console.error(err);
      });

  };
  $scope.cancelacion = function() {
    $scope.cancelar = true;
  };
  $scope.eliminarSolicitud = function() {
    var Actividad = $resource('/api/actividades/:actividadId', {
      actividadId: '@id'
    });
    Actividad.delete({
      actividadId: actividad._id
    }, function() {
      $rootScope.enEspera.reload();
      $rootScope.aprobados.reload();
      $rootScope.desaprobados.reload();
      $modalInstance.dismiss('cancel');
      $modalInstance.dismiss('cancel');
      toaster.pop('success', 'Actividad eliminada', 'La actividad se ha eliminado del sistema');
    }, function() {});
  };
  $scope.aprobarSolicitud = function() {
    $modalInstance.close(actividad);
    var reservas = {};
    reservas.data = [];
    var turnos = [];
    var actividadEditada = {};
    var cont = 0;
    for (var i = 0; i < $scope.turnos.length; i++) { // creamos los objetos reservas
      var turno = $scope.turnos[i];
      for (var j = 0; j < turno.aulas.length; j++) {
        var aula = turno.aulas[j];
        var nuevaReserva = {
          inicio: turno.inicio,
          fin: turno.fin,
          aula: aula._id,
          actividad: actividad._id
        };
        reservas.data[cont] = nuevaReserva;
        cont++;
      }
      turnos[i] = turno._id;
      console.log(reservas);
    }
    $resource('/api/reservas/choque/detectarChoque').save(reservas).$promise // comprobamos que no haya choque
      .then(function() { // contexto que no detecto choque del array de objetos reserva
        //console.log(reservas);
        /*for (var i = 0; i < cont; i++) {
          $resource('/api/reservas').save(reservas.data[i]);
        }*/
        actividadEditada = nuevaActividad(actividad, 'espera_admin');
        Actividad.update({
            idActividad: actividad._id
          }, actividadEditada).$promise
          .then(function() {
            // actividad.estado = 'aprobado';
            $rootScope.enEspera.reload();
            $rootScope.aprobados.reload();
            $rootScope.desaprobados.reload();
            //actualizarTurnos(actividadEditada,respuesta);
            toaster.pop('success', 'Actividad aprobada', 'La solicitud ha sido enviada la Administración Académica para su aprobación');
          }, function(err) {
            //error al actualizar
            console.error(err);
          });
      }, function(err) {
        console.log('ERROR');
        toaster.pop('error', 'Error', 'Ha ocurrido un error al enviar');
        console.error(err);
      });
  };
  $resource('/api/turnos/actividad/:idActividad', {
      idActividad: '@id'
    })
    .query({
      idActividad: $scope.actividad._id
    }, function(turnos) {
      $scope.turnos = turnos;
    });


  $scope.ok = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  /*function actualizarTurnos(actividad,respuesta){
   var aulaAux = [];
   for (var g = 0;  g < $scope.turnos.length; g++){
   actividad.estado = respuesta;
         for (var s in $scope.turnos[g].aulas){
            aulaAux[s] = $scope.turnos[g].aulas[s]._id;
         }
      var turnoActualizado = {
        inicio: $scope.turnos[g].inicio,
        fin: $scope.turnos[g].fin,
        actividad: actividad,
        aulas: aulaAux
      };
    Turno.update({idTurno: $scope.turnos[g]._id},turnoActualizado
    , function(){
     console.log('exito al editar turno.....');
    },
    function(err){console.log(err);}
    );

   }
  }*/
  function nuevaActividad(actividad, respuesta) {
    var actividadEdit = {};
    actividadEdit._id = actividad._id;
    actividadEdit.estado = respuesta;
    // actividadEdit.turnos = turnos;
    actividadEdit.tipo = actividad.tipo;
    actividadEdit.materia = actividad.materia._id;
    actividadEdit.nombre = actividad.nombre;
    actividadEdit.encargado = actividad.encargado._id;
    actividadEdit.creadoPor = actividad.creadoPor;
    actividadEdit.fechaCreacion = actividad.fechaCreacion;
    return actividadEdit;
  }
});
