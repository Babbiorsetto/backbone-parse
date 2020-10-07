import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
/********** PARSE SERVER ACCESS PARAMETERS **********/

export var appId = "myApp";
export var serverURL = "http://localhost:1337/parse";

/******************* END *************************/

/*
Modify each model's parse method to filter
"createdAt" and "updatedAt" returned by parse
*/
let localModel = Backbone.Model.extend({
  parse: function(resp, options) {
    let copy = _.clone(resp);
    delete copy.createdAt;
    delete copy.updatedAt;
    return copy;
  },
  
  idAttribute: "objectId"
});

let User = localModel.extend({
  _parse_class_name: 'User',
  toJSON: function() {
    let temp = _.clone(this.attributes);
    delete temp.sessionToken;
    return temp;
  },
  signup: function(options) {
    if (!this.isNew()) {
      throw new Error('cannot call signup on an already existing user');
    }
    var model = this;
    var promise = this.save(null, options);
    return promise.then(function(data) {
      model.trigger('signup', data.sessionToken);
    });
  },
  login: function(options) {
    if (!this.get('username') || !this.get('password')) {
      throw new Error('cannot call login on a user without username or password');
    }
    var model = this;
    var promise = this.fetch(options);
    return promise.then(function(data) {
      model.trigger('login', data.sessionToken);
    });
  },
  update: function(options) {
    if (!this.get('sessionToken')) {
      throw new Error('cannot call update without a session token');
    }
    var model = this;
    var promise = this.save(null, options);
    return promise.then(function() {
      model.trigger('update');
    });
  },
  retrieve: function(options) {
    if (!this.get('sessionToken')) {
      throw new Error('cannot call retrieve without a session token');
    }
    options = _.extend({parse: true}, options);
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      var serverAttrs = options.parse ? model.parse(resp, options) : resp;
      if (!model.set(serverAttrs, options)) return false;
      if (success) success.call(options.context, model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
    var promise = this.sync('retrieve', this, options);
    return promise.then(function() {
      model.trigger('retrieve');
    });
  },
  logout: function(options) {
    if (!this.get('sessionToken')) {
      throw new Error('cannot call logout without a session token');
    }
    options = _.extend({parse: true}, options);
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      for (var attr in model.attributes) {
        model.set(attr, undefined);
      }
      if (success) success.call(options.context, model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
    var promise = this.sync('logout', this, options);
    return promise.then(function() {
      model.trigger('logout');
    });
  },
});

/*
  Replace the parse method of Backbone.Collection

  Backbone Collection expects to get a JSON array when fetching.
  Parse returns a JSON object with key "results" and value being the array.
*/

let localCollection = Backbone.Collection.extend({
  parse : function(resp, options) {
    let _parse_class_name = this.__proto__._parse_class_name;
    // if the collection is a parse collection and the response is coming from parse server
    if (_parse_class_name && resp.results) {
      // return array of results from the results property of the response
      return resp.results;
    } else {
      //return original, in case there are collections from another source
      return resp;
    }
  }
});


/*
  Method to HTTP Type Map
*/
let methodMap = {
  'create': 'POST',
  'update': 'PUT',
  'delete': 'DELETE',
  'read':   'GET'
};

/*
  Override the default Backbone.sync
*/
let ajaxSync = Backbone.sync;
let newSync = function(method, model, options) {

  let object_id = model.models? "" : model.id; //get id if it is not a Backbone Collection

  let class_name = model._parse_class_name;
  if (!class_name) {
    return ajaxSync(method, model, options) //It's a not a Parse-backed model, use default sync
  }

  // create request parameters
  let type = methodMap[method];
    options || (options = {});
  let base_url = serverURL + "/classes";
  let url = base_url + "/" + class_name;
  if (method != "create") {
    url = url + object_id;
  }

  //Setup data
  let data;
  if (!options.data && model && (method == 'create' || method == 'update')) {
    data = JSON.stringify(model.toJSON());
  } else if (options.query && method == "read") { //query for parse objects
    data = encodeURI("where=" + JSON.stringify(options.query));
  }

  let request = {
    //data
    contentType: "application/json",
    processData: false,
    dataType: 'json',
    data: data,

    //action
    url: url,
    type: type,

    //authentication
    headers: {
        "X-Parse-Application-Id": appId,
    }
  };

  return $.ajax(_.extend(options, request));
};

let userSync = function(method, model, options) {

  let type;
  let url = serverURL;
  
  switch (method) {
    case 'create':
      type = 'POST';
      url = url + '/users';
      break;
    case 'read':
      type = 'GET';
      url = url + '/login';
      break;
    case 'update':
      type = 'PUT';
      url = url + `/users/${model.id}`;
      break;
    case 'retrieve':
      type = 'GET';
      url = url + '/users/me';
      break;
    case 'logout':
      type = 'POST';
      url = url + '/logout';
      break;
    }

  let data = JSON.stringify(model.toJSON());

  let request = {
    //data
    contentType: "application/json",
    processData: false,
    dataType: 'json',
    data: data,

    //action
    url: url,
    type: type,

    //authentication
    headers: {
        "X-Parse-Application-Id": appId,
    }
  };

  // method is read (login)
  if (method == 'read') {
    request.processData = true;
    request.contentType = "application/x-www-form-urlencoded";
    request.data = {
      username: model.get('username'),
      password: model.get('password')
    };
  };

  // method is update or retrieve
  if (_.contains(['update', 'retrieve', 'logout'], method)) {
    request.headers["X-Parse-Session-Token"] = model.get('sessionToken');
  }

  if ('retrieve' == method || 'logout' == method) {
    delete request.data;
  }

  return $.ajax(_.extend(options, request));
};

localModel.prototype.sync = newSync;
localCollection.prototype.sync = newSync;
User.prototype.sync = userSync;
export {localModel as Model, localCollection as Collection, User};
