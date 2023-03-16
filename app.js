require('dotenv').config()

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
// const {campgroundSchema, reviewSchema} = require('./schemas.js');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoDBStore = require('connect-mongo');


const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');



// const dbUrl =  "mongodb+srv://mongosh:EA0DP7Ma5NogrWmy@cluster0.8deagh3.mongodb.net/?retryWrites=true&w=majority";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/Camp";
mongoose.connect(dbUrl, {useNewUrlParser: true,  useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error'));
db.once('open', () => {
    console.log('Database Connected');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));  
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret: "thisistopsecret",
    touchAfter: 24 * 60 * 60,
  });

store.on("error", function(e) {
    console.log("Session Store Error");
})

const sessionConfig =  {
    secret:'thishowbeabettersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

// app.use(session({
//     secret: 'my-secret-key',
//     resave: false,
//     saveUninitialized: false
//   }));

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//how to store and unstore it in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// const validateCampground = (req, res, next) => {
//     const error = campgroundSchema.validate(req.body);
//     if(error) {
//         const msg = error.details.map(el => el.message).join(',')
//         //.join to make single string message
//         throw new ExpressError(msg, 400);
//     } else{
//         next();
//     }
// }
// const validateReview = (req, res, next) => {
//     const {error} = reviewSchema.validate(req.body);
//     if(error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     }
//     else {
//         next();
//     }
// }

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email: 'dhiraj@gmail.com', username: 'manvi'});
//     const newUser = await User.register(user, 'Dhiraj@22');
//     res.send(newUser);
// });

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});
    
app.use((err, req, res, next) => {
    const {statusCode = 400} = err;
    if(err.status !== 400) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
});

const port = process.env.PORT || 3003

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});