// src/components/BossPanel.tsx
// Module 04: enemy data. Mirrors legacy index-legacy.html lines 249-284.
// - def / defBonus / dazeMult: numeric inputs
// - res: 0% / 20% / 40% button group (locked to 0% when weak=true)
// - weak: toggle button; turning it on forces res to 0
import { useAppState, useAppDispatch } from '../state/AppContext';
import styles from './BossPanel.module.css';

const RES_OPTIONS: Array<{ value: 0 | 0.2 | 0.4; label: string }> = [
  { value: 0, label: '0%' },
  { value: 0.2, label: '20%' },
  { value: 0.4, label: '40%' },
];

export function BossPanel() {
  const { boss } = useAppState();
  const dispatch = useAppDispatch();

  const setNumber = (field: 'def' | 'defBonus' | 'dazeMult') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    dispatch({ type: 'SET_BOSS', field, value: Number.isFinite(v) ? v : 0 });
  };

  const setRes = (value: 0 | 0.2 | 0.4) => {
    if (boss.weak) return; // locked while weak
    dispatch({ type: 'SET_BOSS', field: 'res', value });
  };

  const toggleWeak = () => {
    const next = !boss.weak;
    dispatch({ type: 'SET_BOSS', field: 'weak', value: next });
    if (next && boss.res !== 0) {
      dispatch({ type: 'SET_BOSS', field: 'res', value: 0 });
    }
  };

  return (
    <div className={`module ${styles.bossPanel}`} id="mod-boss">
      <div className="module-title"><span>04 // 敌人数据</span></div>
      <div className="sub-module">
        <div className="input-group">
          <label htmlFor="boss-def">基础防御力</label>
          <input
            id="boss-def"
            type="number"
            value={boss.def}
            onChange={setNumber('def')}
          />
        </div>
        <div className="input-group">
          <label htmlFor="boss-def-bonus">防御加成 (%)</label>
          <input
            id="boss-def-bonus"
            type="number"
            value={boss.defBonus}
            onChange={setNumber('defBonus')}
          />
        </div>
        <div className="input-group">
          <label htmlFor="boss-daze-mult">基础失衡倍率</label>
          <input
            id="boss-daze-mult"
            type="number"
            step="0.01"
            value={boss.dazeMult}
            onChange={setNumber('dazeMult')}
          />
        </div>
        <div className="input-group">
          <label>敌人抗性</label>
          <div className="switch-container res-group">
            {RES_OPTIONS.map(({ value, label }) => {
              const isActive = boss.res === value;
              const isDisabled = boss.weak && value !== 0;
              return (
                <button
                  key={value}
                  type="button"
                  className={`zzz-btn${isActive ? ' active' : ''}`}
                  disabled={isDisabled}
                  style={isDisabled ? { opacity: 0.5 } : undefined}
                  onClick={() => setRes(value)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="input-group" style={{ marginTop: 10 }}>
          <label>敌人弱点</label>
          <div className="switch-container">
            <button
              type="button"
              className={`zzz-btn${boss.weak ? ' active' : ''}`}
              onClick={toggleWeak}
            >
              {boss.weak ? '是' : '否'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
