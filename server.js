'esversion: 8';

const express = require('express');
const app = express();

const ldp = require("./index.js");

/******************************************/

var config = {
    createIndexDoc: function(version) {
        var index = {};
        
        if (version.content.configType !== undefined) {
            console.log("Found configType");
            // This is a 'config' thing.  A profile, probably.
            index.resourceType = version.content.configType;
            if (version.content.name !== undefined) {
                index.label = version.content.name;
            }
        }
        
        if (version.content.rdf) {
            // We have a verso resource.
            console.log("Found Resource.");
            index.resourceType = "resource";
            if (version.content.profile !== undefined) {
                index.profile = version.content.profile;
            }
            var rdf = JSON.parse(version.content.rdf);
            
        }
        
        console.log("index ran");
        console.log(index);
        return index;
    }
};

ldp.setConfig(config);

/******************************************/

app.use('/ldp', ldp);

app.listen(3000);
console.log("Listening on port 3000");

module.exports = ldp;