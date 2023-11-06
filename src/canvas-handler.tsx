import { toObservable } from '@utils/to-observable';
import { exhaustMap, first, last, map, of, startWith, switchMap, takeUntil } from 'rxjs';
import { Accessor, createMemo, createSignal, onCleanup } from 'solid-js';
import { effect } from 'solid-js/web';

import { stroke } from './croquis/brush/simple';
import { getStylusState } from './croquis/stylus';
import { pointerdown, pointermove, pointerup } from './events/pointer';
import { COMPOSITE_OPERATIONS } from './interfaces/CompositeOperations';
import { Dimensions } from './interfaces/Dimensions.interface';

let imageId = 0;

export type Image = { imageData: ImageData; id: number };

export function createCanvasHandler(props: { size: Accessor<Dimensions> }) {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement | undefined>(undefined);
  const ctx: Accessor<CanvasRenderingContext2D | undefined> = createMemo(
    () => canvas()?.getContext('2d', { willReadFrequently: true }) ?? undefined
  );

  const [brushSize, setBrushSize] = createSignal(20);
  const [brushColor, setBrushColor] = createSignal('#ffffff');
  const [brushComposite, setBrushComposite] = createSignal(COMPOSITE_OPERATIONS[0]);

  const [currentImage, setCurrentImage] = createSignal<Image | undefined>(undefined, {
    equals: (prev, next) => prev?.id === next?.id
  });

  const brushScreenSize = createMemo(() => {
    const { width } = props.size();
    const _canvas = canvas();

    const scale = width && _canvas?.width ? width / _canvas.width : 1;

    return brushSize() * scale * window.devicePixelRatio;
  });

  effect(() => {
    const img = currentImage();
    const _ctx = ctx();
    if (!_ctx) {
      return;
    }

    if (img) {
      _ctx.putImageData(img.imageData, 0, 0);
    } else {
      _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    }
  });

  const resizeTo = createMemo(() => {
    const { height, width } = props.size();
    const _canvas = canvas();

    if (!_canvas || height === 0 || width === 0) {
      return 'matrix(1,0,0,1,0,0)';
    }

    const scaleX = width / _canvas.width;
    const skewY = 0;
    const skewX = 0;
    const scaleY = height / _canvas.height;
    const translateX = (width - _canvas.width) / 2;
    const translateY = (height - _canvas.height) / 2;

    return `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, ${translateX}, ${translateY})`;
  });

  const subscription = toObservable(ctx)
    .pipe(
      switchMap((ctx) =>
        ctx
          ? pointerdown(ctx.canvas).pipe(
              exhaustMap((event) => {
                const context = stroke.down(
                  {
                    ctx,
                    color: brushColor(),
                    size: brushSize(),
                    globalCompositeOperation: brushComposite()
                  },
                  getStylusState(event)
                );

                return pointermove(ctx.canvas).pipe(
                  startWith(event),
                  map((event) => context.move(getStylusState(event))),
                  takeUntil(
                    pointerup(ctx.canvas).pipe(
                      first(),
                      map((event) => context.up(getStylusState(event)))
                    )
                  ),
                  last()
                );
              }),
              map(() => ({
                imageData: ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
                id: imageId++
              }))
            )
          : of(undefined)
      )
    )
    .subscribe(setCurrentImage);

  onCleanup(() => {
    subscription.unsubscribe();
  });

  return [
    {
      brushSize,
      brushScreenSize,
      brushColor,
      brushComposite,
      resizeTo,
      // currentImage: createMemo(on(inputTrigger, () => untrack(currentImage)))
      currentImage
    },
    {
      setBrushSize,
      setBrushColor,
      setBrushComposite,
      setCanvas,
      setCurrentImage
    }
  ] as const;
}
