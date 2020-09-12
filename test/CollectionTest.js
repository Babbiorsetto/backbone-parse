import chai from "chai";
import {describe, it} from "mocha";
import {Collection as ParseCollection} from "../backbone-parse";
var expect = chai.expect;

describe('Collection', function(){

  var Collection = ParseCollection.extend({_parse_class_name: 'Test'});
  var collectionInstance = new Collection();

  it('_parse_class_name should be the one passed on collection definition', function(){
    expect(collectionInstance._parse_class_name).to.equal('Test');
  });
  it('its \'parse\' method should extract the fields from the response coming from parse', function(){
    let response = {
      "results": [
        {
          "name": "test",
          "updatedAt": "2011-08-19T02:24:17.787Z",
          "createdAt": "2011-08-19T02:24:17.787Z",
          "objectId": "A22v5zRAgd"
        },
        {
          "name": "test2",
          "updatedAt": "2011-08-21T18:02:52.248Z",
          "createdAt": "2011-08-20T02:06:57.931Z",
          "objectId": "Ed1nuqPvcm"
        }
      ]
    };
    let results = collectionInstance.parse(response);
    expect(results[0].name).to.equal('test');
    expect(results[1].name).to.equal('test2');

  });


});
