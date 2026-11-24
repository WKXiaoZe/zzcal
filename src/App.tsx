import { useCallback, useEffect, useState } from 'react';
import { AppProvider } from './state/AppContext';
import { Layout } from './components/Layout';
import { HeroHeader } from './components/HeroHeader';
import { AgentPanel } from './components/AgentPanel';
import { BossPanel } from './components/BossPanel';
import { FieldBuffPanel } from './components/FieldBuffPanel';
import { ManualOptPanel } from './components/ManualOptPanel';
import { AutoOptPanel } from './components/AutoOptPanel';
import { OutputPanel } from './components/OutputPanel';
import { DiscHexCard } from './components/DiscHexCard';
import { ExportButton } from './components/ExportButton';
import { SimWorkspace } from './sim/SimWorkspace';

type AppViewMode = 'calc' | 'sim';

function parseHashRoute(hash: string): { mode: AppViewMode; ops: boolean } {
  const clean = (hash || '').trim().toLowerCase();
  if (clean.startsWith('#/ops')) {
    return { mode: 'sim', ops: true };
  }
  if (clean.startsWith('#/sim')) {
    return { mode: 'sim', ops: false };
  }
  return { mode: 'calc', ops: false };
}

/**
 * Background blur on scroll: legacy onScrollFrame() (L965-992) toggled
 * #hero-video.is-blurred past 50px. In `sim` mode we keep background softly
 * blurred at all times so dense charts & swimlanes stay crisp.
 */
function useScrollAndViewState(mode: AppViewMode) {
  useEffect(() => {
    document.body.dataset.appView = mode;
    const video = document.getElementById('hero-video');
    if (mode === 'sim') {
      if (video) video.classList.add('is-blurred');
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const v = document.getElementById('hero-video');
        if (v) v.classList.toggle('is-blurred', window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode]);
}

export default function App() {
  const initial = parseHashRoute(
    typeof window !== 'undefined' ? window.location.hash : '',
  );
  const [activeMode, setActiveMode] = useState<AppViewMode>(initial.mode);
  const [opsOpen, setOpsOpen] = useState<boolean>(initial.ops);
  const [hasVisitedSim, setHasVisitedSim] = useState<boolean>(
    initial.mode === 'sim' || initial.ops,
  );
  const [specVersion, setSpecVersion] = useState<string>('3.4.5_r20699967');

  useScrollAndViewState(activeMode);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute(window.location.hash);
      setActiveMode(parsed.mode);
      setOpsOpen(parsed.ops);
      if (parsed.mode === 'sim' || parsed.ops) {
        setHasVisitedSim(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSwitchMode = useCallback((target: AppViewMode) => {
    setActiveMode(target);
    if (target === 'sim') {
      setHasVisitedSim(true);
      setOpsOpen(false);
      if (!window.location.hash.toLowerCase().startsWith('#/sim')) {
        window.location.hash = '#/sim';
      }
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      setOpsOpen(false);
      if (
        window.location.hash.toLowerCase().startsWith('#/sim') ||
        window.location.hash.toLowerCase().startsWith('#/ops')
      ) {
        window.location.hash = '#/';
      }
    }
  }, []);

  const handleOpenOps = useCallback(() => {
    setHasVisitedSim(true);
    setActiveMode('sim');
    setOpsOpen(true);
    if (!window.location.hash.toLowerCase().startsWith('#/ops')) {
      window.location.hash = '#/ops';
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleCloseOps = useCallback(() => {
    setOpsOpen(false);
    if (window.location.hash.toLowerCase().startsWith('#/ops')) {
      window.location.hash = '#/sim';
    }
  }, []);

  return (
    <AppProvider>
      <Layout>
        <HeroHeader
          activeMode={activeMode}
          onChangeMode={handleSwitchMode}
          onOpenOps={handleOpenOps}
          specVersion={specVersion}
        />

        {/* 原配装词条算盘主界面：display: contents 保持原有 .container > * + * 间距规则零变动，
            隐藏时不卸载组件树，切回算盘时全部输入与优化结果 100% 保留 */}
        <div style={{ display: activeMode === 'calc' ? 'contents' : 'none' }}>
          <section className="grid-3">
            <AgentPanel slot="main" label="01 // 代理人 - 主C" />
            <AgentPanel slot="sup1" label="01b // 副C 1" />
            <AgentPanel slot="sup2" label="01c // 副C 2" />
          </section>
          <DiscHexCard />
          <section className="grid-2-split">
            <BossPanel />
            <FieldBuffPanel />
          </section>
          <section className="grid-2-split">
            <ManualOptPanel />
            <AutoOptPanel />
          </section>
          <OutputPanel />
        </div>

        {/* 实战排轴与 WASM 搜轴双引擎工作台 */}
        {hasVisitedSim && (
          <div style={{ display: activeMode === 'sim' ? 'block' : 'none' }}>
            <SimWorkspace
              opsOpen={opsOpen}
              onOpenOps={handleOpenOps}
              onCloseOps={handleCloseOps}
              onSpecVersionLoaded={setSpecVersion}
            />
          </div>
        )}
      </Layout>

      {activeMode === 'calc' && <ExportButton />}
    </AppProvider>
  );
}
