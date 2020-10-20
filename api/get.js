const Method = require("./method");

var Converter = require("../helpers/Converter");
var ContainerUtil = require("../helpers/ContainerUtil");

class Get extends Method {
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        this._uu.getUriInfo(req);
        //console.log(this._uu);
    
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
                    } else if (mime.value == "application/activity+json") {
                        
                    } else {
                        // Need to handle:
                        // 4.2.1.4
                        // 4.4.1.2
                        // 5.2.1.4
                        
                        // What happens when you have an Accept value that 
                        // doesn't match the content? 404?
                        
                        var version = doc.versions[doc.versions.length - 1];
                        var content = version.content;
                        if (mime.resourceType == "Unknown") {
                            // This means the accept type was */*.  It depends
                            // on the content.
                            if (version.ldpTypes.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                                mime.resourceType = "NonRDF";
                                mime.value = version.mimeType;
                            } else { 
                                // Let's assume it is an RDFSource.
                                mime.resourceType = "RDF";
                                mime.value = version.mimeType;
                            }
                        } else if (mime.resourceType == "NonRDF" || version.ldpTypes.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                            if (version.mimeType != mime.value) {
                                if ( this._mu.accepts.find(x => x.value === '*/*') !== undefined) {
                                    if (this._mu.mimes[version.mimeType] !== undefined) {
                                        mime = this._mu.mimes[version.mimeType];
                                        mime.value = version.mimeType;
                                    }
                                } else {
                                    return res.status(409).send("Conflict: Cannot render resource as " + mime.value + ".");
                                }
                            }
                        }
                        
                        var commonHeaders = this._headers.getCommonHeaders();
                        if (mime.resourceType == "NonRDF") {
                            var links = ['<http://www.w3.org/ns/ldp#NonRDFSource>;rel="type"'];
                            res.set('Link', links);
                            res.set('Content-Type', mime.value);
                            
                            for (var c in commonHeaders) {
                                if (c != "Accept-post") {
                                    res.set(c, commonHeaders[c].replace('POST,', ''));
                                }
                            }
        
                            // This is a hack to JSONify embedded JSONLD Expanded RDF.
                            // There is a corresponding hack in ProcessUtils that 
                            // stringifies this on the way in.  See not in that file.
                            if (mime.value == "application/json") {
                                if (content.rdf !== undefined) {
                                    try {
                                        content.rdf = JSON.parse(content.rdf);
                                    } catch(e) {
                                        console.log("Tried to parse content.rdf.  It failed.  Maybe not JSON?");
                                    }
                                }
                            }
                            res.status(200).send(content);
                        } else {
                            var preferences = this._headers.getPreferHeaders(req.headers);
                            var config = this._config;
                            var cu = new ContainerUtil(config);
                            cu.containerContents(this._uu.uri)
                                .then(docs => {
                                    var primaryresource;
                                    if (content["@graph"] !== undefined) {
                                        primaryresource = content["@graph"].find(x => x["@id"] === this._uu.uri);
                                    } else { 
                                        if (content["@id"] === undefined) {
                                            content["@id"] = this._uu.uri;
                                        }
                                        primaryresource = content;
                                    }
                                    
                                    /* 
                                        If include MiminalContainer, then no contains triples.
                                        If omit Containment, then no contains triples.
                                        if omit MinimalContainer, then contains triples.
                                    */
                                    var includeContainmentTriples = true;
                                    if (preferences.omit !== undefined) {
                                        if (preferences.omit.indexOf("http://www.w3.org/ns/ldp#PreferContainment") > -1) {
                                            res.set('Preference-applied', "return=representation");
                                            includeContainmentTriples = false;
                                        } else if (preferences.include.indexOf("http://www.w3.org/ns/ldp#PreferMinimalContainer") > -1) {
                                            // If this Prefer header is set, let's acknowledge it.
                                            res.set('Preference-applied', "return=representation");
                                        }
                                    }
                                    if (preferences.include !== undefined) {
                                        if (preferences.include.indexOf("http://www.w3.org/ns/ldp#PreferMinimalContainer") > -1) {
                                            res.set('Preference-applied', "return=representation");
                                            includeContainmentTriples = false;
                                        } else if (preferences.include.indexOf("http://www.w3.org/ns/ldp#PreferContainment") > -1) {
                                            // If this Prefer header is set, let's acknowledge it.
                                            res.set('Preference-applied', "return=representation");
                                        }
                                    }
                                    
                                    if (includeContainmentTriples && docs.length > 0) {
                                        primaryresource["ldp:contains"] = []
                                        for (var d of docs) {
                                            primaryresource["ldp:contains"].push({ "@id": d.uri.replace(this._uu.uribase, this._uu.hostbase) });
                                        }
                                    }
                                    var contentStr = content;
                                    contentStr = JSON.stringify(content, null, 2);

                                    const toreplace = new RegExp(this._uu.uri, 'g')
                                    contentStr = contentStr.replace(toreplace, this._uu.puburi);
                                    var output = "";
                                    
                                    for (var c in commonHeaders) {
                                        res.set(c, commonHeaders[c].replace('application/xml, application/json,', ''));
                                    }
                                    res.set('Vary', "Prefer, Accept, Accept-Encoding");
                                    
                                    var links = ['<http://www.w3.org/ns/ldp#Resource>;rel="type"', '<http://www.w3.org/ns/ldp#Container>;rel="type"', '<http://www.w3.org/ns/ldp#BasicContainer>;rel="type"'];
                                    res.set('Link', links);
                                    if (mime.value == "application/ld+json") {
                                        res.set('Content-Type', mime.value);
                                        res.status(200).send(contentStr);
                                    } else {
                                        async function processOutput() {
                                            var c = new Converter(config);
                                            output = await c.convert('jsonld', mime.riot, contentStr);
                                            res.set('Content-Type', mime.value);
                                            res.status(200).send(output);
                                        }
                                        processOutput();
                                    }
                                })
                                .catch(err => {
                                    return res.status(500).send(err);
                                });   
                        }
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