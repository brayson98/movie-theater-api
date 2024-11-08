const request = require('supertest');
const express = require('express');
const { User, Show } = require('../models/index');
const showRouter = require('../routes/showRouter'); // Adjust this path to where your router is located

const app = express();
app.use(express.json());
app.use('/api/shows', showRouter); // Register the routes under /api/shows

describe('Show Routes', () => {
  let showId;
  let userId;

  // Setup: Create a show and a user for testing
  beforeAll(async () => {
    const user = await User.create({ username: 'testuser', password: 'password' });
    userId = user.id;
    
    const show = await Show.create({
      title: 'Test Show',
      genre: 'Drama',
      rating: 5,
      available: true,
    });
    showId = show.id;
  });

  // Test: GET /api/shows should return a list of shows
  it('should retrieve a list of shows', async () => {
    const response = await request(app).get('/api/shows');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test: GET /api/shows/:id should return a specific show by ID
  it('should retrieve a show by ID', async () => {
    const response = await request(app).get(`/api/shows/${showId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', showId);
    expect(response.body).toHaveProperty('title', 'Test Show');
  });

  // Test: GET /api/shows/:id/users should return users associated with the show
  it('should retrieve users associated with a show by ID', async () => {
    // Associate user with the show
    const show = await Show.findByPk(showId);
    await show.addUser(userId);
    
    const response = await request(app).get(`/api/shows/${showId}/users`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('Users');
    expect(response.body.Users).toContainEqual(
      expect.objectContaining({
        username: 'testuser'
      })
    );
  });

  // Test: PUT /api/shows/:id/available should toggle the show availability
  it('should toggle the availability of a show', async () => {
    const initialResponse = await request(app).get(`/api/shows/${showId}`);
    const initialAvailability = initialResponse.body.available;

    const response = await request(app).put(`/api/shows/${showId}/available`);
    expect(response.status).toBe(200);
    expect(response.body.available).toBe(!initialAvailability);
  });

  // Test: DELETE /api/shows/:id should delete a show
  it('should delete a show by ID', async () => {
    const response = await request(app).delete(`/api/shows/${showId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', showId);

    const deletedShow = await Show.findByPk(showId);
    expect(deletedShow).toBeNull();
  });

  // Test: GET /api/shows/:genre should return shows by genre
  it('should retrieve shows by genre', async () => {
    const response = await request(app).get('/api/shows/Drama');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('genre', 'Drama');
  });

  // Test: GET /api/shows/:genre when no shows found for that genre
  it('should return 404 if no shows found for the genre', async () => {
    const response = await request(app).get('/api/shows/NonExistentGenre');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'No shows found for this genre');
  });

  // Cleanup: Remove test data after all tests
  afterAll(async () => {
    await User.destroy({ where: { id: userId } });
    await Show.destroy({ where: { id: showId } });
  });
});
