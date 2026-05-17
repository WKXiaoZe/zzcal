import { AppProvider } from './state/AppContext';
import { Layout } from './components/Layout';
import { HeroHeader } from './components/HeroHeader';
import { AgentPanel } from './components/AgentPanel';
import { WeaponPanel } from './components/WeaponPanel';
import { DiscPanel } from './components/DiscPanel';
import { BossPanel } from './components/BossPanel';
import { FieldBuffPanel } from './components/FieldBuffPanel';
import { ManualOptPanel } from './components/ManualOptPanel';
import { AutoOptPanel } from './components/AutoOptPanel';
import { OutputPanel } from './components/OutputPanel';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <HeroHeader />
        <section className="grid-3">
          <AgentPanel slot="main" label="01 // 代理人 - 主C" />
          <AgentPanel slot="sup1" label="01b // 副C 1" />
          <AgentPanel slot="sup2" label="01c // 副C 2" />
        </section>
        <section className="grid-3">
          <WeaponPanel slot="main" label="02 // 音擎 - 主C" />
          <WeaponPanel slot="sup1" label="02b // 音擎 1" />
          <WeaponPanel slot="sup2" label="02c // 音擎 2" />
        </section>
        <section className="grid-2-split">
          <DiscPanel />
          <BossPanel />
        </section>
        <FieldBuffPanel />
        <section className="grid-2-split">
          <ManualOptPanel />
          <AutoOptPanel />
        </section>
        <OutputPanel />
      </Layout>
    </AppProvider>
  );
}
