var UriUtil = require("../helpers/UriUtil");
var MimeUtil = require("../helpers/MimeUtil");

class Method {
    constructor(config) {
        this._config = config;
        this._db = config._db;
        this._collection = config._collection;
        
        this._uu = new UriUtil(this._db);
        this._mu = new MimeUtil();
        
        this._body = "";
    }
}
module.exports = Method;