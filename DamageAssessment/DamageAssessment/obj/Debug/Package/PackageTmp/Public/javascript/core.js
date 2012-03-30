/* Stuff used by all versions */

// Namespace
if (!this.Map || typeof this.Map !== 'object') {
    this.Map = {};
}

Map.Marker = (function () {

    var _markerType = {
        damagedBuilding: 'Damaged Building',
        destroyedBuilding: 'Destroyed Building',
        activeFire: 'Fire (active)',
        injuries: 'Injuries',
        deaths: 'Deaths',
        roadDamage: 'Road Damage',
        roadImpassable: 'Road Impassable',
        bridgeDamage: 'Bridge Damage'
    };

    _markerType.find = function (val) {
        for (var item in this) {
            if (this[item] === val)
                return item.toString().toDash();
        }
    };

    _markerType.toHtmlSelect = function () {
        var select = $('<select>');
        for (var item in this) {
            var me = this[item];
            if (typeof me === "string") {
                var option = $('<option>').attr('value', item).text(me);
                option.appendTo(select);
            }
        }

        return $('<select><option>Select type&hellip;</option>'.concat(select.html()).concat('</select>'))[0];
    };

    _markerType.toRadioGroup = function () {
        var el, name, container = $('<div>');
        for (var item in this) {
            var me = this[item];
            if (typeof me === "string") {
                id = 'radio-choice-' + item;
                el = '<input type="radio" name="point-type-radio-group" id="' + id + '" value="' + item + '" /><label for="' + id + '">' + me + '</label>';
                container.append(el);
            }
        }

        return container.html();
    };

    return {
        markerType: _markerType
    };


} ($));

Map.Session = (function () {
    var _get = function () {
        return window.name === "" ? "" : JSON.parse(window.name);
    },

    _exists = function () {
        return window.name !== "";
    },

    _toString = function () {
        var user = _get();
        return _exists()
            ? String.format('{0} | {1}', user.screenname, user.email)
            : "";
    },

    _login = function (data) {
        if (data.success) {
            window.name = JSON.stringify(data);
        }
    },

    _logout = function () {
        window.name = "";
        window.location.reload();
        console.debug('Map.Session._logout');
    };

    return {
        login: function (data, isSuccess) {
            _login(data, isSuccess);
        },
        logout: function () { _logout(); },
        exists: function () { return _exists(); },
        get: function () { return _get(); },
        toString: function () { return _toString(); }
    };

} ($));

// extend things to make them more useful
String.prototype.toCamel = function(){
    return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};

String.prototype.toDash = function(){
    return this.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
};

String.format = function() {
    for(var i = 0; i < arguments.length; i++) {
        var arg = arguments[i], 
        regex = new RegExp("\\{".concat(i).concat("\\}"), "gi");
        arguments[0] = arguments[0].replace(regex, arguments[i + 1]);
    };
    return arguments[0];
};

String.prototype.isEmailAddress = function(){  
   var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
   return emailPattern.test(this);  
}

String.prototype.isEmpty = function () {
    return /^\s{1,}$/.test(this) || this.length === 0;
} 


