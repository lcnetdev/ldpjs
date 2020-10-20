class Headers{
    
    constructor() {
        this.commonHeaders = {
            "Accept-post": 'application/n-triples, text/plain, application/rdf+xml, application/n3, text/n3, text/turtle, application/ld+json, application/xml, application/json, application/x-mongoquery+json',
            "Allow": 'GET,POST,PUT,DELETE,OPTIONS'
        };
    }
    
    getCommonHeaders() {
        return this.commonHeaders;
    }
    
    getPreferHeaders(reqHeaders) {
        var preferences = {};
        preferences.version = true;
        if (reqHeaders["prefer"] !== undefined) {
            var preferParts = reqHeaders["prefer"].split(',');
            for (var pp of preferParts) {
                if (pp.indexOf("return=representation;") !== -1) {
                    if (pp.indexOf("omit=") !== -1) {
                        var ppParts = pp.split("omit=");
                        preferences.omit = ppParts[ppParts.length - 1];
                    }
                    if (pp.indexOf("include=") !== -1) {
                        ppParts = pp.split("include=");
                        preferences.include = ppParts[ppParts.length - 1];
                    }
                }
                if (pp.indexOf("version=0") !== -1) {
                    preferences.version = false;
                }
            }
        }
        return preferences;
    }

}
module.exports = Headers;