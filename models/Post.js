const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    kode:{
        type: String,
        required : true
    },
    nama: {
        type: String,
        required : true
    },
    harga: {
        type: Number,
        required : true
    },
    stok:{
        type: Number,
        required : true
    }


});

module.exports = mongoose.model('Posts', PostSchema);