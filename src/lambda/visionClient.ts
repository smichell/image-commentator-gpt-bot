import * as vision from "@google-cloud/vision";

export type ImageInformation = Readonly<{
  landmarks: ReadonlyArray<string>;
  localizedObjects: ReadonlyArray<string>;
  labels: ReadonlyArray<string>;
}>;

export const getImageInformation = async (
  buffer: Buffer
): Promise<ImageInformation> => {
  const client = new vision.ImageAnnotatorClient();
  // Node.js用SDKを使用する場合はAPI呼び出し1回で全て取得する方法がなさそうなので1つずつ呼び出し。
  const landmarks =
    (await client.landmarkDetection(buffer))?.[0]?.landmarkAnnotations ?? [];
  const localizedObjects = client.objectLocalization
    ? (await client.objectLocalization(buffer))?.[0]
        .localizedObjectAnnotations ?? []
    : [];
  const labels =
    (await client.labelDetection(buffer))?.[0].labelAnnotations ?? [];

  const info: ImageInformation = {
    landmarks: landmarks
      .map((item) => item.description ?? "")
      .filter((item) => !!item),
    localizedObjects: localizedObjects
      .map((item) => item.name ?? "")
      .filter((item) => !!item),
    labels: labels
      .map((item) => item.description ?? "")
      .filter((item) => !!item),
  };

  return info;
};
