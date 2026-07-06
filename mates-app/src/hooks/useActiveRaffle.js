import { useContext } from "react";
import { ActiveRaffleContext } from "../context/RaffleContext";

export function useActiveRaffle() {
  return useContext(ActiveRaffleContext);
}