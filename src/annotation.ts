import { trackStore } from '@solid-primitives/deep';
import { createUndoHistory } from '@solid-primitives/history';
import { createFileDownload } from '@utils/file-download';
import { offscreenCanvas } from '@utils/offscreen-canvas';
import { Accessor, createMemo, untrack } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';
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
    const imageId = copy[currentFrame]?.image?.id;

    // the functions thats return state.
    return () => {
      setAnnotations(reconcile(structuredClone(copy)));
      props.setCurrentFrame(currentFrame);
    };
  }, {});

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

  const currentComments = createMemo<Annotation['comments']>(() => currentAnnotation()?.comments ?? []);

  function addImage(image: Image | undefined): void {
    if (!image || image.id === untrack(currentAnnotation)?.image?.id) {
      return;
    }

    function setImage(state: AnnotationStore) {
      const currentFrame = untrack(props.currentFrame);

      if (state[currentFrame]) {
        state[currentFrame].image = image;
        // state[currentFrame].id = getAnnotationId();
      } else {
        state[currentFrame] = {
          frame: currentFrame,
          image,
          comments: [],
          id: getAnnotationId()
        };
      }
    }

    setAnnotations(produce(setImage));
  }

  function addComment(text: string): void {
    if (!text) {
      return;
    }

    function setComment(state: AnnotationStore) {
      const currentFrame = untrack(props.currentFrame);

      const commnet = { text, date: new Date(), author: 'Any' };

      if (state[currentFrame]) {
        state[currentFrame].comments?.push(commnet);
        // state[currentFrame].id = getAnnotationId();
      } else {
        state[currentFrame] = {
          frame: currentFrame,
          image: undefined,
          comments: [commnet],
          id: getAnnotationId()
        };
      }
    }

    setAnnotations(produce(setComment));
  }

  return [
    { currentAnnotation, currentComments, history },
    { save, addImage, addComment }
  ] as const;
}
