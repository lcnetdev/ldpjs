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
        this.hostbase = protocol + "://" + hostname + portStr + req.baseUrl;
    
        this.uribase = "info:lc";
        
        var path = req.path;
        //path = path.replace(/^\/ldp\//, '/');
        path = path.replace(/\/$/, '');
        this.uripath = path;
        
        var uri = '/';
        var docuri = '/root.json';
        if (path != '' && path != '/') {
            uri = path;
            docuri = path + ".json";
        }
        
        this.uri = this.uribase + uri;
        this.puburi = this.hostbase + uri;
        this.docuri = docuri;

        // Set up defaults, but only PUT needs to know the container.
        // POST will rewrite the container paths.
        // These will be set for GET and DELETE, but they are not used.
        var containeruri = this.uribase + "/";
        var containerpath = '/';
        var containerdocuri = '/root.json';
            
        if (req.method == "PUT") {
        
            var path_parts = this.uripath.split('/');
            //console.log(path_parts);
            
            var checks = [];
            for (var i = path_parts.length - 1; i >= 0; i--) {
                var checkpath = path_parts.slice(0, i).join('/');
                var checkdocuri = checkpath + '.json';
                var checkuri = this.uribase + checkpath;
                var check = {
                    checkuri: checkuri,
                    checkpath: checkpath,
                    checkdocuri: checkdocuri
                };
                checks.push(check);
            }
            this.checks = checks;

        } else {
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
                if (containerpath == '' || containerpath == '/') {
                    containerpath = '/';
                    containerdocuri = '/root.json';
                }
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
    }
    
    setConfig(config) {
        this._config = config;
    }
    
    async findContainer(callback) {
        await this._findContainer(0, this.checks, function(err, cobj) {
            console.log(cobj);
            this.containerpath = cobj.checkpath;
            this.containeruri = cobj.checkuri;
            this.containerdocuri = cobj.checkdocuri;
            if (this.containerpath === '/') {
                this.containerisroot = true;
            } else {
                this.containerisroot = false;
            }
            callback(err, this);
        }.bind(this));
    }

    async _findContainer(pos, checks, callback) {
        var check = checks[pos];
        var checkdocuri = check.checkdocuri;
        var checkuri = check.checkuri;
        await this._db.collection(this._config.mongodb.collection)
            .findOne( { docuri: { $exists: true, $eq: checkdocuri } } )
            .then(doc => {
                console.log(doc);
                if (doc === null) {
                    console.log("false: " + checkdocuri);
                    pos++;
                    this._findContainer(pos, checks, callback);
                } else {
                    console.log("true: " + checkdocuri);
                    callback(false, check);
                }
            })
            .catch(err => {
                callback(err, {});
            });
    }
    
}

module.exports = UriUtil;