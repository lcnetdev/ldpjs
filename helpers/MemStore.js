'esversion: 8';
const N3 = require('n3');
const jsonld = require('jsonld');

class MemStore{
    
    constructor() {
        var store;
        var quads;
    }
    
    async getNtriples(quads) {
        var n3quads = quads.map(MemStore.toN3Quad);
        const writer = new N3.Writer({ format: 'N-Triples' });
        return writer.quadsToString(n3quads);
    }
    
    ntriplesToStore(ntriples) {
        // To try:  new N3.Parser({ blankNodePrefix: '' });
        var parser = new N3.Parser();
        this.quads = parser.parse(ntriples);
        this.store = new N3.Store();
        this.store.addQuads(this.quads);
    }
    
    quadsForJSONLDJS() {
        var jsonldquads = this.quads.map(MemStore.toJsonldQuad);
        /*
        this.quads.forEach( function(q) {
            console.log("this ran");
            jsonldquads.push(MemStore.toJsonldQuad(q));
        });
        */
        return jsonldquads;
    }
    
    getQuads() {
        this.store.getQuads(null, null, null, null);
    }
    
    static toN3Quad (quad) {
        return {
          subject: MemStore.toN3Term(quad.subject),
          predicate: MemStore.toN3Term(quad.predicate),
          object: MemStore.toN3Term(quad.object),
          graph: MemStore.toN3Term(quad.graph)
        }
    }

  static toN3Term (term) {
    if (term.termType === 'BlankNode') {
      return {
        termType: 'BlankNode',
        value: term.value.replace('_:', '')
      }
    }
    return term
  }
    
    static toJsonldQuad (quad) {
        return {
          subject: MemStore.toJsonldTerm(quad.subject),
          predicate: MemStore.toJsonldTerm(quad.predicate),
          object: MemStore.toJsonldTerm(quad.object),
          graph: MemStore.toJsonldTerm(quad.graph)
        }
    }

  static toJsonldTerm (term) {
    if (term.termType === 'BlankNode') {
      return {
        termType: 'BlankNode',
        value: `_:${term.value}`
      }
    }
    return term
  }
}

module.exports = MemStore;