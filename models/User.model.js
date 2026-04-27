const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { 
        type: String,
        required: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
       return   
    }

    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        
    } catch (err) {
       throw err;
    }
});

userSchema.methods.comparePassword = async function (inputedPassword) {
    return await bcrypt.compare(inputedPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);