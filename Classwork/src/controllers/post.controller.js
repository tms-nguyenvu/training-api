"use strict";

const PostService = require("../services/post.service");

class PostController {
  async createPost(req, res) {
    const result = await PostService.createPost(req.body);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }

  async getAllPosts(req, res) {
    const result = await PostService.getAllPosts(req.query);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }

  async getPostById(req, res) {
    const result = await PostService.getPostById(req.params.id);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }

  async updatePost(req, res) {
    const result = await PostService.updatePost(req.params.id, req.body);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }

  async deletePost(req, res) {
    const result = await PostService.deletePost(req.params.id);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }

  async counterPostsByUser(req, res) {
    const result = await PostService.countPostsByUser(req.params.userId);
    res
      .status(result.status)
      .json(result.error ? { error: result.error } : result.data);
  }
}

module.exports = new PostController();
