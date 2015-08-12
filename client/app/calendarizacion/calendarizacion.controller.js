'use strict';

angular.module('reservasApp')
  .controller('CalendarizacionCtrl', function(Auth, $scope, $resource, toaster, $compile, $modal, $log, CalendarioEs) {

    /******************************Calendario******************************/
   /*Variables*/


    $scope.events = {//  carga los eventos del dia actual en el web service.
      url: '/api/reservas',
      className: 'Clases',
      startParam: 'inicio',
      endParam: 'fin'
    };



     /*Funciones*/
    // evento al dar clic a una reserva
    $scope.alertOnEventClick = function(date, jsEvent, view) {
      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'reserva-detalle.html',
        controller: 'ModalInstanceCtrl',
        size: 'lg',
        resolve: {
          items: function() {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function(selectedItem) {
        $scope.selected = selectedItem;
      }, function() {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

    $scope.disabled = function(date, mode) {
     return ( mode === 'day' && ( date.getDay() === 0 ) );
   };
    /*$scope.addRemoveEventSource = function(sources, source) {
      var canAdd = 0;
      angular.forEach(sources, function(value, key) {
        if (sources[key] === source) {
          sources.splice(key, 1);
          canAdd = 1;
        }
      });
      if (canAdd === 0) {
        sources.push(source);
      }
    };

    $scope.addEvent = function(dia) {
      console.log("entra");
      $scope.events.events.push({
        title: 'Prueba',
        start:  new Date(2015, 08, 08, 6, 20, 0),
      end: new Date(2011, 08, 08, 8, 0, 0)
        className: ['Clases']
      });
    };
    /* remove event
    $scope.remove = function(index) {
      $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function(view, calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if (uiCalendarConfig.calendars[calendar]) {
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
    /* Render Tooltip */
    $scope.eventRender = function(event, element, view) {
      element.attr({
        'tooltip': event.title,
        'tooltip-append-to-body': true
      });
      $compile(element)($scope);
    };




    $scope.uiConfig = {
   calendar: {
        editable: false, // no se podra arrastrar ni extender
        height: 500,
        ignoreTimezone: false, // usara el UTC -6
        timezone: 'local',
        header: {
          left: 'month,agendaWeek,agendaDay', // vistas de mes semana y dia
          center: 'title',
          right: 'today prev,next'
        },
        buttonText: {
          today: 'hoy',
          month: 'mes',
          week: 'semana',
          day: 'día'
        },
        eventClick: $scope.alertOnEventClick,
        eventRender: $scope.eventRender,
        defaultView: 'agendaDay',
        allDaySlot: false,
        firstDay: 1,
        lang: 'es',
        firstHour: 8,
        slotMinutes: 20,
        defaultEventMinutes: 120,
        timeFormat: 'HH:mm',
        axisFormat: 'HH:mm',
        minTime: "06:00:00",
        maxTime: "21:00:00",
	dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesShort: ["dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio','Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      }


};

$scope.items = ['item1', 'item2', 'item3'];
   /**********************************************************************/
   $scope.esDocente = Auth.isDocente;

    if (Auth.isDocente()) {
     var Docente = $resource('/api/docentes/user/:docenteId', {
        docenteId: '@id'
      });
      var usuario = Auth.getCurrentUser();
      var docente = Docente.get({
        docenteId: usuario._id
      }, function() {
        $scope.materias = docente.materias;
      });
    }
    /***********************************************************************/
    $scope.actividad = {// inicializamos la actividad para la reserva
      inicio: new Date(2011, 2, 12, 6, 20, 0),
      fin: new Date(2011, 2, 12, 8, 0, 0)
    };
    $scope.hstep = 1; // horas en el timepicker se desplaza 1 hora
    $scope.mstep = 5;// minutos en el timepicker se desplaza 5 mins
    $scope.ismeridian = false; // no mostrara AM/PM
    $scope.changed = function() {// evento al cambiar la hora en el timepicker de inicio
      $scope.actividad.fin = $scope.actividad.inicio;
    };
    $scope.irvan = function() {
      $scope.mostrar = true;
    }
    $scope.datePicker = {};
    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datePicker.opened = true;
    };

    /************************************************************************/

    /* event sources array*/
    $scope.eventSources = [$scope.events];
    $scope.animationsEnabled = true;

    /**************************************************************************/
    $scope.etiquetas = ['Edificio B', 'Edificio C', 'Edificio D']; // parametros de busqueda para reservas
    $scope.aulas = []; // parametro de busqueda por aulas

    $scope.loadTags = function(query) {
      return ['Edificio Electrica', 'Laboratorios UCB', 'Auditorios', 'Edificio Industrial', 'LCOMP', 'BIB', 'Edificio Mecanica'];
    };
    $scope.cargarAulas = function(query) {
      var res = $resource('/api/aulas/nombre/' + query);
      return res.query().$promise
    };
    /****************************************************************************/

    $scope.enviar = function() {
       var fecha =  new Date($scope.actividad.fecha);
       var fechaHi = new Date($scope.actividad.inicio);
       var fechaFi = new Date($scope.actividad.fin);


       var dates = {// objeto con la fecha y horas de la actividad
	  dia: fecha.getDate(),
	  mes: fecha.getMonth(),
	  year: fecha.getFullYear(),
	  mi: fechaHi.getMinutes(),
          hi: fechaHi.getHours(),
	  mf: fechaFi.getMinutes(),
          hf: fechaFi.getHours()
       };

	var DetectaChoque = $resource('/api/reservas/choque',{});
	var reservasComprobar = crearReservas(dates); // creamos reservas 'auxiliares' para detectar posibles choques.
	DetectaChoque.save(reservasComprobar).$promise//mandamos las reservas al WS para comprobar choque
       .then(function(data){
	 // en el caso no haya alguna reserva que choque
	var aulas = obtenerAulas();// obtenemos un array con los _ids de las aulas ingresadas
	var nuevoTurno = {// se crea el turno para la actividad (solo se soporta 1 turno en esta version)
	     inicio: new Date(dates.year,dates.mes,dates.dia,dates.hi,dates.mi),
	     fin: new Date(dates.year,dates.mes,dates.dia,dates.hf,dates.mf),
	     aulas: aulas
	   };
	    $resource('/api/turnos').save(nuevoTurno).$promise
	    .then(function(turnoCreado){
	         //se ha creado el turno
	       var encargado;// detectamos el encargado dependiendo el user actual
	       if(Auth.isDocente()) // si es docente
	         encargado = Auth.getCurrentUser().name;// el encargado de la materia es el usuario actual
	       else// si es admin o representante
	         encargado = $scope.encargado;// el encargado estara definido en un campo especial
	         var nuevaActividad = {
		    nombre: $scope.actividad.nombre,
		    tipo: 1, //esto deberia cambiar en un futuro para soportar otro tipo de actividades
		    encargado: encargado,
		    estado: 'en espera',
		    turnos: [turnoCreado._id], // el turno que se acaba de crear
		    creadoPor: Auth.getCurrentUser()._id
		  };

		  var Actividades= $resource('/api/actividades')
	         Actividades.save(nuevaActividad).$promise
	         .then(function(actividadCreada){
		     toaster.pop('success', "Éxito", "La reserva se ha enviado a aprobación");
	         }
)
	    });



        },// en el caso ha detectado choque
               function(error){ toaster.pop('error', "Error", "Ha ocurrido un error al enviar");});
    };


   function crearReservas(f){
       var reservas = {};
       var nuevaReserva = {};
       for(var i = 0; i < $scope.actividad.aulas.length; i++){
	 nuevaReserva = {
	  inicio: new Date(f.year,f.mes,f.dia,f.hi,f.mi),
          fin: new Date(f.year,f.mes,f.dia,f.hf,f.mf),
          aula: $scope.actividad.aulas[i]._id
	};
	reservas[i] = nuevaReserva;
       }
       return reservas;
   };

   function obtenerAulas(){// obtengo un array con referencias (_id) a las aulas
     var aulas = [];
     for(var i = 0; i < $scope.actividad.aulas.length; i++){
	aulas.push($scope.actividad.aulas[i]._id);
      }
     return aulas;
   }

  })

.controller('ModalInstanceCtrl', function($scope, $modalInstance, items) {
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function() {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
