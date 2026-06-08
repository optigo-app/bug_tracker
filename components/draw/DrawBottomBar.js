import {
  ArrowUpRight,
  Copy,
  Eraser,
  Hand,
  Image,
  MoreVertical,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Type,
  StickyNote,
  Undo2,
  ChevronUp,
} from "lucide-react";
import { Tooltip } from "@mui/material";
import DrawShapeMenu from "./DrawShapeMenu";
import { SHAPE_OPTIONS } from "./shapeOptions";
import styles from "./draw-editor.module.css";

const TOOL_ITEMS = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "pan", label: "Pan", icon: Hand },
  { id: "draw", label: "Draw", icon: Pencil },
  { id: "eraser", label: "Delete", icon: Eraser },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "text", label: "Text", icon: Type },
  { id: "note", label: "Sticky Note", icon: StickyNote },
  { id: "media", label: "Media", icon: Image },
  { id: "shape", label: "Shape", icon: Square },
];

export default function DrawBottomBar({
  activeTool,
  beginTextEdit,
  currentColor,
  currentShapeType,
  deleteShape,
  duplicateSelectedShape,
  handleRedo,
  handleUndo,
  isSpacePanning,
  isShapeMenuOpen,
  onShapeMenuToggle,
  onShapeSelect,
  selectedId,
  selectedShape,
  setActiveTool,
  triggerMediaPicker,
}) {
  const handleToolClick = (id) => {
    if (id === "shape") {
      onShapeMenuToggle("bottom", false);
      setActiveTool("shape");
      return;
    }

    onShapeMenuToggle("bottom", false);
    if (id === "media") {
      setActiveTool("media");
      triggerMediaPicker();
      return;
    }

    setActiveTool(id);

    if (id === "text" && selectedShape?.type === "text") {
      beginTextEdit({ x: selectedShape.x, y: selectedShape.y });
    }
  };

  const selectedShapeIcon =
    SHAPE_OPTIONS.find((shape) => shape.value === currentShapeType)?.icon || Square;

  return (
    <div className={styles.bottomToolbarWrap}>
      <div className={styles.historyToolbar}>
        <Tooltip title="Undo (Ctrl+Z)" arrow>
          <button className={styles.iconButton} onClick={handleUndo}>
            <Undo2 size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)" arrow>
          <button className={styles.iconButton} onClick={handleRedo}>
            <Redo2 size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Delete (Delete)" arrow>
          <button
            className={styles.iconButton}
            onClick={() => selectedId && deleteShape(selectedId)}
            disabled={!selectedId}
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Duplicate (Ctrl+D)" arrow>
          <button
            className={styles.iconButton}
            onClick={duplicateSelectedShape}
            disabled={!selectedId}
          >
            <Copy size={16} />
          </button>
        </Tooltip>
      </div>

      <div className={styles.toolDockWrap}>
        {isShapeMenuOpen ? (
          <DrawShapeMenu
            currentShapeType={currentShapeType}
            onSelect={onShapeSelect}
            style={{
              left: "auto",
              right: 0,
              bottom: "calc(100% + 14px)",
              transform: "none",
            }}
          />
        ) : null}

        <div className={styles.toolDock}>
          {TOOL_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive =
              activeTool === id ||
              (id === "pan" && isSpacePanning) ||
              (id === "shape" && activeTool === "shape");

            const ShapeToolIcon = id === "shape" ? selectedShapeIcon : Icon;

            return (
              <Tooltip
                key={id}
                title={`${label}${shortcutSuffix(id)}${id === "pan" ? " / hold Space" : ""}`}
                arrow
              >
                <button
                  className={`${styles.toolButton} ${isActive ? styles.toolButtonActive : ""}`}
                  style={getToolButtonStyle(id, isActive, currentColor)}
                  aria-label={label}
                  onClick={() => handleToolClick(id)}
                >
                  <ShapeToolIcon size={18} strokeWidth={2.2} />
                </button>
              </Tooltip>
            );
          })}

          <Tooltip title="More shapes" arrow>
            <button
              className={`${styles.toolButton} ${isShapeMenuOpen ? styles.toolButtonActive : ""}`}
              aria-label="More shapes"
              onClick={() => onShapeMenuToggle("bottom")}
            >
              <ChevronUp size={18} strokeWidth={2.2} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function shortcutSuffix(toolId) {
  const shortcuts = {
    select: " (V)",
    pan: " (H)",
    draw: " (D)",
    eraser: " (E)",
    arrow: " (A)",
    text: " (T)",
    note: " (N)",
    media: " (U)",
    shape: " (S)",
  };

  return shortcuts[toolId] || "";
}

function getToolButtonStyle(toolId, isActive, currentColor) {
  if (toolId !== "draw" || !isActive) return undefined;

  return {
    background: currentColor,
    color: getContrastColor(currentColor),
    boxShadow: `0 4px 12px ${currentColor}44`,
  };
}

function getContrastColor(color) {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) return "#ffffff";

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#ffffff";
}
