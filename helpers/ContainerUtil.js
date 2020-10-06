var assert = require('assert');

class ContainerUtil {
    
    constructor(db) {
        var _db;
        this._db = db;
    }
    
    containerContents(containeruri) {
        var db = this._db;
        return new Promise(function(resolve,reject){
            db.collection('resources')
                .find( { containedIn: { $exists: true, $eq: containeruri } })
                .project( {uri:1} )
                .toArray(function(err, res) {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
        });
    }

}
module.exports = ContainerUtil;