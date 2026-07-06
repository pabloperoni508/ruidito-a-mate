import { createContext } from "react";
import { useFetch } from "../hooks/useFetch";
import { getActiveRaffle } from "../services/raffleService";

export const ActiveRaffleContext = createContext(null);

export function ActiveRaffleProvider({ children }) {
  const { data: activeRaffle, loading } = useFetch(getActiveRaffle, []);

  return (
    <ActiveRaffleContext.Provider value={{ activeRaffle, loading }}>
      {children}
    </ActiveRaffleContext.Provider>
  );
}