const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true
    },
    phone:{
        type:String
    },
    age:{
        type:Number
    },
    password:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, {
    timestamps:true
});

userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);