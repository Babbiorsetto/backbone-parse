import {Model as ParseModel, serverURL, appId, RESTApiKey} from "../backbone-parse.js";

var expect = chai.expect;
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

  it('its \'save\' method makes a request to the correct URL to create a new database object', function(){
    let saveStub = sinon.stub(jQuery, 'ajax');
    let url = serverURL + '/classes/Test';

    modelInstance.save();
    expect(saveStub).to.have.been.calledOnce;
    let ajaxOptions = saveStub.getCall(0).args[0];
    expect(ajaxOptions.url).to.equal(url);
    saveStub.restore();
  });

  it('its save method makes a request to the correct URL to update an existing database object', function() {
    let saveStub = sinon.stub(jQuery, 'ajax');
    let url = serverURL + '/classes/Test/abcd';

    modelInstance.set('objectId', 'abcd');
    modelInstance.save();

    expect(saveStub).to.have.been.calledOnce;
    let ajaxOptions = saveStub.getCall(0).args[0];
    expect(ajaxOptions.url).to.equal(url);

    saveStub.restore();
  });

  it('appends the correct headers to requests', function() {
    let saveStub = sinon.stub(jQuery, 'ajax');
    
    modelInstance.save();

    expect(saveStub).to.have.been.calledOnce;
    let ajaxOptions = saveStub.getCall(0).args[0];
    expect(ajaxOptions.headers['X-Parse-Application-Id']).to.equal(appId);
    expect(ajaxOptions.headers['X-Parse-REST-API-Key']).to.equal(RESTApiKey);

    saveStub.restore();
  });

});
