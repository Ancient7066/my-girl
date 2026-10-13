import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { copy, recipientName, senderName } from './content';

const DreamScene = lazy(() => import('./Scene'));
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const initialReducedMotion = reducedMotionQuery.matches;

type Preferences = { progress: number; quiet: boolean; gentle: boolean; haptics: boolean; sound: boolean; volume: number };
const emptyPreferences: Preferences = { progress: 0, quiet: false, gentle: false, haptics: false, sound: false, volume: 0.35 };
function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem('for-aashi-preferences');
    return raw ? { ...emptyPreferences, ...JSON.parse(raw) } : emptyPreferences;
  } catch { return emptyPreferences; }
}
function savePreferences(value: Preferences) {
  try { localStorage.setItem('for-aashi-preferences', JSON.stringify(value)); } catch { /* storage can be unavailable */ }
}
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch { return false; }
}
function lowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4);
}
function useModalFocus(open: boolean, selector: string, onClose: () => void) {
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const root = document.querySelector<HTMLElement>(selector);
    const items = () => root ? Array.from(root.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])')).filter(item => !item.hasAttribute('disabled')) : [];
    (root?.querySelector<HTMLElement>('.section-map button') ?? items()[0])?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== 'Tab') return;
      const focusable = items();
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
    };
  }, [open, selector]);
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type AudioRig = { context: AudioContext; master: GainNode; oscillators: OscillatorNode[]; chimeTimer: number };

