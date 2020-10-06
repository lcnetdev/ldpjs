class AdminIndexes {
    constructor(config) {
        this._config = config;
        this._db = config._db;
        this._collection = config._collection;
    }
    
    createIndexes(req, res) {
        var indexes = this._config.indexes;
        this._collection.createIndexes(indexes, {})
            .then(results => {
                console.log(results);
                if (results.ok) {
                    res.status(204).send();
                } else {
                    res.status(500).send(results);
                }
            })
            .catch(err => {
                res.status(500).send(err);
                throw err;
            });
    }
    
    deleteIndexes(req, res) {
        this._collection.dropIndexes()
            .then(results => {
                if (results) {
                    res.status(204).send();
                } else {
                    res.status(500).send(results);
                }
            })
            .catch(err => {
                res.status(500).send(err);
                throw err;
            });
    }
    
    showIndexes(req, res) {
        this._collection.indexes()
            .then(results => {
                if (results) {
                    var jsonstr = JSON.stringify(results, null, 2);
                    res.set('Content-Type', 'application/json');
                    res.status(200).send(jsonstr);
                } else {
                    res.status(500).send(results);
                }
            })
            .catch(err => {
                res.status(500).send(err);
                throw err;
            });
    }
    
}
module.exports = AdminIndexes;