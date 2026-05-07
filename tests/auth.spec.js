const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./database");
const User = require("../models/user.model");

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
afterEach(clearTestDB);

describe("Signup Auth Routes", () => {
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

    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should fail if email is already registered", async () => {
    await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const res = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam2",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail if username is already taken", async () => {
    await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    });

    const res = await request(app).post("/signup").send({
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam2@gmail.com",
      password: "sadamsad",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should fail if password is less than 6 characters", async () => {
    const res = await request(app).post("/signup").send({
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      email: "test@test.com",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("Login Auth Routes", () => {
  it("should login successfully and return a token", async () => {
    const payload = {
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    };

    await request(app).post("/signup").send(payload);

    const res = await request(app).post("/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
  });

  it("should fail with wrong password", async () => {
    const payload = {
      firstName: "Sadam",
      lastName: "Hussein",
      username: "sirdam",
      email: "sadam@gmail.com",
      password: "sadamsad",
    };

    await request(app).post("/signup").send(payload);

    const res = await request(app).post("/login").send({
      email: payload.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Incorrect password or username" });
  });
});
