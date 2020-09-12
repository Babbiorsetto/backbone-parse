import _ from "underscore";
import $ from "jquery";
import Backbone from "backbone";
/********** PARSE SERVER ACCESS PARAMETERS **********/

export var appId = "myApp";
export var serverURL = "http://localhost:1337/parse";

/******************* END *************************/

/*
  Modify each model's parse method to filter
  "createdAt" and "updatedAt" returned by parse
*/
let localModel = Backbone.Model;
let ParseModel = {
    parse: function(resp, options) {
      delete resp.createdAt;
      delete resp.updatedAt;
      return resp;
    },

    idAttribute: "objectId"
};
_.extend(localModel.prototype, ParseModel);

/*
  Replace the parse method of Backbone.Collection

  Backbone Collection expects to get a JSON array when fetching.
  Parse returns a JSON object with key "results" and value being the array.
*/

let localCollection = Backbone.Collection;
let ParseCollection = {
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
};
_.extend(localCollection.prototype, ParseCollection);

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

  let class_name = model.__proto__._parse_class_name;
  if (!class_name) {
    return ajaxSync(method, model, options) //It's a not a Parse-backed model, use default sync
  }

  // create request parameters
  let type = methodMap[method];
    options || (options = {});
  let base_url = serverURL + "/classes";
  let url = base_url + "/" + class_name + "/";
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

localModel.prototype.sync = newSync;
localCollection.prototype.sync = newSync;
export {localModel as Model, localCollection as Collection};
