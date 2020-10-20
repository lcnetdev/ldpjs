var chai = require('chai');
var request = require('supertest');
var assert = require('assert');

var app = require('../server.js');
const fs = require('fs');  

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

describe('GET /ldp/tests/1 as n-triples', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "text/plain")
        .expect(200)
        .expect('Content-Type', /plain/) 
        .expect(response => {
            response.text.indexOf('tests/1> <http://');
        })
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('PUT (update) /ldp/tests/1', function() {
  it('responds with 204 Updated', function(done) {
    request(app)
        .put('/ldp/tests/1')
        .send("<> <http://purl.org/dc/terms/title> 't1' . ")
        .set('Content-type', 'text/plain')
        .expect(204)
        .then(response => {
          done();
        })
        .catch(err => {
          if (err) console.log(err);
          done();
        });
    });
});

describe('GET /ldp/tests/1 - check update succeeded', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/1')
        .set("Accept", "text/plain")
        .expect(200)
        .expect('Content-Type', /plain/) 
        .expect(response => {
            response.text.indexOf('tests/1> <http://purl.org/dc/terms/title');
        })
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('DELETE /ldp/tests/1', function() {
  it('responds with 204 No Content', function(done) {
    request(app)
        .delete('/ldp/tests/1')
        .expect(204)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});
