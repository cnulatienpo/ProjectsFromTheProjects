<<<<<<< HEAD
import { z } from "zod";

export const WordEntrySchema = z.object({
    word: z.string(),
    from: z.object({
        language: z.string(),
        root: z.string(),
        gloss: z.string(),
    }),
    literal: z.string(),
});

export const PackSchema = z.object({
    id: z.string(),
    label: z.string(),
    entries: z.array(WordEntrySchema),
});

export function validateAndNormalizePack(data: unknown) {
    const result = PackSchema.safeParse(data);
    if (!result.success) {
        throw new Error("Invalid pack data: " + JSON.stringify(result.error.format(), null, 2));
    }
    return result.data;
}
=======
export { default } from "../utils/validateAndNormalize";
export * from "../utils/validateAndNormalize";
>>>>>>> b5d40d1934d5b6a601792fe47ed65f483fc206b5
