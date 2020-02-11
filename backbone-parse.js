/********** PARSE SERVER ACCESS PARAMETERS **********/

var appId = "myApp";
var serverURL = "http://localhost:1337/parse";

/******************* END *************************/

{

  /*
    Replace the toJSON method of Backbone.Model with our version

    This method removes the "createdAt" and "updatedAt" keys from the JSON version
    because otherwise the PUT requests to Parse fails.
  */
  let original_toJSON =Backbone.Model.prototype.toJSON;
  let ParseModel = {
    toJSON : function(options) {
      _parse_class_name = this.__proto__._parse_class_name;
      data = original_toJSON.call(this,options);
      delete data.createdAt
      delete data.updatedAt
      return data
    },

    idAttribute: "objectId"
  };
  _.extend(Backbone.Model.prototype, ParseModel);

  /*
    Replace the parse method of Backbone.Collection

    Backbone Collection expects to get a JSON array when fetching.
    Parse returns a JSON object with key "results" and value being the array.
  */
  let original_parse =Backbone.Collection.prototype.parse;
  let ParseCollection = {
    parse : function(options) {
      let _parse_class_name = this.__proto__._parse_class_name;
      let data = original_parse.call(this,options);
      if (_parse_class_name && data.results) {
        //do your thing
        return data.results;
      } else {
        //return original
        return data;
      }
    }
  };
  _.extend(Backbone.Collection.prototype, ParseCollection);

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
	Backbone.sync = function(method, model, options) {

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

}
