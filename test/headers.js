var chai = require('chai');
var request = require('supertest');
var assert = require('assert');

var expect = chai.expect;

var app = require('../server.js');
const fs = require('fs');  

describe('PUT /ldp/tests container', function() {
  it('responds with 201 Created', function(done) {
    request(app)
        .put('/ldp/tests')
        .expect(201)
        .then(response => {
          done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
    });
});

describe('GET /ldp/tests/', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/')
        .set("Accept", "application/rdf+xml")
        .expect(200)
        .expect('Content-Type', /rdf\+xml/) 
        .expect(response => {
            response.text.indexOf('rdfs:Resource');
        })
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('PUT n-triples at /ldp/tests/1', function() {
  it('responds with 201 Created', function(done) {
    fs.readFile(__dirname + "/data/21026276.bibframe.nt", 'utf8',  (err, data) => {
        if (err) throw err;
        request(app)
        .put('/ldp/tests/1')
        .send(data)
        .set('Content-type', 'text/plain')
        .expect(201)
        .then(response => {
          done();
        })
        .catch(err => {
          if (err) console.log(err);
          done();
        });
      });
    });
});

describe('GET /ldp/tests/1 as RDF/XML', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "application/rdf+xml")
        .expect(200)
        .expect('Content-Type', /rdf\+xml/) 
        .expect(response => {
            response.text.indexOf('<bf:Work rdf:about=');
        })
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('GET /ldp/tests/1', function() {
  it('responds with 200 and "#Container" Link', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "application/ld+json")
        .expect(200)
        .expect('Link', /#Container/) 
        .then(response => {
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('GET /ldp/tests/1', function() {
  it('responds with 200 and "#BasicContainer" Link', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "application/ld+json")
        .expect(200)
        .expect('Link', /#BasicContainer/) 
        .then(response => {
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('GET /ldp/tests/1', function() {
  it('responds with 200 and POST, GET, and DELETE found in Allow header', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "application/ld+json")
        .expect(200)
        .expect('Allow', /POST/)
        .expect('Allow', /GET/)
        .expect('Allow', /DELETE/)
        .then(response => {
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('GET /ldp/tests/1', function() {
  it('responds with 200 and application/n3, application/ld+json, and application/x-mongoquery+json found in Accept-post header', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "application/ld+json")
        .expect(200)
        .expect('Accept-post', /mongoquery/)
        .expect('Accept-post', /n3/)
        .expect('Accept-post', /ld\+json/)
        .then(response => {
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
  });
});

describe('POST JSON document to /ldp/tests/', function() {
  it('responds with 201 Created', function(done) {
    fs.readFile(__dirname + "/data/profile.json", 'utf8',  (err, data) => {
        if (err) throw err;
        request(app)
            .post('/ldp/tests/')
            .set("Slug", "jsondoc")
            .send(data)
            .set('Content-type', 'application/json')
            .expect(201)
            .then(response => {
              done();
            })
            .catch(err => {
              if (err) return console.log(err);
              done();
            });
        });
    });
});

describe('GET /ldp/tests/jsondoc', function() {
  it('responds with 200 and NonRDFSource Link', function(done) {
    request(app)
        .get('/ldp/tests/jsondoc')
        .set("Accept", "application/json")
        .expect(200)
        .expect('Link', /NonRDFSource/) 
        .then(response => {
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
      });
});


describe('GET /ldp/tests/jsondoc', function() {
  it('responds with 200 and Allow with no POST', function(done) {
    request(app)
        .get('/ldp/tests/jsondoc')
        .set("Accept", "application/json")
        .expect(200)
        .then(response => {
            expect(response.headers.allow).to.not.have.string('POST');
            done();
        })
        .catch(err => {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('DELETE /ldp/tests', function() {
  it('responds with 204 No Content', function(done) {
    request(app)
        .delete('/ldp/tests')
        .expect(204)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

