'use strict';

angular.module('reservasApp')
  .controller('AulaCtrl', function($rootScope, $scope, $resource, NgTableParams, $filter, Aula, $modal, toaster, Auth) {
    $scope.esAdmin = Auth.isAdmin;

    $rootScope.tablaAulas = new NgTableParams({
      page: 1, // show first page
      count: 5 // count per page
    }, {
      total: 0,
      getData: function($defer, params) {
        Aula.query().$promise
          .then(function(aulas) {
            var orderedRecentActivity = params.filter() ?
              $filter('filter')(aulas, params.filter()) :
              aulas;
            params.total(orderedRecentActivity.length);
            $defer.resolve(orderedRecentActivity.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          });

      }
    });

    $scope.nuevaAula = function() {
     $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'nueva-aula.html',
        controller: 'NuevaAulaCtrl',
        size: 'lg'
      });
    };


    $scope.eliminarAula = function(idAula) {
      Aula.delete({
        aulaId: idAula
      }, function() {
        $rootScope.tablaAulas.reload();
        toaster.pop('success', 'Aula eliminada', 'El aula se ha eliminado del sistema');
      }, function() {
       toaster.pop('error','Error', 'Por favor intente mas tarde');
      });
    };

    $scope.editarAula = function(aula) {
      $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'editar-aula.html',
        controller: 'EditarAulaCtrl',
        size: 'lg',
        resolve: {
          aula: function() {
            return aula;
          }
        }
      });
    };

  })


.controller('NuevaAulaCtrl', function($scope, $rootScope, $modalInstance, $resource, toaster, Aula) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.enviarAula = function(form) {
      $scope.submitted = true;
      if (form.$valid){
        Aula.save($scope.aula,
         function() {
           $rootScope.tablaAulas.reload();
           $modalInstance.dismiss('cancel');
           toaster.pop('success', 'Aula Ingresada', 'El aula se ha ingresado en el sistema');
          },
          function(err) {
             $scope.errors = {};
             console.log(form.nombre);
             //update validity of form fields that match the mongoose errors
             angular.forEach(err.data.errors, function(error, field){
               form[field].$setValidity('mongoose', false);
                 $scope.errors[field]= error.message;
              });
            toaster.pop('error', 'Error', 'Ha ocurrido un error al enviar. Por favor intente mas tarde');
       });
     }
  };

})

.controller('EditarAulaCtrl', function(aula, $scope, $rootScope, $modalInstance, Aula, toaster) {

  Aula.get({aulaId: aula._id}, function(aulax){
   console.log(aulax);
   $scope.aula = aulax;
  },function(err){
   console.log(err);
  });

  $scope.actualizar = function() {
   console.log($scope.aula);
    Aula.update({
      aulaId: $scope.aula._id
    }, $scope.aula, function() {
      $rootScope.tablaAulas.reload();
      $modalInstance.dismiss('cancel');
      toaster.pop('success', 'Aula Editada', 'El aula se ha editado en el sistema');
    }, function() {
      console.log('error');
    });
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
