# ldpjs

`ldpjs` is, for better or for worse, a MongoDB-backed LDP Server (https://www.w3.org/TR/ldp/),
of sorts. 'of sorts' because no serious attempt at testing its conformance to the LDP 
specification has been made.  It is certainly in the spirit of LDP.

It will not store binaries.  It will store RDF, JSON, and XML.

Basic Containers are supported.  Direct and Indirect Containers are not supported.
Can only update via PUT.

## Getting Started

`ldpjs` can be used as a standalone NodeJS server/application or, more common probably, 
can be used within another NodeJS server project.

### Prerequisites

    MongoDB 4.* (Earlier versions might be fine, but it has been developed using MongoDB version 4.4)
    Jena Riot (https://jena.apache.org/download/index.cgi)
    
### Installation

You'll probably just want to use npm to install ldpjs:

    npm install git+https://github.com/lcnetdev/ldpjs.git

If you'd like to download and install the latest source you'll need git:

    git clone https://github.com/lcnetdev/ldpjs.git

### Configuring

The following snippet represents the minimum amount of code to instantiate `ldpjs` 
within another NodeJS server project:

```javascript
const app = express();
const ldp = require("ldpjs");
var ldpconfig = {
    useConverter: "riot",
    converters: {
        riot: {
            TD: "/path/to/tmp/directory/",
            JAVA_HOME: "/path/to/java/home/",
            JENA_HOME: "/path/to/jena/home/",
            JENA_RIOT: "/path/to/jena/home/riot/binary",
        }
    }
};

ldp.setConfig(ldpconfig);
app.use('/ldp', ldp);
app.listen(3000);
```

The above assumes, for example, that MongoDB is running at localhost on port 27017
and that a database with the name 'ldp' and a collection with the name of 'resources'
are OK.  See docs/configuring(docs/configuring.md) for more information about 
the default configuration values and options.


### Basic Usage

Generally the examples seen in the [LDP documentation](https://www.w3.org/TR/ldp/) 
should work with the exceptions noted above about supporting binaries and direct 
and indirect containers.

Create a resource.
```bash
$ curl -s -i -X PUT http://localhost:3000/ldp/hello
HTTP/1.1 201 Created
X-Powered-By: Express
Location: http://localhost:3000/ldp/hello
Content-Type: text/plain; charset=utf-8
Content-Length: 31
ETag: W/"1f-47GiSy7sl4kSFvbt7UkwrIVPRt0"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 17:00:56 GMT
Connection: keep-alive

http://localhost:3000/ldp/hello
```

View the resource (NB: Default serialization is JSONLD)
```bash
$ curl -s -i -X GET http://localhost:3000/ldp/hello
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-post: application/n-triples, text/plain, application/rdf+xml, application/n3, text/n3, text/turtle, application/ld+json,  application/x-mongoquery+json
Allow: GET,POST,PUT,DELETE,OPTIONS
Vary: Prefer, Accept, Accept-Encoding
Link: <http://www.w3.org/ns/ldp#Resource>;rel="type"
Link: <http://www.w3.org/ns/ldp#Container>;rel="type"
Link: <http://www.w3.org/ns/ldp#BasicContainer>;rel="type"
Content-Type: application/ld+json; charset=utf-8
Content-Length: 523
ETag: W/"20b-ZkgGKPdhKryk6KgZ5rDerAFrqJg"
Date: Wed, 24 Feb 2021 17:01:42 GMT
Connection: keep-alive

{
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
  "@id": "http://localhost:3000/ldp/hello",
  "@type": "rdfs:Resource"
}
```

View RDF/XML instead:
```bash
$ curl -s -i -X GET -H "Accept: application/rdf+xml" http://localhost:3000/ldp/hello
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-post: application/n-triples, text/plain, application/rdf+xml, application/n3, text/n3, text/turtle, application/ld+json,  application/x-mongoquery+json
Allow: GET,POST,PUT,DELETE,OPTIONS
Vary: Prefer, Accept, Accept-Encoding
Link: <http://www.w3.org/ns/ldp#Resource>;rel="type"
Link: <http://www.w3.org/ns/ldp#Container>;rel="type"
Link: <http://www.w3.org/ns/ldp#BasicContainer>;rel="type"
Content-Type: application/rdf+xml
Content-Length: 543
ETag: W/"21f-P7L2gKSmJEWnIrvD8mffdo/Q12A"
Date: Wed, 24 Feb 2021 17:03:02 GMT
Connection: keep-alive

<rdf:RDF
    xmlns:bf="http://id.loc.gov/ontologies/bibframe/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:ldp="http://www.w3.org/ns/ldp#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:foaf="http://xmlns.com/foaf/0.1/"
    xmlns:void="http://rdfs.org/ns/void#"
    xmlns:bflc="http://id.loc.gov/ontologies/bflc/">
  <rdfs:Resource rdf:about="http://localhost:3000/ldp/hello"/>
</rdf:RDF>
```

Create a resource via POST
```bash
$ curl -s -i -X POST http://localhost:3000/ldp/hello
HTTP/1.1 201 Created
X-Powered-By: Express
Location: http://localhost:3000/ldp/hello/71a6fbf3-659c-44e2-8bf4-f55846103b42
Content-Type: text/plain; charset=utf-8
Content-Length: 68
ETag: W/"44-C5+sUVUEE7oWntr9Tv8+Dk84O60"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 17:03:52 GMT
Connection: keep-alive

http://localhost:3000/ldp/hello/71a6fbf3-659c-44e2-8bf4-f55846103b42
```

Creata a resource via POST with a specific 'slug':
```bash
$ curl -s -i -X POST -H "Slug: world" http://localhost:3000/ldp/hello
HTTP/1.1 201 Created
X-Powered-By: Express
Location: http://localhost:3000/ldp/hello/world
Content-Type: text/plain; charset=utf-8
Content-Length: 37
ETag: W/"25-KhTjRn1cupIZc3LmXVlkhwW81UQ"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 17:04:58 GMT
Connection: keep-alive

http://localhost:3000/ldp/hello/world
```

View the 'hello' container again, note the ldp:contains predicate:
```bash
$ curl -s -i -X GET http://localhost:3000/ldp/hello
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-post: application/n-triples, text/plain, application/rdf+xml, application/n3, text/n3, text/turtle, application/ld+json,  application/x-mongoquery+json
Allow: GET,POST,PUT,DELETE,OPTIONS
Vary: Prefer, Accept, Accept-Encoding
Link: <http://www.w3.org/ns/ldp#Resource>;rel="type"
Link: <http://www.w3.org/ns/ldp#Container>;rel="type"
Link: <http://www.w3.org/ns/ldp#BasicContainer>;rel="type"
Content-Type: application/ld+json; charset=utf-8
Content-Length: 776
ETag: W/"308-LAh31a6/FGD8W0dI9aq/OPWyg+k"
Date: Wed, 24 Feb 2021 17:06:06 GMT
Connection: keep-alive

{
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
  "@id": "http://localhost:3000/ldp/hello",
  "@type": "rdfs:Resource",
  "ldp:contains": [
    {
      "@id": "http://localhost:3000/ldp/hello/71a6fbf3-659c-44e2-8bf4-f55846103b42"
    },
    {
      "@id": "http://localhost:3000/ldp/hello/there"
    },
    {
      "@id": "http://localhost:3000/ldp/hello/world"
    }
  ]
}
```

Delete the 'hello' container:
```bash
$ curl -s -i -X DELETE http://localhost:3000/ldp/hello
HTTP/1.1 204 No Content
X-Powered-By: Express
Date: Wed, 24 Feb 2021 17:06:57 GMT
Connection: keep-alive
```

Note, all children were removed also:
```bash
$ curl -s -i -X GET http://localhost:3000/ldp/hello/world
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 9
ETag: W/"9-R1yEhnOj95+nePAcK9WnIdTEFwc"
Vary: Accept-Encoding
Date: Wed, 24 Feb 2021 17:07:44 GMT
Connection: keep-alive

Not found
```

## Special features

`ldpjs` provides a few features that are not part of the LDP specification and/or 
unique to this project because of this project's characteristics.

These include but are not limited to:

* [MongoDB Document](docs/features.md#MongoDB Document)
* [MongoDB Search](docs/features.md#MongoDB Search)
* [Content versioning](docs/features.md#Content versioning)
* [JSONLD Profiles](docs/features.md#JSONLD Profiles)

All special features are [here](docs/features.md)

## Developing

(Some) Unit tests are included:

    npm test
