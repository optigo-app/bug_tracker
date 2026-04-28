import { DEFAULT_VIEWPORT, INITIAL_SHAPES, STORAGE_KEY } from "./constants";

export function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return distance(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

export function normalizeShape(shape) {
  if (
    [
      "rect",
      "ellipse",
      "image",
      "triangle",
      "diamond",
      "hexagon",
      "oval",
      "parallelogram",
      "star",
      "cloud",
      "heart",
      "x-box",
      "check-box",
      "left-arrow",
      "up-arrow",
      "down-arrow",
      "right-arrow",
    ].includes(shape.type)
  ) {
    const x = shape.w < 0 ? shape.x + shape.w : shape.x;
    const y = shape.h < 0 ? shape.y + shape.h : shape.y;
    return { ...shape, x, y, w: Math.abs(shape.w), h: Math.abs(shape.h) };
  }
  return shape;
}

export function getShapeBounds(shape) {
  if (shape.type === "draw") {
    const xs = shape.points.map((point) => point.x);
    const ys = shape.points.map((point) => point.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
  }

  if (shape.type === "arrow") {
    const xs = [shape.x, shape.x2];
    const ys = [shape.y, shape.y2];
    if (shape.midpoint) {
      xs.push(shape.midpoint.x);
      ys.push(shape.midpoint.y);
    }
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
  }

  if (shape.type === "text") {
    return {
      x: shape.x,
      y: shape.y,
      w: shape.w || 200,
      h: shape.h || 120,
    };
  }

  return { x: shape.x, y: shape.y, w: shape.w || 0, h: shape.h || 0 };
}

export function buildDrawPath(points) {
  if (!points.length) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const previous = points[index - 1];
    const midX = (previous.x + point.x) / 2;
    const midY = (previous.y + point.y) / 2;
    path += ` Q ${previous.x} ${previous.y} ${midX} ${midY}`;
  }
  return path;
}

export function getStoredEditorState() {
  if (typeof window === "undefined") {
    return {
      shapes: INITIAL_SHAPES,
      viewport: DEFAULT_VIEWPORT,
    };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        shapes: INITIAL_SHAPES,
        viewport: DEFAULT_VIEWPORT,
      };
    }

    const parsed = JSON.parse(saved);
    return {
      shapes: Array.isArray(parsed.shapes) ? parsed.shapes : INITIAL_SHAPES,
      viewport: parsed.viewport || DEFAULT_VIEWPORT,
    };
  } catch {
    return {
      shapes: INITIAL_SHAPES,
      viewport: DEFAULT_VIEWPORT,
    };
  }
}

export function cloneShapeForDuplicate(shape) {
  const duplicated = {
    ...shape,
    id: generateId(shape.type),
  };

  if (duplicated.type === "arrow") {
    duplicated.x += 24;
    duplicated.x2 += 24;
    duplicated.y += 24;
    duplicated.y2 += 24;
    return duplicated;
  }

  if (duplicated.type === "draw") {
    duplicated.points = duplicated.points.map((point) => ({
      x: point.x + 24,
      y: point.y + 24,
    }));
    return duplicated;
  }

  duplicated.x += 24;
  duplicated.y += 24;
  return duplicated;
}

export function getViewportCenter(viewport, rect) {
  return {
    x: (rect.width / 2 - viewport.x) / viewport.scale,
    y: (rect.height / 2 - viewport.y) / viewport.scale,
  };
}
