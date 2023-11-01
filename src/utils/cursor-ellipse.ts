import { Accessor, createMemo } from 'solid-js';

export function cursorEllipse(props: { brushSize: Accessor<number> }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const cursor = createMemo(() => {
    const size = props.brushSize();
    canvas.width = size + 2;
    canvas.height = size + 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#535353';

    console.log(size);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.ellipse(size / 2 + 1, size / 2 + 1, size / 2, size / 2, 1, 0, Math.PI * 2);
    ctx.stroke();

    const dataURL = canvas.toDataURL();

    console.log(`dataURL`, dataURL);

    return `url(${dataURL}) ${size / 2 + 1} ${size / 2 + 1}, crosshair`;
  });

  return { cursor } as const;
}
