const mongoose = require('mongoose');
const Pakaian = mongoose.model('Pakaian',{
    kode: {
        type: String,
        required: true
    },
    nama: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
        required: true
    },
    harga: {
        type: Number,
        required: true
    },
    stok: {
        type: Number,
        required: true
    }
});

module.exports=Pakaian;
