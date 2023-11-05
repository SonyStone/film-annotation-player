import { Accessor, onCleanup } from 'solid-js';
import { effect } from 'solid-js/web';
import { Dimensions } from '../interfaces/Dimensions.interface';

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

  onCleanup(() => {
    clear();
  });

  return {
    imageToImageData,
    imageDataToBlop
  };
}
