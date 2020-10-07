import { serverURL, User } from '../backbone-parse.js';

var expect = chai.expect;
describe('User', function() {

    let user;
    
    beforeEach(function() {
        user = new User({score: 13});
    })

    describe('creation', function() {

        it('has _parse_class_name of "User"', function() {
            expect(user._parse_class_name).to.equal('User');
        });

        it('has the attributes passed on instantiation', function() {
            expect(user.get('score')).to.equal(13);
        });
    });

    it('set sets a hash of attributes', function() {
        user.set({password: 'HowYouDoin'});

        expect(user.get('password')).to.equal('HowYouDoin');
    });

    describe('signup', function() {

        let saveStub;
        let data = {
            objectId: 123,
            customOption: 'custom',
            sessionToken: 'abcd',
        };

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            // replicate how jquery would call 'options.success'
            // passing the object obtained by parsing the json sent by parse
            saveStub.yieldsTo('success', {objectId: data.objectId});
            saveStub.resolves({sessionToken: data.sessionToken});
        });

        afterEach(function() {
            saveStub.restore();
        });

        it('should make a request to the correct parse endpoint on signup', function() {
            
            let url = serverURL + '/users';

            user.signup();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.url).to.equal(url);
            expect(ajaxOptions.type).to.equal('POST');

        });

        it('signup should not throw error if used on a new model', function() {

            expect(user.signup.bind(user)).to.not.throw();

        });

        it('signup should throw error if used on a model that was synced with the server', function() {

            user.signup();
            expect(user.signup.bind(user)).to.throw('existing');

        });

        it('calls a success callback passed in the options argument with parameters (model, response, options)', function() {

            let spy = sinon.spy();

            user.signup({success: spy, customOption: data.customOption});

            expect(spy).to.have.been.calledOnce;
            expect(spy.getCall(0).args[0]).to.equal(user);
            expect(spy.getCall(0).args[1].objectId).to.equal(data.objectId);
            expect(spy.getCall(0).args[2].customOption).to.equal(data.customOption);
        });

        it('triggers a signup event on the model, passing sessionToken as an argument', function(done) {
            var object = {};
            _.extend(object, Backbone.Events);
            var spy = sinon.spy();

            object.listenTo(user, 'signup', spy);
            user.signup().then(function() {
                expect(spy).to.have.been.calledOnceWith(data.sessionToken);
            }).then(done);
            
        })
    });

    describe('login', function() {

        let saveStub;
        let url = serverURL + '/login';
        let data = {
            username: 'Sancho@panza.com',
            password: 'Zorro',
            customOption: 'custom',
            sessionToken: "r:pnktnjyb996sj4p156gjtp4im",
        };

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success', {
                username: "Sancho@panza.com",
                phone: "415-392-0202",
                createdAt: "2011-11-07T20:58:34.448Z",
                updatedAt: "2011-11-07T20:58:34.448Z",
                objectId: "g7y9tkhB7O",
                sessionToken: data.sessionToken,
            });
            saveStub.resolves({sessionToken: data.sessionToken});
            
            user.set('username', data.username);
            user.set('password', data.password);
        });

        afterEach(function() {
            saveStub.restore();
        });

        it('makes a request to the correct parse endpoint', function() {

            user.login();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.url).to.equal(url);
            expect(ajaxOptions.type).to.equal('GET');
            
        });

        it('username and password are passed to jquery in the right way to be urlencoded and appended to url', function() {
            user.login();

            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.data['username']).to.equal(data.username);
            expect(ajaxOptions.data['password']).to.equal(data.password);
            expect(ajaxOptions.contentType).to.equal('application/x-www-form-urlencoded');
            expect(ajaxOptions.processData).to.be.true;
        });

        it('saves data returned by parse in the user', function() {

            expect(user.phone).to.not.exist;

            user.login();
            
            expect(user.get('username')).to.equal('Sancho@panza.com');
            // id is actually set on the object, not on its attr array
            expect(user.id).to.equal("g7y9tkhB7O");
            expect(user.get('phone')).to.equal('415-392-0202');
            expect(user.get('sessionToken')).to.equal("r:pnktnjyb996sj4p156gjtp4im");
        });

        it('throws an error if used on a user without username', function() {
            user.unset('username');
            expect(user.login.bind(user)).to.throw('username');
        });

        it('throws an error if used on a user without password', function() {
            user.unset('password');
            expect(user.login.bind(user)).to.throw('password');
        });
        
        it('throws an error if used on a user without username and password', function() {
            user.unset('username');
            user.unset('password');
            expect(user.login.bind(user)).to.throw('username');
        });
        
        it('does not throw an error if used on a user with username and password', function() {
            expect(user.login.bind(user)).to.not.throw();
        });

        it('calls a success callback passed in the options argument with parameters (model, response, options)', function() {

            let spy = sinon.spy();

            user.login({success: spy, customOption: data.customOption});

            expect(spy).to.have.been.calledOnce;
            expect(spy.getCall(0).args[0]).to.equal(user);
            expect(spy.getCall(0).args[1].sessionToken).to.equal(data.sessionToken);
            expect(spy.getCall(0).args[2].customOption).to.equal(data.customOption);
        });

        it('triggers a login event on the model, passing sessionToken as an argument', function(done) {
            var object = {};
            _.extend(object, Backbone.Events);
            var spy = sinon.spy();

            object.listenTo(user, 'login', spy);
            user.login().then(function() {
                expect(spy).to.have.been.calledOnceWith(data.sessionToken);
            }).then(done);
        });
    });

    describe('update', function() {

        let saveStub;
        let data = {
            username: 'Sancho@panza.com',
            password: 'Zorro',
            id: "g7y9tkhB7O",
            name: "Sancho",
            sessionToken: "r:pnktnjyb996sj4p156gjtp4im",
            customOption: 'custom',
        };
        let url = serverURL + '/users/' + data.id;

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success', {
                updatedAt: "2011-11-07T20:58:34.448Z"
            });
            saveStub.resolves({});
            
            user.set('username', data.username);
            user.set('password', data.password);
            user.set('name', data.name);
            user.set('objectId', data.id);
            user.set('sessionToken', data.sessionToken);
        });

        afterEach(function() {
            saveStub.restore();
        });

        it('makes a request to the correct endpoint', function() {
            user.update();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.url).to.equal(url);
            expect(ajaxOptions.type).to.equal('PUT');
        });

        it('throws an error if called without a session token', function() {
            user.unset('sessionToken');
            expect(user.update.bind(user)).to.throw('session');
        });

        it('does not throw error if called with a session token', function() {
            expect(user.update.bind(user)).to.not.throw();
        });

        it('sends the session token as a header', function() {
            user.update();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.headers['X-Parse-Session-Token']).to.equal(data.sessionToken);
        });

        it('does not send the session token as a field', function() {
            user.update();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.data.sessionToken).to.not.exist;
        });

        it('calls a success callback passed in the options argument with parameters (model, response, options)', function() {

            let spy = sinon.spy();

            user.update({success: spy, customOption: data.customOption});

            expect(spy).to.have.been.calledOnce;
            expect(spy.getCall(0).args[0]).to.equal(user);
            expect(spy.getCall(0).args[1].updatedAt).to.equal("2011-11-07T20:58:34.448Z");
            expect(spy.getCall(0).args[2].customOption).to.equal(data.customOption);
        });

        it('triggers an update event on the model', function(done) {
            var object = {};
            _.extend(object, Backbone.Events);
            var spy = sinon.spy();
            object.listenTo(user, 'update', spy);

            user.update().then(function() {
                expect(spy).to.have.been.calledOnce;
            }).then(done);
        });
    });

    describe('retrieve', function() {

        let saveStub;
        let data = {
            sessionToken: "r:pnktnjyb996sj4p156gjtp4im",
            username: "cooldude6",
            phone: "415-392-0202",
            objectId: "g7y9tkhB7O",
            customOption: 'custom',
        };
        let url = serverURL + '/users/me';

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success', {
                username: data.username,
                phone: data.phone,
                createdAt: "2011-11-07T20:58:34.448Z",
                updatedAt: "2011-11-07T20:58:34.448Z",
                objectId: data.objectId
            });
            saveStub.resolves({});

            user.set('sessionToken', data.sessionToken);
        });

        afterEach(function() {
            saveStub.restore();
        });

        it('makes a request to the correct endpoint', function() {
            user.retrieve();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.type).to.equal('GET');
            expect(ajaxOptions.url).to.equal(url);
        });

        it('throws an error if called without a session token', function() {
            user.unset('sessionToken');
            expect(user.retrieve.bind(user)).to.throw('session');
        });

        it('does not throw error if called with a session token', function() {
            expect(user.retrieve.bind(user)).to.not.throw();
        });

        it('sends the session token as a header', function() {
            user.retrieve();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.headers['X-Parse-Session-Token']).to.equal(data.sessionToken);
        });

        it('does not send the session token as a field', function() {
            user.retrieve();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.data['X-Parse-Session-Token']).to.not.exist;
        });

        it('sets the fields received by Parse', function() {
            user.retrieve();
            expect(user.get('username')).to.equal(data.username);
            expect(user.id).to.equal(data.objectId);
        });

        it('calls a success callback passed in the options argument with parameters (model, response, options)', function() {

            let spy = sinon.spy();

            user.retrieve({success: spy, customOption: data.customOption});

            expect(spy).to.have.been.calledOnce;
            expect(spy.getCall(0).args[0]).to.equal(user);
            expect(spy.getCall(0).args[1].updatedAt).to.equal("2011-11-07T20:58:34.448Z");
            expect(spy.getCall(0).args[2].customOption).to.equal(data.customOption);
        });

        it('triggers a retrieve event on the model', function(done) {
            var object = {};
            _.extend(object, Backbone.Events);
            var spy = sinon.spy();
            object.listenTo(user, 'retrieve', spy);

            user.retrieve().then(function() {
                expect(spy).to.have.been.calledOnce;
            }).then(done);
        });
    });

    describe('logout', function() {

        let saveStub;
        let data = {
            sessionToken: 'haofhadau',
            name: 'Massimo',
            objectId: 'abcd',
        };
        let url = serverURL + '/logout';

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success');
            saveStub.resolves({});

            user.set(data);
        });

        afterEach(function() {
            saveStub.restore();
        });

        it('makes a request to the correct endpoint', function() {
            user.logout();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.type).to.equal('POST');
            expect(ajaxOptions.url).to.equal(url);
        });

        it('throws an error if called without a session token', function() {
            user.unset('sessionToken');
            expect(user.logout.bind(user)).to.throw('session');
        });

        it('does not throw error if called with a session token', function() {
            expect(user.logout.bind(user)).to.not.throw();
        });

        it('sends the session token as a header', function() {
            user.logout();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.headers['X-Parse-Session-Token']).to.equal(data.sessionToken);
        });

        it('does not send any POST data', function() {
            user.logout();
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.data).to.not.exist;
        });

        it('sets all previously set attributes to undefined', function(done) {
            user.logout().then(function(){
                expect(user.get('name')).to.be.undefined;
                expect(user.get('sessionToken')).to.be.undefined;
                expect(user.id).to.be.undefined;
                done();
            });
            
        });

        it('triggers a logout event on the model', function(done) {
            var object = {};
            _.extend(object, Backbone.Events);
            var spy = sinon.spy();
            object.listenTo(user, 'logout', spy);

            user.logout().then(function() {
                expect(spy).to.have.been.calledOnce;
            }).then(done);
        });

    });

    it('no methods should ever send sessionToken as a field');
    it('any method sending sessionToken should do so in a header');

});
