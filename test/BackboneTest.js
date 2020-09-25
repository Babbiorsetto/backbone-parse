import { Model, serverURL, appId } from '../backbone-parse.js'

var expect = chai.expect;

describe('General', function() {

    it('serverURL and appId cannot be set programmatically in a module', function() {
        let saveStub = sinon.stub(jQuery, 'ajax');
        let customURL = 'http://mysite.com/parse';
        let customAppId = 'anotherApp';
        let MyModel = Model.extend({
            _parse_class_name: 'Custom',
        });
        let model = new MyModel();
        
        var badFunction = function() {
            serverURL = customURL;
        };
        var worseFunction = function() {
            appId = customAppId;
        };

        expect(badFunction).to.throw();
        expect(worseFunction).to.throw();

        model.save();

        let ajaxOptions = saveStub.getCall(0).args[0];
        expect(ajaxOptions.url).not.to.equal(customURL);
        expect(ajaxOptions.appId).not.to.equal(customAppId);

        saveStub.restore();
    });
});
