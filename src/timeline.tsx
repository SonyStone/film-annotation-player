import { clamp } from '@utils/clamp';
import { createMemo, createSignal, ErrorBoundary, For } from 'solid-js';

import { Frame } from './interfaces/Frame';
import { TimelinePosition } from './interfaces/TimelinePosition';

import { onDrag } from './utils/onDrag';
import { onResize } from './utils/onResize';

const PADDING = 8 as TimelinePosition;

export default function Timeline(props: {
  totalFrames: Frame;
  currentFrame: Frame;
  progress: (readonly [number, number])[];
  setCurrentFrame: (frame: Frame) => void;
  pause: () => void;
}) {
  const [size, setSize] = createSignal<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const width = createMemo(() => size().width);

  const ratio = createMemo(() => props.totalFrames / (width() - PADDING * 2));

  const position = createMemo(() => (clamp(props.currentFrame, 0, props.totalFrames) / ratio() || 0) + PADDING);

  function getPosition(frame: Frame) {
    return (100 / props.totalFrames) * frame;
  }

  onResize;
  onDrag;

  return (
    <ErrorBoundary fallback={<div>Error in Timeline</div>}>
      <div
        class="border-coolgray relative flex flex-1 touch-none rounded-sm border border-solid p-2"
        use:onResize={setSize}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="30" width="100%">
          <rect
            class="hover:fill-#d4d4d4 fill-#b6b6b680 cursor-e-resize transition"
            x={0}
            y={10}
            height={10}
            width={'100%'}
            onClick={(event) => {
              props.pause();
              const clipPosition = event.offsetX - PADDING;
              const frame = Math.round(clipPosition * ratio()) as Frame;
              props.setCurrentFrame(frame);
            }}
          />

          <For each={props.progress}>
            {(item) => (
              <rect
                class="fill-#ffffffcc pointer-events-none"
                x={getPosition(item[0]) + '%'}
                y={10}
                height={10}
                width={getPosition(item[1] - item[0]) + '%'}
              ></rect>
            )}
          </For>

          <path class="stroke-0.5px stroke-#777" />

          <g class="cursor-e-resize" style={{ transform: `translate(${position()}px)` }}>
            <line class="stroke-1px fill-none stroke-black" x1={0} y1={10} x2={0} y2={20} />
            <rect
              class="fill-#00000000 hover:fill-#00000020 transition"
              use:onDrag={(event) => {
                if (event.type === 'pointerdown') {
                  props.pause();
                }
                const clipPosition = event.offsetX - PADDING;
                const frame = Math.round(clipPosition * ratio()) as Frame;

                props.setCurrentFrame(clamp(frame, 0, props.totalFrames));
              }}
              x={-12}
              y={0}
              height={30}
              width={24}
              rx={4}
            />
          </g>
        </svg>
      </div>
    </ErrorBoundary>
  );
}
