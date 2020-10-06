var chai = require('chai');
var request = require('supertest');
var assert = require('assert');

var app = require('../server.js');

describe('PUT RDFSource /ldp/tests/interaction-model-test as DirectContainer', function() {
    it('responds with 400 Bad Request', function(done) {
        request(app)
        .put('/ldp/tests/1')
        .send('')
        .set('Content-type', 'text/plain')
        .set('Link', '<http://www.w3.org/ns/ldp#DirectContainer>; rel="type"')
        .expect(400)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
    });
});

describe('PUT RDFSource /ldp/tests/interaction-model-test as IndirectContainer', function() {
    it('responds with 400 Bad Request', function(done) {
        request(app)
        .put('/ldp/tests/1')
        .send('')
        .set('Content-type', 'text/plain')
        .set('Link', '<http://www.w3.org/ns/ldp#IndirectContainer>; rel="type"')
        .expect(400)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
    });
});

describe('PUT RDFSource /ldp/tests/interaction-model-test as NonRDFSource', function() {
    it('responds with 409 Bad Request', function(done) {
        request(app)
        .put('/ldp/tests/1')
        .send('')
        .set('Content-type', 'text/plain')
        .set('Link', '<http://www.w3.org/ns/ldp#NonRDFSource>; rel="type"')
        .expect(409)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
    });
});

describe('PUT NonRDFSource /ldp/tests/interaction-model-test as RDFSource', function() {
    it('responds with 409 Bad Request', function(done) {
        request(app)
        .put('/ldp/tests/1')
        .send('<somexml />')
        .set('Content-type', 'application/xml')
        .set('Link', '<http://www.w3.org/ns/ldp#RDFSource>; rel="type"')
        .expect(409)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
    });
});

