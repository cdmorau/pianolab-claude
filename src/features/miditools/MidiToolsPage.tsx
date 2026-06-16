import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/state/settingsStore';

// ── YouTube URL helpers ──────────────────────────────────────────────────────

function extractYtId(url: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// ── Types ────────────────────────────────────────────────────────────────────

type VideoType = 'synthesia' | 'recording';
type Lang = 'es' | 'en';

interface BI { es: string; en: string }

interface QualityRow {
  label: BI;
  score: number; // 0–5
}

interface ToolDef {
  id: string;
  name: string;
  github: string;
  badge: BI;
  videoTypes: VideoType[];
  stars: number;
  qualityRows: QualityRow[];
  description: BI;
  limitation: BI;
  requires: string;
  time: BI;
  online?: string;
  getCommand: (url: string) => string;
}

// ── Tool data ─────────────────────────────────────────────────────────────────

const TOOLS: ToolDef[] = [
  {
    id: 'piano-video-2-midi',
    name: 'piano-video-2-midi',
    github: 'https://github.com/Adelost/piano-video-2-midi',
    badge: { es: '🎮 Synthesia · 100 % exacto', en: '🎮 Synthesia · 100 % accurate' },
    videoTypes: ['synthesia'],
    stars: 5,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 5 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 0 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 0 },
    ],
    description: {
      es: 'Lee visualmente los píxeles del video — no interpreta audio. Perfecto cuando el video muestra notas de colores cayendo al estilo Synthesia.',
      en: 'Reads pixels from the video visually — no audio interpretation. Perfect when the video shows colored falling notes Synthesia-style.',
    },
    limitation: {
      es: 'Solo funciona con videos que muestren las teclas o notas en color. Completamente inútil con grabaciones reales.',
      en: 'Only works with videos showing colored keys or notes. Completely useless on real recordings.',
    },
    requires: 'Python 3.8+ · ffmpeg · OpenCV',
    time: { es: '~1 min por 10 min de video', en: '~1 min per 10 min of video' },
    getCommand: (url) =>
      `# Instalar dependencias
pip install piano-video-2-midi yt-dlp

# Descargar el video
yt-dlp -f "bestvideo[ext=mp4]+bestaudio/best" \\
  "${url || 'URL_DEL_VIDEO'}" -o video.mp4

# Extraer MIDI
piano-video-2-midi video.mp4 output.mid

echo "✅  Guardado: output.mid"`,
  },

  {
    id: 'desynthesia',
    name: 'DeSynthesia',
    github: 'https://github.com/kevinlinxc/DeSynthesia',
    badge: { es: '🎮 Synthesia · + partitura', en: '🎮 Synthesia · + sheet music' },
    videoTypes: ['synthesia'],
    stars: 4,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 4 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 0 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 0 },
    ],
    description: {
      es: 'Usa OpenCV para detectar colores de teclas en videos Synthesia. Además del MIDI, puede generar una partitura básica.',
      en: 'Uses OpenCV to detect key colors in Synthesia videos. In addition to MIDI, it can generate a basic score.',
    },
    limitation: {
      es: 'Puede requerir calibración manual del color si el video usa paletas no estándar.',
      en: 'May require manual color calibration if the video uses non-standard palettes.',
    },
    requires: 'Python 3.8+ · OpenCV · ffmpeg',
    time: { es: '~2 min por 10 min de video', en: '~2 min per 10 min of video' },
    getCommand: (url) =>
      `# Clonar e instalar
git clone https://github.com/kevinlinxc/DeSynthesia
cd DeSynthesia
pip install -r requirements.txt

# Descargar el video
yt-dlp -f "bestvideo[ext=mp4]+bestaudio/best" \\
  "${url || 'URL_DEL_VIDEO'}" -o video.mp4

# Ejecutar
python main.py --input video.mp4 --output output.mid`,
  },

  {
    id: 'piano-transcription',
    name: 'piano_transcription_inference',
    github: 'https://github.com/qiuqiangkong/piano_transcription_inference',
    badge: { es: '🎼 Piano solo · Máxima precisión', en: '🎼 Solo piano · Top accuracy' },
    videoTypes: ['recording'],
    stars: 5,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 0 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 5 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 2 },
      { label: { es: 'Cualquier instrumento', en: 'Any instrument' }, score: 1 },
    ],
    description: {
      es: 'Modelo de ByteDance entrenado exclusivamente en piano. Detecta onsets, offsets, velocity y pedal con alta fidelidad. El estándar de referencia para grabaciones de piano solo.',
      en: "ByteDance's model trained exclusively on piano. Detects onsets, offsets, velocity and pedal with high fidelity. The reference standard for solo piano recordings.",
    },
    limitation: {
      es: 'Solo para piano acústico/eléctrico solo. Pierde mucha precisión con acompañamiento, batería u otros instrumentos en la mezcla.',
      en: 'Solo acoustic/electric piano only. Loses much accuracy with accompaniment, drums, or other instruments in the mix.',
    },
    requires: 'Python 3.8+ · PyTorch · GPU recomendada (10× más rápido)',
    time: { es: '~8× duración en CPU · ~2× en GPU', en: '~8× duration on CPU · ~2× on GPU' },
    getCommand: (url) =>
      `# Instalar
pip install piano_transcription_inference yt-dlp

# Descargar solo el audio en WAV
yt-dlp -x --audio-format wav --audio-quality 0 \\
  "${url || 'URL_DEL_VIDEO'}" -o audio.wav

# Transcribir a MIDI
python3 -c "
from piano_transcription_inference import PianoTranscription, load_audio
audio, sr = load_audio('audio.wav', mono=True, target_sr=16000)
# Cambiar 'cpu' por 'cuda' si tienes GPU NVIDIA
tr = PianoTranscription(device='cpu')
tr.transcribe(audio, 'output.mid')
print('✅  Guardado: output.mid')
"`,
  },

  {
    id: 'transkun',
    name: 'Transkun',
    github: 'https://github.com/Yujia-Yan/Transkun',
    badge: { es: '🔬 ISMIR 2024 · Transformer', en: '🔬 ISMIR 2024 · Transformer' },
    videoTypes: ['recording'],
    stars: 5,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 0 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 5 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 3 },
      { label: { es: 'Cualquier instrumento', en: 'Any instrument' }, score: 1 },
    ],
    description: {
      es: 'Estado del arte académico (ISMIR 2024). Arquitectura transformer con mejor rendimiento que piano_transcription en piezas complejas. Publicado como paper revisado por pares.',
      en: 'Academic state of the art (ISMIR 2024). Transformer architecture with better performance than piano_transcription on complex pieces. Published as a peer-reviewed paper.',
    },
    limitation: {
      es: 'Instalación más compleja. Requiere GPU para tiempos razonables. Documentación de uso menos amigable que otras opciones.',
      en: 'More complex installation. Requires GPU for reasonable processing times. Less user-friendly documentation.',
    },
    requires: 'Python 3.8+ · PyTorch · CUDA recomendada',
    time: { es: '~3× duración en GPU', en: '~3× duration on GPU' },
    getCommand: (url) =>
      `# Instalar
pip install transkun yt-dlp

# Descargar audio
yt-dlp -x --audio-format wav --audio-quality 0 \\
  "${url || 'URL_DEL_VIDEO'}" -o audio.wav

# Transcribir
python3 -c "
import transkun
model = transkun.load_model('transkun')
notes = model.transcribe('audio.wav')
transkun.save_midi(notes, 'output.mid')
print('✅  Guardado: output.mid')
"`,
  },

  {
    id: 'basic-pitch',
    name: 'Basic Pitch',
    github: 'https://github.com/spotify/basic-pitch',
    badge: { es: '🎵 Cualquier instrumento · Online', en: '🎵 Any instrument · Online' },
    videoTypes: ['recording'],
    stars: 3,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 0 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 3 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 3 },
      { label: { es: 'Cualquier instrumento', en: 'Any instrument' }, score: 4 },
    ],
    description: {
      es: 'De Spotify. El más versátil: funciona con guitarra, voz, sintetizadores y piano. Tiene versión web sin instalar nada. Buena opción si no quieres instalar Python.',
      en: "From Spotify. The most versatile: works with guitar, voice, synths and piano. Has a web version with no installation needed. Good option if you don't want to install Python.",
    },
    limitation: {
      es: 'Menos preciso que piano_transcription en piano solo. Diseñado para uso general, no optimizado para piano clásico.',
      en: 'Less accurate than piano_transcription on solo piano. Designed for general use, not optimized for classical piano.',
    },
    requires: 'Python 3.7+ · CPU suficiente  — o usa la web',
    time: { es: '~1× duración (muy rápido)', en: '~1× duration (very fast)' },
    online: 'https://basicpitch.spotify.com',
    getCommand: (url) =>
      `# Instalar
pip install basic-pitch yt-dlp

# Descargar audio
yt-dlp -x --audio-format mp3 --audio-quality 0 \\
  "${url || 'URL_DEL_VIDEO'}" -o audio.mp3

# Transcribir (genera MIDI + CSV en ./output_midi/)
basic-pitch ./output_midi/ audio.mp3

echo "✅  MIDI en: ./output_midi/"

# ─────────────────────────────────────────────
# Sin instalar nada → https://basicpitch.spotify.com
# (sube el MP3 descargado con yt-dlp)`,
  },

  {
    id: 'oh-sheet',
    name: 'Oh-Sheet',
    github: 'https://github.com/Oh-Sheet-Team/oh-sheet',
    badge: { es: '⚡ Pipeline completo · PDF + MIDI', en: '⚡ Full pipeline · PDF + MIDI' },
    videoTypes: ['recording'],
    stars: 4,
    qualityRows: [
      { label: { es: 'Tutorial Synthesia', en: 'Synthesia tutorial' }, score: 0 },
      { label: { es: 'Piano solo (grabación)', en: 'Solo piano (recording)' }, score: 4 },
      { label: { es: 'Con acompañamiento', en: 'With accompaniment' }, score: 3 },
      { label: { es: 'Cualquier instrumento', en: 'Any instrument' }, score: 3 },
    ],
    description: {
      es: 'Acepta el link de YouTube directamente. Pipeline completo: descarga → Demucs (separa pistas) → Basic Pitch (transcribe) → MIDI + PDF de partitura lista para imprimir.',
      en: 'Accepts the YouTube link directly. Full pipeline: download → Demucs (stem separation) → Basic Pitch (transcribe) → MIDI + print-ready sheet music PDF.',
    },
    limitation: {
      es: 'El más lento (separación de pistas tarda). Requiere más espacio en disco y dependencias pesadas (Demucs).',
      en: 'The slowest (stem separation takes time). Requires more disk space and heavy dependencies (Demucs).',
    },
    requires: 'Python 3.9+ · ffmpeg · Demucs (~1 GB)',
    time: { es: '~5–15 min por canción', en: '~5–15 min per song' },
    getCommand: (url) =>
      `# Clonar e instalar (primera vez, tarda por Demucs)
git clone https://github.com/Oh-Sheet-Team/oh-sheet
cd oh-sheet
pip install -e .

# Ejecutar con la URL directamente
# → genera MIDI + PDF de partitura en ./output/
python -m ohsheet \\
  --url "${url || 'URL_DEL_VIDEO'}" \\
  --output ./output/

echo "✅  MIDI y partitura en: ./output/"`,
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'text-yellow-400' : 'text-slate-700'}>★</span>
      ))}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const color =
    score === 0 ? 'bg-slate-700' :
    score <= 2  ? 'bg-almost/80' :
    score <= 3  ? 'bg-brand-400' :
                  'bg-correct';
  return (
    <div className="h-2 w-full rounded-full bg-slate-800">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  }
  return (
    <button onClick={copy} className="btn-ghost py-1 px-3 text-xs">
      {done ? `✓ ${t('miditools.copied')}` : `📋 ${t('miditools.copyCommand')}`}
    </button>
  );
}

