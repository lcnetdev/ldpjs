const Method = require("./method");

var Converter = require("../helpers/Converter");
var ContainerUtil = require("../helpers/ContainerUtil");

class Get extends Method {
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        this._uu.getUriInfo(req);
        console.log(this._uu);
    
        this._mu.getMimeInfo(req);
        //console.log(this._mu);
    
        var mime = this._mu.mimeAccept; 
        if (mime.Accept !== undefined) {
            return res.status(400).send("Bad request: " + this._mu.mimeAccept.Accept);
        }
    
        this._collection.findOne( { docuri: { $exists: true, $eq: this._uu.docuri } } )
            .then(doc => {
                if (doc) {
                    if (mime.value == "application/x-mongodoc+json") {
                        var jsonstr = JSON.stringify(doc, null, 2);
                        res.set('Content-Type', 'application/json');
                        res.status(200).send(jsonstr);
                    } else {
                        // Need to handle:
                        // 4.2.1.4
                        // 4.4.1.2
                        // 5.2.1.4
                        
                        var config = this._config;
                        var cu = new ContainerUtil(this._db);
                        cu.containerContents(this._uu.uri)
                            .then(docs => {
                                var content = doc.versions[doc.versions.length - 1].content;
                                var primaryresource;
                                if (content["@graph"] !== undefined) {
                                    primaryresource = content["@graph"].find(x => x["@id"] === this._uu.uri);
                                } else { 
                                    if (content["@id"] === undefined) {
                                        content["@id"] = this._uu.uri;
                                    }
                                    primaryresource = content;
                                }

                                if (docs.length > 0) {
                                    primaryresource["ldp:contains"] = []
                                    for (var d of docs) {
                                        primaryresource["ldp:contains"].push({ "@id": d.uri.replace(this._uu.uribase, this._uu.hostbase) });
                                    }
                                }
                                var contentStr = content;

                                if (mime.value != "application/xml") { 
                                    contentStr = JSON.stringify(content, null, 2);
                                }
                                const toreplace = new RegExp(this._uu.uri, 'g')
                                contentStr = contentStr.replace(toreplace, this._uu.puburi);
                                var output = "";

                                var links = ['<http://www.w3.org/ns/ldp#Resource>;rel="type"', '<http://www.w3.org/ns/ldp#Container>;rel="type"', '<http://www.w3.org/ns/ldp#BasicContainer>;rel="type"'];
                                if (mime.resourceType == "NonRDF") {
                                    links = ['<http://www.w3.org/ns/ldp#NonRDFSource>;rel="type"'];
                                }
                                res.set('Link', links);
                                if (mime.value == "application/ld+json" || mime.value == "application/xml") {
                                    res.set('Content-Type', mime.value);
                                    res.status(200).send(contentStr);
                                } else {
                                    async function processOutput() {
                                        if (mime.resourceType == "RDF") {
                                            var c = new Converter(config);
                                            output = await c.convert('jsonld', mime.riot, contentStr);
                                            res.set('Content-Type', mime.value);
                                            res.status(200).send(output);
                                        }
                                    }
                                    processOutput();
                                }
                            })
                            .catch(err => {
                                return res.status(500).send(err);
                            });
                    }
                } else {
                    res.status(404).send("Not found");
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Server error.");
            });
        }
    }
module.exports = Get;