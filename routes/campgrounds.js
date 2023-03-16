const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');


router.get('/', catchAsync(async (req, res) => {
    console.log('working');
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

router.get('/new', (req, res) => {
    // if(!req.isAuthenticated()) {
    //     req.flash('error', 'You must be signed in');
    //     res.redirect('/login');
    // }
    res.render('campgrounds/new');
});
    
router.post('/', catchAsync(async(req, res) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id',catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground,});
}));

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('error', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}));

module.exports = router;