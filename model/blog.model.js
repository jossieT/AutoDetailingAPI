const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        en: { type: String, trim: true }, // English title
        am: { type: String, trim: true }, // Amharic title
    },
    content: {
        en: { type: String }, // English content
        am: { type: String }, // Amharic content
    },
    image: { type: String }, // Add image field for Cloudinary URL
    author: { type: String, default: 'Swift Addis' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

blogSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;