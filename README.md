# 🎹 PianoLab

> Aprende piano en el navegador: teoría interactiva, validación por micrófono, digitación guiada y repertorio de práctica.
> Learn piano in the browser: interactive theory, microphone validation, guided fingering and a practice repertoire.

PianoLab es una app web **open-source** y **100% local** (tu audio nunca sale del navegador) para dar tus primeros pasos en el piano. /
PianoLab is an **open-source**, **100% local** web app (your audio never leaves the browser) to take your first steps on the piano.

---

## ✨ Características / Features

- 📖 **Teoría interactiva** — lecciones bilingües (ES/EN) sobre el teclado, la escala mayor y los acordes, con demos sonoras y mini-quizzes.
- 🎤 **Validación por micrófono** — toca tu piano real y la app detecta el tono con [Pitchy](https://github.com/ianprime0509/pitchy) (McLeod Pitch Method). Incluye afinador en vivo.
- 🖐️ **Digitación guiada** — indicadores de dedo 1–5 sobre las teclas y en las partituras.
- 🎯 **Retos progresivos** — encuentra la nota, escala de Do mayor, entrenamiento auditivo, acordes y melodías, con feedback, pistas y reinicio.
- ⭐ **Notas que caen** — práctica estilo Synthesia con *modo espera* (Canvas).
- 🎼 **Repertorio** — piezas de dominio público (incl. **Chopin, Nocturne Op. 9 No. 2**, Beethoven) y arreglos **a dos manos**, con tempo ajustable, bucle y selección de mano. Además puedes **importar tus propios archivos MIDI** (la vía recomendada para partituras completas exactas).
- 🎮 **Gamificación** — XP, niveles, estrellas y racha diaria (guardado local).
- 🌗 Tema claro/oscuro · 🌍 Español / English · 🎹 Entrada por clic, teclado del PC, micrófono o **teclado MIDI** (Web MIDI).

---

## 🚀 Empezar / Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción
npm test         # tests (Vitest)
```

> Requiere Node 20+ y un navegador con Web Audio. Para la validación por micrófono, concede el permiso cuando el navegador lo solicite.

---

## 🧱 Stack

| Área | Tecnología |
|------|-----------|
| UI | React 19 · Vite · TypeScript · Tailwind CSS |
| Sonido | [Tone.js](https://tonejs.github.io/) (samples Salamander Grand Piano, CC-BY) |
| Detección de tono | [Pitchy](https://github.com/ianprime0509/pitchy) |
| Partituras | [VexFlow](https://www.vexflow.com/) |
| Notas cayendo | Canvas 2D |
| MIDI | [@tonejs/midi](https://github.com/Tonejs/Midi) · Web MIDI API |
| Estado | [Zustand](https://github.com/pmndrs/zustand) |
| i18n | [i18next](https://www.i18next.com/) |

---

## 📁 Estructura / Structure

```
src/
  audio/        # notes, Tone.js engine, pitch detection, MIDI import/input
  components/   # Piano (SVG), FallingNotes (Canvas), Notation (VexFlow), MicMeter, Feedback, Layout
  features/     # home, theory, challenges, repertoire, progress
  data/         # lessons, challenges, scales, chords, songs/
  state/        # Zustand stores (settings, progress, ui, imported songs)
  i18n/         # locales es/en
  types/        # music & song types
```

---

## 🔒 Privacidad / Privacy

La detección por micrófono usa la Web Audio API y se procesa **íntegramente en tu dispositivo**. No se graba ni se envía audio a ningún servidor. /
Microphone detection uses the Web Audio API and is processed **entirely on your device**. No audio is recorded or sent to any server.

---

## ⚖️ Licencia y contenido musical / License & musical content

El **código** se distribuye bajo licencia [MIT](./LICENSE). /
The **source code** is released under the [MIT](./LICENSE) license.

Sobre el **repertorio** / About the **repertoire**:

- Las piezas clásicas (p. ej. **Chopin – Nocturne Op. 9 No. 2**, Beethoven) son de **dominio público**.
- Los arreglos a dos manos de obras modernas (**Interstellar – Main Theme**, Hans Zimmer; **Her – “Photograph”**, Arcade Fire) se incluyen **solo con fines personales/educativos**; los derechos pertenecen a sus respectivos titulares. Son arreglos hechos a mano (no la partitura oficial completa); para una versión exacta, usa el importador de MIDI.

Los samples de piano son del [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) (CC-BY 3.0), servidos vía el CDN de Tone.js.

---

Hecho con 🎶 para aprender. / Made with 🎶 for learning.
