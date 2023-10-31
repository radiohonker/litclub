const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    login: String,
    pass: mongoose.Schema.Types.Mixed,
    favbooks: [{ type: Schema.Types.ObjectId, ref: 'book' }],
    recentRead: [{ type: Schema.Types.ObjectId, ref: 'book' }],
    myBooks: [{ type: Schema.Types.ObjectId, ref: 'book' }],
    bookmark: [{ type: Schema.Types.Mixed }],
    showbookmark: String
});

module.exports = mongoose.model('Account', AccountSchema);