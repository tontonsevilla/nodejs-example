const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dishesInfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;