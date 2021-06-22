const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {body, validationResult, check, Result} = require('express-validator');
const methodOverride = require('method-override');


const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Pakaian = require('./models/pakaian');
const { findOne } = require('./models/pakaian');


const app = express();
const port = 3000;

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(expressLayouts); //Third Party middleware
app.use(express.static('public')); //Built in middleware
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

app.get('/', (req, res) => {
  res.render('index',{
    title:'Home',
   layout:'layouts/main-layout'});
 });

app.get('/about', (req, res) => {
  res.render('about',{
     title:'About',
    layout:'layouts/main-layout'});
  });

  app.get('/pakaian', async (req, res) => {
    const pakaian = await Pakaian.find();
    res.render('pakaian', {
       title:'Pakaian',
      layout:'layouts/main-layout',
      pakaian,
       msg: req.flash('msg'),
});
  });
//form tambah data
  app.get('/pakaian/tambah', (req, res) => {
    res.render('tambahPakaian', {
      title: 'Form Tambah Data Pakaian',
      layout: 'layouts/main-layout',
    });
  });

//simpan data
app.post('/pakaian', [
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
      res.redirect('/pakaian');
    })
  }
});

//detail
app.get('/pakaian/:nama', async (req, res) => {
  const pakaian = await Pakaian.findOne({nama: req.params.nama});

  res.render('detail', {
    title: 'Halaman Detail',
    layout: 'layouts/main-layout',
    pakaian,
  });
});

//hapus
app.delete('/pakaian', (req, res) => {
  Pakaian.deleteOne({kode: req.body.kode}).then((Result) => {
    req.flash('msg', 'Data Pakaian berhasil dihapus!');
    res.redirect('/pakaian')
  });
});

//form ubah data contact
app.get('/pakaian/edit/:nama', async (req, res) => {
  const pakaian = await Pakaian.findOne({ nama: req.params.nama});
  res.render('ubahPakaian', {
    title: 'Form Ubah Data Pakaian',
    layout: 'layouts/main-layout',
    pakaian,
  });
});

// ubah data
app.put('/pakaian', [
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
          harga: req.body.harga,
          stok: req.body.stok
        },
      }).then((result) => {
        //kirimkan flash message
        req.flash('msg', 'Data Pakaian berhasil diubah!');
        res.redirect('/pakaian');
    });
  }
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});