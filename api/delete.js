const Method = require("./method");

var ContainerUtil = require("../helpers/ContainerUtil");

class Delete extends Method {
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        this._uu.getUriInfo(req);
        console.log(this._uu);

        if (this._uu.uripath == '/' || this._uu.uripath == '') {
            return res.status(200).send("Cannot delete root node.");
        } else {
            
            this._collection.aggregate( [
                { $match: { "docuri": this._uu.docuri } },
                {
                    $graphLookup: {
                        from: "resources",
                        startWith: "$uri",
                        connectFromField: "uri",
                        connectToField: "containedIn",
                        as: "containers"
                    }
                },
                { 
                    $project: {
                        "uri": 1,
                        "containers": "$containers.uri"
                    }
                }
            ]).toArray()
                .then(results => {
                    var uris = [this._uu.uri]
                    var our_resource = results.find(x => x["uri"] === this._uu.uri);
                    if (our_resource !== undefined) {
                        uris = uris.concat(our_resource.containers);
                    }
    
                    this._collection.deleteMany({ uri: { $in: uris }})
                        .then(result => {
                            if (result.deletedCount > 0) {
                                res.status(204).send();
                            } else {
                                res.status(404).send("Not found.");
                            }
                        })
                        .catch(function(err) {
                            console.log(err);
                            res.status(500).send("Server error.");
                        });
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Server error.");
                });
        }
    }
}
module.exports = Delete;