import fs from "fs";
import path from "path";
import sharp from "sharp";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Trait {
  name: string;
  rarity: Rarity;
}

export const RARITY_CHANCES = [
  { rarity: "common", chance: 40 },
  { rarity: "uncommon", chance: 30 },
  { rarity: "rare", chance: 18 },
  { rarity: "epic", chance: 10 },
  { rarity: "legendary", chance: 2 },
] as const;

export const MUG_TRAITS: Trait[] = [
  { name: "base", rarity: "common" },
  { name: "brick", rarity: "uncommon" },
  { name: "obsidian", rarity: "uncommon" },
  { name: "amethyst", rarity: "uncommon" },
  { name: "cyan", rarity: "rare" },
  { name: "fuchsia", rarity: "rare" },
  { name: "teal", rarity: "rare" },
  { name: "sakura", rarity: "epic" },
  { name: "slime", rarity: "epic" },
  { name: "gold", rarity: "legendary" },
];

export const STEAM_TRAITS: Trait[] = [
  { name: "1-line", rarity: "common" },
  { name: "2-line", rarity: "common" },
  { name: "3-line", rarity: "uncommon" },
  { name: "ribbon", rarity: "uncommon" },
  { name: "happy", rarity: "rare" },
  { name: "heart", rarity: "rare" },
  { name: "star", rarity: "rare" },
  { name: "skull", rarity: "epic" },
  { name: "sun", rarity: "epic" },
  { name: "shine", rarity: "legendary" },
];

export const BAND_TRAITS: Trait[] = [
  { name: "base", rarity: "common" },
  { name: "stripe", rarity: "uncommon" },
  { name: "horizontal", rarity: "rare" },
  { name: "stair", rarity: "epic" },
  { name: "checkered", rarity: "legendary" },
];

export const getRandomTrait = (traits: Trait[]): Trait => {
  let random = Math.random() * 100;
  let selectedRarity: Rarity = "common";

  for (const { rarity, chance } of RARITY_CHANCES) {
    if (random < chance) {
      selectedRarity = rarity;
      break;
    }
    random -= chance;
  }

  let pool = traits.filter(t => t.rarity === selectedRarity);
  if (pool.length === 0) {
    pool = traits;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

export const STAGE_FOLDERS: Record<string, string> = {
  Harvested: "harvest",
  Processed: "process",
  Roasted: "roast",
  Distributed: "distribute",
};

const OUTPUT_SIZE = 2048;

export const sanitize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const resizePixelArt = (filePath: string) =>
  sharp(filePath).resize(OUTPUT_SIZE, OUTPUT_SIZE, { kernel: sharp.kernel.nearest, fit: "fill" }).png().toBuffer();

export const generateNftBuffer = async (params: {
  region: string;
  stage: keyof typeof STAGE_FOLDERS;
  roastLevel?: string;
  mug: string;
  band: string;
  steam: string;
}) => {
  const baseDir = path.resolve(process.cwd(), "..", "nextjs", "public", "layers");
  const regionKey = sanitize(params.region);
  const regionBgPath = path.join(baseDir, "backgrounds", `${regionKey}.png`);
  const bgPath = fs.existsSync(regionBgPath) ? regionBgPath : path.join(baseDir, "backgrounds", "other.png");

  const layerPaths = [
    bgPath,
    path.join(baseDir, "mugs", `${params.mug}.png`),
    path.join(baseDir, "bands", STAGE_FOLDERS[params.stage], `${params.band}.png`),
  ];

  const showLiquid = params.stage === "Roasted" || params.stage === "Distributed";
  if (showLiquid) {
    if (params.roastLevel) {
      layerPaths.push(path.join(baseDir, "liquids", `${sanitize(params.roastLevel)}-roast.png`));
    }
    layerPaths.push(path.join(baseDir, "steams", `${params.steam}.png`));
  }

  const [bgBuffer, ...overlayBuffers] = await Promise.all(layerPaths.map(resizePixelArt));

  return sharp(bgBuffer)
    .composite(overlayBuffers.map(input => ({ input, top: 0, left: 0 })))
    .png({ compressionLevel: 6, adaptiveFiltering: false })
    .toBuffer();
};
