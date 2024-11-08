const request = require("supertest");
const { db, User, Show } = require("./models/index"); // Assuming models are exported from this location
const app = require("./src/app"); // Assuming your Express app is exported from here

beforeAll(async () => {
  // Syncing the database before tests start (optional: you can use a test-specific database)
  await db.sync({ force: true });
  
  // Create sample data to test with
  await User.create({ id: 1, username: "john_doe", password: "password123" });
  await Show.create({ id: 1, title: "Action Movie", genre: "Action", rating: 5, available: true });
});

afterAll(async () => {
  // Clean up after tests
  await db.close();
});

describe("User Routes", () => {
  // Test for fetching all users
  it("should fetch all users", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1); // As we created one user
    expect(response.body[0].username).toBe("john_doe");
  });

  // Test for fetching a single user by ID
  it("should fetch user by ID", async () => {
    const response = await request(app).get("/users/1");
    expect(response.status).toBe(200);
    expect(response.body.username).toBe("john_doe");
  });

  // Test for fetching shows associated with a user
  it("should fetch shows of a user", async () => {
    await User.findByPk(1).then(async (user) => {
      await user.addShow(1); // Adding a show to the user
    });

    const response = await request(app).get("/users/1/shows");
    expect(response.status).toBe(200);
    expect(response.body.shows).toHaveLength(1); // Should return the shows associated with the user
    expect(response.body.shows[0].title).toBe("Action Movie");
  });

  // Test for updating user and adding a show
  it("should associate a show with a user", async () => {
    const response = await request(app)
      .put("/users/1/shows/1")
      .send({}); // Sending empty body as the params are sufficient
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User 1 is now associated with show 1");
  });

  // Test for adding a show to a user with invalid user ID
  it("should return 404 for invalid user ID in PUT /users/:userId/shows/:showId", async () => {
    const response = await request(app)
      .put("/users/999/shows/1")
      .send({});
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });

  // Test for adding a show to a user with invalid show ID
  it("should return 404 for invalid show ID in PUT /users/:userId/shows/:showId", async () => {
    const response = await request(app)
      .put("/users/1/shows/999")
      .send({});
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Show not found");
  });

  // Test for handling error when fetching shows of a user (no shows associated)
  it("should return 404 if user has no shows", async () => {
    const response = await request(app).get("/users/2/shows");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });

  // Test for handling error when fetching a user that does not exist
  it("should return 404 if user not found", async () => {
    const response = await request(app).get("/users/999");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "User not found");
  });

  // Test for handling internal server error
  it("should return 500 on server error", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "invalid_token"); // Simulate server error
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("An error whilst fetching Users");
  });
});
