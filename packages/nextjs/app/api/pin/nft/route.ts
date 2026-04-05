import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Stage } from "~~/types/coffee";
import { BAND_TRAITS, MUG_TRAITS, STAGE_FOLDERS, STEAM_TRAITS, getRandomTrait } from "~~/utils/nft";

const OUTPUT_SIZE = 2048;

// Helper to sanitize input strings for file paths
const sanitize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

// Sharp utility to resize pixel art into high res 2048x2048
const resizePixelArt = (filePath: string) =>
  sharp(filePath).resize(OUTPUT_SIZE, OUTPUT_SIZE, { kernel: sharp.kernel.nearest, fit: "fill" }).png().toBuffer();

export async function POST(req: NextRequest) {
  try {
    const { region, stage, roastLevel, existingSteam, existingMug } = await req.json();

    // Resolve traits (use existing or pick random, always random band)
    const mug = existingMug ?? getRandomTrait(MUG_TRAITS).name;
    const band = getRandomTrait(BAND_TRAITS).name;
    const steam = existingSteam ?? getRandomTrait(STEAM_TRAITS).name;

    const baseDir = path.join(process.cwd(), "public", "layers");
    const regionKey = sanitize(region);

    // Resolve background (fallback to "other")
    const regionBgPath = path.join(baseDir, "backgrounds", `${regionKey}.png`);
    const bgPath = fs.existsSync(regionBgPath) ? regionBgPath : path.join(baseDir, "backgrounds", "other.png");

    // Build layer stack
    const layerPaths = [
      bgPath,
      path.join(baseDir, "mugs", `${mug}.png`),
      path.join(baseDir, "bands", STAGE_FOLDERS[stage as Stage], `${band}.png`),
    ];

    // Add liquid + steam for roasted/distributed stages
    const showLiquid = stage === "Roasted" || (stage === "Distributed" && roastLevel);
    if (showLiquid) {
      if (roastLevel) layerPaths.push(path.join(baseDir, "liquids", `${sanitize(roastLevel)}-roast.png`));
      layerPaths.push(path.join(baseDir, "steams", `${steam}.png`));
    }

    // Upscale all layers to output size
    const [bgBuffer, ...overlayBuffers] = await Promise.all(layerPaths.map(resizePixelArt));

    // Composite overlays onto background
    const imageBuffer = await sharp(bgBuffer)
      .composite(overlayBuffers.map(input => ({ input, top: 0, left: 0 })))
      .png({ compressionLevel: 6, adaptiveFiltering: false })
      .toBuffer();

    return NextResponse.json({ buffer: imageBuffer.toString("base64"), traits: { mug, steam, band } }, { status: 200 });
  } catch (error: any) {
    console.error("[generate-nft]", error);
    return NextResponse.json({ error: error.message ?? "Failed to generate NFT" }, { status: 500 });
  }
}