interface ToolCardProps {
  tool: ToolDef;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
}
function ToolCard({ tool, lang, selected, onSelect }: ToolCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`card flex flex-col gap-3 cursor-pointer transition-all ${
        selected
          ? 'ring-2 ring-brand-500 bg-brand-500/5'
          : 'hover:border-slate-600'
      }`}
      onClick={onSelect}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-mono font-bold text-sm">{tool.name}</h3>
          <span className="text-xs text-slate-400">{tool.badge[lang]}</span>
        </div>
        <Stars n={tool.stars} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed">{tool.description[lang]}</p>

      {/* Quality bars */}
      <div className="flex flex-col gap-1.5">
        {tool.qualityRows.map((row) => (
          <div key={row.label.es} className="grid grid-cols-[1fr_auto_80px] items-center gap-2 text-xs">
            <span className="text-slate-400 truncate">{row.label[lang]}</span>
            <span className="text-slate-500 tabular-nums w-4 text-right">
              {row.score === 0 ? '✕' : row.score}
            </span>
            <ScoreBar score={row.score} />
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="chip bg-slate-800 text-slate-400">⏱ {tool.time[lang]}</span>
        {tool.online && (
          <a
            href={tool.online}
            target="_blank"
            rel="noopener noreferrer"
            className="chip bg-correct/15 text-correct"
            onClick={(e) => e.stopPropagation()}
          >
            🌐 {t('miditools.openOnline')}
          </a>
        )}
      </div>

      {/* Limitation */}
      <p className="text-xs text-slate-500 border-t border-slate-800 pt-2">
        ⚠ {tool.limitation[lang]}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <a
          href={tool.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          GitHub ↗
        </a>
        <button
          className={`py-0.5 px-3 text-xs rounded font-semibold transition-colors ${
            selected
              ? 'bg-brand-500 text-white'
              : 'btn-ghost'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          {selected ? `✓ ${t('miditools.selected')}` : t('miditools.useThisTool')}
        </button>
      </div>
    </div>
  );
}

// ── Comparison matrix ─────────────────────────────────────────────────────────

function ComparisonMatrix({ tools, lang }: { tools: ToolDef[]; lang: Lang }) {
  const { t } = useTranslation();
  if (tools.length === 0) return null;
  const rows = tools[0].qualityRows.map((r) => r.label);
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {t('miditools.qualityMatrix')}
      </p>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-1 pr-4 text-slate-400 font-normal">
              {t('miditools.scenario')}
            </th>
            {tools.map((tool) => (
              <th key={tool.id} className="py-1 px-2 text-center text-slate-300 font-mono font-normal">
                {tool.name.split('_')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((label, ri) => (
            <tr key={label.es} className="border-t border-slate-800">
              <td className="py-1.5 pr-4 text-slate-400">{label[lang]}</td>
              {tools.map((tool) => {
                const score = tool.qualityRows[ri]?.score ?? 0;
                return (
                  <td key={tool.id} className="py-1.5 px-2 text-center">
                    {score === 0 ? (
                      <span className="text-slate-700">✕</span>
                    ) : (
                      <span className={
                        score >= 5 ? 'text-correct font-bold' :
                        score >= 4 ? 'text-correct' :
                        score >= 3 ? 'text-brand-400' :
                                     'text-almost'
                      }>
                        {'★'.repeat(score)}{'☆'.repeat(5 - score)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function MidiToolsPage() {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.language) as Lang;

  const [url, setUrl] = useState('');
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ytId = useMemo(() => extractYtId(url), [url]);
  const isValidUrl = ytId !== null;

  const filteredTools = useMemo(
    () => (videoType ? TOOLS.filter((tool) => tool.videoTypes.includes(videoType)) : []),
    [videoType],
  );

  const selectedTool = TOOLS.find((tool) => tool.id === selectedId) ?? null;
  const command = selectedTool ? selectedTool.getCommand(url) : '';

  function handleTypeChange(type: VideoType) {
    setVideoType(type);
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ── Hero ── */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">🎥 {t('miditools.title')}</h1>
        <p className="text-slate-400 max-w-2xl">{t('miditools.subtitle')}</p>
      </header>

      {/* ── Step 1: URL ── */}
      <section className="card flex flex-col gap-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
          {t('miditools.step1')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder={t('miditools.urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder-slate-600 focus:border-brand-500 focus:outline-none"
            />
            {url && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isValidUrl ? 'text-correct' : 'text-wrong'}`}>
                {isValidUrl ? '✓' : '✕'}
              </span>
            )}
          </div>
          {ytId && (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src={ytThumb(ytId)}
                alt="YouTube thumbnail"
                className="h-14 w-24 rounded object-cover border border-slate-700 hover:opacity-80 transition-opacity"
              />
            </a>
          )}
        </div>
        {!isValidUrl && url.length > 5 && (
          <p className="text-xs text-wrong">{t('miditools.invalidUrl')}</p>
        )}
      </section>

      {/* ── Step 2: Video type ── */}
      <section className="card flex flex-col gap-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
          {t('miditools.step2')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Synthesia */}
          <button
            onClick={() => handleTypeChange('synthesia')}
            className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
              videoType === 'synthesia'
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-3xl">🎮</div>
            <div>
              <p className="font-bold">{t('miditools.synthesia')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('miditools.synthesiaDesc')}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['Synthesia', 'Piano Teacher', 'Tutorial'].map((tag) => (
                <span key={tag} className="chip bg-brand-500/15 text-brand-300 text-xs">{tag}</span>
              ))}
            </div>
          </button>

          {/* Recording */}
          <button
            onClick={() => handleTypeChange('recording')}
            className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
              videoType === 'recording'
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-3xl">🎼</div>
            <div>
              <p className="font-bold">{t('miditools.recording')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('miditools.recordingDesc')}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {[t('miditools.tagConcert'), t('miditools.tagCover'), 'Live'].map((tag) => (
                <span key={tag} className="chip bg-slate-700/60 text-slate-300 text-xs">{tag}</span>
              ))}
            </div>
          </button>
        </div>
      </section>

      {/* ── Step 3: Tool cards ── */}
      {videoType && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
            {t('miditools.step3')}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                lang={lang}
                selected={tool.id === selectedId}
                onSelect={() => setSelectedId(tool.id === selectedId ? null : tool.id)}
              />
            ))}
          </div>

          {/* Comparison matrix */}
          {filteredTools.length > 1 && (
            <div className="card mt-2">
              <ComparisonMatrix tools={filteredTools} lang={lang} />
            </div>
          )}
        </section>
      )}

      {/* ── Step 4: Command panel ── */}
      {selectedTool && (
        <section className="card flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
              {t('miditools.step4')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="chip bg-slate-800 text-slate-400 text-xs">
                🐍 {t('miditools.requiresPython')}
              </span>
              <CopyBtn text={command} />
            </div>
          </div>

          {!isValidUrl && (
            <p className="text-xs text-slate-500 italic">{t('miditools.noUrl')}</p>
          )}

          <pre className="overflow-x-auto rounded-lg bg-slate-900 border border-slate-800 p-4 text-xs leading-relaxed text-slate-200 font-mono whitespace-pre">
            {command}
          </pre>

          {selectedTool.online && (
            <div className="flex items-center gap-2 rounded-lg bg-correct/10 border border-correct/20 p-3">
              <span className="text-correct text-lg">🌐</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-correct">{t('miditools.onlineAlt')}</p>
                <p className="text-xs text-slate-400">{t('miditools.onlineAltDesc')}</p>
              </div>
              <a
                href={selectedTool.online}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost py-1 px-3 text-xs shrink-0"
              >
                {t('miditools.openOnline')} ↗
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── Requires row ── */}
      {selectedTool && (
        <section className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>📦 {t('miditools.requires')}: <span className="text-slate-400">{selectedTool.requires}</span></span>
          <span>·</span>
          <a
            href="https://www.python.org/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            {t('miditools.getPython')} ↗
          </a>
        </section>
      )}

      {/* ── Disclaimer ── */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500 leading-relaxed">
        <strong className="text-slate-400">{t('miditools.disclaimerTitle')}:</strong>{' '}
        {t('miditools.disclaimerBody')}
      </div>
    </div>
  );
}
