'user strict';

const { Router } = require('express');
const restaurantRouter = new Router();
const ZOMATO_API_KEY = process.env.ZOMATO_API_KEY;

const routeGuard = require('./../middleware/route-guard.js');

const Restaurant = require('./../models/restaurant');
const Zomato = require('zomato.js');
const zomato = new Zomato(ZOMATO_API_KEY);

restaurantRouter.get('/', (req, res) => {
  const ownerId = req.user._id;
  Restaurant.find({ owner: ownerId })
    .then((restaurants) => res.render('restaurant/index', { restaurants }))
    .catch((error) => next(error));
});

//create by zomato ID
restaurantRouter.get('/createByZomatoId', (req, res) => {
  res.render('restaurant/createByZomatoId');
});

restaurantRouter.post('/createByZomatoId', routeGuard, (req, res, next) => {
  const ownerId = req.user;
  const zomatoRestaurantId = req.body.zomatoId;
  zomato
    .restaurant({ res_id: zomatoRestaurantId })
    .then((restaurantData) => {
      return Restaurant.create({
        name: restaurantData.name,
        location: {
          latitude: restaurantData.location.latitude,
          longitude: restaurantData.location.longitude
        },
        cuisineType: restaurantData.cuisines,
        averagePrice: restaurantData.average_cost_for_two,
        contact: restaurantData.phone_numbers.split(' ').join(''),
        owner: ownerId
      }).then((restaurant) => {
        console.log(restaurant);
        res.render('restaurant/index', { restaurant });
      });
    })
    .catch((error) => next(error));
});

//manually
restaurantRouter.get('/create', (req, res) => {
  res.render('restaurant/create');
});

restaurantRouter.post('/create', (req, res, next) => {
  const ownerId = req.user;
  const { name, description, latitute, longitude, cuisineType, contact } = req.body;
  Restaurant.create({
    name,
    description,
    latitute,
    longitude,
    cuisineType,
    contact,
    owner: ownerId
  })
    .then((restaurant) => res.render('restaurant/index', { restaurant }))
    .catch((error) => next(error));
});

// List all restaurants
restaurantRouter.get('/list', (req, res, next) => {
  Restaurant.find()
    .then((restaurants) => {
      res.render('restaurant/list', { restaurants });
    })
    .catch((error) => next(error));
});

// View single restaurant
restaurantRouter.get('/:restaurantId', (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  Restaurant.findById(restaurantId)
    .then((restaurant) => res.render('restaurant/single', { restaurant }))
    .catch((error) => next(error));
});

// Create menu for single restaurant
restaurantRouter.post('/:restaurantId/menu', (req, res, next) => {
  const ownerId = req.user;
  const { name, description, latitute, longitude, cuisineType, contact, menuExists } = req.body;
  Restaurant.create({
    name,
    description,
    latitute,
    longitude,
    cuisineType,
    contact,
    menuExists,
    owner: ownerId
  })
    .then((restaurant) => res.render('restaurant/index', { restaurant }))
    .catch((error) => next(error));
});

module.exports = restaurantRouter;
