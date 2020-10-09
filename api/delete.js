const Method = require("./method");

class Delete extends Method {
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        this._uu.getUriInfo(req);
        //console.log(this._uu);

        if (this._uu.uripath == '/' || this._uu.uripath == '') {
            return res.status(200).send("Cannot delete root node.");
        } else {
            
            const containerUriRegex = new RegExp('^' + this._uu.uri);
            this._collection.aggregate( [
                { $match: { "containedIn" : { $regex : containerUriRegex, $options: 'i' } } },
                { 
                    $project: {
                        "uri": 1,
                    }
                }
            ]).toArray()
                .then(results => {
                    var uris = [this._uu.uri];
                    results.forEach(function(r) {
                        uris.push(r.uri);
                    })
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