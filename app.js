const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {body, validationResult, check, Result} = require('express-validator');
const methodOverride = require('method-override');


const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Pakaian = require('./models/pakaian');
const { findOne, count } = require('./models/pakaian');


const app = express();
const port = 3000;

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(expressLayouts); 
app.use(express.static('public')); 
app.use(express.urlencoded({extended: true}));
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get('/', async(req, res) => {
  var kategori = await Pakaian.find({}, {kategori:1, _id:0});
    var tmp = [];
    for(var i = 0; i < kategori.length; i++){
      tmp.push(kategori[i]['kategori']);
    }
    result = tmp.reduce((total, value) => {
      total[value] = (total[value] || 0) + 1;
      return total;
    }, {});

    res.render('index', {
      title: 'Home',
      layout: 'layouts/main-layout',
      kategori: Object.keys(result),
      data: Object.values(result),
    });
  });


app.get('/about', (req, res) => {
  res.render('about',{
    title:'About',
    layout:'layouts/main-layout'});
  });
//tabel
app.get('/pakaian/:page', (req, res, next) => {
  var perPage = 5
  var page = req.params.page || 1

  Pakaian
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, pakaians) {
      Pakaian.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('pakaian', {
          title: 'Clothes',
          layout: 'layouts/main-layout',
          pakaians: pakaians,
          current: page,
          pages: Math.ceil(count / perPage),
          msg: req.flash('msg'),
        })
      })
    });
});
//form tambah data
  app.get('/pakaian/tambah/:page', (req, res) => {
    res.render('tambahPakaian', {
      title: 'Form Tambah Data Pakaian',
      layout: 'layouts/main-layout',
    });
  });

//simpan data
app.post('/pakaian/:page', [
  body('kode').custom(async (value) => {
    const duplikat = await Pakaian.findOne({kode : value});
    if(duplikat) {
      throw new Error('Kode pakaian sudah terdaftar!');
    }
    return true;
  }),
], (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('tambahPakaian', {
      title: 'Form Tambah Data Pakaian',
      layout: 'layouts/main-layout',
      errors: errors.array(),
    });
  } else {
    Pakaian.insertMany(req.body, (error, Result) => {
      //kirimkan flash message
      req.flash('msg', 'Data berhasil ditambahkan!');
      res.redirect('/pakaian/:page');
    })
  }
});

//detail
app.get('/pakaian/:page/:kode', async (req, res) => {
  const pakaian = await Pakaian.findOne({kode: req.params.kode});

  res.render('detail', {
    title: ' Details',
    layout: 'layouts/main-layout',
    pakaian :pakaian,
  });
});

//hapus
app.delete('/pakaian/:page', (req, res) => {
  Pakaian.deleteOne({kode: req.body.kode}).then((Result) => {
    req.flash('msg', 'Data Pakaian berhasil dihapus!');
    res.redirect('/pakaian/:page')
  });
});

//form ubah data contact
app.get('/pakaian/edit/:page/:kode', async (req, res) => {
  const pakaian = await Pakaian.findOne({ kode: req.params.kode});
  res.render('ubahPakaian', {
    title: 'Form Ubah Data Pakaian',
    layout: 'layouts/main-layout',
    pakaian:pakaian,
  });
});

// ubah data
app.put('/pakaian/:page', [
  body('kode').custom(async (value, {req}) => {
    const duplikat = await Pakaian.findOne({kode: value});
    if( value !== req.body.oldKode && duplikat) {
      throw new Error('kode sudah terdaftar!');
    }
    return true;
  }),
],
(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.render('ubahPakaian', {
      title: 'Form Ubah Data Pakaian',
      layout: 'layouts/main-layout',
      errors: errors.array(),
      pakaian: req.body,
    });
  } else {
    Pakaian.updateOne(
      { _id : req.body._id},
      {
        $set: {
          kode: req.body.kode,
          nama: req.body.nama,
          kategori: req.body.kategori,
          harga: req.body.harga,
          stok: req.body.stok
        },
      }).then((result) => {
        req.flash('msg', 'Data Pakaian berhasil diubah!');
        res.redirect('/pakaian/:page');
    });
  }
});

//filter kategori
app.post('/pakaian/search/:page', function (req, res, next) {
  var perPage = 5
  var page = req.params.page || 1
  var filterKat = req.body.filterKat;

  if (filterKat != '' ) {
    var filterParameter = {
    kategori: filterKat }
    }

  var pakaianFilter = Pakaian.find(filterParameter);
  Pakaian
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, pakaians) {
      Pakaian.count().exec(function (err, count) {
        if (err) return next(err)
        pakaianFilter.exec(function (err, data) {
          if (err) return next(err);
          res.render('pakaian',
            {
              title: 'Clothes',
              layout: 'layouts/main-layout',
              current: page,
              pages: Math.ceil(count / perPage),
              msg: req.flash('msg'),
              pakaians: data
            });
        });
      });
    });
});

app.put('/pakaian/stok/:id', (req, res) => {
  Pakaian.updateOne(
    { _id: req.body._id },
    {
      $set: {
        kode: req.body.kode,
        nama: req.body.nama,
        kategori: req.body.kategori,
        harga: req.body.harga,
        stok: req.body.stok
      },
    }).then((result) => {
    });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});