import { createMemo } from 'solid-js';
import { Frame } from './interfaces/Frame';
import { VIDEO_TIME_PRECISION } from './interfaces/VideoTime';

export function Timecode(props: { currentFrame: Frame; frameSize: number }) {
  const currentTimecode = createMemo(() => framesToTimecode(props.currentFrame, props.frameSize));

  return (
    <>
      {currentTimecode().suffix < 0 ? '-' : ' '}
      {formatTimeItem(currentTimecode().hours)}:{formatTimeItem(currentTimecode().minutes)}:
      {formatTimeItem(currentTimecode().seconds)}:{formatTimeItem(currentTimecode().frames)}
    </>
  );
}

function formatTimeItem(item: number): string {
  return item < 10 ? `0${item}` : `${item}`;
}

function framesToTimecode(frame: Frame, frameSize: number) {
  const absFrame = Math.abs(frame);
  const suffix = frame < 0 ? -1 : 1;
  const time = (absFrame * frameSize) / VIDEO_TIME_PRECISION;

  const hours = Math.floor(time / 3600) % 24;
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time % 60);
  const frames = Math.floor(absFrame % (VIDEO_TIME_PRECISION / frameSize));

  return {
    suffix,
    hours,
    minutes,
    seconds,
    frames
  } as const;
}
