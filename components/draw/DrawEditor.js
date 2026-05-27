'use client';

import { useState, useRef, useEffect } from "react";
import styles from "./draw-editor.module.css";
import DrawBottomBar from "./DrawBottomBar";
import DrawCanvas from "./DrawCanvas";
import DrawContextToolbar from "./DrawContextToolbar";
import DrawPropertiesPanel from "./DrawPropertiesPanel";
import DrawStatusBar from "./DrawStatusBar";
import DrawTopbar from "./DrawTopbar";
import { useDrawEditor } from "./hooks/useDrawEditor";
import {
  exportCanvasAsPng,
  exportCanvasAsSvg,
} from "./services/export";
import { getShapeBounds } from "./utils";
import { generateExportFileName } from "@/utils/glocalfunc";

export default function DrawEditor({ onSave, onSaveAndNew, onClose, initialImageSrc = "", taskNo = "", username = "" }) {
  const editor = useDrawEditor();
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState(null);
  const editorShellRef = useRef(null);
  const initializedImageRef = useRef("");
  const { setSelectedId } = editor;

  useEffect(() => {
    if (!initialImageSrc) {
      initializedImageRef.current = "";
      return;
    }

    if (initializedImageRef.current === initialImageSrc) return;

    const loadInitialImage = async () => {
      try {
        const response = await fetch(initialImageSrc);
        const blob = await response.blob();
        const extension = blob.type.includes("png") ? "png" : "jpg";
        const file = new File([blob], `reedit-image.${extension}`, { type: blob.type || "image/png" });
        await editor.createMediaShape(file, "image");
        initializedImageRef.current = initialImageSrc;
      } catch (error) {
        console.error("Failed to load initial image for editor:", error);
      }
    };

    const timer = setTimeout(loadInitialImage, 0);
    return () => clearTimeout(timer);
  }, [initialImageSrc, editor]);

  const exportCanvas = async (canvasElement) => {
    setSelectedId(null);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    
    const svg = canvasElement.querySelector("svg");
    if (!svg) return null;

    // Compute content bounds from shapes to crop out empty header space
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasContent = false;
    editor.shapes.forEach((shape) => {
      const bounds = getShapeBounds(shape);
      if (!bounds || (bounds.w === 0 && bounds.h === 0)) return;
      hasContent = true;
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.w);
      maxY = Math.max(maxY, bounds.y + bounds.h);
    });

    const padding = 0;
    const contentX = hasContent ? Math.max(0, minX - padding) : 0;
    const contentY = hasContent ? Math.max(0, minY - padding) : 0;
    const contentW = hasContent
      ? Math.max(1, Math.round(maxX - minX + padding * 2))
      : 800;
    const contentH = hasContent
      ? Math.max(1, Math.round(maxY - minY + padding * 2))
      : 600;

    const svgClone = svg.cloneNode(true);
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("width", `${contentW}`);
    svgClone.setAttribute("height", `${contentH}`);
    svgClone.setAttribute("viewBox", `${contentX} ${contentY} ${contentW} ${contentH}`);

    // Strip viewport transform so shapes render at their raw coordinates
    const g = svgClone.querySelector("g[transform]");
    if (g) {
      g.removeAttribute("transform");
    }

    const serialized = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    
    return new File([blob], "bug-screenshot.svg", { type: "image/svg+xml" });
  };

  const handleContinueSave = async () => {
    const canvasElement = editor.canvasRef.current;
    if (!canvasElement) {
      onSave?.(null);
      return;
    }

    try {
      const file = await exportCanvas(canvasElement);
      onSave?.(file);
    } catch (e) {
      console.error("Failed to export canvas:", e);
      onSave?.(null);
    }
  };

  const handleSaveAndNew = async () => {
    const canvasElement = editor.canvasRef.current;
    if (!canvasElement) {
      onSaveAndNew?.(null);
      return;
    }

    try {
      const file = await exportCanvas(canvasElement);
      if (file) {
        editor.clearCanvas();
        initializedImageRef.current = "";
      }
      onSaveAndNew?.(file);
    } catch (e) {
      console.error("Failed to export canvas:", e);
      onSaveAndNew?.(null);
    }
  };

  const handleShapeMenuToggle = (anchor = "bottom", nextValue) => {
    setShapeMenuAnchor((current) => {
      if (nextValue === false) return null;
      if (typeof nextValue === "boolean") return nextValue ? anchor : null;
      return current === anchor ? null : anchor;
    });
  };

  const handleShapeSelect = (shapeType) => {
    editor.setCurrentShapeType(shapeType);
    editor.setActiveTool("shape");
    setShapeMenuAnchor(null);
  };

  const handleExportSvg = () => {
    const filename = generateExportFileName(username, taskNo, 'svg');
    exportCanvasAsSvg(editor.canvasRef.current, filename);
  };

  const handleExportPng = async () => {
    const filename = generateExportFileName(username, taskNo, 'png');
    await exportCanvasAsPng(editor.canvasRef.current, filename);
  };

  return (
    <div className={styles.editorShell} ref={editorShellRef}>
      <DrawTopbar
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onSave={handleContinueSave}
        onSaveAndNew={onSaveAndNew ? handleSaveAndNew : null}
        onClose={onClose}
      />

      <main className={styles.canvasArea}>
        <DrawCanvas
          buildDrawPath={editor.buildDrawPath}
          canvasRef={editor.canvasRef}
          commitTextEdit={editor.commitTextEdit}
          currentColor={editor.currentColor}
          draftText={editor.draftText}
          editingText={editor.editingText}
          handleCanvasDoubleClick={editor.handleCanvasDoubleClick}
          handleCanvasDragOver={editor.handleCanvasDragOver}
          handleCanvasDrop={editor.handleCanvasDrop}
          handleCanvasPointerDown={editor.handleCanvasPointerDown}
          handleCanvasPointerMove={editor.handleCanvasPointerMove}
          handleCanvasPointerUp={editor.handleCanvasPointerUp}
          handleWheel={editor.handleWheel}
          selectedBounds={editor.selectedBounds}
          selectedShape={editor.selectedShape}
          setDraftText={editor.setDraftText}
          setEditingText={editor.setEditingText}
          shapes={editor.shapes}
          triggerMediaPicker={editor.triggerMediaPicker}
          viewport={editor.viewport}
        />

        <DrawContextToolbar
          deleteShape={editor.deleteShape}
          duplicateSelectedShape={editor.duplicateSelectedShape}
          moveSelectedShapeLayer={editor.moveSelectedShapeLayer}
          selectedBounds={editor.selectedBounds}
          selectedId={editor.selectedId}
          viewport={editor.viewport}
        />

        <DrawPropertiesPanel
          activeTool={editor.activeTool}
          applyStylesToSelected={editor.applyStylesToSelected}
          applyColorToMode={editor.applyColorToMode}
          createMediaShape={editor.createMediaShape}
          currentAlign={editor.currentAlign}
          currentColor={editor.currentColor}
          currentDash={editor.currentDash}
          currentFill={editor.currentFill}
          currentBackgroundColor={editor.currentBackgroundColor}
          currentFont={editor.currentFont}
          currentFontSize={editor.currentFontSize}
          currentTextTransform={editor.currentTextTransform}
          currentShapeType={editor.currentShapeType}
          currentStrokeWidth={editor.currentStrokeWidth}
          imageInputRef={editor.imageInputRef}
          isShapeMenuOpen={shapeMenuAnchor === "panel"}
          onShapeMenuToggle={handleShapeMenuToggle}
          onShapeSelect={handleShapeSelect}
          selectedShape={editor.selectedShape}
          setCurrentAlign={editor.setCurrentAlign}
          setCurrentColor={editor.setCurrentColor}
          setCurrentDash={editor.setCurrentDash}
          setCurrentFill={editor.setCurrentFill}
          setCurrentBackgroundColor={editor.setCurrentBackgroundColor}
          setCurrentFont={editor.setCurrentFont}
          setCurrentFontSize={editor.setCurrentFontSize}
          setCurrentTextTransform={editor.setCurrentTextTransform}
          setCurrentShapeType={editor.setCurrentShapeType}
          setCurrentStrokeWidth={editor.setCurrentStrokeWidth}
          triggerMediaPicker={editor.triggerMediaPicker}
        />

        <DrawBottomBar
          activeTool={editor.activeTool}
          beginTextEdit={editor.beginTextEdit}
          currentShapeType={editor.currentShapeType}
          deleteShape={editor.deleteShape}
          duplicateSelectedShape={editor.duplicateSelectedShape}
          handleRedo={editor.handleRedo}
          handleUndo={editor.handleUndo}
          currentColor={editor.currentColor}
          isSpacePanning={editor.isSpacePanning}
          isShapeMenuOpen={shapeMenuAnchor === "bottom"}
          onShapeMenuToggle={handleShapeMenuToggle}
          onShapeSelect={handleShapeSelect}
          selectedId={editor.selectedId}
          selectedShape={editor.selectedShape}
          setActiveTool={editor.setActiveTool}
          triggerMediaPicker={editor.triggerMediaPicker}
        />

        <DrawStatusBar
          setZoom={editor.setZoom}
          viewport={editor.viewport}
        />
      </main>
    </div>
  );
}
