import {
  ArrowUpRight,
  Circle,
  Cloud,
  Diamond,
  Heart,
  Hexagon,
  Square,
  Star,
  Triangle,
} from "lucide-react";

export const SHAPE_OPTIONS = [
  { id: "rect", value: "rect", icon: Square, label: "Rectangle" },
  { id: "ellipse", value: "ellipse", icon: Circle, label: "Ellipse" },
  { id: "triangle", value: "triangle", icon: Triangle, label: "Triangle" },
  { id: "diamond", value: "diamond", icon: Diamond, label: "Diamond" },
  { id: "hexagon", value: "hexagon", icon: Hexagon, label: "Hexagon" },
  { id: "oval", value: "oval", icon: Circle, label: "Oval" },
  { id: "parallelogram", value: "parallelogram", icon: Square, label: "Parallelogram" },
  { id: "star", value: "star", icon: Star, label: "Star" },
  { id: "cloud", value: "cloud", icon: Cloud, label: "Cloud" },
  { id: "heart", value: "heart", icon: Heart, label: "Heart" },
  { id: "x-box", value: "x-box", icon: Square, label: "X Box" },
  { id: "check-box", value: "check-box", icon: Square, label: "Check Box" },
  { id: "left-arrow", value: "left-arrow", icon: ArrowUpRight, label: "Left Arrow" },
  { id: "up-arrow", value: "up-arrow", icon: ArrowUpRight, label: "Up Arrow" },
  { id: "down-arrow", value: "down-arrow", icon: ArrowUpRight, label: "Down Arrow" },
  { id: "right-arrow", value: "right-arrow", icon: ArrowUpRight, label: "Right Arrow" },
];

export function getShapeIconStyle(shapeId) {
  if (shapeId === "left-arrow") return { transform: "rotate(180deg)" };
  if (shapeId === "up-arrow") return { transform: "rotate(-90deg)" };
  if (shapeId === "down-arrow") return { transform: "rotate(90deg)" };
  return undefined;
}
