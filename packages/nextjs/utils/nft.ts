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

  // Determine rarity based on weighted chances
  for (const { rarity, chance } of RARITY_CHANCES) {
    if (random < chance) {
      selectedRarity = rarity;
      break;
    }
    random -= chance;
  }

  // Get all traits in the selected rarity pool
  let pool = traits.filter(t => t.rarity === selectedRarity);

  // Fallback in case a list doesn't have an item for the selected rarity
  if (pool.length === 0) {
    pool = traits;
  }

  // Choose one equally from the filtered pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

export const STAGE_FOLDERS: Record<string, string> = {
  Harvested: "harvest",
  Processed: "process",
  Roasted: "roast",
  Distributed: "distribute",
};
export const mapTraitsToAttributes = (
  existingAttributes: any[],
  stage: string,
  traits: { mug: string; steam?: string; band: string },
) => {
  const baseAttributes = Array.isArray(existingAttributes) ? existingAttributes : [];
  const newAttributes = baseAttributes.filter(
    (attr: any) => !["Stage", "Mug", "Band", "Steam"].includes(attr.trait_type),
  );
  newAttributes.push({ trait_type: "Stage", value: stage });
  if (traits.mug) newAttributes.push({ trait_type: "Mug", value: traits.mug });
  if (traits.band) newAttributes.push({ trait_type: "Band", value: traits.band });
  if (traits.steam) newAttributes.push({ trait_type: "Steam", value: traits.steam });
  return newAttributes;
};
