// backend/models/User.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Ім'я користувача є обов'язковим"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Пароль є обов`язковим'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['medic', 'doctor', 'admin'],
        default: 'medic'
    }
}, { timestamps: true });

// Хешуємо пароль ПЕРЕД збереженням
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Метод для порівняння паролів
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Переконайтесь, що тут немає нічого зайвого
module.exports = mongoose.model('User', UserSchema);

console.log('--- Defining and exporting User model ---');
const UserModel = mongoose.model('User', UserSchema);
console.log('Is UserModel a constructor?', typeof UserModel === 'function'); // Має бути true
module.exports = UserModel;