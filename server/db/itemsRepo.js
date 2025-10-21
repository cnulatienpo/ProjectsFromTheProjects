import { getAllItems } from "../content/items.js";

export function fetchItemById(id) {
    return getAllItems().find(i => i.id === id);
}

export function fetchNextForUser(userId) {
    // TODO: use mastery + introduces_beats gates
    const pool = getAllItems();
    return pool[Math.floor(Math.random() * pool.length)];
}
