var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');/////////////////////////

/* GET home page. */
router.get('/', (req, res, next) => {

  // La liste de tous les films
  mongoose.model('Movie').find({}, (err, items) => res.render('index', { movies: items }));
});

router.get('/create', (req, res, next) => {
  //Afficher le formulaire de création
  res.render('create');
});
router.post('/create', (req, res, next) => {
  const movie = req.body;

  mongoose.model('Movie').create(movie, (err, item) => {
    if (!err)
      return res.redirect('/');

    console.log(err);
    res.send(err);
  })
});
router.get('/view/:id', (req, res, next) => {
  //Afficher un film
  mongoose.model('Movie').findById(req.params.id, (err, movie) => {
    if (err)
      return res.send(err);

    res.render('view', { movie })
  });
});
router.get('/edit/:id', (req, res, next) => {
  //Modifier un film
  mongoose.model('Movie').findById(req.params.id, (err, movie) => {
    if (err)
      return res.send(err);

    res.render('edit', { movie });
  });
});
router.post('/edit/:id', (req, res, next) => {
  mongoose.model('Movie').findByIdAndUpdate(req.params.id, req.body, (err, movie) => {
    if (err)
      return res.send(err);

    res.redirect('/');
  })
});
router.get('/delete/:id', (req, res, next) => {
  //Supprimer un film
  mongoose.model('Movie').findById(req.params.id, (err, movie) => {
    res.render('delete', { movie });
  });
})
router.post('/delete/:id', (req, res, next) => {
  mongoose.model('Movie').findByIdAndDelete(req.params.id, (err, movie) => {
    if (err)
      return res.send(err);

    res.redirect('/');
  })
})

router.get('/search', (req, res, next) => {
  mongoose.model('Movie').search({
    dis_max: {
      queries: [
        {
          function_score: {
            query: {
              match: {
                'title.ngram': {
                  query: req.query.q,
                  fuzziness: 'AUTO'
                }
              }
            },
            script_score: {
              script: '_score * 0.7'
            }
          }
        },
        {
          match: {
            'title.keyword': {
              'query': req.query.q,
              'operator' : 'and',
              'boost': 5.0,
            }
          }
        }
      ]
    }
  }, (err, items) => {
    if (!err && items) {
      const movies = items.hits.hits.map(item => {
        const movie = item._source;
        movie._id = item._id;
        movie._score = item._score;
        return movie;
      })
      res.render('search', { movies })
    }
  });
});




//ça déconne...
router.get('/fuzzy', (req, res, next) => {
  mongoose.model('Movie').search({
    fuzzy: {
      'title.ngram': {
        value: req.query.q,
        fuzziness: 'AUTO',
        prefix_length: 0,
        max_expansions: 50
      }
    }
  }, (err, items) => res.send(err || items));
});

// router.get('/searchH', (req, res, next) => {
//   mongoose.model('Movie').search({
//     match: {
//       title: req.query.q
//     }
//   }, { hydrate: true }, (err, items) => {
//     if(!err && items)
//     {
//       const movies = items.hits.hits.map(item => {
//         const movie = item._source;
//         movie._id = item._id;
//         return movie;
//       })
//       res.render('search', { movies })
//     }
//   } );
// });

// const maFonction = () => {
//   const promesse = new Promise();
//   codeAsync((donnees) => {
//     promesse.resolve(donnees);
//   }, (err) => promesse.reject(err));
// }

// const maFonction2 = async () => {
//   maFonction().then(data => { return data } ).catch(err => err)
// }

// const maFonction = async () => {
//   const mesDonnees = await codeAsync();
//   return mesDonnees;
// }

module.exports = router;
