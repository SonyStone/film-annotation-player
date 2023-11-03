import { trackStore } from '@solid-primitives/deep';
import { createUndoHistory } from '@solid-primitives/history';
import { Accessor, createMemo, onCleanup, untrack } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';
import { effect } from 'solid-js/web';
import { Image } from './canvas-handler';
import { createImageFileHandler } from './image-file-handler';
import { Brand } from './interfaces/Brand.type';
import { Dimensions } from './interfaces/Dimensions.interface';
import { Frame } from './interfaces/Frame';

export interface Annotation {
  frame?: Frame;
  image?: Image;
  comments?: { text: string; author: string; date: Date }[];
  id: AnnotationId;
}

interface AnnotationStore {
  // currentFrame: Frame;
  [key: Frame]: Annotation;
}

let id = 0;
function getAnnotationId(): AnnotationId {
  return id++;
}

/**
 * Кадр ролика целое число `int`
 */
export type AnnotationId = Brand<number, 'Frame'> | number;

export function createAnnotation(props: {
  currentFrame: Accessor<Frame>;
  dimentions: Accessor<Dimensions>;
  setCurrentFrame: (frame: Frame) => void;
}) {
  const [annotations, setAnnotations] = createStore<AnnotationStore>({});

  const history = createUndoHistory(() => {
    // part that save in history
    trackStore(annotations);
    const copy = structuredClone(unwrap(annotations));
    const currentFrame = untrack(props.currentFrame);

    // the functions thats return state.
    return () => {
      setAnnotations(reconcile(copy));
      props.setCurrentFrame(currentFrame);
    };
  });

  const undo = () => {
    history.undo();
  };
  const redo = () => {
    history.redo();
  };

  const { imageToImageData, imageDataToBlop } = offscreenCanvas({ dimentions: props.dimentions });
  const fileHandler = createImageFileHandler({ imageToImageData, imageDataToBlop });
  const fileDownload = createFileDownload();

  async function save() {
    const file = await fileHandler.save(annotations);
    fileDownload.save(file);
  }
  const currentAnnotation = createMemo<Annotation | undefined>(
    () => {
      const annotation = annotations[props.currentFrame()];

      return annotation;
    },
    undefined,
    {
      equals: () => false
    }
  );

  function add(image: Image | undefined): void {
    if (!image || image.id === untrack(currentAnnotation)?.image?.id) {
      return;
    }

    const currentFrame = untrack(props.currentFrame);
    const annotationId = getAnnotationId();
    const annotation: Annotation = {
      frame: currentFrame,
      image,
      comments: [],
      id: annotationId
    };

    setAnnotations(
      produce((state) => {
        state[currentFrame] = annotation;
      })
    );
  }

  return [
    { currentAnnotation, history },
    { save, add, undo, redo }
  ] as const;
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
