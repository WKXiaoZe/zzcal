// src/components/Layout.tsx
// Top-level page shell. Mirrors the legacy `.container` wrapper so global
// styles (max-width, padding, grid backdrop) apply unchanged.
import type { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <div className="container">{children}</div>;
}
