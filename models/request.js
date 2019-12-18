const mongoose = require('./bdd');


var requestSchema = mongoose.Schema({
    category:String,
    position: String,
    longitude: Number,
    latitude: Number,
    image: String,
    description:String,
    dateRequest:Date,
    dateFinish: Date,
    statut: String,
    notation:String,
})

var requestModel = mongoose.model('Request', requestSchema)

module.exports = requestModel;