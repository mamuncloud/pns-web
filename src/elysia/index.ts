import { Elysia } from "elysia";
import { db } from "../db";
import { sql } from "drizzle-orm";

const app = new Elysia({ prefix: "/api" })
  .get("/", () => ({ message: "Welcome to PNS API (Elysia Edition)" }))
  .get("/health", async () => {
    try {
      const startTime = Date.now();
      // Simple query to check DB connection
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - startTime;
      
      return {
        status: "healthy",
        database: "connected",
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        status: "unhealthy",
        database: "disconnected",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  })
  .group("/products", (app) =>
    app
      .get("/", async () => {
        return await db.query.products.findMany({
          with: {
            variants: true,
          },
        });
      })
      .get("/:id", async ({ params: { id }, set }) => {
        const product = await db.query.products.findFirst({
          where: (products, { eq }) => eq(products.id, id),
          with: {
            variants: true,
          },
        });
        if (!product) {
          set.status = 404;
          return { message: "Product not found" };
        }
        return product;
      })
  );

export type App = typeof app;
export default app;
