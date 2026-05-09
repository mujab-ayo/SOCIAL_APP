

const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");

const User = require("../models/user.model");
const Post = require("../models/post.model");
const Like = require("../models/like.model");

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
afterEach(clearTestDB);

const createAndRegisterToken = async () => {
  const res = await request(app).post("/signup").send({
    firstName: "Sadam",
    lastName: "Hussein",
    username: "sirdam",
    email: "sadam@gmail.com",
    password: "sadamsad",
  });

  return res.body.token;
};

describe("Post Routes", () => {
  test("create post", async () => {
    const payload = {
      title: "work",
      content: "work work work",
      tags: ["work", "work", "work"],
    };

    const token = await createAndRegisterToken();

    const res = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);

    expect(res.body.message).toEqual("post created successfully");

    expect(res.body.newPost).toMatchObject({
      title: payload.title,
      tags: payload.tags,
      content: payload.content,
    });

    expect(res.body.newPost._id).toEqual(expect.any(String));

    const savedPost = await Post.findById(res.body.newPost._id).lean();

    expect(savedPost).not.toBeNull();
    expect(savedPost.title).toBe(payload.title);
    expect(savedPost.state).toBe("draft");
  });

  test("view posts (available for public)", async () => {
    const payload = {
      title: "work",
      content: "work work work",
      tags: ["work", "work", "work"],
    };

    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const postId = createRes.body.newPost._id;

    await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get("/view/posts");

    expect(res.statusCode).toBe(200);

    expect(res.text).toContain(payload.title);
    expect(res.text).toContain(payload.content);
  });

  test("view single published post", async () => {
    const payload = {
      title: "single post",
      content: "single content",
      tags: ["node"],
    };

    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const postId = createRes.body.newPost._id;

    await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get(`/view/post/${postId}`);

    expect(res.statusCode).toBe(200);

    expect(res.text).toContain(payload.title);
    expect(res.text).toContain(payload.content);
  });

  test("publish post", async () => {
    const payload = {
      title: "publish test",
      content: "publish content",
      tags: ["test"],
    };

    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const postId = createRes.body.newPost._id;

    const res = await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.state).toBe("published");

    const updatedPost = await Post.findById(postId).lean();

    expect(updatedPost.state).toBe("published");
  });

  test("edit post", async () => {
    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "old title",
        content: "old content",
        tags: ["old"],
      });

    const postId = createRes.body.newPost._id;

    const res = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "new title",
        content: "new content",
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.makePost.title).toBe("new title");
    expect(res.body.makePost.content).toBe("new content");

    const updatedPost = await Post.findById(postId).lean();

    expect(updatedPost.title).toBe("new title");
  });

  test("delete post", async () => {
    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "delete me",
        content: "delete content",
        tags: ["delete"],
      });

    const postId = createRes.body.newPost._id;

    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe("post deleted successfully");

    const deletedPost = await Post.findById(postId);

    expect(deletedPost).toBeNull();
  });

  test("like post", async () => {
    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "like test",
        content: "like content",
        tags: ["like"],
      });

    const postId = createRes.body.newPost._id;

    await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);

    expect(res.body.message).toBe("post liked successfully");

    expect(res.body.like_count).toBe(1);

    const like = await Like.findOne({ post: postId });

    expect(like).not.toBeNull();
  });

  test("unlike post", async () => {
    const token = await createAndRegisterToken();

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "unlike test",
        content: "unlike content",
        tags: ["unlike"],
      });

    const postId = createRes.body.newPost._id;

    await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .post(`/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe("post unliked successfully");

    expect(res.body.like_count).toBe(0);

    const like = await Like.findOne({ post: postId });

    expect(like).toBeNull();
  });
});