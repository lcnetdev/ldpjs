`ldpjs` Features
----------------

The following are features of `ldpjs` specific to this project.

Contents
-----------------

* [MongoDB Document](#MongoDB+Document)
* [MongoDB Search](#MongoDB+Search)
* [Content versioning](#Content+versioning)
* [JSONLD Profiles](#JSONLD+Profiles)

----------------

### MongoDB Document

Submitting a GET request with `Accept: application/x-mongodoc+json` will return 
JSON document as stored in MongoDB.

```bash
$ curl -s -i -X GET -H "Accept: application/x-mongodoc+json" http://localhost:3000/ldp/hello/world
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 1051
ETag: W/"41b-avoPMz1CthtrcfRMVVXS0lGlDE4"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 18:49:27 GMT
Connection: keep-alive

{
  "_id": "60369ea9f8cc90338875191d",
  "uri": "info:lc/hello/world",
  "docuri": "/hello/world.json",
  "created": "2021-02-24T18:44:54.207Z",
  "modified": "2021-02-24T18:44:54.207Z",
  "containedIn": "info:lc/hello",
  "index": {},
  "versions": [
    {
      "v_created": "2021-02-24T18:44:54.207Z",
      "mimeType": "application/ld+json",
      "ldpTypes": [
        "<http://www.w3.org/ns/ldp#BasicContainer>"
      ],
      "content": {
        "@context": {
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
          "ldp": "http://www.w3.org/ns/ldp#",
          "dcterms": "http://purl.org/dc/terms/",
          "bf": "http://id.loc.gov/ontologies/bibframe/",
          "bflc": "http://id.loc.gov/ontologies/bflc/",
          "madsrdf": "http://www.loc.gov/mads/rdf/v1#",
          "void": "http://rdfs.org/ns/void#",
          "foaf": "http://xmlns.com/foaf/0.1/"
        },
        "@id": "info:lc/hello/world",
        "@type": "rdfs:Resource"
      }
    }
  ]
}
```


### MongoDB Search

Because `ldpjs` uses MongoDB as a backend, it is possible to use MOngoDB's search
capabilities.  

Search is executed by POSTing to a Container.  Everything within that container, 
including all descendents, is searched.  (If you want to search the entire system, 
target the root container.)  The POST request should carry a `Content-type: application/x-mongoquery+json`
header.  The POST body should be an array each item of which should match a 
[MongoDB Aggregate pipeline stage](https://docs.mongodb.com/manual/aggregation/).  

Find the resource whose (internal) URI is 'info:lc/hello/world':
```bash
$ curl -s -i -X POST -H "Content-type: application/x-mongoquery+json" --data '[{"$match": { "uri": "info:lc/hello/world" } }]' http://localhost:3000/ldp/hello
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 618
ETag: W/"26a-e/v5iTviu5kBV7GY4/AhFUp8KRU"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 18:57:11 GMT
Connection: keep-alive

{"totalHits":1,"query":[{"$match":{"uri":"info:lc/hello/world"}}],"results":[{"modified":"2021-02-24T18:44:54.207Z","mimeType":"application/ld+json","data":{"@context":{"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdfs":"http://www.w3.org/2000/01/rdf-schema#","ldp":"http://www.w3.org/ns/ldp#","dcterms":"http://purl.org/dc/terms/","bf":"http://id.loc.gov/ontologies/bibframe/","bflc":"http://id.loc.gov/ontologies/bflc/","madsrdf":"http://www.loc.gov/mads/rdf/v1#","void":"http://rdfs.org/ns/void#","foaf":"http://xmlns.com/foaf/0.1/"},"@id":"http://localhost:3000/ldp/hello/world","@type":"rdfs:Resource"}}]}
```


### Content versioning

By default, content is versioned, but it is possible to disable this behavior per 
PUT request by sending the `Prefer: version=0` header:

```bash
$ curl -s -i -X PUT -H "Prefer: version=0" http://localhost:3000/ldp/hello/world
```


### JSONLD Profiles

The default JSONLD profile used for GET requests - meaning the RDF output from a 
GET request - uses the [compacted](http://www.w3.org/ns/json-ld#compacted).  It 
is possible to request a different profile as part of the `Accept` header.
'expanded' and 'flattened' are also available.

```bash
$ curl -s -i -X GET -H "Accept: application/ld+json; profile=http://www.w3.org/ns/json-ld#expanded" http://localhost:3000/ldp/hello/world
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-post: application/n-triples, text/plain, application/rdf+xml, application/n3, text/n3, text/turtle, application/ld+json,  application/x-mongoquery+json
Allow: GET,POST,PUT,DELETE,OPTIONS
Vary: Prefer, Accept, Accept-Encoding
Link: <http://www.w3.org/ns/ldp#Resource>;rel="type"
Link: <http://www.w3.org/ns/ldp#Container>;rel="type"
Link: <http://www.w3.org/ns/ldp#BasicContainer>;rel="type"
Content-Type: application/ld+json; charset=utf-8
Content-Length: 138
ETag: W/"8a-+44GbZbNR3Q8pPjqxo7r484+qI4"
Date: Wed, 24 Feb 2021 19:25:49 GMT
Connection: keep-alive

[
  {
    "@id": "http://localhost:3000/ldp/hello/world",
    "@type": [
      "http://www.w3.org/2000/01/rdf-schema#Resource"
    ]
  }
]
```
