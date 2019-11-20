const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: { type: String, es_indexed: true },
  release_date: Date,
  runtime: Number,
  summary: String,
  imdb_rating: Number,
  actors: [{ String }]
});

MovieSchema.plugin(mongoosastic);

const Movie = mongoose.model('Movie', MovieSchema);

const stream = Movie.synchronize();
let count = 0;

stream.on('data', (err, doc) => count++);
stream.on('close', () => console.log(`Indexed ${count} documents`));
stream.on('error', err => console.log(err));

module.exports = Movie;