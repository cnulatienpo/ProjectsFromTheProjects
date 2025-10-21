import { getAllItems } from "../content/items";
import type { ItemBase } from "@shared/gameTypes";

export function fetchItemById(id: string): ItemBase | undefined {
  return getAllItems().find(i => i.id === id);
}

export function fetchNextForUser(userId: string): ItemBase {
  // TODO: use mastery + introduces_beats gates
  const pool = getAllItems();
  return pool[Math.floor(Math.random() * pool.length)];
}
