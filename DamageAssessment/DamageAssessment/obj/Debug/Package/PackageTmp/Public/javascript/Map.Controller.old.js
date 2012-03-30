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
            /////////////////////////////////////////////.addLayer(nexradLayer)
            .on('zoomend', _mapExtentUpdateHandler)
            .on('dragend', _mapExtentUpdateHandler);
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
        _map.addLayer(new L.Marker(new L.LatLng(data.lat, data.lng), { icon: _getMarker(data.pointType) }));                
    }

    function _gotMapPoints(data) {
        if ($.isArray(data)) {
            $.each(data, function (idx, item) { _addPointToMap(item); });
        } else {
            _addPointToMap(data);
            _showToaster('added point!');
        }
        _map.closePopup();
    }

    // handler for select/dropdown within map popup
    function _onMarkerTypeChange(e) {
        var latlng = _map._popup._latlng,
            pointType = _markerType[$(e.target).val()];

        $('#add-point').removeClass('active');

        _realTimeHub.addDamageLocation(_userId, latlng.lat, latlng.lng, pointType)
            .fail(function () { alert('error adding location'); });
    }

    // invoke user selection of point type			
    function _addPointMapClickHandler(e) {
        var popup = new L.Popup();
        popup.setLatLng(new L.LatLng(e.latlng.lat, e.latlng.lng));
        popup.setContent(_markerType.toHtmlSelect());
        _map.openPopup(popup);
        // remove the handler   
        _map.off('click', _addPointMapClickHandler);
    }

    function _joinCallback(data) {
        _userId = data.userId; //.net userid
        _session.login(data);

        if (data.success) {
            //hide the login form
            $.unblockUI();
            $('#user').show().find('span').html(_session.toString());
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
        $.blockUI({
            message: $('#sign-in'),
            css: {
                width: '300px',
                textAlign: 'center',
                '-webkit-border-radius': '8px',
                '-moz-border-radius': '8px',
                'border-radius': '8px',
                opacity: .85,
                background: '#3C494F',
                color: '#FFF'
            }
        });
    }

    function _logout() {
        _realTimeHub.logout(_userId)
            .done(_session.logout)
            .fail(function () { alert('An unexpected error ocurred logging out.'); });

        //the (intended) behavior of the node/ socket.io version was that when you leave the page, you are logged out... when we do that, the callback never gets hit
        //so you're logged out on the server side but our session on the client is never ended
        //so we use $.ajax with async = false
        //side effect: when you refresh the page, you are logged out
        //todo: consider alternative - just don't worry about duplicate email addresses - it doesn't really matter
//        $.ajax({
//            url: '/da/home/logout',
//            data: { userId: _userId },
//            traditional: true,
//            dataType: 'json',
//            success: _session.logout,
//            error: function () { alert('An unexpected error ocurred logging out.'); },
//            async: false
//        });
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
            $('#toggle-drive').toggleClass('active');
        });

        $('#add-point').click(function () {
            $(this).addClass('active');
            _map.on('click', _addPointMapClickHandler);
        });

        $('.leaflet-popup-content select').live('change', _onMarkerTypeChange);

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
        //$(window).unload(_logout); this causes problems
    };

    return me;

} ($));
//we pass $ in so js doesn't have to walk the scope chain - $ is now local to this closure.