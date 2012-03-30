//This is our static module
Map.Controller = (function ($) {
    /////////////////
    //PRIVATE VARIABLES
    var me = {},
        _imageBaseUrl,
        _map,
        _realTimeHub,
        _clientId, //signalr clientid (guid)
        _userId, //.net userid (int)
		_isDriver = false,
		_markerType = Map.Marker.markerType,
        _session = Map.Session;

    /////////////////
    //PRIVATE METHODS
    function _mapExtentUpdateHandler(e) {
        if (_isDriver) {
            var ctr = _map.getCenter();
            _realTimeHub.updateMapExtent(ctr.lat, ctr.lng, e.target.getZoom());
        }
    }

    function _initMap() {
        _map = new L.Map('map', { closePopupOnClick: false });

        var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/997/256/{z}/{x}/{y}.png',
		    cloudmadeAttrib = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		    cloudmade = new L.TileLayer(cloudmadeUrl, { maxZoom: 18, attribution: cloudmadeAttrib });

        var start = new L.LatLng(0, 0); // the venerable null island 

        var nexradUrl = 'http://ags2.dtsagile.com/ArcGIS/rest/services/LiveFeeds/Nexrad/MapServer',
			nexradLayer = new L.AgsDynamicLayer(nexradUrl, { definitionQuery: '0:Order_=0', opacity: 0.5 });

        _map.setView(start, 4)
            .addLayer(cloudmade)
            ////////////////////////////////////////////////////////////////.addLayer(nexradLayer)
            .on('zoomend', _mapExtentUpdateHandler)
            .on('dragend', _mapExtentUpdateHandler)
            .on('locationfound', _onLocationFound)
            .on('locationerror', _onLocationError);
    }

    function _onLocationFound(e) {        
        $('#gps-button').removeClass('ui-btn-active');
    }

    function _onLocationError(e) {
        $('#gps-button').removeClass('ui-btn-active');
        alert(e.message);
    }

    //init the connection to the server
    function _initSignalr() {
        _realTimeHub = $.connection.realTimeHub;

        //listen for events coming from the server
        _realTimeHub.gotMapPoints = _gotMapPoints;
        _realTimeHub.gotNewDamageLocation = _gotMapPoints;
        _realTimeHub.gotMapExtent = _gotMapExtent;

        //start the connection
        $.connection.hub.start(function () {
            _clientId = $.connection.hub.clientId; //signalr clientid

            //if session does not exist, we will call join which will push the points down
            //if it already exists, join won't get called, so we need to get them...
            _session.exists() &&
                _realTimeHub.getMapPoints()
                    .done(function (data) {
                        $.each(data, function (idx, item) { _addPointToMap(item); });
                    });
        });

        return true;
    }

    //the server pushed a new map extent
    function _gotMapExtent(data) {
        if (data.callerId !== _clientId) {
            var latLng = new L.LatLng(data.lat, data.lng);
            _map.setView(latLng, data.zoom);
        }
    }

    function _gpsButtonHandler() {
        _map.locateAndSetView(14);
    }

    function _getMarker(markerType) {
        var iconUrl = _imageBaseUrl.concat(_markerType.find(markerType).toDash()).concat('.png'),
        icon = L.Icon.extend({
            iconSize: new L.Point(32, 37),
            shadowSize: new L.Point(47, 37),
            iconAnchor: new L.Point(16, 37),
            shadowUrl: _imageBaseUrl + 'custom-marker-shadow.png',
            iconUrl: iconUrl
        });
        return new icon();
    }

    function _showToaster(message) {
        $('#toaster').empty().text(message).slideToggle(function () {
            setTimeout(function () { $('#toaster').slideToggle(); }, 2000);
        });
    }

    //add a point to the map
    function _addPointToMap(data) {
        if (data.pointType && data.lat && data.lng) {
            _map.addLayer(new L.Marker(new L.LatLng(data.lat, data.lng), { icon: _getMarker(data.pointType) }));
        }
    }

    function _gotMapPoints(data) {
        if ($.isArray(data)) {
            $.each(data, function (idx, item) { _addPointToMap(item); });
        } else {
            _addPointToMap(data);
            _showToaster('added point!');
        }
    }

    // invoke user selection of point type			
    function _addPointMapClickHandler(e) {
        //html select doesn't work on a leaflet popup - we'll use a jquery mobile dialog instead
        $('#add-point-dialog button').data('latlng', JSON.stringify(new L.LatLng(e.latlng.lat, e.latlng.lng)));

        $.mobile.changePage('#add-point-dialog', 'pop');

        $('#add-point').removeClass('ui-btn-active');
        // remove the handler   
        _map.off('click', _addPointMapClickHandler);
    }

    function _initAddPointDialog() {
        $('#point-type-list').append(_markerType.toRadioGroup());
        $('#add-point-dialog button').click(function () {
            if ($('#add-point-dialog').find('input:checked').length !== 1) {
                alert('You must select a point type!');
                return;
            }

            var latlng = JSON.parse($(this).data('latlng')),
                markerString = $('#add-point-dialog').find('input:checked').val(),
                pointType = _markerType[markerString];

            $('#add-point-dialog').dialog('close');

            _realTimeHub.addDamageLocation(_userId, latlng.lat, latlng.lng, pointType)
                .fail(function () { alert('error adding location'); });
        });
    }

    function _joinCallback(data) {
        _userId = data.userId; //.net userid
        _session.login(data);

        if (data.success) {
            //hide the login dialog
            $.mobile.changePage('#map-page', { transition: 'pop' });
        } else {
            //show the error
            _displayLoginError(String.format('<p>The e-mail address &#39;{0}&#39; is already in use.</p>', data.email));
        }
    }

    function _joinErrback() {
        _displayLoginError('An unexpected error ocurred logging in.');
    }

    function _displayLoginError(message) {
        $('#errors').html('').append(message).fadeIn('slow');
    }

    function _validateLoginForm(email, screenname) {
        var isValid = true,
            messages = [];

        if (!email.isEmailAddress() || email.isEmpty()) {
            isValid = false;
            messages.push("Please enter a valid e-mail address.");
        }

        if (screenname.isEmpty()) {
            isValid = false;
            messages.push("Please enter a screen name.");
        }

        if (!isValid) {
            var msg = '';
            $.each(messages, function (idx, item) {
                msg += String.format('<p>{0}</p>', item)
            });
            _displayLoginError(msg);
        }

        return isValid;
    }

    function _submitLoginForm(e) {
        e.preventDefault();
        var email = $('#email').val(),
            screenname = $('#screenname').val();

        var isValid = _validateLoginForm(email, screenname);

        if (isValid) {
            //call a method on the server
            _realTimeHub.join(email, screenname)
                .done(_joinCallback)
                .fail(_joinErrback);
        }

        return false;
    }

    function _displayLoginForm() {
        $.mobile.changePage('#sign-in');
    }

    function _logout() {
        _realTimeHub.logout(_userId)
            .done(_session.logout)
            .fail(function () { alert('An unexpected error ocurred logging out.'); });
    }

    ////////////////
    //PUBLIC METHODS
    me.getMap = function () { return _map; };
    me.init = function (args) {
        _imageBaseUrl = args.imageBaseUrl;
        _initMap();
        _initSignalr();

        //event handlers
        $('#toggle-drive').click(function () {
            _isDriver = !_isDriver;
            if (!_isDriver) {
                var mouseOutHandler = function () {
                    $(this).removeClass('ui-btn-active');
                    $(this).unbind('mouseout', mouseOutHandler);
                };
                $(this).bind('mouseout', mouseOutHandler);
            }
        });

        $('#add-point').click(function () {
            _map.on('click', _addPointMapClickHandler);
        });

        $('#gps-button').live('vclick', _gpsButtonHandler);

        //login/ session
        if (!_session.exists()) {
            $('#sign-in form').submit(_submitLoginForm);
            _displayLoginForm();
        } else {
            //we're already logged in - get the userid and show login info
            _userId = _session.get().userId;
            $('#user').show().find('span').html(_session.toString());
        }

        $('#signout').click(_logout);

        _initAddPointDialog();
    };

    return me;

} ($));
//we pass $ in so js doesn't have to walk the scope chain - $ is now local to this closure.