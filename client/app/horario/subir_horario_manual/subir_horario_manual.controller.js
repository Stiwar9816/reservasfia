'use strict';

angular.module('reservasApp')
  .controller('SubirHorarioManualCtrl', function($scope, $rootScope, ngTableParams, $filter, $modal, Ciclo, Escuela, $resource, Clase, ClaseByHorario, Franja, Auth) {
    var horarioActual = null;
    $scope.esAdmin = Auth.isAdmin;
    $scope.esRepresentante = Auth.isRepresentante;
    $scope.opcion = {};
    if (Auth.isAdmin()) {
      Escuela.query(function(escuelas) {
        $scope.escuelas = escuelas;
      });
    }
    Ciclo.query(function(ciclos) {
      $scope.ciclos = ciclos;
    });

    Franja.query(function(franjas) {
      $rootScope.franjas = franjas
    });

    $scope.ciclo = function() {
     if($scope.opcion.ciclo === ''){
          $scope.opcion.hayHorario = false;
     }else{
      if (Auth.isRepresentante()) {
        $resource('/api/representantes/user/:userId', {
            userId: '@id'
          })
          .get({
            userId: Auth.getCurrentUser()._id
          }, function(representante) {
            $scope.opcion.escuela = representante.escuela._id;
            $resource('/api/horarios/ciclo/escuela')
              .get({
                ciclo: $scope.opcion.ciclo,
                escuela: $scope.opcion.escuela
              }, function(horario) {

                cargarTabla(horario);
                $scope.opcion.hayHorario = true;
              }, function(err) {
                console.error("entra al error horario");
                $scope.opcion.noHayHorario = true;
              });
          })
      }
     }


    };

    $scope.nuevaClase = function(materia) {
      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'nueva-clase.html',
        controller: 'NuevaClaseCtrl',
        size: 'lg',
        resolve: {
          materia: function() {
            return materia;
          },
          ciclo: function(){ return $scope.opcion.ciclo},
          horario: function(){ return horarioActual._id}
        }
      });
    };

    $scope.editarClase = function(clase) {
      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'editar-clase.html',
        controller: 'EditarClaseCtrl',
        size: 'lg',
        resolve: {
          clase: function() {
            return clase;
          }
        }
      });
    };

    $scope.crearHorario = function() {
      $resource('/api/horarios/crear-horario/plantilla')
        .save({
          ciclo: $scope.opcion.ciclo,
          escuela: $scope.opcion.escuela
        }, function(horario) {
          console.log(horario);
          $scope.opcion.noHayHorario = false;
          $scope.opcion.hayHorario = true;
          cargarTabla(horario);
        })

    }
    $scope.eliminar = function(id) {
      Clase.delete({
        claseId: id
      }, function() {
        $rootScope.tablaHorario.reload();
        console.log('exito');
      }, function() {
        console.log('error');
      })
    }


    function cargarTabla(horario) {
      horarioActual = horario;
      $rootScope.tablaHorario = new ngTableParams({

      }, {
        counts: [],
        groupBy: function(grupo) {
          return grupo.materia.nombre + '       ( ' + grupo.materia.codigo + ' )';
        },
        getData: function($defer, params) {
          ClaseByHorario.query({
            horarioId: horario._id
          }, function(clases) {
           var clasesor =  agregarNombreMateria(clases);
           console.log(clasesor);
            $defer.resolve($filter('orderBy')(clasesor, params.orderBy()));
            $defer.resolve(clasesor);
          })
        }
      });
    };

    function agregarNombreMateria(clases){
      for(var a =1; a< clases.length; a++){
       clases[a].nmateria = clases[a].materia.nombre;
     }
     return clases;
    };

    $rootScope.cargarAulas = function(query) {
      var res = $resource('/api/aulas/nombre/' + query);
      return res.query().$promise
    };
  })
  .controller('NuevaClaseCtrl', function($scope, $rootScope, $resource, materia, ciclo, horario, Clase, $modalInstance, toaster) {
    $scope.materia = materia;
    $scope.arrayAulas = [];
    console.log(horario);
    $scope.clase = {};
    $resource('/api/docentes/materia/:materiaId', {
        materiaId: '@id'
      })
      .query({
        materiaId: materia._id
      }, function(docentes) {
        $scope.docentes = docentes;
      });

    $scope.enviarClase = function(form) {
      console.log($scope.clase);
      $scope.submitted = true;
      if(form.$valid){
       $scope.clase.materia =  materia._id;
       $scope.clase.horario =  horario;
       $scope.clase.aula = $scope.clase.aula[0]._id;
       $scope.clase.ciclo =  ciclo;
       Clase.save($scope.clase, function(clase) {
         toaster.pop('success', "Grupo agregado");
         $rootScope.tablaHorario.reload();
         $modalInstance.dismiss('cancel');
       }, function(err) {
         console.log(err);
         toaster.pop('error', "Error al agregar grupo");
       });
     }
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
   $scope.evaluarAula = function(){
    if($scope.arrayAulas.length > 0)
     return false;
    return true;
   };
  })
  .controller('EditarClaseCtrl', function($scope, $rootScope, $resource, $modalInstance, toaster, clase, Clase, Franja) {
    $scope.arrayAulas = [];

    $resource('/api/docentes/materia/:materiaId', {
        materiaId: '@id'
      })
      .query({
        materiaId: clase.materia._id
      }, function(docentes) {
        $scope.docentes = docentes;
      });
    Clase.get({
      claseId: clase._id
    }, function(clas) {
      $scope.clasesx = clas;
      $scope.arrayAulas.push($scope.clasesx.aula);

    });
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.actualizar = function() {
      $scope.clasesx.materia = $scope.clasesx.materia._id;
      $scope.clasesx.docente = $scope.clasesx.docente._id;
      $scope.clasesx.aula = $scope.arrayAulas[0]._id;
      $scope.clasesx.franja1 = $scope.clasesx.franja1._id;
      if ($scope.clasesx.franja2)
        $scope.clasesx.franja2 = $scope.clasesx.franja2._id;
      console.log($scope.clasesx);
      Clase.update({
        claseId: clase._id
      }, $scope.clasesx, function() {
        $rootScope.tablaHorario.reload();
        $modalInstance.dismiss('cancel');
        //toaster.pop('success', "Carrera ingresada", "La carrera se ha agregado al sistema");
      }, function(err) {
        toaster.pop('error', "Error", "Ha ocurrido un error al enviar. Por favor intente mas tarde");
      });
    };
    $scope.evaluarAula = function(){
     if($scope.arrayAulas.length > 0)
      return false;
     return true;
    };


    /*$scope.cargarDocentes = function(query) {
      var res = $resource('/api/docentes/nombre/' + query+'?materia='+clase.materia._id);
      return res.query().$promise
    };*/
  })