export default function App() {
  const stored = useMemo(readPreferences, []);
  const [section, setSection] = useState(() => Math.max(0, Math.min(9, stored.progress || 0)));
  const [hasResume, setHasResume] = useState(() => stored.progress > 0);
  const [quiet, setQuiet] = useState(stored.quiet);
  const [gentle, setGentle] = useState(stored.gentle || initialReducedMotion);
  const [haptics, setHaptics] = useState(stored.haptics);
  const [soundOn, setSoundOn] = useState(false); // Audio is always opt-in after a deliberate tap.
  const [soundPreference, setSoundPreference] = useState(stored.sound);
  const [volume, setVolume] = useState(stored.volume);
  const volumeRef = useRef(stored.volume);
  const [mapOpen, setMapOpen] = useState(false);
  const [fallback, setFallback] = useState(() => !hasWebGL() || lowPowerDevice());
  const [forcedFallback, setForcedFallback] = useState(false);
  const [note, setNote] = useState('');
  const [flowerCount, setFlowerCount] = useState(0);
  const [flowerMessage, setFlowerMessage] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(-1);
  const [selectedMemory, setSelectedMemory] = useState(-1);
  const [selectedNeed, setSelectedNeed] = useState('');
  const [guideOn, setGuideOn] = useState(false);
  const [pace, setPace] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [collected, setCollected] = useState<number[]>([]);
  const [luckyIndex, setLuckyIndex] = useState<number | null>(null);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [takeTime, setTakeTime] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<AudioRig | null>(null);
  const audioStopTimer = useRef<number | null>(null);
  const keyboardMode = useRef(false);
  useModalFocus(mapOpen, '.map-dialog', () => setMapOpen(false));
  useModalFocus(hasResume, '.resume-dialog', () => setHasResume(false));

  useEffect(() => {
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.pageDescription);
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Tab') keyboardMode.current = true; };
    const pointerdown = () => { keyboardMode.current = false; };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', pointerdown);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', pointerdown); };
  }, []);
  useEffect(() => {
    if (keyboardMode.current && document.activeElement === document.body) document.querySelector<HTMLElement>('.chapter h1')?.focus();
  }, [section]);
  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => { setReducedMotion(event.matches); if (event.matches) setGentle(true); };
    reducedMotionQuery.addEventListener?.('change', listener);
    return () => reducedMotionQuery.removeEventListener?.('change', listener);
  }, []);
  useEffect(() => {
    savePreferences({ progress: section, quiet, gentle, haptics, sound: soundPreference, volume });
  }, [section, quiet, gentle, haptics, soundPreference, volume]);
  useEffect(() => {
    if (!guideOn) return;
    if (reducedMotion || quiet) { setBreathPhase('in'); return; }
    setBreathPhase('in');
    const timer = window.setTimeout(() => setBreathPhase(breathPhase === 'in' ? 'out' : 'in'), (breathPhase === 'in' ? 4000 : 6000) * pace);
    return () => window.clearTimeout(timer);
  }, [guideOn, breathPhase, pace, reducedMotion, quiet]);
  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.oscillators.forEach(oscillator => { try { oscillator.stop(); } catch { /* already stopped */ } });
      window.clearInterval(audioRef.current.chimeTimer);
      void audioRef.current.context.close();
    }
  }, []);

  const stopAudio = () => {
    const rig = audioRef.current;
    if (!rig) return;
    try { rig.master.gain.setTargetAtTime(0, rig.context.currentTime, 0.4); } catch { /* context may be closed */ }
    if (audioStopTimer.current !== null) window.clearTimeout(audioStopTimer.current);
    audioStopTimer.current = window.setTimeout(() => {
      const current = audioRef.current;
      if (current) {
        window.clearInterval(current.chimeTimer);
        current.oscillators.forEach(oscillator => { try { oscillator.stop(); } catch { /* already stopped */ } });
        void current.context.close();
        audioRef.current = null;
      }
    }, 900);
  };
  const startAudio = () => {
    if (audioRef.current) {
      if (audioStopTimer.current !== null) window.clearTimeout(audioStopTimer.current);
      audioRef.current.master.gain.setTargetAtTime(volume * 0.055, audioRef.current.context.currentTime, 0.5);
      void audioRef.current.context.resume();
      return;
    }
    try {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      const oscillators = [110, 164.81, 220].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const layer = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        layer.gain.value = index === 0 ? 0.48 : 0.22;
        oscillator.connect(layer); layer.connect(master); oscillator.start();
        return oscillator;
      });
      const chimeTimer = window.setInterval(() => {
        if (context.state !== 'running' || volumeRef.current <= 0) return;
        const chime = context.createOscillator();
        const chimeGain = context.createGain();
        const now = context.currentTime;
        const notes = [523.25, 659.25, 783.99, 587.33];
        chime.type = 'sine'; chime.frequency.value = notes[Math.floor(Math.random() * notes.length)];
        chimeGain.gain.setValueAtTime(0.0001, now);
        chimeGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volumeRef.current * 0.009), now + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
        chime.connect(chimeGain); chimeGain.connect(context.destination); chime.start(now); chime.stop(now + 2.6);
      }, 18000);
      master.gain.setTargetAtTime(volume * 0.055, context.currentTime, 1.2);
      void context.resume();
      audioRef.current = { context, master, oscillators, chimeTimer };
    } catch { setSoundOn(false); }
  };
  const toggleSound = () => {
    if (soundOn) { stopAudio(); setSoundOn(false); setSoundPreference(false); }
    else { setQuiet(false); startAudio(); setSoundOn(true); setSoundPreference(true); }
  };
  const toggleQuiet = () => {
    if (!quiet) { stopAudio(); setSoundOn(false); setSoundPreference(false); setQuiet(true); setGentle(true); }
    else setQuiet(false);
  };
  const playHaptic = () => { if (haptics && 'vibrate' in navigator) navigator.vibrate(9); };
  const goTo = (index: number) => {
    setSection(Math.max(0, Math.min(9, index)));
    setMapOpen(false); setTakeTime(false); setNote(''); setFlowerMessage('');
    if (index === 4) setGuideOn(false);
    playHaptic();
  };
  const next = () => goTo(section === 9 ? 0 : section + 1);
  const pickStar = (index: number) => { setNote(copy.starNotes[index]); playHaptic(); };
  const growFlower = () => {
    const current = flowerCount % copy.flowerMessages.length;
    setFlowerCount(count => count + 1); setFlowerMessage(copy.flowerMessages[current]); playHaptic();
  };
  const updateVolume = (nextVolume: number) => {
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.master.gain.setTargetAtTime(nextVolume * 0.055, audioRef.current.context.currentTime, 0.25);
  };
  const reset = () => {
    setSection(0); setHasResume(false); setMapOpen(false); setNote(''); setFlowerMessage(''); setFlowerCount(0); setSelectedPrompt(-1); setSelectedMemory(-1); setSelectedNeed(''); setGuideOn(false); setBreathPhase('in'); setPace(1); setCollected([]); setLuckyIndex(null); setNudgeCount(0); setTakeTime(false);
  };
  const currentNeed = copy.needs.find(item => item.id === selectedNeed);
  const effectiveQuiet = quiet;
  const ambientStyle = { '--accent': currentNeed?.id === 'comfort' ? '#e6a9bb' : currentNeed?.id === 'quiet' ? '#998bb9' : currentNeed?.id === 'distraction' ? '#9cb6df' : currentNeed?.id === 'smile' ? '#d8ace4' : '#e6cf9c' } as CSSProperties;

  return <div className={`app-shell ${effectiveQuiet ? 'is-quiet' : ''} ${gentle || reducedMotion ? 'is-gentle' : ''} scene-${section} ${currentNeed ? `mood-${currentNeed.color}` : ''}`} style={ambientStyle}>
    <div className="sky-wash" aria-hidden="true" />
    {!fallback && !forcedFallback && <div className="canvas-wrap" aria-hidden="true"><SceneErrorBoundary onError={() => setFallback(true)}><Suspense fallback={null}><DreamScene section={section} gentle={gentle} quiet={effectiveQuiet} lowParticles={lowPowerDevice()} mood={selectedNeed || null} reducedMotion={reducedMotion} /></Suspense></SceneErrorBoundary></div>}
    {(fallback || forcedFallback) && <div className="css-dream" aria-hidden="true"><span className="css-moon"/><span className="css-cloud cloud-one"/><span className="css-cloud cloud-two"/><span className="css-hill hill-one"/><span className="css-hill hill-two"/><span className="css-fireflies"/></div>}
    <div className="vignette" aria-hidden="true" />

    {loading && <div className="loading-screen" aria-label={copy.loading}><div className="loading-star" aria-hidden="true">✧</div><p>{copy.loading}</p></div>}
    <header className="topbar">
      <a className="brand" href="#home" aria-label={`${recipientName}, ${copy.brand}`} onClick={event => { event.preventDefault(); goTo(0); }}><span className="brand-mark" aria-hidden="true">✦</span><span>{copy.brand}</span></a>
      <div className="progress-wrap" aria-label={`${copy.chapter}, ${section + 1} ${copy.progressOfTen}`}>
        <span className="progress-count">{String(section + 1).padStart(2, '0')} <i>/</i> 10</span>
        <div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={10} aria-valuenow={section + 1} aria-label={copy.chapter}><span style={{ width: `${(section + 1) * 10}%` }} /></div>
        <button className="map-trigger" onClick={() => setMapOpen(true)} aria-haspopup="dialog" aria-label={copy.map}>{copy.sectionNames[section]} <span aria-hidden="true">⌄</span></button>
      </div>
      <div className="global-controls">
        <div className="sound-control">
          <button className={`tool-button sound-button ${soundOn ? 'is-active' : ''}`} onClick={toggleSound} aria-label={soundOn ? copy.soundOff : copy.soundOn} aria-pressed={soundOn}><span aria-hidden="true">{soundOn ? '◖' : '◌'}</span><span className="control-word">{copy.sound}</span></button>
          {soundOn && <label className="volume-control"><span className="sr-only">{copy.soundVolume}</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={event => updateVolume(Number(event.target.value))} /></label>}
        </div>
        <button className={`tool-button ${quiet ? 'is-active' : ''}`} onClick={toggleQuiet} aria-pressed={quiet} aria-label={copy.quietMode}><span aria-hidden="true">◐</span><span className="control-word">{copy.quietMode}</span></button>
        <button className={`tool-button gentle-button ${gentle ? 'is-active' : ''}`} onClick={() => setGentle(value => !value)} aria-pressed={gentle} aria-label={copy.gentleMode}><span aria-hidden="true">✧</span><span className="control-word">{copy.gentleMode}</span></button>
        <button className={`tool-button haptic-button ${haptics ? 'is-active' : ''}`} onClick={() => setHaptics(value => !value)} disabled={!('vibrate' in navigator)} title={'vibrate' in navigator ? undefined : copy.feedback.hapticsUnsupported} aria-pressed={haptics} aria-label={copy.haptics}><span aria-hidden="true">⌁</span><span className="control-word">{copy.haptics}</span></button>
        <button className="tool-button skip-animation" onClick={() => setGentle(true)} aria-label={copy.skipAnimation}><span aria-hidden="true">≫</span><span className="control-word">{copy.skipAnimation}</span></button>
        <button className="tool-button restart-button" onClick={reset} aria-label={copy.restart}><span aria-hidden="true">↺</span><span className="control-word">{copy.restart}</span></button>
      </div>
    </header>

    <main id="home" className="main-stage" aria-live="off">
      <section key={section} className={`chapter chapter-${section}`} role="region" aria-labelledby="chapter-title">
        <div className="chapter-topline"><span className="chapter-kicker">{copy.chapter}</span><span className="chapter-number">{String(section + 1).padStart(2, '0')} — 10</span></div>
        <div className="chapter-copy">
          <p className="instruction"><span className="instruction-star" aria-hidden="true">✦</span>{copy.sectionInstructions[section]}</p>
          {section === 0 ? <>
            <p className="eyebrow">{copy.welcome.eyebrow}</p>
            <h1 id="chapter-title" className="hero-title" tabIndex={-1}>{copy.welcome.heading}</h1>
            <p className="chapter-lede">{copy.welcome.body}</p>
            <div className="welcome-actions"><button className="button-primary" onClick={() => goTo(1)}>{copy.welcome.enter}<span aria-hidden="true"> ↗</span></button><button className="text-button" onClick={() => goTo(1)}>{copy.welcome.skip}</button></div>
          </> : <>
            <p className="eyebrow">{copy.sectionNames[section]}</p>
            <h1 id="chapter-title" tabIndex={-1}>{copy.sectionHeadings[section]}</h1>
          </>}

          {section === 1 && <div className="star-world content-world">
            <div className="star-grid" role="group" aria-label={copy.sectionNames[1]}>{copy.starNotes.map((_, i) => <button key={i} className={`star-choice star-size-${i % 4}`} style={{ '--delay': `${(i % 6) * 0.12}s` } as CSSProperties} onClick={() => pickStar(i)} aria-label={`${copy.starLabel} ${i + 1}`} title={`${copy.starLabel} ${i + 1}`}><span aria-hidden="true">{i % 5 === 0 ? '✦' : '✧'}</span></button>)}</div>
            <p className="soft-hint">{copy.messageCount}</p>
            {note && <p key={note} className="message-note" aria-live="polite">{note}</p>}
          </div>}

          {section === 2 && <div className="garden-world content-world">
            <div className="flower-field" onClick={event => { if (!(event.target instanceof Element) || !event.target.closest('button')) growFlower(); }} aria-label={copy.sectionNames[2]}>{Array.from({ length: Math.min(flowerCount, 12) }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2 - Math.PI / 2; const radius = 30 + (i % 2) * 13;
              return <button key={i} className={`flower flower-${i % 5}`} style={{ left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%`, '--bloom-delay': `${i * 0.08}s` } as CSSProperties} onClick={() => setFlowerMessage(copy.flowerMessages[i % copy.flowerMessages.length])} aria-label={`${copy.flowerLabel} ${i + 1}`}><span aria-hidden="true">✿</span></button>;
            })}<div className="garden-glow" aria-hidden="true" /></div>
            <button className="button-secondary" onClick={growFlower}><span aria-hidden="true">✿</span> {copy.flowerButton}</button>
            {flowerMessage && <p key={flowerMessage} className="message-note" aria-live="polite">{flowerMessage}</p>}
          </div>}

          {section === 3 && <div className="prompt-grid content-world" role="group" aria-label={copy.sectionNames[3]}>{copy.groundingPrompts.map((prompt, i) => <button key={prompt} className={`prompt-card ${selectedPrompt === i ? 'chosen' : ''}`} onClick={() => { setSelectedPrompt(i); setNote(prompt); playHaptic(); }}><span className="prompt-index">0{i + 1}</span><span>{prompt}</span><span className="prompt-glint" aria-hidden="true">✧</span></button>)}{note && <p className="quiet-response" aria-live="polite">{note}</p>}</div>}

          {section === 4 && <div className="breath-world content-world">
            <p className="chapter-lede breath-lede">{copy.breath.body}</p>
            <div className={`breathing-orb ${guideOn && !reducedMotion && !quiet ? 'is-guided' : ''} ${breathPhase === 'out' ? 'phase-out' : ''}`} style={{ '--breath-duration': `${10 * pace}s` } as CSSProperties} role="img" aria-label={guideOn ? `${copy.breath.title}, ${breathPhase === 'in' ? copy.breath.inhale : copy.breath.exhale}` : copy.breath.resting}><span className="orb-halo"/><span className="orb-core"/><span className="breath-phase" aria-live="polite">{guideOn ? breathPhase === 'in' ? copy.breath.inhale : copy.breath.exhale : copy.breath.resting}</span></div>
            <div className="breath-controls"><button className={guideOn ? 'button-stop' : 'button-secondary'} onClick={() => setGuideOn(value => !value)}>{guideOn ? copy.breath.stop : copy.breath.guided}</button><button className={`text-button ${!guideOn ? 'selected-mode' : ''}`} onClick={() => setGuideOn(false)}>{copy.breath.free}</button></div>
            <label className="pace-control"><span>{copy.breathScale}</span><input type="range" min="0.7" max="1.3" step="0.05" value={pace} onChange={event => setPace(Number(event.target.value))} /><span>{pace < 1 ? copy.breath.faster : pace > 1 ? copy.breath.slower : copy.breathDefaultPace}</span></label>
          </div>}

          {section === 5 && <div className="memory-world content-world"><p className="chapter-lede">{copy.sectionInstructions[5]}</p><div className="memory-orbit" aria-hidden="true"/><div className="memory-grid">{copy.memoryCards.map((card, i) => <button key={card.title} className={`memory-card memory-${i + 1} ${selectedMemory === i ? 'selected' : ''}`} onClick={() => { setSelectedMemory(selectedMemory === i ? -1 : i); playHaptic(); }} aria-label={`${copy.memoryLabel} ${i + 1}: ${selectedMemory === i ? copy.closeCard : copy.openCard}`}><span className="memory-mark" aria-hidden="true">✧</span><span className="memory-title">{card.title}</span><span className="memory-card-hint">{selectedMemory === i ? card.body : copy.openCard}</span></button>)}</div></div>}

          {section === 6 && <div className="needs-world content-world">
            {!currentNeed ? <><p className="chapter-lede">{copy.sectionInstructions[6]}</p><div className="need-options" role="group" aria-label={copy.chooseMood}>{copy.needs.map((item, i) => <button key={item.id} className={`need-option need-${item.color}`} onClick={() => { setSelectedNeed(item.id); playHaptic(); }}><span className="need-symbol" aria-hidden="true">{['◡','◌','✧','◐','✦'][i]}</span><span className="need-title">{item.title}</span><span className="need-line">{item.line}</span></button>)}</div></> : <div className={`need-result need-result-${currentNeed.color}`}><button className="change-need" onClick={() => setSelectedNeed('')}>{copy.chooseMood}</button><p className="need-result-kicker">{currentNeed.title}</p><p className="need-message" aria-live="polite">{currentNeed.messages[(Math.floor(Date.now() / 1000) + section) % currentNeed.messages.length]}</p><button className="button-secondary" onClick={() => { setSelectedNeed(''); setNote(''); }}>{copy.close}</button><div className="need-switches">{copy.needs.filter(item => item.id !== currentNeed.id).map(item => <button key={item.id} onClick={() => setSelectedNeed(item.id)}>{item.title}</button>)}</div></div>}
          </div>}

          {section === 7 && <div className="play-world content-world">
            <p className="chapter-lede">{copy.sectionInstructions[7]}</p>
            <div className="firefly-play" role="group" aria-label={copy.sectionNames[7]}>{Array.from({ length: 8 }, (_, i) => <button key={i} disabled={collected.includes(i)} className={`play-firefly firefly-${i} ${collected.includes(i) ? 'gathered' : ''}`} onClick={() => { setCollected(items => [...items, i]); setNote(copy.playNotes[i % copy.playNotes.length]); playHaptic(); }} aria-label={`${copy.fireflyLabel} ${i + 1}`}><span aria-hidden="true">✦</span></button>)}<span className="play-count">{collected.length} · {copy.firefliesGathered}</span></div>
            <div className={`floaty-row nudge-${nudgeCount % 3}`}><span>✧</span><span>◌</span><span>✦</span><button className="nudge-button" onClick={() => setNudgeCount(value => value + 1)} aria-label={copy.nudge}>↗</button></div>
            <div className="lucky-row">{copy.playNotes.map((_, i) => <button key={i} className="lucky-star" onClick={() => setLuckyIndex(luckyIndex === i ? -1 : i)} aria-label={`${copy.luckyStar} ${i + 1}`}><span aria-hidden="true">✧</span></button>)}</div>
            {note && <p className="message-note" aria-live="polite">{note}</p>}{luckyIndex !== null && luckyIndex >= 0 && <p className="message-note" aria-live="polite">{copy.playNotes[luckyIndex]}</p>}
          </div>}

          {section === 8 && <div className="letter-world content-world"><div className="letter-scroll" tabIndex={0} aria-label={copy.sectionNames[8]}><div className="letter-topmark" aria-hidden="true">✧</div><div className="letter-text">{copy.letter.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}</div></div><p className="letter-signature">{senderName}</p></div>}

          {section === 9 && <div className="closing-world content-world"><div className="name-constellation" aria-label={recipientName}>{recipientName.split('').map((letter, i) => <span key={i} style={{ '--letter-index': i } as CSSProperties}>{letter}</span>)}</div><p className="closing-message">{copy.closing.message}</p><div className="closing-actions"><button className="button-primary" onClick={reset}>{copy.closing.replay}<span aria-hidden="true"> ↺</span></button><button className="button-secondary" onClick={toggleQuiet}>{copy.closing.finish}</button><button className="text-button" onClick={() => setMapOpen(true)}>{copy.closing.map}</button></div></div>}
        </div>
        {section > 0 && <div className="section-actions"><button className="skip-button" onClick={next}>{copy.skip}<span aria-hidden="true"> ↗</span></button></div>}
      </section>
    </main>

    <footer className="bottom-bar">
      <div className="bottom-note" aria-live="polite">{takeTime ? copy.feedback.takeTime : copy.lowerGlow}</div>
      <div className="bottom-actions">{fallback || forcedFallback ? <button className="scene-toggle" onClick={() => { setFallback(false); setForcedFallback(false); }}>{copy.use3d}</button> : <button className="scene-toggle" onClick={() => setForcedFallback(true)}>{copy.fallback}</button>}
        <button className="take-time-button" onClick={() => setTakeTime(true)}>{copy.takeTime}</button>
        {section === 9 ? <button className="button-primary footer-continue" onClick={reset}>{copy.closing.replay}<span aria-hidden="true"> ↺</span></button> : <button className="button-primary footer-continue" onClick={next}>{copy.continue}<span aria-hidden="true"> →</span></button>}
      </div>
    </footer>

    {mapOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setMapOpen(false); }}><div className="map-dialog" role="dialog" aria-modal="true" aria-labelledby="map-title"><div className="dialog-header"><div><p className="eyebrow">{copy.chapter}</p><h2 id="map-title">{copy.journey}</h2></div><button className="dialog-close" onClick={() => setMapOpen(false)} aria-label={copy.close}>×</button></div><nav className="section-map" aria-label={copy.map}>{copy.sectionNames.map((name, i) => <button key={name} className={section === i ? 'map-current' : ''} onClick={() => goTo(i)}><span className="map-index">{String(i + 1).padStart(2, '0')}</span><span>{name}</span>{i <= section && <span className="map-done" aria-hidden="true">✦</span>}</button>)}</nav></div></div>}

    {hasResume && <div className="modal-backdrop resume-backdrop"><div className="resume-dialog" role="dialog" aria-modal="true" aria-labelledby="resume-title"><div className="resume-star" aria-hidden="true">✧</div><p className="eyebrow">{copy.welcome.eyebrow}</p><h2 id="resume-title">{copy.resumeTitle}</h2><p>{copy.resumeBody}</p><div className="resume-actions"><button className="button-primary" onClick={() => setHasResume(false)}>{copy.pickUp}<span aria-hidden="true"> →</span></button><button className="text-button" onClick={() => { setHasResume(false); goTo(0); }}>{copy.startBeginning}</button></div></div></div>}
  </div>;
}
