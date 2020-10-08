var assert = require('assert');

class ContainerUtil {
    
    constructor(config) {
        this._collectionName = config.mongodb.collection;
        this._db = config._db;
        this._collection = config._collection;
    }
    
    containerContents(containeruri) {
        var db = this._db;
        var collection = this._collection;
        return new Promise(function(resolve,reject){
            collection
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
    
    queryContainer(containeruri, queryParams) {
        var db = this._db;
        var collection = this._collection;
        var collectionName = this._collectionName
        return new Promise(function(resolve,reject){
            collection
                .aggregate( [
                    { $match: { "uri": containeruri } },
                    {
                        $graphLookup: {
                            from: collectionName,
                            startWith: "$uri",
                            connectFromField: "uri",
                            connectToField: "containedIn",
                            as: "resource"
                        }
                    },
                    { $unwind: "$resource" },
                    ...queryParams,
                    { $replaceRoot: { "newRoot": "$resource" } }
                    
                ]).toArray(function(err, res) {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
        });
    }

}
module.exports = ContainerUtil;