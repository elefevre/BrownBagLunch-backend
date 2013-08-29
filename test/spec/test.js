/*global describe, it, before, require*/
/*jshint globalstrict: true*/
"use strict";

var should = require('chai').should(),
    assert = require('sinon').assert,
    sinon = require('sinon'),
    app = require('../../app.js'),
    http = require('http'),
    index = require('../../routes/index.js'),
    storage = require('../../storage.js'),
    mailer = require('../../mailer.js');

(function () {

    describe('should log bbl usage :', function () {
        before(mockMongo);

        it('should return status 200', function (done) {
            http.get("http://localhost:3000/users/nrichand/hit",function (res) {
                res.statusCode.should.equal(200);
                done();
            });
        });

        it('should store a new hit for nrichand', function (done) {
            http.get("http://localhost:3000/users/nrichand/hit",function (res) {
                assert.calledWith(storage.save, 'nrichand');
                done();
            });
        });
    });

    describe('should mail baggers :', function () {
        before(mockMailSend);

        it('should call send mail', function (done) {
            var post_data = "from=nrichand@brownbaglunch.fr&to=foo@bar.com&subject=BBL&message=Yeah";

            var success_callback = function (chunk) {
                assert.calledOnce(mailer.send);

                assert.calledWith(mailer.send, sinon.match.has("from", "nrichand@brownbaglunch.fr"));
                assert.calledWith(mailer.send, sinon.match.has("to", "foo@bar.com"));
                assert.calledWith(mailer.send, sinon.match.has("subject", "BBL"));
                assert.calledWith(mailer.send, sinon.match.has("message", "Yeah"));

                done();
            };

            var error_callback = function (e) {
                e.message.should.be.empty();
            };

            sendPOSTMailRequest(post_data, success_callback, error_callback);
        });
    });
})();

/*
 *  Utilities methods
 */

function mockMongo(){
    sinon.stub(storage, "save");
}

function mockMailSend(){
    sinon.stub(mailer, "send");
}

function sendPOSTMailRequest(post_data, success_callback, error_callback) {
    var options = {
        hostname: 'localhost',
        port: 3000,
        path: '/mail',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', success_callback);
    });

    req.on('error', error_callback);

    req.write(post_data);
    req.end();
}
