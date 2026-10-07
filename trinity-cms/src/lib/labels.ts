import "server-only";
import { getSetting } from "./settings-server";

/* Server components read their captions straight from here instead of taking a `labels` prop
   through four levels of blocks. `getSetting` is `unstable_cache`d and tagged, so the repeated
   calls in one render cost one query, and an edit in the dashboard invalidates them all. */
export const getLabels = () => getSetting("labels");
