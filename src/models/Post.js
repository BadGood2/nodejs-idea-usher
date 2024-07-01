const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    image: {
        type: String, // base64 encoded image
        required: true,
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }]
});

module.exports = mongoose.model('Post', postSchema);
