const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { postSchema } = require('../validation/postValidation');


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
        const { error, value } = postSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    
        if (error) {
            const errors = error.details.map(err => err.message);
            return res.status(400).json({ errors });
        }

        const { title, desc, tags } = req.body;
        const imageBuffer = req?.files?.[0]
        
        if (!imageBuffer) {
            return res.status(400).json({ error: 'MISSING_IMAGE_FILE' });
        }
        const image = imageBuffer.buffer.toString('base64');

        const regexTags = tags.map(tag => new RegExp(`^${tag}$`, 'i'));
        const existingTags = await Tag.find({ name: { $in: regexTags } });

        const existingTagNames = existingTags.map(tag => tag.name.toLowerCase());
        const newTagNames = tags.filter(tag => !existingTagNames.includes(tag.toLowerCase()));

        let newTags = [];
        if (newTagNames.length > 0) {
            newTags = await Tag.insertMany(newTagNames.map(name => ({ name })));
        }

        const allTags = [...existingTags, ...newTags];

        const newPost = new Post({
            title,
            desc,
            image,
            tags: allTags.map(tag => tag._id.toString())
        });

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
