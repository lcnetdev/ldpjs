/*
    Do I want to do what I am doing below?  No.
    Do I need to?  Evidently yes.
    THe state of dealing with transforms between different RDF serializations in NodeJS is 
    so broken by callback hell, minor differences in backend quads, and lacking documentation
    that after trying for days to do this the "right" way or the "node" way, I'm just giving
    up.  It is entirely possible that I'm just dumb and a shitty coder and that 
    the state of RDF in Javascript is just a wonderful, lovely experience and I'm
    too dense to do it.  On the upside, there's just plain old stupid simplicity.
    
    On the other hand, it is bound to be slower.  It may be possible to speed it up
    by using the nodejs Java module.  Pity SaxonJS doesn't support xquery.
*/
'esversion: 8';
var uuid = require("uuid");
const fs = require('fs');
const { execSync } = require('child_process');

class Converter{
    
    constructor(config) {
        this.useConverter = config.useConverter;
        if (config.useConverter == "riot") {
            this.TD = config.converters.riot.TD;
            this.JAVA_HOME = config.converters.riot.JAVA_HOME;
            this.JENA_HOME = config.converters.riot.JENA_HOME;
            this.JENA_RIOT = config.converters.riot.JENA_RIOT;
        }
    }
    
    convert(from, to, data) {
        if (this.useConverter == "riot") {
            return this.riot(from, to, data);
        }
    }
    
    riot(from, to, data) {
        var tempuuid = uuid.v4();
        var ext = from.toLowerCase();
        if (ext == "rdfxml") {
            ext = "rdf";
        }
        var tmpFile = this.TD + tempuuid + "." + ext;

        fs.writeFileSync(tmpFile, data);
        var result = execSync(this.JENA_RIOT + " --formatted=" + to + " "+ tmpFile , {env: {'MSYS_NO_PATHCONV': 1, 'JENA_HOME': this.JENA_HOME, 'JAVA_HOME': this.JAVA_HOME, 'TMPDIR': this.TD}});
        fs.unlinkSync(tmpFile);
        
        return result;
    }
    
}
module.exports = Converter;
    