//5.2.3.1
//  5.2.3.2 will happen, but does not need to update container?

const Method = require("./method");

var ContainerUtil = require("../helpers/ContainerUtil");
var LinkUtil = require("../helpers/LinkUtil");
var ProcessUtil = require("../helpers/ProcessUtil");

class Post extends Method {
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        
        this._body = req.body;
        this._uu.getUriInfo(req);
        console.log(this._uu);
    
        this._mu.getMimeInfo(req);
        // res.status(200).send(this._mu);

        /*
            This is a POST request.  POST requests can only be made 
            to LDPCs.  The path of this request is the container, allegedly.
            It therefore 1) needs to exist and 2) it needs to be a container, 
            which is to say it should not be a NonRDFSouce.
        */
        
        this._collection.findOne( { docuri: { $exists: true, $eq: this._uu.containerdocuri } } )
            .then(doc => {
                if (doc) {
                    let currentInteractionModel = doc.versions[doc.versions.length - 1].ldpTypes;
                    if (currentInteractionModel.includes("<http://www.w3.org/ns/ldp#NonRDFResource>")) {
                        res.status(409).send("Conflict: " + mu.links + " (Mis-matched interaction model)");
                    }

                    // Otherwise, if the container exists, the post creates a *new* container.
                    // No updating allowed.
                    LinkUtil.validateLinks(this._mu, res)
                        .then(data => {
                            this._mu = data;
                
                            if (this._mu.links.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                                res.status(409).send("Conflict: " + mu.links + " (Cannot POST NonRDFSource)");
                            }
          
                            var mime = this._mu.mimeContentType; 
                            var selfReference = false;
                            this._body = ProcessUtil.addDescriptionURI(this._uu, this._body, mime.incoming);
                            selfReference = ProcessUtil.selfReference(this._uu.uri, this._body, mime.incoming);
                            if (mime["resourceType"] == "RDF" && !selfReference) {
                                res.status(400).send("No Local URI.");
                            }

                            this._collection.findOne( { docuri: { $exists: true, $eq: this._uu.docuri } } )
                                .then(doc => {
                                    if (!doc) {
                                        this._process(res, this._body);
                                    } else {
                                        res.status(409).send("Container exists.");
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Server error.");
                                });
                        })
                        .catch(http_response => {
                            http_response;
                        });
                    
                } else {
                    res.status(404).send("Not found: " + this._uu.containerpath + " (Target Container doesn't exist.)");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Server error.");
            });
    }
    
    async _process(res, body) {
        var mime = this._mu.mimeContentType;
    
        try {
            var version = await ProcessUtil.createVersion(this._config, mime, body);
        } catch(e) {
            console.log(e);
            res.status(500).send("Server error: RDF conversion error.  Malformed RDF?");
        }
        var doc = ProcessUtil.createDocument(this._uu, version);
                                            
        this._collection.insertOne(doc, {})
            .then(result => {
                var location = this._uu.hostbase + this._uu.uripath;
                res.set('Location', location);
                res.set('Content-Type', 'text/plain');
                res.status(201).send(location);
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Server error.");
            });
    }

}
module.exports = Post;