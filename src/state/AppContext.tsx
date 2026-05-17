// src/state/AppContext.tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { reducer, initialState } from './reducer';
import type { AppState, Action } from './types';

interface Ctx { state: AppState; dispatch: Dispatch<Action>; }

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState outside AppProvider');
  return ctx.state;
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppDispatch outside AppProvider');
  return ctx.dispatch;
}
