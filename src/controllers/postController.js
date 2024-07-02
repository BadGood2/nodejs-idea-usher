const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { postSchema } = require('../validation/postValidation');


const getPosts = async (req, res) => {
    try {
        const { sort, page = 1, limit = 10, keyword, tag } = req.query;

        const allowedOptions = ['sort', 'page', 'limit', 'keyword', 'tag'];

        // checking if parameter is allowed or not
        const extraParams = Object.keys(req.query).filter(param => !allowedOptions.includes(param));

        if (extraParams.length > 0) {
            return res.status(400).json({status: false, error: `Additional parameters not allowed: ${extraParams.join(', ')}` });
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
                return res.status(400).json({status: false, error: 'Tag not found' });
            }
        }

        // pass inside query params example: localhost:3000/posts?sort=title:desc
        const sortOption = {};
        if (sort) {
            const parts = sort.split(':');
            sortOption[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

        const posts = await Post.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('tags', 'name');

        res.status(200).json({
            status : true,
            data: posts
        });
    } catch (err) {
        res.status(500).json({status: false, error: err.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { error, value } = postSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    
        if (error) {
            const errors = error.details.map(err => err.message);
            return res.status(400).json({status: false, errors });
        }

        const { title, desc, tags } = req.body;
        const imageBuffer = req?.files?.[0]
        
        if (!imageBuffer) {
            return res.status(400).json({status: false, error: 'MISSING_IMAGE_FILE' });
        }
        const image = imageBuffer.buffer.toString('base64');

        // checking if tags given are present previously in our DB, if not then inserting them
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

        res.status(201).json({
            status : true,
            data: newPost
        });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};


module.exports = {
    getPosts,
    createPost
};
