`ldpjs` Configuring
----------------

The following are details about the `ldpjs` configuration object.

Contents
-----------------

* [mongodb](#mongodb)
* [converters](#converters)
* [context](#context)
* [indexes](#indexes)
* [Creating an index document](#creating-an-index-document)

----------------

### mongodb

```javascript
var ldpconfig = {
    mongodb: {
        conn: "mongodb://localhost:27017",
        db: "ldp",
        collection: "resources"
    }
}
```

The above represents the default values.  You can pass in a custom 'mongodb' object
with values specific to your environment or project.

### converters

```javascript
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
}
```

These objects MUST be included in the `ldpjs` configuration object as they will
be specific to every user.  'riot' is the only converter supported presently.  It 
is used for serialization to/from various RDF flavors, such as to/from RDF/XML.  The 
use of an external converter is unfortunate.  There is a note at the the top of
the [converter code](../helpers/Converter.js) explaining why.  Any assistance 
that makes serialization transformations sane would be appreciated.

### context

```javascript
var ldpconfig = {
    context: {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "ldp": "http://www.w3.org/ns/ldp#",
        "dcterms": "http://purl.org/dc/terms/",
        "bf": "http://id.loc.gov/ontologies/bibframe/",
        "bflc": "http://id.loc.gov/ontologies/bflc/",
        "madsrdf": "http://www.loc.gov/mads/rdf/v1#",
        "void": "http://rdfs.org/ns/void#",
        "foaf": "http://xmlns.com/foaf/0.1/",
    }
}
```

The above represents the default JSONLD context used by `ldpjs`.  If your data
uses other namespaces, then the additional namespaces should be passed in via the 'context'
object.  The code will add the additional namespace to the above.

NB: if you get an error when initially PUTting or POSTing RDF that references 
a malformed JSON property, it may indicate that the namespace is not accounted for 
in the configuration and therefore is not being replaced with a prefix.


### indexes

```javascript
var ldpconfig = {
    indexes: [
        { key: { uri: 1 } },
        { key: { docuri: 1 } },
        { key: { created: -1 } },
        { key: { modified: -1 } },
        { key: { containedIn: 1 } },
    ]
}
```

While this is a configurable option, it is advised to leave this alone for now.  
These reflect indexes that will be created in MongoDB.  The default values - seen
above - are used to make the system function, which is the primary reason to leave 
these alone for now.  There is no attempt to merge additional indexes on top of
the default values.  Therefore, at this time, any additional indexes desired must also 
include these default ones.


### Creating an index document

```javascript
var createIndexDoc = function(version) {
    return {};
};

var ldpconfig = {
    createIndexDoc: createIndexDoc,
}
```

'createIndexDoc' is a function.  It takes the current 'version' of the LDP 
content and produces an 'index' document, which is then embedded in the larger 
MongoDB document.  Basically, it provides a way to create an abstraction of 
the 'content' for special indexing and querying.  An example of how this works
in the wild is here:  https://github.com/lcnetdev/recto/blob/main/server.js#L58-L83

