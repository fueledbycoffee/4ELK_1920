var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');



/* GET home page. */
router.get('/', (req, res, next) => {

  // La liste de tous les films()

  // mongoose.model('Type').find(requete, callback) => Permet de requeter mongodb
  // res.render => Faire un rendu en HTML d'une vue en jade (dans le dossiers /view)
  // on peut lui passer un param qu'on récup ensuite au niveau de la vue

  mongoose.model('Movie').find({}, (err, items) => res.render('index', { movies: items }));
});

router.get('/create', (req, res, next) => {
  //Afficher le formulaire de création
  res.render('create');
});

router.post('/create', (req, res, next) => {
  const movie = req.body;

  // Vu qu'un checkbox nous fournit deux valeurs 'on' ou null ici on le transforme en boolean true/false
  movie.seen = movie.seen === 'on';

  movie.tags = movie.tags.split(',');

  mongoose.model('Movie').create(movie, (err, item) => {

    //S'il n'y a pas d'erreur on redirige vers la home
    if (!err)
      return res.redirect('/');


    console.log(err);
    res.send(err);
  })
});
router.get('/view/:id', (req, res, next) => {
  //Afficher un film

  //findById consiste à faire findOne({ _id: <= id =>})
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

  const movie = req.body;

  movie.seen = movie.seen === 'on';

  //permet de mettre à jour un element
  mongoose.model('Movie').findByIdAndUpdate(req.params.id, movie, (err, movie) => {
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
    // dis_max => Permet de faire une union de n requêtes tout en conservant l'element qui à le scole le plus elevé
    dis_max: {
      queries: [
        {
          // permet de tweaker un score en utilisant un script
          function_score: {
            query: {
              // va matcher les termes selon le découpage (whitespace/symbols etc.) défini 
              match: {
                'title.ngram': {
                  query: req.query.q,
                  // permet les fautes de frappes
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
              'operator': 'or',
              'boost': 5.0,
            }
          }
        },
        {
          match: {
            'tags.keyword': {
              'query': req.query.q,
              'operator': 'or',
              'boost': 2.0,
            }
          }
        },
        {
          function_score: {
            query: {
              match: {
                'tags.ngram': {
                  query: req.query.q,
                  // permet les fautes de frappes
                  fuzziness: 'AUTO'
                }
              }
            },
            script_score: {
              script: '_score * 1'
            }
          }
        },
      ]
    }
  }, (err, items) => {
    if (!err && items) {
      // Vu que les resultats sont fournis dans une forme un peu particulière un element qui contient un _id, _source et _score
      // on l'applati
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

router.get('/advsearch', (req, res, next) => {
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

router.get('/seen', (req, res, next) => {

  const match = req.query.q ? {
    match: {
      'title.ngram': {
        query: req.query.q,
        fuzziness: 'AUTO'
      }
    }
    // match_all permet de TOUT matcher
  } : { match_all: {} }

  const request = {
    // une requete de type boolean permet de récuperer les elements qui match les requetes que l'on defini
    // ici : un filter et un must 
    bool: {
      filter: {
        term: { seen: req.query.seen === 'true' }
      },
      must: match
    }
  };

  mongoose.model('Movie').search(request, (err, items) => {
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
