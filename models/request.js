const mongoose = require('./bdd');


var requestSchema = mongoose.Schema({
    category:String,
    position:String,
    description:String,
    dateRequest:Date,
    dateFinish: Date,
    statut: String,
    notation:String,
})

var requestModel = mongoose.model('Request', requestSchema)

module.exports = requestModel;