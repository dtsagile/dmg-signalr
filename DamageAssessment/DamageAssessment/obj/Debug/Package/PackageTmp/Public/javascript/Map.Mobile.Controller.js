if (!this.Map || typeof this.Map !== 'object') {
    this.Map = {};
}

Map.Controller = (function ($) {
    var me = {},
        _map,
        _mcLayer,
        _disasterLayer,
        _imageBaseUrl,
        _isDriver = false,
        _menuOpen = false,
        _currentMarkerType = '';

    function _initMap() {
        _map = new L.Map('map');
        var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/997/256/{z}/{x}/{y}.png',
            cloudmadeAttrib = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';

        _disasterLayer = new L.TileLayer(cloudmadeUrl, { maxZoom: 18, attribution: cloudmadeAttrib });
        var mcUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/999/256/{z}/{x}/{y}.png';
        _mcLayer = new L.TileLayer(mcUrl, { maxZoom: 18, attribution: cloudmadeAttrib });
        var start = new L.LatLng(39.50404070558415, -96.9873046875);
        _map.setView(start, 4).addLayer(_disasterLayer);
    }

    function _initIO() {
        _ioWrapper = new IOWrapper();
        _ioWrapper.getPoints();
        _ioWrapper.bind('updateMap', function (data) {
            console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
            _map.setView(new L.LatLng(data.lat, data.lng), data.zoom);
        });

        _ioWrapper.bind('pointAdded', _addPointToMap);
        _ioWrapper.bind('wii', function (data) {
            console.log('Got wii:', data);
            var s = _map.getSize().y / 2;
            _map.panBy(new L.Point(data.x * s, data.y * s));
        });
        _ioWrapper.bind('userCountUpdate', function (data) {
            console.log('updating user count...', data);
            $('#userCount').text(data.count + ' users'); 
        });
    }

    function _getMarker(markerType) {
        var iconUrl = _imageBaseUrl + markerType + '-mobile.png',
            icon = L.Icon.extend({ iconSize: new L.Point(32, 32), iconAnchor: new L.Point(16, 16),
            shadowUrl: null, iconUrl: iconUrl
        });
        return new icon();
    }

    function _addPointToMap(data) {
        console.log('Adding point to the map ' + data.pointType); 
        _map.addLayer(new L.Marker(new L.LatLng(data.lat, data.lng), { icon: _getMarker(data.pointType) }));
    }

    function _addPointMapClickHandler(e) {
        var data = { pointType: _currentMarkerType, lat: e.latlng.lat, lng: e.latlng.lng };
        _addPointToMap(data);
        _ioWrapper.addMapPoint(data);
        _map.off('click', _addPointMapClickHandler); 
        $('.active').removeClass('active');
    }

    me.getMap = function () {
        return _map;
    };

    me.init = function (args) {
        _imageBaseUrl = args.imageBaseUrl;
        _initMap();
        _initIO();
        $('.circle-container').on('click', '.circle', function () {
            console.log('got circle click');
            if (_menuOpen) {
                move('#fire').ease('in-out').y(0).rotate(360).end();
                move('#deaths').ease('in-out').y(0).rotate(360).end();
                move('#road-damage').ease('in-out').y(0).rotate(360).end();
                move('#road-impassable').ease('in-out').y(0).rotate(360).end();
                move('#damaged-building').ease('in-out').y(0).rotate(360).end();
                move('#destroyed-building').ease('in-out').y(0).rotate(360).end();
                move('#gps').ease('in-out').x(0).rotate(360).end();
                _menuOpen = false;
            } else {
                move('#fire').ease('in-out').y(-210).rotate(-360).end();
                move('#deaths').ease('in-out').y(-170).rotate(-360).end();
                move('#road-damage').ease('in-out').y(-130).rotate(-360).end();
                move('#road-impassable').ease('in-out').y(-90).rotate(-360).end();
                move('#damaged-building').ease('in-out').y(-50).rotate(-360).end();
                move('#destroyed-building').ease('in-out').y(-50).rotate(-360).end();
                move('#gps').ease('in-out').x(50).rotate(-360).end();
                _menuOpen = true;
            }
        });

        $('ul.items').on('click', 'li', function (evt) {
            if ($(this).is('#gps') == false) {
                _currentMarkerType = $(this).data('type');
                $('.active').removeClass('active');
                $(this).addClass('active');
                _map.on('click', _addPointMapClickHandler);
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var loc = new L.LatLng(position.coords.latitude, position.coords.longitude);
                        _map.setView(loc, 14);
                    },
                        function (msg) {
                            alert('Error with GPS');
        
                        });
                    } else {
                        error('not supported');
                    }
                }
            });
        };
        return me;
}($));