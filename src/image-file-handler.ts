export function createImageFileHandler<T>(props: {
  imageToImageData(image: CanvasImageSource): ImageData;
  imageDataToBlop(imageData: ImageData): Promise<Blob>;
}) {
  async function restore(file: File): Promise<T> {
    const json = await readJsonFile(file);

    // 1. Parse json and get all base64 images
    const base64Images: string[] = getBase64List(json);

    // 2. Convert all base64 images into ImageData
    const images = await Promise.all(
      base64Images.map((item) => base64ToImage(item).then((image) => props.imageToImageData(image)))
    );
    const map = mapTwoArrays(base64Images, images);

    // 3. Parse json and replase all base64 images with ImageData;
    return getImageData(json, map);
  }

  async function save(data: T): Promise<File> {
    // 1. Parse obj as json and get all ImageData
    const images: ImageData[] = getImageDataList(data);

    // 2. Convert all ImageData into base64 images
    const base64Images = await Promise.all(
      images.map((img) => props.imageDataToBlop(img).then((blob) => blobToBase64(blob)))
    );
    const map = mapTwoArrays(images, base64Images);

    // 3. Parse obj as json and replase all ImageData with base64 images
    const json = getJson(data, map);

    return createJsonFile(json);
  }

  return {
    restore,
    save
  };
}

function blobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
  const reader = new FileReader();
  reader.readAsDataURL(blob);

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result;
      result ? resolve(result) : reject();
    };
  });
}

function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      resolve(img);
    };
  });
}

function readJsonFile(file: File): Promise<string> {
  const reader = new FileReader();
  reader.readAsText(file);

  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result;
      result ? resolve(result as string) : reject();
    };
  });
}

function getImageDataList(data: any) {
  const images: ImageData[] = [];

  JSON.stringify(data, (_, value) => {
    if (value instanceof ImageData) {
      return images.push(value);
    }

    return value;
  });

  return images;
}

function getBase64List(json: string): string[] {
  const base64Images: string[] = [];

  JSON.parse(json, (_, value) => {
    if (typeof value === 'string' && value.startsWith('data:image/png;base64')) {
      base64Images.push(value);
    }

    return value;
  });

  return base64Images;
}

function getImageData(json: string, map: Map<string | ArrayBuffer, ImageData>): any {
  return JSON.parse(json, (_, value) => {
    if (typeof value === 'string' && map.has(value)) {
      return map.get(value);
    }

    return value;
  });
}

function getJson(data: any, map: Map<ImageData, string | ArrayBuffer>): string {
  return JSON.stringify(data, (_, value) => {
    if (value instanceof ImageData && map.has(value)) {
      return map.get(value);
    }

    return value;
  });
}

function createJsonFile(json: string): File {
  return new File([json], 'foo.json', { type: 'text/json' });
}

function mapTwoArrays<K, V>(array1: K[], array2: V[]): Map<K, V> {
  return new Map(array1.map((key, i) => [key, array2[i]]));
}
