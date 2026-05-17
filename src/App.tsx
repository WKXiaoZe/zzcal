import { AppProvider } from './state/AppContext';

export default function App() {
  return (
    <AppProvider>
      <main style={{ padding: 24, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <h1>ZZZ 神秘小算盘</h1>
        <p>React refactor in progress…</p>
      </main>
    </AppProvider>
  );
}
