"use client";
import { createContext, useContext, type ReactNode } from "react";

/* The destinations switched off in Settings → Navigation, for client components that build their own
   destination lists (the enquiry form). The server components get the same list from the settings. */
const Ctx = createContext<string[]>([]);
export const HiddenDestinationsProvider = ({ hidden, children }: { hidden: string[]; children: ReactNode }) => <Ctx.Provider value={hidden}>{children}</Ctx.Provider>;
export const useHiddenDestinations = () => useContext(Ctx);
