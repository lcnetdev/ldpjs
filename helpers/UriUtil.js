var uuid = require("uuid");

class UriUtil {
    
    constructor(db) {
        var _db;
        this._db = db;
        var hostbase, uribase, uripath, uri, puburi, docuri, location, 
            containeruri, containerdocuri, containerpath, containerisroot;
    }
    
    getUriInfo(req) {
        var protocol = "http";
        if (req.httpsVersion !== undefined) {
            procotol = "https";
        }
        var host = req.headers["host"];
        var hostname = host;
        var port = "";
        if ( host.indexOf(':') !== -1 ) {
            var hostparts = host.split(':');
            hostname = hostparts[0];
            port = hostparts[1];
        }
        var portStr = "";
        if (protocol == "http" && port != "80") {
            portStr = ":" + port;
        } else if (protocol == "https" && port != "443") {
            portStr = ":" + port;
        }
        this.hostbase = protocol + "://" + hostname + portStr + "/ldp";
    
        this.uribase = "info:lc";
        
        var path = req.path;
        //path = path.replace(/^\/ldp\//, '/');
        path = path.replace(/\/$/, '');
        this.uripath = path;
        
        var uri = '/';
        var docuri = '/root.json';
        if (path != '') {
            uri = path;
            docuri = path + ".json";
        }

        if (req.method == "POST") {
            /*
                POST requests are different.  If the immediate parent doesn't exist, 
                then the request needs to eventually fail.
                So we don't want to find the existing containter.  We need to
                operate on the assumption that the immediate parent is its
                parent.
            */

            containerpath = uri;
            containerdocuri = containerpath +  ".json";
            containeruri = this.uribase + containerpath;
            
            if (!uri.endsWith('/')) {
                uri = uri + "/";
            }
            if (req.headers["slug"] !== undefined) {
                uri = uri + req.headers["slug"];
            } else {
                var newuuid = uuid.v4();
                uri = uri + newuuid
            }
            docuri = uri + ".json";
            
            this.uri = this.uribase + uri;
            this.puburi = this.hostbase + uri;
            this.uripath = uri;
            this.docuri = docuri;
            
        } else {

            this.uri = this.uribase + uri;
            this.puburi = this.hostbase + uri;
            this.docuri = docuri;
        
            var path_parts = this.uripath.split('/');
            //console.log(path_parts);
    
            // Set up defaults, but only PUT needs to know the container.
            var containeruri = this.uribase + "/";
            var containerpath = '/';
            var containerdocuri = '/root.json';
        
            if (req.method == "PUT") {
                //const ok = this._findContainer(path_parts, containeruri);
                for (var i = path_parts.length - 1; i >= 0; i--) {
                    var checkuri = path_parts.slice(0, i).join('/');
                    console.log("checkuri: " + checkuri);
                    if (checkuri == '') { break; }
                    if (containeruri != this.uribase + '/') { break; }
                    var checkdocuri = checkuri + '.json';
                    console.log("Checking: " + checkdocuri)
                    
                    var doc = this._findContainer(checkdocuri);
                    if (doc) {
                        console.log("Found")
                        containerpath = checkuri;
                        containeruri = this.uribase + containerpath;
                        containerdocuri = checkdocuri;
                        break;
                    }
                }
            }
                
                    /*var db = this._db;
                    console.log("Start")
                    var d = await db.collection('resources')
                            .findOne( { docuri: { $exists: true, $eq: checkdocuri } } )
                            / *
                            .toArray(function(err, res) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(res);
                            });
                            * /
                        //})
                    //let x = docs
                        .then(doc => {
                            console.log("Got a doc")
                            if (doc) {
                                console.log("Found")
                                containerpath = checkuri;
                                containeruri = this.uribase + containerpath;
                                containerdocuri = checkdocuri;
                            }
                        })
                        .catch(err => {
                            console.log("This ran");
                            console.log(err);
                            throw err;
                        });
                        console.log("End")
                    
                }
                */

        }
        
        if (containerpath === '/') {
            this.containerisroot = true;
        } else {
            this.containerisroot = false;
        }
        this.containeruri = containeruri;
        this.containerpath = containerpath;
        this.containerdocuri = containerdocuri;
        //console.log(this);
        //process.exit(0);
    }


    async _findContainer(checkuri) {
        const result =  await this._db.collection('resources')
                        .findOne( { docuri: { $exists: true, $eq: checkuri } } )
                            .then(doc => {
                                doc
                            })
                            .catch(err => {
                                []
                            });
        return result;
    }
}

module.exports = UriUtil;