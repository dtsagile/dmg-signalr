//This depends on socket.io being loaded into the page
IOWrapper = function () {
    console.log('initing IOWrapper...');
    var self = this;
    this.clientId = null;
    this.isConnected = false;

    this.realTimeHub = $.connection.realTimeHub;
    //listen for events coming from the server    
    this.realTimeHub.gotMapExtent = function (data) {
        console.log('IOWrapper: got updateMap...');
        self.trigger('updateMap', data);
    };

    this.realTimeHub.gotNewDamageLocation = function (data) {
        console.log('IOWrapper: got PointAdded...');
        self.trigger('pointAdded', data);
    };

    //start the connection
    $.connection.hub.start(function () {
        self.clientId = $.connection.hub.clientId; //signalr clientid
        self.isConnected = true;
        //once it's started, get the points
        self.realTimeHub.getMapPoints()
            .done(function (data) {
                $.each(data, function (idx, item) { self.trigger('pointAdded', item); });
            });
    });

    //----- END CONTSTRUCTOR --------

    //public methods send messages to the server
    this.addMapPoint = function (data) {
        if (this.isConnected) {
            this.realTimeHub.addDamageLocation(data.lat, data.lng, data.pointType);
        }
    };

    this.pushMapState = function (data) {
        if (this.isConnected) {
            this.realTimeHub.updateMapExtent(data.lat, data.lng, data.zoom);
        }
    };

    this.getPoints = function () {
        if (this.isConnected) {
            this.realTimeHub.getMapPoints().done(function (data) {
                $.each(data, function (idx, item) { self.trigger('pointAdded', item); });
            });
        }
    };
};
MicroEvent.mixin(IOWrapper);