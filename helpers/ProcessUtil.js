const jsonld = require('jsonld');
var Converter = require("./Converter");

class ProcessUtil{
    
    static createDocument(uu, version, index) {
        var doc = {
            'uri': uu.uri,
            'docuri': uu.docuri,
            'created': version.v_created,
            'modified': version.v_created,
            'containedIn': uu.containeruri,
            'index': index,
            'versions': [version]
        }
        return doc;
    }
    
    static async createVersion(config, mime, body) {
        //var create = async function() {

        console.log(mime);
        
        let saveMimetype = ProcessUtil.getSaveMimetype(mime);
        let modificationTime = new Date().toISOString();
        
        var doc = body;
        var version = {};
        if (mime.resourceType == "RDF") {
            if (mime.incoming != "jsonld") {
                var c = new Converter(config);
                var docStr = c.convert(mime.riot, "JSONLD", body);
                doc = JSON.parse(docStr); 
            }
            const compacted = await jsonld.compact(doc, config.context);

            version = {
                v_created: modificationTime,
                mimeType: saveMimetype,
                ldpTypes: ["<http://www.w3.org/ns/ldp#BasicContainer>"],
                content: compacted,
            }
            return version;
        } else {
            // We have a non RDF resource, either XML or JSON
            if (mime.incoming == "json") { 
                doc = JSON.parse(doc); 
            }
            // Consider 4.2.4.1 (note 4.2.4.3)
            // IF ldp:contains present, 5.2.4.1
            version = {
                v_created: modificationTime,
                mimeType: saveMimetype,
                ldpTypes: ["<http://www.w3.org/ns/ldp#NonRDFResource>"],
                content: doc,
            };
            return version;
        }
        
    //}
    //return create;
        
    }
    
    static addDescriptionURI(uu, body, incomingType) {
        if (body === "" || Object.keys(body).length === 0) {
            body = '<' + uu.uri + '> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .';
        } else if (incomingType == "ntriples" || incomingType == "turtle") {
            // Normalize the URI of the incoming description.
            body = body.replace(/<>/g, '<' + uu.uri + '>');
            body = body.replace(/'<' + uu.hostbase + uu.uripath + '>'/g, '<' + uu.uri + '>');
        } else if (incomingType== "rdfxml") {
            // Still need to check xml:base
            body = body.replace(/rdf:about=""/g, 'rdf:about="' + uu.uri + '"');
            // Below line needs to be tested.
            body = body.replace(/'rdf:about="' + uu.hostbase + uu.uripath + '"'/g, 'rdf:about="' + uu.uri + '"');
        } else if (incomingType == "jsonld") {
            // How is this done?
            // Both here are untested.
            body = body.replace(/"@id": ""/g, '"@id": "' + uu.uri + '"');
            body = body.replace(/"@id": "' + uu.hostbase + uu.uripath + '"/g, '"@id": "' + uu.uri + '"');
        }
        return body;
    }
    
    static getSaveMimetype(mime) {
        if (mime.resourceType == "NonRDF") {
            if (mime.incoming == "json") { 
                return "application/json";
            } else {
                return "application/xml";
            }
        }
        return "application/ld+json";
    }
    
    static selfReference(uri, body, incomingType) {
        if (incomingType == "ntriples" || incomingType == "turtle") {
            if ( body.indexOf('<' + uri + '>') !== -1 || body === "") {
                return true;
            }
        } else if (incomingType== "rdfxml") {
            if ( body.indexOf('rdf:about="' + uri + '"') !== -1 ) {
                return true;
            }
        } else if (incomingType == "jsonld") {
            // How is this done?
            return true;
        }
        return false;
    }
    
}
module.exports = ProcessUtil;
    