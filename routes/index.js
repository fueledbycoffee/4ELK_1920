var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  // La liste de tous les films

  res.render('index', { title: 'Express' });
});

router.get('/create', (req,res, next) => {
  //Afficher le formulaire de création
  res.render('create');
});
router.post('/create', (req,res, next) => {

});
router.get('/view/:id', (req, res,next) => {
  //Afficher un film

});
router.get('/edit/:id', (req,res, next) => {
  //Modifier un film

});
router.post('/edit/:id', (req,res, next) => {

});
router.get('/delete/:id', (req,res, next)=> {
  //Supprimer un film
})
router.post('/delete/:id', (req,res,next) => {
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
