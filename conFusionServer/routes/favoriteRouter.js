const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({ userInfo: req.user._id })
    .populate('userInfo')
    .populate('dishesInfo')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userInfo: req.user._id})
    .then((favorite) => {
        
        if (favorite == null) {

            Favorites.create({userInfo: req.user._id, dishesInfo: req.body})
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('userInfo')
                .populate('dishesInfo')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });            
            }, (err) => next(err));

        } else {
            let currentFavorites = Array.from(favorite.dishesInfo);

            if (req.body._id !== undefined) {
                currentFavorites.some(currentFavorite => {
                    var same = req.body._id == currentFavorite._id;
                    
                    if (!same) {
                        favorite.dishesInfo.push(req.body);
                    }

                    return same;
                });
            } else if (req.body.length !== undefined) {
                console.log("Array of Favorites was passed.");

                if (currentFavorites.length > 0) {
                    currentFavorites.forEach(currentFavorite => {
                        req.body.some(newFavorite => {
                            var same = currentFavorite._id == newFavorite._id;
                            
                            if (!same) {
                                favorite.dishesInfo.push(newFavorite);
                            }
    
                            return same;
                        })
                    });
                } else {
                    req.body.forEach(newFavorite => {
                        favorite.dishesInfo.push(newFavorite._id);
                    });
                }
            }

            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('userInfo')
                .populate('dishesInfo')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });            
            }, (err) => next(err));
        }

    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({userInfo: req.user._id})
    .then((resp) => {
        Favorites.findOne({ userInfo: req.user._id })
        .populate("userInfo")
        .populate("dishesInfo")
        .then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        });
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({userInfo: req.user._id})
    .populate("userInfo")
    .populate({
        "path":"dishesInfo",
        "match": { "_id": { "$eq": req.params.dishId } }
    })
    .then((favorite) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);

    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userInfo: req.user._id})
    .then((favorite) => {
        
        if (favorite == null) {

            Favorites.create({userInfo: req.user._id, dishesInfo: req.params.dishId})
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('userInfo')
                .populate('dishesInfo')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });            
            }, (err) => next(err));

        } else {
            let currentFavorites = Array.from(favorite.dishesInfo);

            currentFavorites.some(currentFavorite => {
                var same = req.params.dishId == currentFavorite._id;
                
                if (!same) {
                    favorite.dishesInfo.push(req.params.dishId);
                }

                return same;
            });

            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('userInfo')
                .populate('dishesInfo')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });            
            }, (err) => next(err));
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.update(
        { userInfo: req.user._id },
        { $pull: { dishesInfo: req.params.dishId } }
    ).then((favorite) => {
        Favorites.findOne({ userInfo: req.user._id })
        .populate('userInfo')
        .populate('dishesInfo')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;