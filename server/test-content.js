import { getAllItems } from "./content/items.js";

console.log("Testing content loader...");
try {
    const items = getAllItems();
    console.log(`Loaded ${items.length} items`);
    if (items.length > 0) {
        console.log("First item:", items[0]);
    }
} catch (error) {
    console.error("Error loading content:", error.message);
}
