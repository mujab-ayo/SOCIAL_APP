const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");
const User = require("../models/user.model");

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
    
    return res.body.token
};

const createPost = async (token) => {
    const post = await request(app)
      .post("/posts/create")
      .send({
        title: "work",
        content: "work work work",
        tags: ["work", "work", "work"],
      });
    
    return post
}

describe("Post Routes", () => {
    test("create post", async () => {
        const token = await createAndRegisterToken();
        
        const res = await createPost(token)

        
    })


  test("view posts (available for public)", async () => {

    const res = await request(app)
      .get("/view/posts")
    

    expect(res.statusCode).toBe(200);
  });
    
 
    
   
});
