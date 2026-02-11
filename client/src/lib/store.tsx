import React, { createContext, useContext, useEffect, useReducer } from "react";

// --- Types ---

export type ScoringType = "score" | "grade" | "text" | "boolean" | "manual_score";

export interface ScoringItem {
  id: string;
  label: string;
  type: ScoringType;
  min?: number;
  max?: number;
  order: number;
}

export interface MatchRecord {
  id: string;
  matchNumber: string;
  teamNumber: string;
  alliance: "red" | "blue";
  scoutName: string;
  data: Record<string, any>; // itemId -> value
  timestamp: number;
}

export interface AppSettings {
  sheetUrl: string;
  googleScriptUrl?: string;
}

export interface AppState {
  schema: ScoringItem[];
  matches: MatchRecord[];
  settings: AppSettings;
  theme: "dark" | "light";
}

type Action =
  | { type: "ADD_SCHEMA_ITEM"; payload: ScoringItem }
  | { type: "REMOVE_SCHEMA_ITEM"; payload: string }
  | { type: "UPDATE_SCHEMA_ITEM"; payload: ScoringItem }
  | { type: "ADD_MATCH_RECORD"; payload: MatchRecord }
  | { type: "SET_MATCH_RECORDS"; payload: MatchRecord[] }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> }
  | { type: "SET_THEME"; payload: "dark" | "light" }
  | { type: "IMPORT_DATA"; payload: Partial<AppState> };

// --- Initial State ---

const DEFAULT_SCHEMA: ScoringItem[] = [
  { id: "auto_mobility", label: "自動階段移動", type: "boolean", order: 0 },
  { id: "auto_score_top", label: "自動頂層得分 (按鈕)", type: "score", min: 0, max: 99, order: 1 },
  { id: "tele_score_manual", label: "手動得分 (直接輸入)", type: "manual_score", min: 0, max: 999, order: 2 },
  { id: "driver_skill", label: "駕駛技術評分", type: "grade", order: 3 },
  { id: "defense_quality", label: "防守能力", type: "grade", order: 4 },
  { id: "notes", label: "備註", type: "text", order: 5 },
];

const initialState: AppState = {
  schema: DEFAULT_SCHEMA,
  matches: [],
  settings: {
    sheetUrl: "",
  },
  theme: "dark",
};

// --- Reducer ---

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_SCHEMA_ITEM":
      return { ...state, schema: [...state.schema, action.payload] };
    case "REMOVE_SCHEMA_ITEM":
      return { ...state, schema: state.schema.filter((i) => i.id !== action.payload) };
    case "UPDATE_SCHEMA_ITEM":
      return {
        ...state,
        schema: state.schema.map((i) => (i.id === action.payload.id ? action.payload : i)),
      };
    case "ADD_MATCH_RECORD":
      return { ...state, matches: [action.payload, ...state.matches] };
    case "SET_MATCH_RECORDS":
      return { ...state, matches: action.payload };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "IMPORT_DATA":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// --- Context ---

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load from local storage on init
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const stored = localStorage.getItem("frc-scout-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...initial, ...parsed };
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    return initial;
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("frc-scout-data", JSON.stringify(state));
    // Apply theme
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
