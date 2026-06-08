import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Plus,
  Square,
  Ban,
  Pencil,
  PaintBucket,
  MoveRight,
  MoveLeft,
  MoveHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Select, MenuItem } from "@mui/material";
import DrawShapeMenu from "./DrawShapeMenu";
import { COLORS, DASH_STYLES, FILL_STYLES, FONT_FAMILIES, TEXT_ALIGNMENTS } from "./constants";
import { SHAPE_OPTIONS } from "./shapeOptions";
import styles from "./draw-editor.module.css";

const SIZE_OPTIONS = [
  { label: "12", value: 12 },
  { label: "14", value: 14 },
  { label: "16", value: 16 },
  { label: "20", value: 20 },
  { label: "24", value: 24 },
  { label: "32", value: 32 },
  { label: "40", value: 40 },
  { label: "48", value: 48 },
  { label: "64", value: 64 },
  { label: "80", value: 80 },
  { label: "90", value: 90 },
];

export default function DrawPropertiesPanel({
  activeTool,
  applyStylesToSelected,
  applyColorToMode,
  createMediaShape,
  currentAlign,
  currentColor,
  currentDash,
  currentFill,
  currentBackgroundColor,
  currentFont,
  currentFontWeight,
  currentFontStyle,
  currentTextDecoration,
  currentFontSize,
  currentTextTransform,
  currentShapeType,
  currentStrokeWidth,
  currentArrowHead,
  imageInputRef,
  isShapeMenuOpen,
  onShapeMenuToggle,
  onShapeSelect,
  selectedShape,
  setCurrentAlign,
  setCurrentColor,
  setCurrentDash,
  setCurrentFill,
  setCurrentBackgroundColor,
  setCurrentFont,
  setCurrentFontWeight,
  setCurrentFontStyle,
  setCurrentTextDecoration,
  setCurrentFontSize,
  setCurrentTextTransform,
  setCurrentShapeType,
  setCurrentStrokeWidth,
  setCurrentArrowHead,
}) {
  const shouldEditSelectedShape = Boolean(selectedShape) && activeTool === "select";
  const mode = shouldEditSelectedShape ? selectedShape.type : activeTool;
  const shouldHidePanel = !selectedShape && ["select", "pan", "eraser", "media"].includes(activeTool);
  const [colorMode, setColorMode] = useState("stroke"); // "stroke" or "background"

  const handleStyleChange = (partial) => {
    if (shouldEditSelectedShape) {
      applyStylesToSelected(partial);

      if (partial.color !== undefined) setCurrentColor(partial.color);
      if (partial.strokeWidth !== undefined) setCurrentStrokeWidth(partial.strokeWidth);
      if (partial.fill !== undefined) setCurrentFill(partial.fill);
      if (partial.backgroundColor !== undefined) setCurrentBackgroundColor(partial.backgroundColor);
      if (partial.dash !== undefined) setCurrentDash(partial.dash);
      if (partial.font !== undefined) setCurrentFont(partial.font);
      if (partial.fontWeight !== undefined) setCurrentFontWeight(partial.fontWeight);
      if (partial.fontStyle !== undefined) setCurrentFontStyle(partial.fontStyle);
      if (partial.textDecoration !== undefined) setCurrentTextDecoration(partial.textDecoration);
      if (partial.align !== undefined) setCurrentAlign(partial.align);
      if (partial.fontSize !== undefined) setCurrentFontSize(partial.fontSize);
      if (partial.textTransform !== undefined) setCurrentTextTransform(partial.textTransform);
      if (partial.arrowHead !== undefined) setCurrentArrowHead(partial.arrowHead);
      return;
    }

    if (partial.color !== undefined && ["text", "note", "draw"].includes(mode) && applyColorToMode) {
      applyColorToMode(mode, partial.color);
      return;
    }

    if (partial.color !== undefined) setCurrentColor(partial.color);
    if (partial.strokeWidth !== undefined) setCurrentStrokeWidth(partial.strokeWidth);
    if (partial.fill !== undefined) setCurrentFill(partial.fill);
    if (partial.backgroundColor !== undefined) setCurrentBackgroundColor(partial.backgroundColor);
    if (partial.dash !== undefined) setCurrentDash(partial.dash);
    if (partial.font !== undefined) setCurrentFont(partial.font);
    if (partial.fontWeight !== undefined) setCurrentFontWeight(partial.fontWeight);
    if (partial.fontStyle !== undefined) setCurrentFontStyle(partial.fontStyle);
    if (partial.textDecoration !== undefined) setCurrentTextDecoration(partial.textDecoration);
    if (partial.align !== undefined) setCurrentAlign(partial.align);
    if (partial.fontSize !== undefined) setCurrentFontSize(partial.fontSize);
    if (partial.textTransform !== undefined) setCurrentTextTransform(partial.textTransform);
    if (partial.shapeType !== undefined) setCurrentShapeType(partial.shapeType);
    if (partial.arrowHead !== undefined) setCurrentArrowHead(partial.arrowHead);
  };

  const getActiveValue = (key, fallback) =>
    shouldEditSelectedShape && selectedShape[key] !== undefined ? selectedShape[key] : fallback;

  if (shouldHidePanel) {
    return (
      <>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              await createMediaShape(file, "image");
            }
            event.target.value = "";
          }}
        />
      </>
    );
  }

  const showFillRow = ["draw", "arrow", "rect", "ellipse", "triangle", "diamond", "shape", "note"].includes(mode);
  const showBackgroundRow = ["text", "rect", "ellipse", "triangle", "diamond", "shape", "note"].includes(mode);
  const showDashRow = ["draw", "arrow", "rect", "ellipse", "triangle", "diamond", "shape", "note"].includes(mode);
  const showFontRow = ["text", "note", "arrow"].includes(mode);
  const showTextTransformRow = ["text", "note"].includes(mode);
  const showAlignRow = ["text", "note"].includes(mode);
  const showShapeRow = mode === "shape" || SHAPE_OPTIONS.some((shape) => shape.value === mode);
  const showArrowRow = mode === "arrow";
  const activeShapeOption =
    SHAPE_OPTIONS.find((shape) => shape.value === getActiveValue("type", currentShapeType)) ||
    SHAPE_OPTIONS.find((shape) => shape.value === currentShapeType) ||
    SHAPE_OPTIONS[0];
  const ActiveShapeIcon = activeShapeOption.icon || Square;

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await createMediaShape(file, "image");
          }
          event.target.value = "";
        }}
      />

      <aside className={styles.propertiesPanelCompact}>
        {isShapeMenuOpen ? (
          <DrawShapeMenu
            currentShapeType={currentShapeType}
            onSelect={onShapeSelect}
            style={{
              top: "auto",
              bottom: 0,
              left: "auto",
              right: "calc(100% + 10px)",
              transform: "none",
            }}
          />
        ) : null}

        <div className={styles.compactSection}>
          <div className={styles.propertyGrid}>

            {COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.colorDot} ${colorMode === "stroke"
                  ? (getActiveValue("color", currentColor) === color ? styles.colorDotActive : "")
                  : (getActiveValue("backgroundColor", currentBackgroundColor) === color ? styles.colorDotActive : "")
                  }`}
                onClick={() => {
                  if (colorMode === "stroke") {
                    handleStyleChange({ color });
                  } else {
                    handleStyleChange({ backgroundColor: color });
                  }
                }}
              >
                <span
                  className={styles.colorDotInner}
                  style={{ backgroundColor: color }}
                />
              </button>
            ))}
          </div>
        </div>

        {showBackgroundRow && (
          <div className={styles.compactSection}>
            <div className={styles.iconGrid}>
              <button
                className={`${styles.gridIconButton} ${colorMode === "stroke" ? styles.gridIconButtonActive : ""}`}
                onClick={() => setColorMode("stroke")}
                title={mode === "text" || mode === "note" ? "Text Color" : "Stroke Color"}
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.gridIconButton} ${colorMode === "background" ? styles.gridIconButtonActive : ""}`}
                onClick={() => setColorMode("background")}
                title="Background Color"
              >
                <PaintBucket size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("backgroundColor", currentBackgroundColor) === "transparent" ? styles.gridIconButtonActive : ""}`}
                onClick={() => handleStyleChange({ backgroundColor: "transparent" })}
                title="Transparent Background"
              >
                <Ban size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
        {!showFontRow && (
          <div className={styles.compactSection}>
            <div className={styles.sliderRow}>
              <Minus size={14} />
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={getActiveValue("strokeWidth", currentStrokeWidth)}
                className={styles.thicknessSlider}
                onChange={(event) =>
                  handleStyleChange({ strokeWidth: parseInt(event.target.value, 10) })
                }
              />
              <Plus size={14} />
            </div>
          </div>
        )}


        {showFillRow ? (
          <div className={styles.compactSection}>
            <div className={styles.iconGrid}>
              {FILL_STYLES.map((fill) => (
                <button
                  key={fill}
                  className={`${styles.gridIconButton} ${getActiveValue("fill", currentFill) === fill ? styles.gridIconButtonActive : ""
                    }`}
                  onClick={() => handleStyleChange({ fill })}
                >
                  <FillIcon type={fill} />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {showDashRow ? (
          <div className={styles.compactSection}>
            <div className={styles.iconGrid}>
              {DASH_STYLES.map((dash) => (
                <button
                  key={dash}
                  className={`${styles.gridIconButton} ${getActiveValue("dash", currentDash) === dash ? styles.gridIconButtonActive : ""
                    }`}
                  onClick={() => handleStyleChange({ dash })}
                >
                  <DashIcon type={dash} />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.compactSection}>
          <div className={styles.sizeGrid}>
            {SIZE_OPTIONS.map((option) => (
              <button
                key={option.label}
                className={`${styles.sizeButton} ${mode === "text" || mode === "note"
                  ? getActiveValue("fontSize", currentFontSize) === option.value
                  : getActiveValue("strokeWidth", currentStrokeWidth) === Math.round(option.value / 6)
                    ? styles.sizeButtonActive
                    : ""
                  }`}
                onClick={() => {
                  if (mode === "text" || mode === "note") {
                    handleStyleChange({ fontSize: option.value });
                  } else {
                    handleStyleChange({ strokeWidth: Math.round(option.value / 6) });
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {showTextTransformRow ? (
          <div className={styles.compactSection}>
            <div className={styles.iconGrid}>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("textTransform", currentTextTransform) === "none" ? styles.gridIconButtonActive : ""
                  }`}
                onClick={() => handleStyleChange({ textTransform: "none" })}
                title="Normal"
              >
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>Aa</span>
              </button>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("textTransform", currentTextTransform) === "uppercase" ? styles.gridIconButtonActive : ""
                  }`}
                onClick={() => handleStyleChange({ textTransform: "uppercase" })}
                title="Uppercase"
              >
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>AA</span>
              </button>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("textTransform", currentTextTransform) === "lowercase" ? styles.gridIconButtonActive : ""
                  }`}
                onClick={() => handleStyleChange({ textTransform: "lowercase" })}
                title="Lowercase"
              >
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>aa</span>
              </button>
            </div>
            <div className={styles.iconGrid} style={{ marginTop: '8px' }}>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("fontWeight", currentFontWeight) === "bold" ? styles.gridIconButtonActive : ""}`}
                onClick={() => handleStyleChange({ fontWeight: getActiveValue("fontWeight", currentFontWeight) === "bold" ? "normal" : "bold" })}
                title="Bold"
              >
                <Bold size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("fontStyle", currentFontStyle) === "italic" ? styles.gridIconButtonActive : ""}`}
                onClick={() => handleStyleChange({ fontStyle: getActiveValue("fontStyle", currentFontStyle) === "italic" ? "normal" : "italic" })}
                title="Italic"
              >
                <Italic size={16} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.gridIconButton} ${getActiveValue("textDecoration", currentTextDecoration) === "line-through" ? styles.gridIconButtonActive : ""}`}
                onClick={() => handleStyleChange({ textDecoration: getActiveValue("textDecoration", currentTextDecoration) === "line-through" ? "none" : "line-through" })}
                title="Strikethrough"
              >
                <Strikethrough size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : null}

        {showAlignRow ? (
          <div className={styles.compactSection}>
            <div className={styles.iconGrid}>
              {TEXT_ALIGNMENTS.map((align) => (
                <button
                  key={align}
                  className={`${styles.gridIconButton} ${(getActiveValue("align", currentAlign) || TEXT_ALIGNMENTS[0]) === align ? styles.gridIconButtonActive : ""
                    }`}
                  onClick={() => handleStyleChange({ align })}
                >
                  <AlignIcon type={align} />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {showArrowRow ? (
          <>
            <div className={styles.compactInfoRow}>
              <span>Line</span>
              <button className={styles.inlineIconButton}>
                <DashIcon type={getActiveValue("dash", currentDash)} />
              </button>
            </div>
            <div className={styles.compactInfoRow}>
              <span>Arrows</span>
              <div className={styles.iconGrid} style={{ width: 'auto', gap: '4px', background: 'none', padding: 0 }}>
                <button
                  className={`${styles.gridIconButton} ${getActiveValue("arrowHead", currentArrowHead) === "none" ? styles.gridIconButtonActive : ""}`}
                  onClick={() => handleStyleChange({ arrowHead: "none" })}
                  title="Line"
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <button
                  className={`${styles.gridIconButton} ${getActiveValue("arrowHead", currentArrowHead) === "end" ? styles.gridIconButtonActive : ""}`}
                  onClick={() => handleStyleChange({ arrowHead: "end" })}
                  title="Arrow at End"
                >
                  <MoveRight size={16} strokeWidth={2.5} />
                </button>
                <button
                  className={`${styles.gridIconButton} ${getActiveValue("arrowHead", currentArrowHead) === "start" ? styles.gridIconButtonActive : ""}`}
                  onClick={() => handleStyleChange({ arrowHead: "start" })}
                  title="Arrow at Start"
                >
                  <MoveLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  className={`${styles.gridIconButton} ${getActiveValue("arrowHead", currentArrowHead) === "both" ? styles.gridIconButtonActive : ""}`}
                  onClick={() => handleStyleChange({ arrowHead: "both" })}
                  title="Arrow at Both Ends"
                >
                  <MoveHorizontal size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : null}

        {showShapeRow ? (
          <div className={styles.compactInfoRow}>
            <span>Shape</span>
            <button
              className={styles.gridIconButton}
              onClick={() => onShapeMenuToggle("panel")}
              title={activeShapeOption.label}
            >
              <ActiveShapeIcon size={16} />
            </button>
          </div>
        ) : null}

      </aside>
    </>
  );
}

function FillIcon({ type }) {
  const size = 18;
  if (type === "none") return <Square size={size} strokeWidth={1.5} style={{ opacity: 0.45 }} />;
  if (type === "semi") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 8h18M3 13h18M3 18h18" strokeOpacity="0.2" />
      </svg>
    );
  }
  if (type === "solid") return <Square size={size} fill="currentColor" strokeWidth={1.5} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 21L21 3M8 21L21 8M3 16L16 3" strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
}

function DashIcon({ type }) {
  const size = 18;
  if (type === "draw") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M4 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray={type === "dashed" ? "5 5" : type === "dotted" ? "1 5" : "none"} />
    </svg>
  );
}

function AlignIcon({ type }) {
  if (type === "start") return <AlignLeft size={16} strokeWidth={2.5} />;
  if (type === "middle") return <AlignCenter size={16} strokeWidth={2.5} />;
  return <AlignRight size={16} strokeWidth={2.5} />;
}
