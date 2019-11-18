const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: String,
  release_date: Date,
  runtime: Number,
  summary: String,
  imdb_rating: Number,
  actors: [{ String }]
});

module.exports = mongoose.model('Movie', MovieSchema);