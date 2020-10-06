'esversion: 8';

const express = require('express');
const app = express();

const ldp = require("./index.js");

/******************************************/

var config = {
    createIndexDoc: function(content) {
        return { good: "yes" };
    }
};

ldp.setConfig(config);

/******************************************/

app.use('/ldp', ldp);

app.listen(3000);
console.log("Listening on port 3000");

module.exports = ldp;