var mongoose = require('./bdd');

var requestSchema = mongoose.Schema({
    category: String,
    position: String,
    longitude: Number,
    latitude: Number,
    image: String,
    description: String,
    dateRequest: Date,
    dateFinish: Date,
    statut: String,
    notation: String,
    idAsker: { type: mongoose.Schema.Types.String, ref: 'Users' },
    idHelper: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
})

var requestModel = mongoose.model('Request', requestSchema)

module.exports = requestModel;