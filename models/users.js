var mongoose = require('./bdd')

var UserSchema= mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    password: String,
    address: String,
    city: String,
    helpRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request'}],
    helperRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request'}],
    })

var userModel = mongoose.model('Users', UserSchema);

module.exports= userModel;