// Test the migration by creating a simple item and testing the grader
import { getAllItems } from "./server/content/items.js";
import gradeAttempt from "./server/graders/index.js";

console.log("🧪 Testing migration...");

try {
    // Test content loading
    const items = getAllItems();
    console.log(`✅ Loaded ${items.length} items`);

    if (items.length > 0) {
        const item = items[0];
        console.log(`📄 First item: ${item.id} (mode: ${item.mode})`);

        // Test grading with a simple payload
        const payload = {
            userId: "test",
            itemId: item.id,
            mode: item.mode,
            answer: {
                sigils: ["action"],
                rationale: "This shows accuracy and clarity"
            }
        };

        // Add item data to payload for grading
        payload.gold = item.gold || {};
        payload.options = item.options || [];
        payload.goldBeats = item.meta?.beat_tags || item.gold?.order || [];
        payload.goldMissing = item.gold?.missingBeat;

        const result = await gradeAttempt(payload);
        console.log(`✅ Grading result: score=${result.score}, rubric=[${result.rubric.join(', ')}]`);

        console.log("🎉 Migration test successful!");
    } else {
        console.log("⚠️ No items loaded");
    }
} catch (error) {
    console.error("❌ Migration test failed:", error.message);
    console.error(error.stack);
}
