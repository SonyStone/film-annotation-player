import { createMemo, createSignal, Show } from 'solid-js';

import { Frame } from './interfaces/Frame';
import { createVideoHandler } from './media-handler';
import { onHold } from './utils/onHold';

import { For } from 'solid-js';

import { createShortcut } from '@solid-primitives/keyboard';
import { cursorEllipse } from '@utils/cursor-ellipse';
import { createStore } from 'solid-js/store';
import { effect } from 'solid-js/web';
import { Annotation, createAnnotation } from './annotation';
import { createCanvasHandler } from './canvas-handler';
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
import { Sidebar } from './sidebar.component';
import { Timecode } from './timecode.component';
import Timeline from './timeline.component';
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
      frameSize,
      progressFramse,
      src,
      dimentions,
      isPlaying,
      volume,
      playbackRate,
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

  const state = createStore<{
    currentFrame: Frame;
    currentImage: ImageData | undefined;
    annotations: { [key: Frame]: Annotation };
  }>({
    currentFrame: 0,
    currentImage: undefined,
    annotations: {}
  });

  const onWaiting = () => console.log(`Playback has stopped because of a temporary lack of data`);

  const [rewind, setRewind] = createSignal<number>(0);

  const { over, files, setFileDropElement } = createFileDrop();

  const videoFile = createMemo<File | undefined>((file) => files().find(isVideoFile) || file);
  const commentFile = createMemo<File | undefined>((file) => files().find(isJsonFile) || file);

  const [{ currentAnnotation, currentComments, history }, { save, addImage, addComment }] = createAnnotation({
    currentFrame,
    dimentions,
    setCurrentFrame
  });

  effect(() => {
    const image = currentImage();
    addImage(currentImage());
  });
  effect(() => {
    const image = currentAnnotation()?.image;
    setCurrentImage(image);
  });

  const fileSrc = createMemo(() => {
    const file = videoFile();
    return file ? URL.createObjectURL(file) : undefined;
  });

  let [isOpen, setIsOpen] = createSignal(false);

  createShortcut(['Control', 'Z'], history.undo);
  createShortcut(['Control', 'Y'], history.redo);
  createShortcut(['P'], playPause);
  createShortcut([' '], playPause);
  createShortcut(['ArrowRight'], nextFrame);
  createShortcut(['ArrowLeft'], previousFrame);

  onHold;

  const { cursor } = cursorEllipse({ brushSize });

  return (
    <div class="border-coolgray relative box-border flex overflow-hidden rounded-sm border border-solid">
      <div class={['box-border flex w-full flex-col transition-all', isOpen() ? 'mr-360px' : 'mr-0'].join(' ')}>
        <div
          class="box-border flex max-h-screen flex-col place-content-center overflow-hidden bg-black"
          ref={setFileDropElement}
          onWheel={(event) => {
            event.preventDefault();
            if (event.deltaY > 0) {
              nextFrame();
            } else {
              previousFrame();
            }
          }}
        >
          <div class="relative flex max-h-full max-w-full transform-gpu place-self-center">
            <canvas
              class="z-1 absolute inset-0 touch-none"
              ref={setCanvas}
              style={{
                transform: resizeTo(),
                cursor: cursor()
              }}
              width={dimentions().width}
              height={dimentions().height}
            />
            <video
              ref={setMedia}
              src={fileSrc() ?? src()}
              class="max-h-[calc(100vh-4rem)] max-w-full touch-none"
              controls={false}
              attr:type="video/mp4"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1 overflow-hidden p-1">
          <Timeline
            currentFrame={currentFrame()}
            totalFrames={totalFrames()}
            setCurrentFrame={setCurrentFrame}
            pause={pause}
            progress={progressFramse()}
          >
            <span class="absolute -bottom-0.5 right-1 font-mono text-sm">
              <Timecode currentFrame={currentFrame()} frameSize={frameSize()} />
            </span>
            <span class="absolute -bottom-0.5 left-1 font-mono text-sm">
              {currentFrame()}f/{totalFrames()}f
            </span>
          </Timeline>

          <div class="flex flex-wrap justify-center gap-1">
            <button class="p-0.5" onClick={save}>
              <SaveIcon />
            </button>

            <button class="p-0.5" disabled={!history.canUndo()} onClick={history.undo}>
              <UndoIcon />
            </button>
            <button class="p-0.5" disabled={!history.canRedo()} onClick={history.redo}>
              <RedoIcon />
            </button>

            <div class="flex-1"></div>

            <button class="p-0.5" onClick={() => setCurrentFrame(0 as Frame)}>
              <SkipPreviousIcon />
            </button>
            <button class="p-0.5" use:onHold={previousFrame} onClick={previousFrame}>
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

            <button class="p-0.5" use:onHold={nextFrame} onClick={nextFrame}>
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

      <Sidebar isOpen={setIsOpen} commnets={currentComments()} addCommnet={addComment} />
    </div>
  );
}

function isVideoFile(file: File) {
  return file.type === 'video/mp4' || file.type === 'video/webm';
}

function isJsonFile(file: File) {
  return file.type === 'application/json';
}
function ellipse(
  arg0: number,
  arg1: number,
  arg2: number,
  radiusY: any,
  rotation: any,
  startAngle: any,
  endAngle: any
) {
  throw new Error('Function not implemented.');
}
