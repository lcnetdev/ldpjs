// 4.2.8.1
// 5.2.3.13

const Method = require("./method");

class Options extends Method {
    
    constructor(config) {
        super(config);
    }
    
    process(req, res) {
        var commonHeaders = this._headers.getCommonHeaders();
        for (var c in commonHeaders) {
            res.set(c, commonHeaders[c]);
        }
        res.status(200).send();
    }
    
}
module.exports = Options;