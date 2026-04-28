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
  exportEditorStateAsJson,
} from "./services/export";

export default function DrawEditor({ onSave, onClose, initialImageSrc = "" }) {
  const editor = useDrawEditor();
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState(null);
  const editorShellRef = useRef(null);
  const initializedImageRef = useRef("");

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

  const handleContinueSave = async () => {
    const canvasElement = editor.canvasRef.current;
    if (!canvasElement) {
      onSave?.(null);
      return;
    }

    try {
      const svg = canvasElement.querySelector("svg");
      if (!svg) {
        onSave?.(null);
        return;
      }

      const rect = canvasElement.getBoundingClientRect();
      const svgClone = svg.cloneNode(true);
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgClone.setAttribute("width", `${Math.max(1, Math.round(rect.width))}`);
      svgClone.setAttribute("height", `${Math.max(1, Math.round(rect.height))}`);

      const serialized = new XMLSerializer().serializeToString(svgClone);
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

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = Math.max(1, Math.round(rect.width));
        exportCanvas.height = Math.max(1, Math.round(rect.height));

        const context = exportCanvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context unavailable.");
        }

        context.fillStyle = "#f1f3f5";
        context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        context.drawImage(image, 0, 0, exportCanvas.width, exportCanvas.height);

        let pngBlob = null;
        try {
          pngBlob = await new Promise((resolve) =>
            exportCanvas.toBlob(resolve, "image/png")
          );
        } catch (error) {
          if (error?.name === "SecurityError") {
            const svgFile = new File([blob], "bug-screenshot.svg", { type: "image/svg+xml" });
            onSave?.(svgFile);
            return;
          }
          throw error;
        }

        if (!pngBlob) {
          const svgFile = new File([blob], "bug-screenshot.svg", { type: "image/svg+xml" });
          onSave?.(svgFile);
          return;
        }

        const file = new File([pngBlob], "bug-screenshot.png", { type: "image/png" });
        onSave?.(file);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to export canvas:", e);
      onSave?.(null);
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

  const handleExportJson = () => {
    exportEditorStateAsJson({
      shapes: editor.shapes,
      viewport: editor.viewport,
    });
  };

  const handleExportSvg = () => {
    exportCanvasAsSvg(editor.canvasRef.current);
  };

  const handleExportPng = async () => {
    await exportCanvasAsPng(editor.canvasRef.current);
  };

  return (
    <div className={styles.editorShell} ref={editorShellRef}>
      <DrawTopbar
        onExportJson={handleExportJson}
        onExportPng={handleExportPng}
        onExportSvg={handleExportSvg}
        onSave={handleContinueSave}
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
