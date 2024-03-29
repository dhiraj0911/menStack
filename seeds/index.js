const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelper')

mongoose.connect('mongodb://localhost:27017/Camp', {useNewUrlParser: true,  useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error'));
db.once('open', () => {
    console.log('Database Connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+ 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/158642',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis quidem ea voluptatibus? Nesciunt ea officia, quibusdam quaerat tempore quae quam dignissimos consequuntur repellendus! Temporibus omnis dolorem natus eius modi voluptas',
            price
        })
        await camp.save();
    }
}

seedDB().then(()=> {
    mongoose.connection.close();
})