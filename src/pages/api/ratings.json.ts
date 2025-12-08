import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "ratings.json");

interface RatingStats {
  sum: number;
  count: number;
}

type RatingsFile = Record<string, RatingStats>;

async function readRatings(): Promise<RatingsFile> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content) as RatingsFile;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return {};
    }
    console.error("Error reading ratings file", err);
    throw err;
  }
}

async function writeRatings(data: RatingsFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const GET: APIRoute = async () => {
  const ratings = await readRatings();

  const averages = Object.fromEntries(
    Object.entries(ratings).map(([id, { sum, count }]) => [
      id,
      {
        average: count ? sum / count : 0,
        count,
      },
    ]),
  );

  return new Response(JSON.stringify(averages), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON body", err);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const parsed = body as { imageId?: string | number; rating?: number };
    const imageId = String(parsed.imageId ?? "");
    const rating = Number(parsed.rating);

    if (!imageId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const ratings = await readRatings();
    const current: RatingStats = ratings[imageId] ?? { sum: 0, count: 0 };

    current.sum += rating;
    current.count += 1;

    ratings[imageId] = current;
    await writeRatings(ratings);

    const average = current.count ? current.sum / current.count : 0;

    return new Response(
      JSON.stringify({ imageId, average, count: current.count }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("Error saving rating", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
