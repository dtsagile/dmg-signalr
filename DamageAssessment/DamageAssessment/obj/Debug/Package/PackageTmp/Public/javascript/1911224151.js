//This is our static module
Map.Controller = (function ($) {
    /////////////////
    //PRIVATE VARIABLES
    var me = {},
        _map,
        _mode = 'disaster',
        _zombieLayer,
        _disasterLayer,
        _socket = {}, 
        _ioWrapper = {},
        _addPointMapHandler = {},
        _isDriver = false,
        _markerType = Map.Marker.markerType,
        _session = Map.Session;

    /////////////////
    //PRIVATE METHODS
    function _initMap(){
        _map = new L.Map('map');
        var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/997/256/{z}/{x}/{y}.png',
            cloudmadeAttrib = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
        _disasterLayer = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttrib});
        var start = new L.LatLng(0,0); // the venerable null island 
        var midnightCommanderUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/999/256/{z}/{x}/{y}.png';
        _zombieLayer = new L.TileLayer(midnightCommanderUrl, {maxZoom: 18, attribution: cloudmadeAttrib});

        _map.setView(start, 4).addLayer(_disasterLayer);
        
        _map.on('zoomend', function(e) {
            if(_isDriver){
                console.log('zoomend: ' +  e.target.getCenter() + e.target.getZoom()); // e is an event object (MouseEvent in this case)
                var ctr = e.target.getCenter();
                //_socket.emit('pushMapState',{lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});
                _ioWrapper.pushMapState({lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});
            }
        });
        
        //When the map is panned, send the
        _map.on('dragend', function(e) {
            //console.log(e);
            if(_isDriver){
                console.log('dragend: ' + e.target.getCenter() + e.target.getZoom()); // e is an event object (MouseEvent in this case)
                var ctr = e.target.getCenter();
                //_socket.emit('pushMapState',{lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()}); 
                _ioWrapper.pushMapState({lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});
            }
        });
        
        $('#mode-switch').bind('click', function(){
            //toggle the mode
            if(_mode === 'disaster'){
                _mode = 'zombie';
            } else{
                _mode = 'disaster';
            }
            _modeChange({mode:_mode}); 
            //_socket.emit('mode-change',{mode:_mode}); 
        });
    }

    function _modeChange(data){
         if(data.mode == 'zombie'){
            $('#mode-switch').text('Zombie Apocalypse Command Center');
            _map.setView(new L.LatLng(33.82495405054108, -116.53849482536316), 16);
            _map.removeLayer(_disasterLayer);
            _map.addLayer(_zombieLayer);
            $('body').toggleClass('zombie');        
        }else{
            $('#mode-switch').text('Damage Assessment Console');
            //_mode='disaster';
            _map.addLayer(_disasterLayer);
            _map.removeLayer(_zombieLayer);
            $('body').toggleClass('zombie');
        }
    }


    //--------------------------------------
    //setup events and socket.io
    //--------------------------------------
    function _initIO(){  
        //setup the ioWapper
        _ioWrapper = new IOWrapper();
        
        _ioWrapper.bind('updateMap', function(data){
            console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
            _map.setView(new L.LatLng(data.lat,data.lng), data.zoom);    
        });
        _ioWrapper.bind('pointAdded', _addPointToMap);
        _ioWrapper.bind('toggleAppState', _modeChange);  
        wii_ioWrapper.bind('updateMap', function(data){
            console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
            _map.setView(new L.LatLng(data.lat,data.lng), data.zoom);    
        });self.trigger('toggleAppState', data);IOWrapper    console.log('got userCountUpdate...');
            $('#userCount').text(data.count + ' users.');_ioWrapper.bind('toggleAppState', _modeChange);  _socket.on('wii', function(data){
               console.log('wii: ' + data.x  + data.y);
               var s = _map.getSize().y / 2; 
               _map.panBy(new L.Point(data.x * s,data.y * s));  

            });
            _socket.on('zoom',function(data){
                console.log('got zoom ' + data.z);
                if(data.z != 0){
                     console.log('Got Remote Zoom: ' + data.z);
                    var newLevel = _map.getZoom() + data.z;
                    console.log('NewLevel: ' + newLevel);
                    if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                        _map.setZoom(newLevel);
                    }
                }
            }); 
            _socket.on('userCountUpdate', function(data){
                console.log('got userCountUpdate...');
                $('#userCount').text(data.count + ' users.');
            });_ioWrapper.pushMapState({lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});{lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});    console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
                _map.setView(new L.LatLng(data.lat,data.lng), data.zoom);        _ioWrapper.bind('', function(data){});updateMaptoggleAppState        console.log('IOWrapper: got PointAdded...') ;this._socket = {};_socket.on('pointAdded', function(data){
                    //RAISE EVENT
                }); 

                _socket.on('mode-change', function(data){
                    //RAISE EVENT
                });_socket.on('updateMap', function (data) { _socket = io.connect();    _socket.on('wii', function(data){
                       console.log('wii: ' + data.x  + data.y);  
                    });
                    _socket.on('zoom',function(data){
                        console.log('got zoom ' + data.z);
                        if(data.z != 0){
                             console.log('Got Remote Zoom: ' + data.z);
                            var newLevel = _map.getZoom() + data.z;
                            console.log('NewLevel: ' + newLevel);
                            if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                                _map.setZoom(newLevel);
                            }
                        }
                    }); 
                    _socket.on('userCountUpdate', function(data){
                        console.log('got userCountUpdate...');
                        $('#userCount').text(data.count + ' users.');
                    });'socketwrapper.js',    /////////////////
                        //PRIVATE VARIABLES
                        var me = {},
                            _map,
                            _mode = 'disaster',
                            _zombieLayer,
                            _disasterLayer,
                            _socket = {},
                            _addPointMapHandler = {},
                            _isDriver = false,
                            _markerType = Map.Marker.markerType,
                            _session = Map.Session;

                        /////////////////
                        //PRIVATE METHODS
                        function _initMap(){
                            _map = new L.Map('map');
                            var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/997/256/{z}/{x}/{y}.png',
                                cloudmadeAttrib = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
                            _disasterLayer = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttrib});
                            var start = new L.LatLng(0,0); // the venerable null island 
                            var midnightCommanderUrl = 'http://{s}.tile.cloudmade.com/e157614f2e585e679ee4a14551192a57/999/256/{z}/{x}/{y}.png';
                            _zombieLayer = new L.TileLayer(midnightCommanderUrl, {maxZoom: 18, attribution: cloudmadeAttrib});

                            _map.setView(start, 4).addLayer(_disasterLayer);

                            _map.on('zoomend', function(e) {
                                if(_isDriver){
                                    console.log('zoomend: ' +  e.target.getCenter() + e.target.getZoom()); // e is an event object (MouseEvent in this case)
                                    var ctr = e.target.getCenter();
                                    _socket.emit('pushMapState',{lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});
                                }
                            });

                            //When the map is panned, send the
                            _map.on('dragend', function(e) {
                                //console.log(e);
                                if(_isDriver){
                                    console.log('dragend: ' + e.target.getCenter() + e.target.getZoom()); // e is an event object (MouseEvent in this case)
                                    var ctr = e.target.getCenter();
                                    _socket.emit('pushMapState',{lat: ctr.lat, lng: ctr.lng, zoom: e.target.getZoom()});
                                }
                            });

                            $('#mode-switch').bind('click', function(){
                                //toggle the mode
                                if(_mode === 'disaster'){
                                    _mode = 'zombie';
                                } else{
                                    _mode = 'disaster';
                                }
                                _modeChange({mode:_mode}); 
                                _socket.emit('mode-change',{mode:_mode}); 
                            });
                        }

                        function _modeChange(data){
                             if(data.mode == 'zombie'){
                                $('#mode-switch').text('Zombie Apocalypse Command Center');
                                _map.setView(new L.LatLng(33.82495405054108, -116.53849482536316), 16);
                                _map.removeLayer(_disasterLayer);
                                _map.addLayer(_zombieLayer);
                                $('body').toggleClass('zombie');        
                            }else{
                                $('#mode-switch').text('Damage Assessment Console');
                                //_mode='disaster';
                                _map.addLayer(_disasterLayer);
                                _map.removeLayer(_zombieLayer);
                                $('body').toggleClass('zombie');
                            }
                        }


                        //--------------------------------------
                        //setup events and socket.io
                        //--------------------------------------
                        function _initSocket(){
                            _socket = io.connect();
                            _socket.on('updateMap', function (data) {
                                console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
                                _map.setView(new L.LatLng(data.lat,data.lng), data.zoom);
                              });

                            _socket.on('pointAdded', _addPointToMap); 

                            _socket.on('mode-change', function(data){
                                  _modeChange(data);
                            });
                            /*_socket.on('remoteNav', function(data){
                               console.log('Got Remote Nav: ' + data.x  + data.y);

                               _map.panBy(new L.Point(data.x,data.y));  

                                if(data.z != 0){
                                     console.log('Got Remote Zoom: ' + data.z);
                                    var newLevel = _map.getZoom() + data.z;
                                    console.log('NewLevel: ' + newLevel);
                                    if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                                        _map.setZoom(newLevel);
                                    }
                                }

                            });   */

                        }



                        function _getMarker(markerType) {
                            var iconUrl = 'images/'.concat(markerType.toDash()).concat('.png'),
                            icon = L.Icon.extend({   
                                iconSize: new L.Point(32, 37),
                                shadowSize: new L.Point(47, 37),
                                iconAnchor: new L.Point(13, 35),
                                shadowUrl: 'images/custom-marker-shadow.png',
                                iconUrl: iconUrl
                            });
                            return new icon();
                        }

                        //add a point to the map
                        function _addPointToMap(data) {
                            console.log('Adding point to the map... Marker:' + data.pointType);
                            _map.addLayer(new L.Marker(new L.LatLng(data.lat, data.lng), { icon: _getMarker(data.pointType)}));
                            _map.closePopup();
                        }

                        // handler for select/dropdown within map popup
                        function _onMarkerTypeChange(e) {
                            console.log('Emitting addPoint event for ' + $(e.target).val());
                            var latlng = _map._popup._latlng,
                            data = {
                                //pointType: _markerType[$(e.target).val()],
                                pointType: $(e.target).val(),  
                                lat: latlng.lat, 
                                lng: latlng.lng
                            };
                            // send the message
                            _socket.emit('addPoint', data, function() {
                                 console.log('success on the server - show the point');
                                _addPointToMap(data);    
                            });
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


                        ////////////////
                        //PUBLIC METHODS
                        me.setDriver = function (val) { _isDriver = val;};
                        me.getMap = function () { return _map; };
                        me.init = function (args) {
                            //_initUI();
                            _initMap();
                            _initSocket();
                            $('#toggle-drive').bind('click', function(){
                                console.log('isDriving ' + _isDriver);
                                _isDriver = !_isDriver;
                                $('#toggle-drive').toggleClass('ui-btn-active');
                                console.log('isDriving ' + _isDriver);
                            });

                            $('#add-point').bind('click', function(){
                                //bind up a click event to the map
                                console.log('setting up map click event')
                                _map.on('click', _addPointMapClickHandler);
                            });

                            _socket.on('wii', function(data){
                               console.log('wii: ' + data.x  + data.y);
                               var s = _map.getSize().y / 2; 
                               _map.panBy(new L.Point(data.x * s,data.y * s));  

                            });
                            _socket.on('zoom',function(data){
                                console.log('got zoom ' + data.z);
                                if(data.z != 0){
                                     console.log('Got Remote Zoom: ' + data.z);
                                    var newLevel = _map.getZoom() + data.z;
                                    console.log('NewLevel: ' + newLevel);
                                    if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                                        _map.setZoom(newLevel);
                                    }
                                }
                            }); 
                            _socket.on('userCountUpdate', function(data){
                                console.log('got userCountUpdate...');
                                $('#userCount').text(data.count + ' users.');
                            });

                            $('.leaflet-popup-content select').live('change', _onMarkerTypeChange);

                            console.log('Done init');
                        };

                        return me; ($));Map.Controller = (function ($) {socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount}); socket.emit('userCountUpdate', {count: userCount});                                                  
        
        /*
        _socket = io.connect();
        _socket.on('updateMap', function (data) {
            console.log('Got Update Map during init ' + data.lat + ' ' + data.lng + ' ' + data.zoom);
            _map.setView(new L.LatLng(data.lat,data.lng), data.zoom);
          });
        
        _socket.on('pointAdded', _addPointToMap); 
        
        _socket.on('mode-change', function(data){
              _modeChange(data);
        });     
        */
        /*_socket.on('remoteNav', function(data){
           console.log('Got Remote Nav: ' + data.x  + data.y);
            
           _map.panBy(new L.Point(data.x,data.y));  
        
            if(data.z != 0){
                 console.log('Got Remote Zoom: ' + data.z);
                var newLevel = _map.getZoom() + data.z;
                console.log('NewLevel: ' + newLevel);
                if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                    _map.setZoom(newLevel);
                }
            }
           
        });   */
        
    }
    
    
    
    function _getMarker(markerType) {
        var iconUrl = 'images/'.concat(markerType.toDash()).concat('.png'),
        icon = L.Icon.extend({   
            iconSize: new L.Point(32, 37),
            shadowSize: new L.Point(47, 37),
            iconAnchor: new L.Point(13, 35),
            shadowUrl: 'images/custom-marker-shadow.png',
            iconUrl: iconUrl
        });
        return new icon();
    }
        
    //add a point to the map
    function _addPointToMap(data) {
        console.log('Adding point to the map... Marker:' + data.pointType);
        _map.addLayer(new L.Marker(new L.LatLng(data.lat, data.lng), { icon: _getMarker(data.pointType)}));
        _map.closePopup();
    }
    
    // handler for select/dropdown within map popup
    function _onMarkerTypeChange(e) {
        console.log('Emitting addPoint event for ' + $(e.target).val());
        var latlng = _map._popup._latlng,
        data = {
            //pointType: _markerType[$(e.target).val()],
            pointType: $(e.target).val(),  
            lat: latlng.lat, 
            lng: latlng.lng
        };
        // send the message
        _ioWrapper.addMapPoint(data); 
        //TODO: Change addPoint to accept a callback
        _addPointToMap(data);
        /*_socket.emit('addPoint', data, function() {
             console.log('success on the server - show the point');
            _addPointToMap(data);    
        });*/
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
    

    ////////////////
    //PUBLIC METHODS
    me.setDriver = function (val) { _isDriver = val;};
    me.getMap = function () { return _map; };
    me.init = function (args) {
        //_initUI();
        _initMap();
        _initIO();
        $('#toggle-drive').bind('click', function(){
            console.log('isDriving ' + _isDriver);
            _isDriver = !_isDriver;
            $('#toggle-drive').toggleClass('ui-btn-active');
            console.log('isDriving ' + _isDriver);
        });
        
        $('#add-point').bind('click', function(){
            //bind up a click event to the map
            console.log('setting up map click event')
            _map.on('click', _addPointMapClickHandler);
        });
        /*
        _socket.on('wii', function(data){
           console.log('wii: ' + data.x  + data.y);
           var s = _map.getSize().y / 2; 
           _map.panBy(new L.Point(data.x * s,data.y * s));  
            
        });
        _socket.on('zoom',function(data){
            console.log('got zoom ' + data.z);
            if(data.z != 0){
                 console.log('Got Remote Zoom: ' + data.z);
                var newLevel = _map.getZoom() + data.z;
                console.log('NewLevel: ' + newLevel);
                if(newLevel <= _map.getMaxZoom() && newLevel >= _map.getMinZoom()){
                    _map.setZoom(newLevel);
                }
            }
        }); 
        _socket.on('userCountUpdate', function(data){
            console.log('got userCountUpdate...');
            $('#userCount').text(data.count + ' users.');
        });
         */  
        $('.leaflet-popup-content select').live('change', _onMarkerTypeChange);
        
        console.log('Done init');
    };

    return me;

} ($));
//we pass $ in so js doesn't have to walk the scope chain - $ is now local to this closure.