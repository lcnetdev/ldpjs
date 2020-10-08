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
        if (typeof this._body === "object") {
            this._body = JSON.stringify(this._body);
        }
        this._uu.getUriInfo(req);
        //console.log(this._uu);
    
        this._mu.getMimeInfo(req);
        //console.log(this._mu);
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
                    if (currentInteractionModel.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                        res.status(409).send("Conflict: " + mu.links + " (Mis-matched interaction model)");
                    }

                    // The above will reject the request if the found document - the 
                    // container - is a NonRDFSource.  That's right; we don't want to 
                    // search NonRDFSources.
                    var mime = this._mu.mimeContentType;
                    //console.log(mime);
                    if (mime.value == "application/x-mongoquery+json") {
                        // This is no longer a write operation, but a query.  
                        // Since we know the container exists, let's get going.
                        //var config = this._config;
                        
                        // Just going to reassign the body.
                        this._body = req.body;
                        this._body = [
                            { $match: {"resource.modified": {"$gte": new Date("2020-10-08T14:45:00.000Z")} } },
                            { $sort : {"resource.modified": -1 } }
                        ];
                        this._body = [
                            { $match: {"resource.index.catalogerid": "jjud"} },
                            { $sort : {"resource.modified": -1 } }
                        ]
                        var cu = new ContainerUtil(this._config);
                        cu.queryContainer(this._uu.containeruri, this._body)
                            .then(docs => {
                                
                                var results = [];
                                
                                const toreplace = new RegExp(this._uu.uribase, 'g')
                                for (var d of docs) {
                                    var version = d.versions[d.versions.length - 1];
                                    var content = version.content;
                                    if (version.mimeType === "application/ld+json") {
                                        var contentStr = JSON.stringify(content, null, 2);
                                        contentStr = contentStr.replace(toreplace, this._uu.hostbase);
                                        content = JSON.parse(contentStr);
                                    }
                                    var hit = {
                                        modified: version.v_created,
                                        mimeType: version.mimeType,
                                        data: content
                                    }
                                    results.push(hit);
                                }
                                
                                var response = {
                                    totalHits: results.length,
                                    query: this._body,
                                    results: results,
                                }
                                
                                res.set('Content-Type', "application/json");
                                res.status(200).send(response);
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).send("Server error.");
                            });
                    } else {
                    
                        // Otherwise, if the container exists, the post creates a *new* container.
                        // No updating allowed.
                        LinkUtil.validateLinks(this._mu, res)
                            .then(data => {
                                this._mu = data;
                    
                                //if (this._mu.links.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                                //    res.status(409).send("Conflict: " + this._mu.links + " (Cannot POST NonRDFSource)");
                                //}
          
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
                        }
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
        try {
            var index = await this._config.createIndexDoc(version);
        } catch(e) {
            console.log(e);
            res.status(500).send("Server error: Index conversion error (createIndexDoc).");
        }
        var doc = ProcessUtil.createDocument(this._uu, version, index);
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