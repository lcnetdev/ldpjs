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

}
module.exports = Headers;