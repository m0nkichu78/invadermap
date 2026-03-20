import rawData from "@/data/world_space_invaders.json";
import type { RawInvader, Invader } from "@/lib/types/invader";
import { normalizeInvader } from "./normalize";

export const allInvaders: Invader[] = (rawData as RawInvader[]).map(normalizeInvader);

export const mappableInvaders: Invader[] = allInvaders.filter((i) => i.hasLocation);

export const invadersByCity: Record<string, Invader[]> = allInvaders.reduce(
  (acc, invader) => {
    (acc[invader.city] ??= []).push(invader);
    return acc;
  },
  {} as Record<string, Invader[]>
);

const invaderIndex = new Map(allInvaders.map((inv) => [inv.id, inv]));

export function getInvaderById(id: string): Invader | undefined {
  return invaderIndex.get(id);
}
