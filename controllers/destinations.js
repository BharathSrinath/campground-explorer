const Destination = require('../models/destination');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); 
// We are passing the token to the Geocoding. Now the geocoder will have acces to methods called forwardGeocode and reverseGeocode.
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

module.exports.index = async (req, res) => {
    const searchTerm = req.query.q ? req.query.q.toLowerCase() : '';
    const allDestinations = await Destination.find({});
    const filteredDestinations = searchTerm 
        ? allDestinations.filter(destination =>
            destination.title?.toLowerCase().includes(searchTerm)
        ) 
        : allDestinations;
    res.render('destinations/index', {
        destinations: filteredDestinations,
        searchTerm 
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render('destinations/new');
}

module.exports.createDestination = async (req, res, next) => {
    const destination = new Destination(req.body.destination);
    destination.geometry = req.body.destination.geometry;
    destination.location = req.body.destination.location;
    destination.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    destination.author = req.user._id;
    await destination.save();
    req.flash('success', 'Successfully made a new destination!');
    res.redirect(`/destinations/${destination._id}`);
}

// GeoJSON
// It has properties such as Type, Coordinates, Geometries, Features, Feature Collection, CRS (Coordinate Reference System)
// GeoJSON Object:
    // Type
    // Coordinates
    // Geometries:
    //     Point - Represents a single geographic point with specific coordinates. (We are using this)
    //     LineString
    //     Polygon
    //     MultiPoint
    //     MultiLineString
    //     MultiPolygon
    //     GeometryCollection
    // Features:
    //     Geometry:
    //         Type
    //         Coordinates
    //     Properties
// In our GeoJSON object we are accessing only geometry object which has type and Coordinates property  

module.exports.showDestination = async (req, res,) => {
    const destination = await Destination.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    const lastUpdated = destination.updatedAt;
    if (!destination) {
        req.flash('error', 'Cannot find that destination!');
        return res.redirect('/destinations');
    }
    res.render('destinations/show', { destination, lastUpdated, dayjs });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findById(id)
    if (!destination) {
        req.flash('error', 'Cannot find that destination!');
        return res.redirect('/destinations');
    }
    res.render('destinations/editForm', { destination });
}

module.exports.updateDestination = async (req, res) => {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, { ...req.body.destination });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    destination.images.push(...imgs);
    await destination.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // This piece of code will remove the image from cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        // This piece of code will remove the image from MongoDB
        await destination.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated destination!');
    res.redirect(`/destinations/${destination._id}`)
}

module.exports.deleteDestination = async (req, res) => {
    const { id } = req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted destination')
    res.redirect('/destinations');
}