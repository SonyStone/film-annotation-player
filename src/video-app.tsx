import { createMemo, createSignal, Show } from 'solid-js';

import { Frame } from './interfaces/Frame';
import { createVideoHandler } from './media-handler';
import { onHold } from './utils/onHold';

import { For } from 'solid-js';

import { createShortcut } from '@solid-primitives/keyboard';
import { effect } from 'solid-js/web';
import { createAnnotation } from './annotation';
import { createCanvasHandler } from './canvas';
import { EXAMPLE_VIDEOS } from './example-videos';
import EraserIcon from './icons/eraser.svg';
import FastForwardIcon from './icons/fast-forward.svg';
import FastRewindIcon from './icons/fast-rewind.svg';
import PauseIcon from './icons/pause.svg';
import PenIcon from './icons/pen.svg';
import PlayIcon from './icons/play.svg';
import RedoIcon from './icons/redo.svg';
import SaveIcon from './icons/save.svg';
import SkipNextIcon from './icons/skip-next.svg';
import SkipPreviousIcon from './icons/skip-previous.svg';
import UndoIcon from './icons/undo.svg';
import { COMPOSITE_OPERATIONS } from './interfaces/CompositeOperations';
import { FRAME_RATES } from './interfaces/FrameRate';
import Rewind from './rewind';
import Timeline from './timeline';
import { createFileDrop } from './utils/file-drop';

declare module 'solid-js' {
  namespace JSX {
    interface ExplicitAttributes {
      type: string;
    }
  }
}

