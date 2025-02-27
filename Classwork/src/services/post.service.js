"use strict";

const PostRepository = require("../repositories/post.repository");
const UserRepository = require("../repositories/user.repository");
const { postValidate } = require("../validations/post.validate");

class PostService {
  static async createPost(data) {
    try {
      const { error } = postValidate(data);
      if (error) {
        return { status: 400, error: error.details[0].message };
      }
      const authorExists = await UserRepository.findUserById(data.author);
      if (!authorExists) {
        throw new Error("Author not found!");
      }

      const newPost = await PostRepository.create(data);
      if (!newPost) return { status: 500, error: "Failed to create post" };
      return { status: 201, data: newPost };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllPosts(query) {
    try {
      const {
        limit = 50,
        sort = "ctime",
        page = 1,
        title,
        author,
        status,
        isCurrentMonth,
      } = query;

      const filter = {};
      if (title) {
        filter.title = title;
      }
      if (author) {
        filter.author = author;
      }
      if (status) {
        filter.status = status;
      }
      if (isCurrentMonth && filter.author) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        filter.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
      }

      const posts = await PostRepository.findAll({
        limit,
        sort,
        page,
        filter,
        select: ["title", "content", "status"],
      });

      if (!posts || posts.length === 0) {
        return { status: 404, error: "No posts found" };
      }

      return { status: 200, data: posts };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  static async getPostById(postId) {
    try {
      const post = await PostRepository.findById(postId);
      if (!post) return { status: 404, error: "Post not found" };
      return { status: 200, data: post };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  static async updatePost(postId, data) {
    try {
      const updatedPost = await PostRepository.update(postId, data);
      if (!updatedPost) return { status: 404, error: "Post not found" };
      return { status: 200, data: updatedPost };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  static async deletePost(postId) {
    try {
      const deletedPost = await PostRepository.delete(postId);
      if (!deletedPost) return { status: 404, error: "Post not found" };
      return { status: 200, data: { message: "Post deleted successfully" } };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }

  static async countPostsByUser(userId) {
    try {
      const authorExists = await UserRepository.findUserById(userId);
      if (!authorExists) {
        return { status: 404, error: "User not found" };
      }

      const count = await PostRepository.countPostsByUser(userId);
      return { status: 200, data: { count } };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  }
}

module.exports = PostService;
