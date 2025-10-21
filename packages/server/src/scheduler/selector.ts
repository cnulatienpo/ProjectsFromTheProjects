import { fetchNextForUser } from "../db/itemsRepo";

export default async function pickNext(userId: string) {
  return fetchNextForUser(userId);
}
