class LinkUtil{
    
    static checkInteractionModel(currentInteractionModel, mime, res) {
        var check = function(resolve,reject) {
            if (mime.resourceType == "RDF" && !currentInteractionModel.includes("<http://www.w3.org/ns/ldp#BasicContainer>")) {
                reject(res.status(409).send("Conflict: " + currentInteractionModel + " (Request would change interaction model.)"));
            }
            if (mime.resourceType == "NonRDF" && !currentInteractionModel.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")) {
                reject(res.status(409).send("Conflict: " + currentInteractionModel + " (Request would change interaction model.)"));
            }
            resolve(currentInteractionModel);
        };
        return new Promise(check);
    }

    static validateLinks(mu, res) {
        var validate = function(resolve,reject) {

            try { 
                var mime = mu.mimeContentType; 
            if (mime.ContentType !== undefined) {
                reject(res.status(400).send("Bad request: " + mime.ContentType + " (not supported)"));
            }
            
            if (
                mu.links.includes("<http://www.w3.org/ns/ldp#DirectContainer>") ||
                mu.links.includes("<http://www.w3.org/ns/ldp#IndirectContainer>")
            ) {
                reject(res.status(400).send("Bad request: " + mu.links + " (Unsuppported interaction model)"));
            }
        
            if (mime.resourceType == "NonRDF") {
                if (mu.links.length === 0) {
                    mu.links.push("<http://www.w3.org/ns/ldp#NonRDFSource>");
                } else if (
                    mu.links.includes("<http://www.w3.org/ns/ldp#RDFSource>") ||
                    mu.links.includes("<http://www.w3.org/ns/ldp#BasicContainer>")
                    ) { 
                        reject(res.status(409).send("Conflict: " + mu.links + " (Mis-matched interaction model)"));
                }  else if ( !mu.links.includes("<http://www.w3.org/ns/ldp#NonRDFSource>") ) {
                    mu.links.push("<http://www.w3.org/ns/ldp#NonRDFSource>");
                }
            }
    
            if (mime.resourceType == "RDF") {
                if (mu.links.length === 0) {
                    mu.links.push("<http://www.w3.org/ns/ldp#BasicContainer>");
                } else if (
                    mu.links.includes("<http://www.w3.org/ns/ldp#NonRDFSource>")
                    ) { 
                        reject(res.status(409).send("Conflict: " + mu.links + " (Mis-matched interaction model)"));
                }  else if ( !mu.links.includes("<http://www.w3.org/ns/ldp#BasicContainer>") ) {
                    mu.links.push("<http://www.w3.org/ns/ldp#BasicContainer>");
                }
            }
            } catch(e) {
                console.log(e);
            }
            
            resolve(mu);
        };
        return new Promise(validate);
    }
}
module.exports = LinkUtil;