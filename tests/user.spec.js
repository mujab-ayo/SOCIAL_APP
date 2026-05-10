const request = require("supertest");
const app = require("../app");

const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");

const Follow = require("../models/follow.model");

beforeAll(connectTestDB);

afterAll(disconnectTestDB);

afterEach(clearTestDB);

describe("User Routes", () => {
  test("view my posts", async () => {
    const signupRes = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const token = signupRes.body.token;

    const payload = {
      title: "my post",
      content: "my content",
      tags: ["mine"],
    };

    await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const res = await request(app)
      .get("/user/me/posts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.posts).toHaveLength(1);

    expect(res.body.posts[0]).toMatchObject({
      title: payload.title,
      content: payload.content,
    });

    expect(res.body.totalPosts).toBe(1);
  });

  test("filter my posts by state", async () => {
    const signupRes = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const token = signupRes.body.token;

    const createRes = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "published post",
        content: "published content",
        tags: ["published"],
      });

    const postId = createRes.body.newPost._id;

    await request(app)
      .patch(`/posts/${postId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get("/user/me/posts?state=published")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.posts).toHaveLength(1);

    expect(res.body.posts[0].state).toBe("published");
  });

  test("follow user", async () => {
    const firstSignup = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const firstToken = firstSignup.body.token;
    const firstUser = firstSignup.body.newUser;

    const secondSignup = await request(app).post("/signup").send({
      firstName: "Ahmad",
      lastName: "Ali",
      username: "ahmadali",
      email: "ahmad@gmail.com",
      password: "ahmadali",
    });

    const secondUser = secondSignup.body.newUser;

    const res = await request(app)
      .post(`/user/${secondUser.id}/follow`)
      .set("Authorization", `Bearer ${firstToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe(
      `Successfully followed ${secondUser.username}`,
    );

   
  });

  test("get following", async () => {
    const firstSignup = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const firstToken = firstSignup.body.token;

    const secondSignup = await request(app).post("/signup").send({
      firstName: "Ahmad",
      lastName: "Ali",
      username: "ahmadali",
      email: "ahmad@gmail.com",
      password: "ahmadali",
    });

    const secondUser = secondSignup.body.newUser;

    await request(app)
      .post(`/user/${secondUser.id}/follow`)
      .set("Authorization", `Bearer ${firstToken}`);

    const res = await request(app)
      .get("/user/me/following")
      .set("Authorization", `Bearer ${firstToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.count).toBe(1);

    expect(res.body.followingList[0]).toMatchObject({
      username: secondUser.username,
    });
  });

  test("get followers", async () => {
    const firstSignup = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const firstToken = firstSignup.body.token;
    const firstUser = firstSignup.body.newUser;

    const secondSignup = await request(app).post("/signup").send({
      firstName: "Ahmad",
      lastName: "Ali",
      username: "ahmadali",
      email: "ahmad@gmail.com",
      password: "ahmadali",
    });

    const secondToken = secondSignup.body.token;
    const secondUser = secondSignup.body.newUser;

    await request(app)
      .post(`/user/${firstUser.id}/follow`)
      .set("Authorization", `Bearer ${secondToken}`);

    const res = await request(app)
      .get("/user/me/followers")
      .set("Authorization", `Bearer ${firstToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.count).toBe(1);

    expect(res.body.followersList[0]).toMatchObject({
      username: secondUser.username,
    });
  });

  test("unfollow user", async () => {
    const firstSignup = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const firstToken = firstSignup.body.token;
    const firstUser = firstSignup.body.newUser;

    const secondSignup = await request(app).post("/signup").send({
      firstName: "Ahmad",
      lastName: "Ali",
      username: "ahmadali",
      email: "ahmad@gmail.com",
      password: "ahmadali",
    });

    const secondUser = secondSignup.body.newUser;

    await request(app)
      .post(`/user/${secondUser.id}/follow`)
      .set("Authorization", `Bearer ${firstToken}`);

    const res = await request(app)
      .delete(`/user/${secondUser.id}/unfollow`)
      .set("Authorization", `Bearer ${firstToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.message).toBe(
      `Successfully unfollowed ${secondUser.username}`,
    );

    const follow = await Follow.findOne({
      follower: firstUser._id,
      following: secondUser._id,
    });

    expect(follow).toBeNull();
  });
});
