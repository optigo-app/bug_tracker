export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
}

export function validateMediaFile(file, expectedKind) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (expectedKind === "image" && !isImage) {
    throw new Error("Please choose an image file.");
  }

  if (expectedKind === "video" && !isVideo) {
    throw new Error("Please choose a video file.");
  }

  const sizeLimit = expectedKind === "video" ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > sizeLimit) {
    throw new Error(
      expectedKind === "video"
        ? "Video must be smaller than 25MB."
        : "Image must be smaller than 10MB."
    );
  }
}
