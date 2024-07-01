const Post = require('../models/Post');
const Tag = require('../models/Tag');

const getPosts = async (req, res) => {
    try {
        const { sort, page, limit, keyword, tag } = req.query;

        const allowedOptions = ['sort', 'page', 'limit', 'keyword', 'tag'];

        const extraParams = Object.keys(req.query).filter(param => !allowedOptions.includes(param));

        if (extraParams.length > 0) {
            return res.status(400).json({ error: `Additional parameters not allowed: ${extraParams.join(', ')}` });
        }
        
        const query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { desc: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (tag) {
            const tagDoc = await Tag.findOne({ name: tag });
            if (tagDoc) {
                query.tags = tagDoc._id;
            } else {
                return res.status(400).json({ error: 'Tag not found' });
            }
        }

        const posts = await Post.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('tags');

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, desc, image, tags } = req.body;

        const existingTags = await Tag.find({ name: { $in: tags } });

        const existingTagNames = existingTags.map(tag => tag.name);

        const newTagNames = tags.filter(tag => !existingTagNames.includes(tag));

        let newTags = [];
        if (newTagNames.length > 0) {
            newTags = await Tag.insertMany(newTagNames.map(name => ({ name })));
        }

        const allTags = [...existingTags, ...newTags];

        const newPost = new Post({
            title,
            desc,
            image,
            tags: allTags.map(tag => tag._id)
        });
t
        await newPost.save();

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    getPosts,
    createPost
};
