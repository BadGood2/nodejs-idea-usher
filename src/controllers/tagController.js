const Tag = require('../models/Tag');

const createTag = async (req, res) => {
    try {
        const { name } = req.body;

        const newTag = new Tag({ name });
        await newTag.save();

        res.status(201).json({
            status : true,
            data: newTag
        });
    } catch (err) {
        res.status(500).json({status: false, error: err.message });
    }
};

module.exports = {
    createTag
};
