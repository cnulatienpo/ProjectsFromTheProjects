import { getAllItems } from "../packages/server/src/content/items";

const items = getAllItems();
console.log("items", items.length, items.slice(0, 3).map(i => ({
  id: i.id,
  mode: i.mode,
  skills: i.skillIds.slice(0, 3),
})));
