var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');/////////////////////////

/* GET home page. */
router.get('/', (req, res, next) => {

  // La liste de tous les films
  mongoose.model('Movie').find({}, (err, items) => res.render('index', { movies : items }));
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

});
router.get('/edit/:id', (req, res, next) => {
  //Modifier un film

});
router.post('/edit/:id', (req, res, next) => {

});
router.get('/delete/:id', (req, res, next) => {
  //Supprimer un film
})
router.post('/delete/:id', (req, res, next) => {
})



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
