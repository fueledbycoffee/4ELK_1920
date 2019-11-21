const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;

let MovieSchema = new Schema({
    title: {
        type: String,
        es_indexed: true,
        es_fields: {
            ngram: { type: 'text', analyzer: 'ngram_analyzer', index: 'analyzed' },
            keyword: { type: 'text', analyzer: 'keyword_analyzer', index: 'analyzed' }
        }
    },
    release_date: { type: Date, es_indexed: true },
    imdb_rating: { type: Number, es_type: 'float', es_indexed: true },
    runtime: { type: Number, es_indexed: true },
    summary: {
        type: String,
        es_indexed: true,
    },
    seen: { type: Boolean, default: false, es_indexed: true },
    tags: [{
        type: String,
        es_indexed: true,
        es_fields: {
            ngram: { type: 'text', analyzer: 'ngram_analyzer', index: 'analyzed' },
            keyword: { type: 'text', analyzer: 'keyword_analyzer', index: 'analyzed' }
        }
    }],
});
MovieSchema.plugin(mongoosastic);

const Movie = mongoose.model('Movie', MovieSchema);

// createMapping permet de définir un mapping custom de nos données au sein d'ElasticSearch
Movie.createMapping({
    //le tout se mets dans un block analysis
    analysis: {
        // on définit un filtre (voir ça au sens filtre instagram qui modifie les donénes plutôt qu'un filtre qui retire des choses)
        // on crée un filtre nGram (cf. cours)
        // on précise que l'on souhaite conserver lettres, chiffres, symboles et ponctuation
        filter: {
            ngram_filter: {
                type: 'nGram',
                min_gram: 3,
                max_gram: 10,
                token_chars: [
                    'letter', 'digit', 'symbol', 'punctuation'
                ]
            }
        },
        // ensuite dans le bloc analyzer on définir les differents "blocs" qui vont indexer nos données selon les regles que l'on a défini
        // ici on en a deux ngram_analyzer et keyword_analyzer
        analyzer: {
            // l'analyzer nGram va être de type custom et on lui passe les filtres à utiliser
            ngram_analyzer: {
                type: 'custom',
                tokenizer: 'whitespace',
                filter: [
                    'lowercase',
                    'asciifolding',
                    'ngram_filter'
                ]
            },
            // celui ci est standard, nous ajoutons juste un asciifolding pour ignorer les accents
            keyword_analyzer: {
                tokenizer: 'standard',
                filter: [
                    'lowercase',
                    'asciifolding'
                ]
            }
        }
    }
}, (err, mapping) => {
    if (err)
        return console.log(err);

    console.log(mapping);
});

// on synchronise les données depuis MongoDb dans ES
const stream = Movie.synchronize();
let count = 0;

stream.on('data', (err, doc) => count++);
stream.on('close', () => console.log(`Indexed ${count} documents`));
stream.on('error', (err) => console.log(err));

module.exports = Movie;