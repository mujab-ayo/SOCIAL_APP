
const request = require("supertest");

const app = require("../app");

const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");

beforeAll(connectTestDB);

afterAll(disconnectTestDB);

afterEach(clearTestDB);

describe("Feed Routes", () => {
  test("get feed posts", async () => {
   
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
      .post(`/user/${secondUser.id}/follow`)
      .set("Authorization", `Bearer ${firstToken}`);

    await request(app)
      .post(`/user/${firstUser.id}/follow`)
      .set("Authorization", `Bearer ${secondToken}`);

    const firstPost = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({
        title: "First Post",
        content: "First Content",
        tags: ["first"],
      });

    await request(app)
      .patch(`/posts/${firstPost.body.newPost._id}/publish`)
      .set("Authorization", `Bearer ${firstToken}`);

    const secondPost = await request(app)
      .post("/posts/create")
      .set("Authorization", `Bearer ${secondToken}`)
      .send({
        title: "Second Post",
        content: "Second Content",
        tags: ["second"],
      });

    await request(app)
      .patch(`/posts/${secondPost.body.newPost._id}/publish`)
      .set("Authorization", `Bearer ${secondToken}`);

    const res = await request(app)
      .get("/feed")
      .set("Authorization", `Bearer ${firstToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.body.feedPost).toHaveLength(2);

    expect(res.body.totalPosts).toBe(2);

    expect(res.body.feedPost[0]).toHaveProperty("title");

    expect(res.body.feedPost[0]).toHaveProperty("content");

    expect(res.body.feedPost[0]).toHaveProperty("author");

    expect(res.body.feedPost[0].author).toHaveProperty("username");
  });
});