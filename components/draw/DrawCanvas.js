import { useEffect, useRef } from "react";
import styles from "./draw-editor.module.css";

export default function DrawCanvas({
  buildDrawPath,
  canvasRef,
  commitTextEdit,
  currentColor,
  currentFontWeight,
  currentFontStyle,
  currentTextDecoration,
  currentFontSize,
  currentTextTransform,
  draftText,
  editingText,
  handleCanvasDoubleClick,
  handleCanvasDragOver,
  handleCanvasDrop,
  handleCanvasPointerDown,
  handleCanvasPointerMove,
  handleCanvasPointerUp,
  handleWheel,
  selectedBounds,
  selectedShape,
  setDraftText,
  setEditingText,
  shapes,
  viewport,
}) {
  // Use a ref for the handleWheel to ensure the effect doesn't re-run unnecessarily
  // while still having access to the latest handleWheel function.
  const handleWheelRef = useRef(handleWheel);
  useEffect(() => {
    handleWheelRef.current = handleWheel;
  }, [handleWheel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e) => {
      handleWheelRef.current(e);
    };

    // We must use a non-passive listener to be able to call e.preventDefault()
    // which stops the browser from zooming the entire page.
    canvas.addEventListener('wheel', onWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [canvasRef]);

  return (
    <section
      ref={canvasRef}
      className={styles.canvas}
      onPointerDown={handleCanvasPointerDown}
      onDoubleClick={handleCanvasDoubleClick}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      // onWheel={handleWheel} // Moved to useEffect for non-passive listener
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <svg className={styles.canvasSvg}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9.5"
            refY="5"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
          <pattern
            id="pattern-hatch"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
          {shapes.map((shape) => {
            const isSelected = selectedBounds && shapes.find(s => s.id === shape.id)?.id === selectedBounds.id;
            const commonProps = {
              fill: getFill(shape),
              stroke: shape.color,
              strokeWidth: shape.strokeWidth,
              strokeDasharray: getDashArray(shape),
              className: styles.shapeGroup,
              'data-shape-id': shape.id,
            };

            return (
              <g key={shape.id} data-shape-id={shape.id}>
                {shape.type === "rect" && (
                  <rect
                    {...commonProps}
                    x={shape.x}
                    y={shape.y}
                    width={shape.w}
                    height={shape.h}
                    rx="8"
                  />
                )}

                {shape.type === "diamond" && (
                  <path
                    {...commonProps}
                    d={getShapePath(shape)}
                  />
                )}

                {shape.type === "triangle" && (
                  <path
                    {...commonProps}
                    d={getShapePath(shape)}
                  />
                )}

                {shape.type === "ellipse" && (
                  <ellipse
                    {...commonProps}
                    cx={shape.x + shape.w / 2}
                    cy={shape.y + shape.h / 2}
                    rx={Math.abs(shape.w / 2)}
                    ry={Math.abs(shape.h / 2)}
                  />
                )}

                {[
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
                ].includes(shape.type) && (
                  <path
                    {...commonProps}
                    d={getShapePath(shape)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

              {shape.type === "arrow" && (
                <g>
                  {isSelected && (
                      <path
                        d={getArrowPath(shape)}
                        stroke="#2d79f6"
                        strokeWidth={shape.strokeWidth + 4}
                        strokeOpacity={0.15}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                    <path
                      {...commonProps}
                      d={getArrowPath(shape)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerStart={shape.arrowHead === "start" || shape.arrowHead === "both" ? "url(#arrowhead)" : undefined}
                      markerEnd={shape.arrowHead === "end" || shape.arrowHead === "both" || !shape.arrowHead ? "url(#arrowhead)" : undefined}
                      style={{ color: shape.color }}
                      fill="none"
                    />
                  </g>
                )}

                {shape.type === "draw" && (
                  <path
                    {...commonProps}
                    d={buildDrawPath(shape.points)}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {(shape.type === "text" || shape.type === "note") && (
                  <g>
                    <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      fill={shape.backgroundColor && shape.backgroundColor !== "transparent" ? shape.backgroundColor : (shape.fill === "solid" ? `${shape.color}14` : "transparent")}
                      stroke={shape.backgroundColor && shape.backgroundColor !== "transparent" ? "transparent" : shape.color}
                      strokeWidth={1}
                      strokeDasharray={shape.dash === "dashed" ? "6 6" : shape.dash === "dotted" ? "2 5" : "4 4"}
                      style={{ opacity: (shape.backgroundColor && shape.backgroundColor !== "transparent") ? 1 : (isSelected || editingText?.id === shape.id ? 0.72 : 0.42) }}
                    />
                    <foreignObject
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      pointerEvents="none"
                    >
                      <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                          color: shape.color,
                          fontSize: `${shape.fontSize || 18}px`,
                          fontFamily: getFontFamily(shape.font),
                          textAlign: shape.align === 'start' ? 'left' : shape.align === 'end' ? 'right' : 'center',
                          textTransform: shape.textTransform || 'none',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: shape.align === 'start' ? 'flex-start' : shape.align === 'end' ? 'flex-end' : 'center',
                          padding: '8px',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          userSelect: 'none',
                          fontWeight: shape.fontWeight || 'normal',
                          fontStyle: shape.fontStyle || 'normal',
                          textDecoration: shape.textDecoration || 'none'
                        }}
                      >
                        {shape.text}
                      </div>
                    </foreignObject>
                  </g>
                )}

                {shape.type === "image" && (
                  <g>
                    <rect
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      rx="8"
                      fill="transparent"
                      stroke={shape.color}
                      strokeWidth={1}
                      style={{ opacity: 0.2 }}
                    />
                    <image
                      href={shape.src}
                      x={shape.x}
                      y={shape.y}
                      width={shape.w}
                      height={shape.h}
                      preserveAspectRatio="none"
                      clipPath={`inset(0 round 8px)`}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {selectedBounds && selectedBounds.id !== "__all__" &&
            shapes.find(s => s.id === selectedBounds.id)?.type !== "draw" && 
            shapes.find(s => s.id === selectedBounds.id)?.type !== "arrow" && (
            <g>
              <rect
                x={selectedBounds.x}
                y={selectedBounds.y}
                width={Math.max(selectedBounds.w, 1)}
                height={Math.max(selectedBounds.h, 1)}
                fill="none"
                stroke="#5a9cff"
                strokeWidth={1.5 / viewport.scale}
                pointerEvents="none"
              />
              {/* Corner Handles for resizing */}
              {[
                { x: selectedBounds.x, y: selectedBounds.y, cursor: 'nwse-resize', handle: 'nw' },
                { x: selectedBounds.x + selectedBounds.w, y: selectedBounds.y, cursor: 'nesw-resize', handle: 'ne' },
                { x: selectedBounds.x, y: selectedBounds.y + selectedBounds.h, cursor: 'nesw-resize', handle: 'sw' },
                { x: selectedBounds.x + selectedBounds.w, y: selectedBounds.y + selectedBounds.h, cursor: 'nwse-resize', handle: 'se' },
              ].map((h, i) => (
                <rect
                  key={i}
                  x={h.x - 4 / viewport.scale}
                  y={h.y - 4 / viewport.scale}
                  width={8 / viewport.scale}
                  height={8 / viewport.scale}
                  fill="#ffffff"
                  stroke="#5a9cff"
                  strokeWidth={1 / viewport.scale}
                  style={{ cursor: h.cursor }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleCanvasPointerDown(e, { kind: 'resize', handle: h.handle });
                  }}
                />
              ))}

              {/* Arrow Bending Handle */}
              {shapes.find(s => s.id === selectedBounds.id)?.type === "arrow" && (() => {
                const s = shapes.find(s => s.id === selectedBounds.id);
                const mx = s.midpoint ? s.midpoint.x : (s.x + s.x2) / 2;
                const my = s.midpoint ? s.midpoint.y : (s.y + s.y2) / 2;
                return (
                  <circle
                    cx={mx}
                    cy={my}
                    r={4 / viewport.scale}
                    fill="#ffffff"
                    stroke="#2d79f6"
                    strokeWidth={1.5 / viewport.scale}
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleCanvasPointerDown(e, { kind: 'bend', shapeId: s.id });
                    }}
                  />
                );
              })()}
            </g>
          )}

          {selectedBounds && selectedBounds.id === "__all__" && (
            <g>
              <rect
                x={selectedBounds.x}
                y={selectedBounds.y}
                width={Math.max(selectedBounds.w, 1)}
                height={Math.max(selectedBounds.h, 1)}
                fill="none"
                stroke="#5a9cff"
                strokeWidth={1.5 / viewport.scale}
                strokeDasharray={`${8 / viewport.scale} ${6 / viewport.scale}`}
                opacity="0.9"
                pointerEvents="none"
              />
            </g>
          )}

          {selectedBounds &&
            shapes.find((s) => s.id === selectedBounds.id)?.type === "arrow" && (() => {
              const s = shapes.find((shape) => shape.id === selectedBounds.id);
              const mx = s.midpoint ? s.midpoint.x : (s.x + s.x2) / 2;
              const my = s.midpoint ? s.midpoint.y : (s.y + s.y2) / 2;
              return (
                <g>
                  <path
                    d={getArrowPath(s)}
                    fill="none"
                    stroke="#5a9cff"
                    strokeWidth={1.5 / viewport.scale}
                    strokeDasharray={`${6 / viewport.scale} ${6 / viewport.scale}`}
                    opacity="0.85"
                    pointerEvents="none"
                  />
                  {[
                    { x: s.x, y: s.y },
                    { x: s.x2, y: s.y2 },
                  ].map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={5 / viewport.scale}
                      fill="#ffffff"
                      stroke="#5a9cff"
                      strokeWidth={1.5 / viewport.scale}
                      pointerEvents="none"
                    />
                  ))}
                  <circle
                    cx={mx}
                    cy={my}
                    r={5 / viewport.scale}
                    fill="#ffffff"
                    stroke="#2d79f6"
                    strokeWidth={1.5 / viewport.scale}
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleCanvasPointerDown(e, { kind: 'bend', shapeId: s.id });
                    }}
                  />
                </g>
              );
            })()}
        </g>
      </svg>

      {editingText && (
        <textarea
          autoFocus
          className={styles.textEditor}
          style={{
            left: editingText.x * viewport.scale + viewport.x,
            top: editingText.y * viewport.scale + viewport.y,
            width: editingText.w * viewport.scale,
            height: editingText.h * viewport.scale,
            color: selectedShape?.type === "text" ? (selectedShape.color || currentColor) : currentColor,
            textAlign: 'left',
            textTransform: selectedShape?.textTransform || currentTextTransform || 'none',
            fontSize: `${(selectedShape?.fontSize || currentFontSize || 18) * viewport.scale}px`,
            fontWeight: selectedShape?.fontWeight || currentFontWeight || 'normal',
            fontStyle: selectedShape?.fontStyle || currentFontStyle || 'normal',
            textDecoration: selectedShape?.textDecoration || currentTextDecoration || 'none',
            verticalAlign: 'top',
          }}
          value={draftText}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onChange={(event) => setDraftText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              commitTextEdit();
            }
            if (event.key === "Escape") {
              setEditingText(null);
              setDraftText("");
            }
          }}
        />
      )}
    </section>
  );
}

function getFill(shape) {
  if (shape.type === "draw" || shape.type === "arrow" || shape.type === "text") return "none";
  if (shape.backgroundColor) return shape.backgroundColor;
  const fill = shape.fill || "none";
  if (fill === "none") return "transparent";
  if (fill === "semi") return shape.color + "33"; // 20% opacity
  if (fill === "solid") return shape.color;
  return "url(#pattern-hatch)"; // Pattern handled in defs? Or simplified.
}

function getDashArray(shape) {
  const dash = shape.dash || "solid";
  if (dash === "dashed") return "8 8";
  if (dash === "dotted") return "2 6";
  return "none";
}

function getFontFamily(font) {
  const fonts = {
    draw: "'Comic Sans MS', cursive",
    sans: "Inter, sans-serif",
    serif: "'Times New Roman', serif",
    mono: "monospace",
  };
  return fonts[font] || fonts.draw;
}

function getArrowPath(shape) {
  const { x, y, x2, y2, midpoint } = shape;
  if (!midpoint) return `M ${x} ${y} L ${x2} ${y2}`;
  return `M ${x} ${y} Q ${midpoint.x} ${midpoint.y} ${x2} ${y2}`;
}

function getShapePath(shape) {
  const { x, y, w, h, type } = shape;
  const right = x + w;
  const bottom = y + h;
  const midX = x + w / 2;
  const midY = y + h / 2;

  if (type === "diamond") {
    return `M ${midX} ${y} L ${right} ${midY} L ${midX} ${bottom} L ${x} ${midY} Z`;
  }

  if (type === "triangle") {
    return `M ${midX} ${y} L ${right} ${bottom} L ${x} ${bottom} Z`;
  }

  if (type === "hexagon") {
    const inset = w * 0.2;
    return `M ${x + inset} ${y} L ${right - inset} ${y} L ${right} ${midY} L ${right - inset} ${bottom} L ${x + inset} ${bottom} L ${x} ${midY} Z`;
  }

  if (type === "oval") {
    return `M ${x} ${midY} C ${x} ${y + h * 0.15}, ${x + w * 0.2} ${y}, ${midX} ${y} C ${right - w * 0.2} ${y}, ${right} ${y + h * 0.15}, ${right} ${midY} C ${right} ${bottom - h * 0.15}, ${right - w * 0.2} ${bottom}, ${midX} ${bottom} C ${x + w * 0.2} ${bottom}, ${x} ${bottom - h * 0.15}, ${x} ${midY} Z`;
  }

  if (type === "parallelogram") {
    const skew = w * 0.18;
    return `M ${x + skew} ${y} L ${right} ${y} L ${right - skew} ${bottom} L ${x} ${bottom} Z`;
  }

  if (type === "star") {
    const outer = Math.min(w, h) / 2;
    const inner = outer * 0.45;
    let path = "";
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const px = midX + Math.cos(angle) * radius;
      const py = midY + Math.sin(angle) * radius;
      path += `${index === 0 ? "M" : "L"} ${px} ${py} `;
    }
    return `${path}Z`;
  }

  if (type === "cloud") {
    return `M ${x + w * 0.2} ${bottom - h * 0.18}
      C ${x + w * 0.08} ${bottom - h * 0.18}, ${x + w * 0.02} ${bottom - h * 0.3}, ${x + w * 0.04} ${midY}
      C ${x - w * 0.01} ${midY - h * 0.18}, ${x + w * 0.08} ${y + h * 0.18}, ${x + w * 0.25} ${y + h * 0.2}
      C ${x + w * 0.3} ${y + h * 0.02}, ${x + w * 0.48} ${y}, ${x + w * 0.56} ${y + h * 0.14}
      C ${x + w * 0.7} ${y + h * 0.02}, ${right - w * 0.05} ${y + h * 0.16}, ${right - w * 0.08} ${midY}
      C ${right} ${midY}, ${right} ${bottom - h * 0.18}, ${right - w * 0.18} ${bottom - h * 0.18}
      Z`;
  }

  if (type === "heart") {
    return `M ${midX} ${bottom}
      C ${x + w * 0.12} ${bottom - h * 0.32}, ${x} ${midY}, ${x + w * 0.24} ${y + h * 0.2}
      C ${x + w * 0.38} ${y}, ${midX} ${y + h * 0.18}, ${midX} ${y + h * 0.32}
      C ${midX} ${y + h * 0.18}, ${right - w * 0.38} ${y}, ${right - w * 0.24} ${y + h * 0.2}
      C ${right} ${midY}, ${right - w * 0.12} ${bottom - h * 0.32}, ${midX} ${bottom} Z`;
  }

  if (type === "x-box") {
    return `M ${x} ${y} L ${right} ${y} L ${right} ${bottom} L ${x} ${bottom} Z M ${x + w * 0.16} ${y + h * 0.16} L ${right - w * 0.16} ${bottom - h * 0.16} M ${right - w * 0.16} ${y + h * 0.16} L ${x + w * 0.16} ${bottom - h * 0.16}`;
  }

  if (type === "check-box") {
    return `M ${x} ${y} L ${right} ${y} L ${right} ${bottom} L ${x} ${bottom} Z M ${x + w * 0.18} ${midY} L ${x + w * 0.4} ${bottom - h * 0.2} L ${right - w * 0.18} ${y + h * 0.22}`;
  }

  if (type === "left-arrow") {
    return `M ${right} ${y + h * 0.2} L ${x + w * 0.34} ${y + h * 0.2} L ${x + w * 0.34} ${y} L ${x} ${midY} L ${x + w * 0.34} ${bottom} L ${x + w * 0.34} ${bottom - h * 0.2} L ${right} ${bottom - h * 0.2} Z`;
  }

  if (type === "up-arrow") {
    return `M ${x + w * 0.2} ${bottom} L ${x + w * 0.2} ${y + h * 0.34} L ${x} ${y + h * 0.34} L ${midX} ${y} L ${right} ${y + h * 0.34} L ${right - w * 0.2} ${y + h * 0.34} L ${right - w * 0.2} ${bottom} Z`;
  }

  if (type === "down-arrow") {
    return `M ${x + w * 0.2} ${y} L ${right - w * 0.2} ${y} L ${right - w * 0.2} ${bottom - h * 0.34} L ${right} ${bottom - h * 0.34} L ${midX} ${bottom} L ${x} ${bottom - h * 0.34} L ${x + w * 0.2} ${bottom - h * 0.34} Z`;
  }

  if (type === "right-arrow") {
    return `M ${x} ${y + h * 0.2} L ${right - w * 0.34} ${y + h * 0.2} L ${right - w * 0.34} ${y} L ${right} ${midY} L ${right - w * 0.34} ${bottom} L ${right - w * 0.34} ${bottom - h * 0.2} L ${x} ${bottom - h * 0.2} Z`;
  }

  return "";
}
