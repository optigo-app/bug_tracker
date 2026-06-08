import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  MousePointer2,
  PencilLine,
  RectangleHorizontal,
  StickyNote,
  Type,
  Upload,
} from "lucide-react";

export const STORAGE_KEY = "sketchflow-editor-v1";

export const COLORS = [
  "#1f1f1f",
  "#8d8d92",
  "#d67cf3",
  "#a942d6",
  "#4569e6",
  "#62a5f7",
  "#f3ad47",
  "#e46d12",
  "#1da36f",
  "#60bf72",
  "#ff7b7b",
  "#ef3838",
  "#ffffff",
];

export const STROKE_WIDTHS = [2, 3, 4, 6];

export const FILL_STYLES = ["none", "semi", "solid", "pattern"];
export const DASH_STYLES = ["draw", "solid", "dashed", "dotted"];
export const FONT_FAMILIES = ["draw", "sans", "serif", "mono"];
export const TEXT_ALIGNMENTS = ["start", "middle", "end"];

export const TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "draw", icon: PencilLine, label: "Draw" },
  { id: "eraser", icon: Eraser, label: "Delete" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "text", icon: Type, label: "Text" },
  { id: "note", icon: StickyNote, label: "Sticky Note" },
  { id: "rect", icon: RectangleHorizontal, label: "Rectangle" },
  { id: "ellipse", icon: Circle, label: "Ellipse" },
  { id: "shape", icon: Diamond, label: "Shape" },
  { id: "media", icon: Upload, label: "Media" },
];

export const DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };

export const INITIAL_SHAPES = [
  {
    id: "shape-arrow",
    type: "arrow",
    x: 170,
    y: 140,
    x2: 760,
    y2: 176,
    color: "#1f1f1f",
    strokeWidth: 4,
  },
  {
    id: "shape-rect",
    type: "rect",
    x: 420,
    y: 390,
    w: 260,
    h: 190,
    color: "#1f1f1f",
    strokeWidth: 4,
  },
  {
    id: "shape-ellipse",
    type: "ellipse",
    x: 790,
    y: 360,
    w: 230,
    h: 170,
    color: "#1f1f1f",
    strokeWidth: 4,
  },
];
