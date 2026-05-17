import { AppProvider } from './state/AppContext';
import { Layout } from './components/Layout';

// Phase 4 panel components will be created in src/components/ by parallel
// agents (BattleSelector, AgentPanel, WeaponPanel, DiscPanel, FieldPanel,
// BossPanel, OutputPanel, AutoOptPanel, etc.). A final assembly agent will
// import them here and place them inside <Layout>. Do not import any panel
// components yet — keeping this file empty avoids merge conflicts during
// parallel work.

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <header>
          <h1>ZZZ 神秘小算盘</h1>
          <p style={{ color: '#888' }}>
            Phase 4 in progress — components being ported...
          </p>
        </header>
      </Layout>
    </AppProvider>
  );
}
