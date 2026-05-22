function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportEditorStateAsJson({ shapes, viewport }, filename = "custom-draw-export.json") {
  const blob = new Blob(
    [JSON.stringify({ shapes, viewport }, null, 2)],
    { type: "application/json" }
  );
  downloadBlob(filename, blob);
}

export function exportCanvasAsSvg(canvasElement, filename = "custom-draw-export.svg") {
  const svg = canvasElement?.querySelector("svg");
  if (!svg) {
    throw new Error("Canvas SVG not found.");
  }

  const serialized = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(filename, blob);
}

export async function exportCanvasAsPng(canvasElement, filename = "custom-draw-export.png") {
  const svg = canvasElement?.querySelector("svg");
  if (!svg) {
    throw new Error("Canvas SVG not found.");
  }

  const rect = canvasElement.getBoundingClientRect();
  const topbarHeight = 56; // Height of the topbar to exclude from export
  const serialized = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to render SVG."));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height - topbarHeight));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context unavailable.");
    }

    context.fillStyle = "#f1f3f5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Draw image offset by topbar height to exclude header
    context.drawImage(image, 0, -topbarHeight, canvas.width, rect.height);

    const pngBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!pngBlob) {
      throw new Error("Failed to build PNG.");
    }

    downloadBlob(filename, pngBlob);
  } finally {
    URL.revokeObjectURL(url);
  }
}
