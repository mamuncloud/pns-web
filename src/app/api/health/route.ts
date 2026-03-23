import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Attempt to query the database
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      latency: `${latency}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
