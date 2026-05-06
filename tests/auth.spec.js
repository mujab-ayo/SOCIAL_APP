const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");
const User = require("../models/user.model");
const { not } = require("supertest/lib/cookies");

describe("Auth Routes", () => {
  beforeAll(connectTestDB);
  afterAll(disconnectTestDB);
  afterEach(clearTestDB);

  test("POST /signup returns a token and persists a hashed password", async () => {
    const payload = {
      firstName: "Jane",
      lastName: "Doe",
      username: "janedoe",
      email: "jane@example.com",
      password: "password123",
    };

    const res = await request(app).post("/signup").send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.newUser).toMatchObject({
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    expect(res.body.newUser).not.toHaveProperty("password");

    const savedUser = await User.findOne({ email: payload.email }).lean();

    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe(payload.password);
    expect(savedUser.password).toMatch(/^\$2[aby]\$/);
  });

  test("POST /login returns a token and persists a hashed password", async () => {
    const payload = {
      firstName: "Jane",
      lastName: "Doe",
      username: "janedoe",
      email: "jane@example.com",
      password: "password123",
    };

    await request(app).post("/signup").send(payload);

    const res = await request(app)
      .post("/login")
      .send({ email: payload.email, password: payload.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
      
      expect(res.body.user).not.toHaveProperty("password")
  });
    
    
     test("POST /login returns the current error response for invalid credentials", async () => {
       await request(app).post("/signup").send({
         firstName: "Mary",
         lastName: "Doe",
         username: "marydoe",
         email: "mary@example.com",
         password: "password123",
       });

       const res = await request(app)
         .post("/login")
         .send({ email: "mary@example.com", password: "wrongpass" });

       expect(res.statusCode).toBe(400);
       expect(res.body).toEqual({
         "error": "Incorrect password.",
       });
     });
});
