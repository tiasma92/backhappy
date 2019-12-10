var mongoose=require('./bdd')

var UserSchema= mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    email: String,
    password: String,
    address: String,
    helpRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'requestSchema'}],
    })

var userModel = mongoose.model('Users', UserSchema);

module.exports= userModel;