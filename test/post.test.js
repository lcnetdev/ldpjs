var chai = require('chai');
var request = require('supertest');
var assert = require('assert');

var app = require('../server.js');
const fs = require('fs');  

describe('PUT /ldp/tests', function() {
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

describe('POST /ldp/tests to create t1', function() {
  it('responds with 201 Created', function(done) {
    request(app)
        .post('/ldp/tests')
        .set("Slug", "t1")
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

describe('GET /ldp/tests/t1', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/t1')
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

describe('POST /ldp/tests/t1 to create t2', function() {
  it('responds with 201 Created', function(done) {
    request(app)
        .post('/ldp/tests/t1')
        .set("Slug", "t2")
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

describe('GET /ldp/tests/t1/t2', function() {
  it('responds with 200', function(done) {
    request(app)
        .get('/ldp/tests/t1/t2')
        .set("Accept", "text/plain")
        .expect(200)
        .expect('Content-Type', /text/) 
        .expect(response => {
            response.text.indexOf('http://www.w3.org/2000/01/rdf-schema#Resource');
        })
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
});

describe('POST /ldp/tests/t1', function() {
  it('responds with 201 Created', function(done) {
    request(app)
        .post('/ldp/tests/t1')
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

describe('POST JSON document to /ldp/tests/t1', function() {
  it('responds with 201 Created', function(done) {
    fs.readFile(__dirname + "/data/profile.json", 'utf8',  (err, data) => {
        if (err) throw err;
        request(app)
            .post('/ldp/tests/t1')
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

describe('DELETE /ldp/tests/t1', function() {
  it('responds with 204 No Content', function(done) {
    request(app)
        .delete('/ldp/tests/t1')
        .expect(204)
        .end(function(err, res) {
          if (err) return console.log(err);
          done();
        });
      });
})

describe('GET /ldp/tests/t1/t2', function() {
  it('responds with 404', function(done) {
    request(app)
        .get('/ldp/tests/t1/t2')
        .set("Accept", "text/plain")
        .expect(404)
        .end(function(err, res) {
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
