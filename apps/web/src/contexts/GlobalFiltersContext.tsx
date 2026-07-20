import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type GlobalFiltersContextType = {
  measurementYear: string | null; // null = "All"
  globalSearch: string;
  setMeasurementYear: (year: string | null) => void;
  setGlobalSearch: (search: string) => void;
};

const GlobalFiltersContext = createContext<GlobalFiltersContextType | null>(
  null
);

export function GlobalFiltersProvider({ children }: { children: ReactNode }) {
  const [measurementYear, setMeasurementYearState] = useState<string | null>(
    null
  ); // ← Default: All
  const [globalSearch, setGlobalSearchState] = useState("");

  // Persist selection
  useEffect(() => {
    const saved = localStorage.getItem("measurementYear");
    if (saved) setMeasurementYearState(saved === "All" ? null : saved);
  }, []);

  const setMeasurementYear = (year: string | null) => {
    setMeasurementYearState(year);
    localStorage.setItem("measurementYear", year || "All");
  };

  return (
    <GlobalFiltersContext.Provider
      value={{
        measurementYear,
        globalSearch,
        setMeasurementYear,
        setGlobalSearch: setGlobalSearchState,
      }}
    >
      {children}
    </GlobalFiltersContext.Provider>
  );
}

export const useGlobalFilters = () => {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error(
      "useGlobalFilters must be used within GlobalFiltersProvider"
    );
  }
  return context;
};
