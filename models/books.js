const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const BookSchema = new Schema({
    title: String,
    content: String,
    img: String,
    popularity: { type: Number, default: 0 },
    createdAt: Date,
    author: String,
    description: mongoose.Schema.Types.Mixed,
    comments: Array
});

module.exports = mongoose.model('Book', BookSchema);