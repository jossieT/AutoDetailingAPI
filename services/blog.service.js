const Blog = require('../model/blog.model');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const createBlog = async (blogData) => {
    const blog = new Blog(blogData);
    return await blog.save();
};

const getAllBlogs = async () => {
    return await Blog.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 }); // Latest blogs first
};

const getBlogById = async (id) => {
    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    return blog;
};

const updateBlogById = async (id, updateData) => {
    const blog = await Blog.findById(id);
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }

    // Update only provided fields while preserving existing translations
    if (updateData.title) {
        blog.title = {
            ...blog.title,
            ...(updateData.title.en && { en: updateData.title.en }),
            ...(updateData.title.am && { am: updateData.title.am }),
        };
    }

    if (updateData.content) {
        blog.content = {
            ...blog.content,
            ...(updateData.content.en && { en: updateData.content.en }),
            ...(updateData.content.am && { am: updateData.content.am }),
        };
    }

    if (updateData.image) {
        blog.image = updateData.image;
    }

    return await blog.save();
};

const deleteBlogById = async (id) => {
    const blog = await Blog.findById(id);
    if (!blog) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    return await blog.deleteOne({ _id: id });
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};