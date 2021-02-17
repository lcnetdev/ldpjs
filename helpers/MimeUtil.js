'esversion: 8';

class MimeUtil{
    constructor() {
        var contentType = "";
        var mimeContentType = "";
        
        var accept = "";
        var accepts = [];
        var mimeAccept = {};
        
        var mimes = {};
        this.mimes = {
            "NotPresent": {
                "Accept": "No Accept Header",
                "ContentType": "No Content-type Header"
            },
            "Error": {
                "Accept": "No valid accept type found.",
                "ContentType": "Invalid Content-type."
            },
            "application/n-triples": {
                "incoming": "ntriples",
                "rdflib": "application/nquads",
                "riot": "NTRIPLES",
                "resourceType": "RDF",
            },
            "text/plain": {
                "incoming": "ntriples",
                "rdflib": "application/nquads",
                "riot": "NTRIPLES",
                "resourceType": "RDF",
            },
            "application/rdf+xml": {
                "incoming": "rdfxml",
                "rdflib": "application/rdf+xml",
                "riot": "RDFXML",
                "resourceType": "RDF",
            },
            "application/n3": {
                "incoming": "turtle",
                "rdflib": "text/n3",
                "riot": "TURTLE",
                "resourceType": "RDF",
            },
            "text/n3": {
                "incoming": "turtle",
                "rdflib": "text/n3",
                "riot": "TURTLE",
                "resourceType": "RDF",
            },
            "text/turtle": {
                "incoming": "turtle",
                "rdflib": "text/turtle",
                "riot": "TURTLE",
                "resourceType": "RDF",
            },
            "application/ld+json": {
                "incoming": "jsonld",
                "rdflib": "application/ld+json",
                "riot": "JSONLD",
                "resourceType": "RDF",
            },
            "application/xml": {
                "incoming": "xml",
                "resourceType": "NonRDF",
            },
            "application/json": {
                "incoming": "json",
                "resourceType": "NonRDF",
            },
            "application/x-mongodoc+json": {
                "incoming": "json",
                "resourceType": "NonRDF",
            },
            "application/x-mongoquery+json": {
                "value": "application/x-mongoquery+json",
                "incoming": "json",
                "resourceType": "NonRDF",
            },
            "*/*": {
                "resourceType": "Unknown",
            },
        };
        
        var links;
    }
    
    getAccept(acceptHeader) {
        var acceptParts = acceptHeader.split(',');
        
        var a = "";
        var accept = "";
        var accepts = []
        if (acceptParts.length === 1) {
            a = this._getMimetype(acceptParts[0]);
            var profile = "";
            if (acceptParts[0].indexOf(";") !== -1) {
                var ap_parts = acceptParts[0].split(';');
                for (var app of ap_parts) {
                    app = app.trim();
                    if ( app.indexOf("profile=") !== -1 ) {
                        profile = app.replace("profile=", "").replace(/"/g, '');
                    }
                }
            }
            accepts.push({ value: a, qvalue: 1, profile: profile });
        } else {
            for (var ap of acceptParts) {
                var a = this._getMimetype(ap);
                
                var qvalue = 1;
                var profile = "";
                if (ap.indexOf(";") !== -1) {
                    var ap_parts = ap.split(';');
                    for (var app of ap_parts) {
                        app = app.trim();
                        if ( app.indexOf("q=") !== -1 ) {
                            qvalue = parseFloat(app.replace("q=", ""));
                        } else if ( app.indexOf("profile=") !== -1 ) {
                            profile = app.replace("profile=", "").replace('"', '');
                        }
                    }
                }
                accepts.push({ value: a, qvalue: qvalue, profile: profile });
            }
            accepts.sort((a, b) => (a.qvalue > b.qvalue) ? -1 : 1);
        }
        this.accepts = accepts;
        this.mimeAccept = this.mimes["Error"];
        for (var ac of accepts) {
            if (this.mimes[ac.value] !== undefined) {
                var newmime = {
                    ...ac,
                    ...this.mimes[ac.value]
                };
                this.accept = ac;
                this.mimeAccept = newmime;
                break;
            }
        }
    }
    
    getMimeInfo(req) {
        if (req.headers['content-type'] !== undefined && this.mimes[req.headers['content-type']] === undefined) {
            this.contentType = "Invalid mimetype.";
            this.mimeContentType = this.mimes["Error"];
        } else if (req.headers['content-type'] !== undefined) {

            this.contentType = req.headers['content-type'];
            this.mimeContentType = this.mimes[this.contentType];
        } else {
            if ( (req.method == "PUT" || req.method == "POST") && (req.body === "" || Object.keys(req.body).length === 0)) {
                this.mimeContentType = this.mimes["text/plain"];
            } else {
                this.mimeContentType = this.mimes["NotPresent"];
            }
        }
        
        // Must ever request have an accept header?  If not, this will
        // need to be adjusted.
        if (req.headers['accept'] !== undefined) {
            this.getAccept(req.headers['accept']);
        } else {
            this.mimeAccept = this.mimes["NotPresent"];
        }
        
        if (req.headers['link'] !== undefined) {
            this.getLinks(req.headers['link']);
        } else {
            this.getLinks('');
        }
        //console.log(this);
    }
    
    getLinks(linkHeader) {
        var foundlinks = []

        var linkParts = linkHeader.split(',');
        for (var lp of linkParts) {
            if (lp.indexOf(";") !== -1) {
                var typestr = lp.split(';')[1];
                typestr = typestr.trim();
                if ( typestr.indexOf('rel="type"') !== -1 ) {
                    var typevalue = lp.split(';')[0];
                    typevalue = typevalue.trim();
                    foundlinks.push(typevalue)
                }
            }
        }
        this.links = foundlinks;
    }
    
    _getMimetype(apart) {
        var a = apart;
        if (apart.indexOf(";") !== -1) {
            a = apart.substr(0, apart.indexOf(';'));
        }
        a = a.trim();
        // Can 'a' ever be empty?
        if ( a == "" ) {
            // This is not a violation:  4.3.2.2
            a = "application/ld+json";
        }
        return a;
    }
    
}
module.exports = MimeUtil;
    