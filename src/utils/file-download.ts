import { onCleanup } from 'solid-js';

export function createFileDownload() {
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
