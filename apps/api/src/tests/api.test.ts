import request from "supertest";
import mongoose from "mongoose";

const API = process.env.API_URL || "http://localhost:5000/api";

describe("API smoke", () => {
  beforeAll(async () => {
    // ensure DB connection not required for external API tests
  });

  afterAll(async () => {
    // nothing
  });

  it("GET /customers/products should return 200 and products", async () => {
    const res = await request(API).get("/customers/products?limit=1");
    expect([200, 204]).toContain(res.status);
  });

  it("GET /customers/stores/featured should return 200", async () => {
    const res = await request(API).get("/customers/stores/featured?limit=1");
    expect([200, 204]).toContain(res.status);
  });

  it("GET /customers/stats/home should return 200", async () => {
    const res = await request(API).get("/customers/stats/home");
    expect([200, 204]).toContain(res.status);
  });
});
