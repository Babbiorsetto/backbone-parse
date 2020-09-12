import sinon from "sinon";
import {Model as ParseModel, serverURL, appId} from "../backbone-parse.js";
import sinonChai from "sinon-chai";
import chai from "chai";
import {describe, it} from "mocha";

var expect = chai.expect;
chai.use(sinonChai);
describe('Model', function(){

  var Model = ParseModel.extend({_parse_class_name: 'Test'});
  var modelInstance = new Model();

  it('_parse_class_name should be the one passed on model definition', function(){
    expect(modelInstance._parse_class_name).to.equal('Test');
  });
  it('idAttribute should be \'objectId\'', function(){
    expect(modelInstance.idAttribute).to.equal('objectId');
  });
  it('its \'parse\' method should remove additional fields from the response coming from parse', function(){
    let response = {
      createdAt: "2011-08-20T02:06:57.931Z",
      correct: true,
      updatedAt: "2011-08-20T02:06:57.931Z"
    };
    let filtered = modelInstance.parse(response);
    expect(filtered.createdAt).to.not.exist;
    expect(filtered.updatedAt).to.not.exist;
    expect(filtered.correct).to.equal(true);
  });
  /* downside of using mocha is that jquery doesn't work
  it('its \'save\' method makes a request to the correct URL to create a new database object', function(){
    let saveStub = sinon.stub(jQuery, 'ajax');
    let url = serverURL + '/classes/Test/';

    modelInstance.save();
    expect(saveStub).to.have.been.calledOnce;
    let ajaxOptions = saveStub.getCall(0).args[0];
    expect(ajaxOptions.url).to.equal(url);
    saveStub.restore();
  });
  */
});
