import { createStoreHistory } from '@utils/store-history';
import { Accessor, createMemo, onCleanup, untrack } from 'solid-js';
import { createStore } from 'solid-js/store';
import { effect } from 'solid-js/web';
import { createImageFileHandler } from './image-file-handler';
import { Dimensions } from './interfaces/Dimensions.interface';
import { Frame } from './interfaces/Frame';

export interface Annotation {
  // frame: Frame;
  image?: ImageData;
  text?: string;
}

export function createAnnotation(props: { currentFrame: Accessor<Frame>; dimentions: Accessor<Dimensions> }) {
  const [annotations, setAnnotations] = createStore<{
    annotations: Annotation[];
  }>({ annotations: [] });
  const { undo, redo } = createStoreHistory({ store: () => annotations, setStore: setAnnotations });
  const { imageToImageData, imageDataToBlop } = offscreenCanvas({ dimentions: props.dimentions });
  const fileHandler = createImageFileHandler({ imageToImageData, imageDataToBlop });
  const fileDownload = createFileDownload();

  async function save() {
    const file = await fileHandler.save(annotations);
    fileDownload.save(file);
  }

  effect(() => {
    console.log(`annotations`, annotations.annotations);
  });

  const currentAnnotation = createMemo(
    () => annotations.annotations[props.currentFrame()] as Annotation | undefined,
    undefined,
    {
      equals: () => false
    }
  );

  function add(imageData: ImageData | undefined): void {
    console.log(`add`, imageData, untrack(props.currentFrame));
    setAnnotations('annotations', (state) => {
      state[untrack(props.currentFrame)] = {
        image: imageData,
        text: ''
      };
      console.log(`add2`, state);
      return [...state];
    });
    console.log(`add3`, annotations.annotations);
  }

  return [{ currentAnnotation }, { save, add }] as const;
}

export function offscreenCanvas(props: { dimentions: Accessor<Dimensions> }) {
  const canvas = new OffscreenCanvas(256, 256);
  const ctx = canvas.getContext('2d')! as any as CanvasRenderingContext2D;
  const empty = ctx.createImageData(canvas.width, canvas.height);

  effect(() => {
    canvas.width = props.dimentions().width;
    canvas.height = props.dimentions().height;
  });

  function imageToImageData(image: CanvasImageSource): ImageData {
    clear();
    drawImage(image);
    const imageData = getImageData();
    clear();

    return imageData;
  }

  function getImageData(): ImageData {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  function drawImage(image: CanvasImageSource): void {
    ctx.drawImage(image, 0, 0);
  }

  function clear(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function imageDataToBlop(imageData: ImageData): Promise<Blob> {
    ctx.putImageData(imageData, 0, 0);

    const blob = (canvas as any)[(canvas as any).convertToBlob ? 'convertToBlob' : 'toBlob']();

    return blob;
  }

  return {
    imageToImageData,
    imageDataToBlop
  };
}

function createFileDownload() {
  const a = document.createElement('a');

  function save(file: File | null | void) {
    if (file) {
      const downloadLink = URL.createObjectURL(file);

      a.href = downloadLink;
      a.download = 'test.json';

      a.click();
    }
  }

  onCleanup(() => {
    a.remove();
  });

  return {
    save
  };
}
