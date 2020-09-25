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

        it('should make a request to the correct parse endpoint on signup', function() {
            let saveStub = sinon.stub(jQuery, 'ajax');
            let url = serverURL + '/users';

            user.signup();
            expect(saveStub).to.have.been.calledOnce;
            let ajaxOptions = saveStub.getCall(0).args[0];
            expect(ajaxOptions.url).to.equal(url);
            expect(ajaxOptions.type).to.equal('POST');

            saveStub.restore();
        });

        it('signup should not throw error if used on a new model', function() {
            let saveStub = sinon.stub(jQuery, 'ajax');

            expect(user.signup.bind(user)).to.not.throw();

            saveStub.restore();
        });

        it('signup should throw error if used on a model that was synced with the server', function() {
            let saveStub = sinon.stub(jQuery, 'ajax');
            // replicate how jquery would call 'options.success'
            // passing the object obtained by parsing the json sent by parse
            saveStub.yieldsTo('success', {objectId: 123});

            user.signup();
            expect(user.signup.bind(user)).to.throw('existing');

            saveStub.restore();
        });
    });

    describe('login', function() {

        let saveStub;
        let url = serverURL + '/login';
        let data = {
            username: 'Sancho@panza.com',
            password: 'Zorro'
        };

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success', {
                username: "Sancho@panza.com",
                phone: "415-392-0202",
                createdAt: "2011-11-07T20:58:34.448Z",
                updatedAt: "2011-11-07T20:58:34.448Z",
                objectId: "g7y9tkhB7O",
                sessionToken: "r:pnktnjyb996sj4p156gjtp4im"
            });
            
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
    });

    describe('update', function() {

        let saveStub;
        let data = {
            username: 'Sancho@panza.com',
            password: 'Zorro',
            id: "g7y9tkhB7O",
            name: "Sancho",
            sessionToken: "r:pnktnjyb996sj4p156gjtp4im",
        };
        let url = serverURL + '/users/' + data.id;

        beforeEach(function() {
            saveStub = sinon.stub(jQuery, 'ajax');
            saveStub.yieldsTo('success', {
                updatedAt: "2011-11-07T20:58:34.448Z"
            });
            
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

    });

    describe('retrieve', function() {

        let saveStub;
        let data = {
            sessionToken: "r:pnktnjyb996sj4p156gjtp4im",
            username: "cooldude6",
            phone: "415-392-0202",
            objectId: "g7y9tkhB7O",
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
    });

    it('no methods should ever send sessionToken as a field');
    it('any method sending sessionToken should do so in a header');

});
