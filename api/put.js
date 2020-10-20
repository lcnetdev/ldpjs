const Method = require("./method");

var LinkUtil = require("../helpers/LinkUtil");
var ProcessUtil = require("../helpers/ProcessUtil");

class Put extends Method {
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
        
        this.preferences = this._headers.getPreferHeaders(req.headers);
        
        LinkUtil.validateLinks(this._mu, res)
            .then(data => {
                this._mu = data;
                var mime = this._mu.mimeContentType; 
                var selfReference = false;
                this._body = ProcessUtil.addDescriptionURI(this._uu, this._body, mime.incoming);
                selfReference = ProcessUtil.selfReference(this._uu.uri, this._body, mime.incoming);
                if (mime["resourceType"] == "RDF" && !selfReference) {
                    res.status(400).send("No Local URI.");
                }
                this._process(res, this._body);
            })
            .catch(http_response => {
                http_response;
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
        var uu = this._uu;
        this._collection.findOne( { docuri: { $exists: true, $eq: this._uu.docuri } } )
            .then(doc => {
                if (doc) {
                    let currentInteractionModel = doc.versions[doc.versions.length - 1].ldpTypes;
                    LinkUtil.checkInteractionModel(currentInteractionModel, mime, res)
                        .then(data => {
                            let modificationTime = new Date().toISOString();
                            var updateObj = 
                                { 
                                    $set: { modified: version.v_created, index: index },
                                    $push: { versions: version }
                                };
                            if (!this.preferences.version) {
                                res.set('Preference-applied', "version=0");
                                doc.versions[doc.versions.length - 1] = version;
                                updateObj = {
                                    $set: { 
                                        modified: version.v_created, 
                                        index: index,
                                        versions: doc.versions
                                    },
                                };
                            }
                            this._collection.updateOne(
                                { _id: doc._id },
                                updateObj
                            )
                            .then(function(result) {
                                res.status(204).send();
                            })
                            .catch(function (err) {
                                console.log(err);
                                res.status(500).send("Server error.");
                            });    
                        })
                        .catch(http_response => {
                            console.log(http_response);
                            http_response;
                        });
                } else {
                    var newdoc = ProcessUtil.createDocument(uu, version, index);
                    this._collection.insertOne(newdoc, {})
                        .then(function(result) {
                            var location = uu.hostbase + uu.uripath;
                            res.set('Location', location);
                            res.set('Content-Type', 'text/plain');
                            res.status(201).send(location);
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.status(500).send("Server error.");
                        });
                }
            })
            .catch(function(err) {
                console.log(err);
                res.status(500).send("Server error.");
            });
        }
}
module.exports = Put;