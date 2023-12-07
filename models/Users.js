const mongoose=require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema(
    {
       
        username: { type: String, required: true,minlengh:2 },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: false },
        image: { type: String, required: false },
        Admin:{type:Boolean,default:false}

    },
    {
        timestamps: true
        //creat date 
    }
);
 const Usersmodel =mongoose.model("OurUsers", UserSchema);
 
module.exports = Usersmodel;