export function VideoApp() {
  const [
    {
      currentFrame,
      totalFrames,
      progressFramse,
      src,
      dimentions,
      isPlaying,
      volume,
      playbackRate,
      currentTimecode,
      fps,
      resize
    },
    {
      setSrc,
      setFps,
      nextFrame,
      previousFrame,
      setPlaybackRate,
      setVolume,
      setMedia,
      setCurrentFrame,
      play,
      pause,
      playPause
    }
  ] = createVideoHandler();
  const [
    { resizeTo, brushSize, brushColor, brushComposite, currentImage },
    { setCanvas, setBrushComposite, setBrushColor, setBrushSize, setCurrentImage }
  ] = createCanvasHandler({
    size: resize
  });

  const onWaiting = () => console.log(`Playback has stopped because of a temporary lack of data`);

  const [rewind, setRewind] = createSignal<number>(0);

  const { over, files, setElement } = createFileDrop();

  const videoFile = createMemo<File | undefined>((file) => files().find(isVideoFile) || file);
  const commentFile = createMemo<File | undefined>((file) => files().find(isJsonFile) || file);

  const [{ currentAnnotation }, { save, add }] = createAnnotation({ currentFrame, dimentions });

  effect(() => {
    add(currentImage());
  });
  effect(() => {
    console.log(`currentAnnotation`, currentAnnotation());
    setCurrentImage(currentAnnotation()?.image);
  });

  const fileSrc = createMemo(() => {
    const file = videoFile();
    return file ? URL.createObjectURL(file) : undefined;
  });

  const [isOpen, setIsOpen] = createSignal(true);

  createShortcut(['Control', 'Z'], () => {
    console.log(`undo!`);
  });
  createShortcut(['Control', 'Y'], () => {
    console.log(`redo!`);
  });
  createShortcut(['P'], playPause);
  createShortcut([' '], playPause);
  createShortcut(['ArrowRight'], nextFrame);
  createShortcut(['ArrowLeft'], previousFrame);

  onHold;

  return (
    <div class="border-coolgray relative box-border flex overflow-hidden rounded-sm border border-solid">
      <div class={['box-border flex w-full flex-col transition-all', isOpen() ? 'mr-360px' : 'mr-0'].join(' ')}>
        <div
          class="box-border flex flex-col place-content-center overflow-hidden bg-black"
          onWheel={(event) => {
            if (event.deltaY > 0) {
              nextFrame();
            } else {
              previousFrame();
            }
          }}
        >
          <div class="relative max-h-full max-w-full transform-gpu place-self-center" ref={setElement}>
            <canvas
              class="z-1 absolute inset-0 cursor-crosshair touch-none"
              ref={setCanvas}
              style={{
                transform: resizeTo()
              }}
              width={dimentions().width}
              height={dimentions().height}
            />
            <video
              ref={setMedia}
              src={fileSrc() ?? src()}
              class="max-h-full max-w-full touch-none"
              controls={false}
              attr:type="video/mp4"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1 overflow-hidden p-2">
          <div class="flex gap-1">
            <div class="border-coolgray max-w-40px w-40px flex place-content-center place-items-center overflow-hidden border border-solid p-2">
              <span class="font-mono">{currentFrame()}f</span>
            </div>
            <Timeline
              currentFrame={currentFrame()}
              totalFrames={totalFrames()}
              setCurrentFrame={setCurrentFrame}
              pause={pause}
              progress={progressFramse()}
            />
          </div>

          <div class="flex flex-wrap justify-center gap-1">
            <button class="p-0.5" onClick={save}>
              <SaveIcon />
            </button>

            <button class="p-0.5">
              <UndoIcon />
            </button>
            <button class="p-0.5">
              <RedoIcon />
            </button>

            <div class="flex-1"></div>

            <button class="p-0.5" onClick={() => setCurrentFrame(0 as Frame)}>
              <SkipPreviousIcon />
            </button>
            <button
              class="p-0.5"
              use:onHold={() => setCurrentFrame((currentFrame() - 1) as Frame)}
              onClick={() => setCurrentFrame((currentFrame() - 1) as Frame)}
            >
              <FastRewindIcon />
            </button>
            <Show
              when={isPlaying()}
              fallback={
                <button onClick={() => play()}>
                  <PlayIcon />
                </button>
              }
            >
              <button class="p-0.5" onClick={() => pause()}>
                <PauseIcon />
              </button>
            </Show>

            <button
              class="p-0.5"
              use:onHold={() => setCurrentFrame((currentFrame() + 1) as Frame)}
              onClick={() => setCurrentFrame((currentFrame() + 1) as Frame)}
            >
              <FastForwardIcon></FastForwardIcon>
            </button>
            <button class="p-0.5" onClick={() => setCurrentFrame(totalFrames() as Frame)}>
              <SkipNextIcon />
            </button>

            <div class="flex-1"></div>

            <button
              class="p-0.5"
              onClick={() => setBrushComposite(COMPOSITE_OPERATIONS[0])}
              disabled={brushComposite() === COMPOSITE_OPERATIONS[0]}
            >
              <PenIcon />
            </button>

            <button
              class="p-0.5"
              onClick={() => setBrushComposite(COMPOSITE_OPERATIONS[1])}
              disabled={brushComposite() === COMPOSITE_OPERATIONS[1]}
            >
              <EraserIcon />
            </button>

            <input
              type="color"
              class="h-unset"
              value={brushColor()}
              onInput={(e) => setBrushColor((e.target as any).value)}
            />

            <input
              type="range"
              min={0.1}
              max={50}
              value={brushSize()}
              onInput={(e) => setBrushSize(parseFloat((e.target as any).value))}
            />
          </div>

          <span class="flex gap-4">
            <span class="font-mono">
              {currentTimecode().suffix < 0 ? '-' : ' '}
              {formatTimeItem(currentTimecode().hours)}:{formatTimeItem(currentTimecode().minutes)}:
              {formatTimeItem(currentTimecode().seconds)}:{formatTimeItem(currentTimecode().frames)}
            </span>
            <span class="font-mono">
              {currentFrame()}/{totalFrames()}
            </span>
          </span>

          <div>
            <label for="volume">Volume:</label>
            <input
              name="volume"
              type="range"
              class="touch-none"
              min={0}
              max={1}
              step={0.01}
              value={volume()}
              onInput={(e) => setVolume(parseFloat((e.target as any).value))}
            />
          </div>

          <div>
            <label for="playbackRate">Playback Rate:</label>
            <input
              name="playbackRate"
              type="range"
              min={0}
              max={8}
              step={0.01}
              value={playbackRate()}
              onInput={(e) => setPlaybackRate(parseFloat((e.target as any).value))}
            />
            <button class="p-0.5" onClick={() => setPlaybackRate(0.5)}>
              0.5
            </button>
            <button class="p-0.5" onClick={() => setPlaybackRate(1)}>
              1.0
            </button>
            <button class="p-0.5" onClick={() => setPlaybackRate(1.5)}>
              1.5
            </button>
          </div>

          <div>
            <Rewind rewind={rewind()} currentFrame={currentFrame()} onCurrentFrame={setCurrentFrame} />
            <label for="rewind">Rewind:</label>
            <input
              name="rewind"
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={rewind()}
              onInput={(e) => {
                setRewind(parseFloat((e.target as any).value));
              }}
              onPointerUp={(e) => {
                setTimeout(() => {
                  setRewind(0);
                }, 0);
              }}
            />
          </div>

          <span>
            Is playing: <b>{`${isPlaying()}`}</b>
          </span>
          <div class="flex flex-wrap gap-1">
            <span>
              Frame rate: <b>{fps()}</b>
            </span>
            <select value={fps()} onChange={(e) => setFps((e.target as any).value)}>
              <For each={FRAME_RATES}>{(item) => <option value={item.value}>{item.name}</option>}</For>
            </select>
            <input type="number" min={0} max={9000} value={fps()} onInput={(e) => setFps((e.target as any).value)} />
          </div>
          <div class="flex flex-wrap gap-1">
            <span>Videos: </span>
            <select
              value={src()}
              onChange={(e) => {
                setSrc((e.target as any).value);
              }}
            >
              <For each={EXAMPLE_VIDEOS}>{(item) => <option value={item.value}>{item.name}</option>}</For>
            </select>
          </div>

          <div class="flex flex-wrap gap-1"></div>
        </div>
      </div>

      <div
        class={[
          'w-360px  bg-#eeeeee border-l-solid border-coolgray absolute inset-y-0 right-10 box-border box-border flex flex-col border transition-transform',
          isOpen() ? 'translate-x-0%  ' : 'translate-x-100%'
        ].join(' ')}
      >
        <div id="chat-header" class="box-border box-border grid grid-cols-[0.6fr_0.4fr] gap-2 p-2">
          <div class="flex w-full gap-2">
            <span class="border-coolgray flex-1 border border-solid p-2">ABR_Ep01_010</span>
            <span class="w-40px border-coolgray border border-solid p-2 text-center">v01</span>
          </div>
          <span class="border-coolgray border border-solid p-2 text-center">Comp</span>
          <span class="border-coolgray border border-solid p-2 text-center">Дмитрий Корников</span>
          <span class="border-coolgray border border-solid p-2 text-center">В разработке</span>
        </div>
        <div id="chat" class="box-border flex flex-1 flex-col gap-2 overflow-y-scroll p-2">
          <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}>
            {(item) => (
              <div id="chat-comment" class="min-h-4 box-border flex w-full flex-[0_0_auto] gap-2 p-2">
                <div class="w-40px h-40px box-border flex place-content-center place-items-center rounded-full bg-white">
                  A
                </div>
                <div class="box-border flex-1 rounded bg-white p-2 text-black">Comment</div>
              </div>
            )}
          </For>
        </div>
        <div id="input" class="box-border flex w-full p-2">
          <input class="h-10 flex-1" />
          <button>send</button>
        </div>
      </div>
      <div class="bg-#eeeeee z-1 border-coolgray min-w-10 border-l-solid box-border flex w-10 flex-col border">
        <button
          class="border-b-solid border-coolgray box-border h-10 border border-none bg-transparent text-black"
          onClick={() => setIsOpen(!isOpen())}
        >
          T
        </button>
      </div>
    </div>
  );
}

function formatTimeItem(item: number): string {
  return item < 10 ? `0${item}` : `${item}`;
}

function isVideoFile(file: File) {
  return file.type === 'video/mp4' || file.type === 'video/webm';
}

function isJsonFile(file: File) {
  return file.type === 'application/json';
}
