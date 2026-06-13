'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_VIEWPORT, STORAGE_KEY } from "../constants";
import { readFileAsDataUrl, validateMediaFile } from "../services/media";
import {
  buildDrawPath,
  cloneShapeForDuplicate,
  distance,
  distToSegment,
  generateId,
  getViewportCenter,
  getShapeBounds,
  normalizeShape,
} from "../utils";

const ALL_SELECTION = "__all__";

export function useDrawEditor() {
  const initialState = useMemo(() => ({ shapes: [], viewport: DEFAULT_VIEWPORT }), []);
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState("select");
  const [currentColor, setCurrentColor] = useState("#1f1f1f");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(4);
  const [currentFill, setCurrentFill] = useState("none");
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState("#ffffff");
  const [currentDash, setCurrentDash] = useState("solid");
  const [currentFont, setCurrentFont] = useState("draw");
  const [currentFontWeight, setCurrentFontWeight] = useState("normal");
  const [currentFontStyle, setCurrentFontStyle] = useState("normal");
  const [currentTextDecoration, setCurrentTextDecoration] = useState("none");
  const [currentAlign, setCurrentAlign] = useState("start");
  const [currentFontSize, setCurrentFontSize] = useState(18);
  const [currentTextTransform, setCurrentTextTransform] = useState("none");
  const [currentShapeType, setCurrentShapeType] = useState("rect");
  const [currentArrowHead, setCurrentArrowHead] = useState("end");
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [history, setHistory] = useState({ past: [], future: [] });
  const [editingText, setEditingText] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [panelMessage, setPanelMessage] = useState("");
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const [copiedShape, setCopiedShape] = useState(null);

  const canvasRef = useRef(null);
  const shapesRef = useRef(shapes);
  const viewportRef = useRef(viewport);
  const interactionRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const copiedShapeRef = useRef(copiedShape);
  const spacePanningRef = useRef(isSpacePanning);
  const storageDisabledRef = useRef(false);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    copiedShapeRef.current = copiedShape;
  }, [copiedShape]);

  useEffect(() => {
    spacePanningRef.current = isSpacePanning;
  }, [isSpacePanning]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (storageDisabledRef.current) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ shapes, viewport })
      );
    } catch (error) {
      if (error?.name === "QuotaExceededError") {
        storageDisabledRef.current = true;
        console.warn("Editor autosave disabled: localStorage quota exceeded.");
        return;
      }
      console.error("Failed to persist editor state:", error);
    }
  }, [shapes, viewport]);

  const isTypingTarget = useCallback((target) => {
    if (!(target instanceof HTMLElement)) return false;
    const tagName = target.tagName;
    return (
      target.isContentEditable ||
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT"
    );
  }, []);

  const selectedShape = useMemo(
    () =>
      selectedId && selectedId !== ALL_SELECTION
        ? shapes.find((shape) => shape.id === selectedId) || null
        : null,
    [shapes, selectedId]
  );

  const selectedBounds = useMemo(
    () => {
      if (selectedShape) {
        return { ...getShapeBounds(selectedShape), id: selectedShape.id };
      }

      if (selectedId === ALL_SELECTION && shapes.length) {
        const bounds = shapes.map((shape) => getShapeBounds(shape));
        return {
          id: ALL_SELECTION,
          x: Math.min(...bounds.map((bound) => bound.x)),
          y: Math.min(...bounds.map((bound) => bound.y)),
          w:
            Math.max(...bounds.map((bound) => bound.x + bound.w)) -
            Math.min(...bounds.map((bound) => bound.x)),
          h:
            Math.max(...bounds.map((bound) => bound.y + bound.h)) -
            Math.min(...bounds.map((bound) => bound.y)),
        };
      }

      return null;
    },
    [selectedId, selectedShape, shapes]
  );

  const inspectorMode = useMemo(() => {
    if (selectedShape) return selectedShape.type;
    return activeTool;
  }, [activeTool, selectedShape]);

  const recordHistory = useCallback((previousShapes, nextShapes) => {
    if (JSON.stringify(previousShapes) === JSON.stringify(nextShapes)) return;
    setHistory((current) => ({
      past: [...current.past, previousShapes],
      future: [],
    }));
  }, []);

  const handleUndo = useCallback(() => {
    const presentShapes = shapesRef.current;
    setHistory((current) => {
      if (!current.past.length) return current;
      const previousShapes = current.past[current.past.length - 1];
      const nextPast = current.past.slice(0, -1);
      setShapes(previousShapes);
      shapesRef.current = previousShapes;
      return {
        past: nextPast,
        future: [presentShapes, ...current.future],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((current) => {
      if (!current.future.length) return current;
      const [nextShapes, ...remaining] = current.future;
      const presentShapes = shapesRef.current;
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return {
        past: [...current.past, presentShapes],
        future: remaining,
      };
    });
  }, []);

  const deleteShape = useCallback((shapeId) => {
    const previousShapes = shapesRef.current;
    const nextShapes =
      shapeId === ALL_SELECTION
        ? []
        : previousShapes.filter((shape) => shape.id !== shapeId);
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(null);
    if (JSON.stringify(previousShapes) !== JSON.stringify(nextShapes)) {
      setHistory((current) => ({
        past: [...current.past, previousShapes],
        future: [],
      }));
    }
  }, []);

  const setZoom = useCallback((nextScale) => {
    setViewport((current) => ({
      ...current,
      scale: Math.min(2.5, Math.max(0.35, nextScale)),
    }));
  }, []);

  const resetViewport = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
  }, []);

  const clearCanvas = useCallback(() => {
    setShapes([]);
    shapesRef.current = [];
    setHistory({ past: [], future: [] });
    setSelectedId(null);
    setDraftText("");
    setEditingText(null);
    setPanelMessage("");
    resetViewport();
  }, [resetViewport]);

  const toCanvasPoint = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return {
      x: (clientX - rect.left - viewportRef.current.x) / viewportRef.current.scale,
      y: (clientY - rect.top - viewportRef.current.y) / viewportRef.current.scale,
    };
  }, []);

  const beginTextEdit = useCallback((point, shapeOverride = null) => {
    setPanelMessage("");
    const existingText =
      shapeOverride ||
      (selectedShape && (selectedShape.type === "text" || selectedShape.type === "note")
        ? selectedShape
        : null);

    if (existingText) {
      const nextWidth = Number(existingText.w) > 0 ? existingText.w : 200;
      const nextHeight = Number(existingText.h) > 0 ? existingText.h : 120;
      setEditingText({
        id: existingText.id,
        x: existingText.x,
        y: existingText.y,
        w: nextWidth,
        h: nextHeight,
        type: existingText.type,
      });
      setDraftText(String(existingText.text ?? ""));
      return;
    }

    setEditingText({ id: null, x: point.x, y: point.y, w: 200, h: 120, type: activeTool === "note" ? "note" : "text" });
    setDraftText("");
  }, [selectedShape, activeTool]);

  const commitTextEdit = useCallback(() => {
    if (!editingText) return;
    const text = draftText.trim();
    const isEditingExistingShape = Boolean(editingText.id);
    setEditingText(null);

    if (!text && !isEditingExistingShape) {
      setDraftText("");
      return;
    }

    const previousShapes = shapesRef.current;
    let nextShapes;
    let nextSelectedId;

    if (isEditingExistingShape) {
      nextShapes = previousShapes.map((shape) =>
        shape.id === editingText.id ? { ...shape, text } : shape
      );
      nextSelectedId = editingText.id;
    } else {
      const newShape = {
        id: generateId("text"),
        type: editingText.type || (activeTool === "note" ? "note" : "text"),
        x: editingText.x,
        y: editingText.y,
        w: 200,
        h: 120,
        text,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        font: currentFont,
        fontWeight: currentFontWeight,
        fontStyle: currentFontStyle,
        textDecoration: currentTextDecoration,
        align: currentAlign,
        fill: currentFill,
        backgroundColor: activeTool === "note" ? "#f3ad47" : currentBackgroundColor,
        fontSize: currentFontSize,
        textTransform: currentTextTransform,
        dash: currentDash,
      };
      nextShapes = [...previousShapes, newShape];
      nextSelectedId = newShape.id;
    }

    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(nextSelectedId);
    setDraftText("");
    setActiveTool("select");
    recordHistory(previousShapes, nextShapes);
  }, [
    currentAlign,
    currentColor,
    currentDash,
    currentFill,
    currentBackgroundColor,
    currentFontSize,
    currentTextTransform,
    currentFont,
    currentFontWeight,
    currentFontStyle,
    currentTextDecoration,
    currentStrokeWidth,
    draftText,
    editingText,
    recordHistory,
    activeTool,
  ]);

  const applyStylesToSelected = useCallback((partial) => {
    if (!selectedId) return;
    const previousShapes = shapesRef.current;
    const nextShapes = previousShapes.map((shape) =>
      shape.id === selectedId ? { ...shape, ...partial } : shape
    );
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    recordHistory(previousShapes, nextShapes);
  }, [recordHistory, selectedId]);

  const applyColorToMode = useCallback((mode, color) => {
    if (!color) return;

    const previousShapes = shapesRef.current;
    const targetTypes = mode === "draw"
      ? ["draw"]
      : mode === "text" || mode === "note"
        ? ["text", "note"]
        : [mode];

    const nextShapes = previousShapes.map((shape) =>
      targetTypes.includes(shape.type) ? { ...shape, color } : shape
    );

    setCurrentColor(color);

    if (JSON.stringify(previousShapes) === JSON.stringify(nextShapes)) return;

    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    recordHistory(previousShapes, nextShapes);
  }, [recordHistory]);

  const duplicateSelectedShape = useCallback(() => {
    if (!selectedShape) return;
    const previousShapes = shapesRef.current;
    const duplicated = cloneShapeForDuplicate(selectedShape);
    const nextShapes = [...previousShapes, duplicated];
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(duplicated.id);
    recordHistory(previousShapes, nextShapes);
  }, [recordHistory, selectedShape]);

  const copySelectedShape = useCallback(() => {
    if (!selectedShape) return;
    setCopiedShape(JSON.parse(JSON.stringify(selectedShape)));
    setPanelMessage("Copied selection.");
  }, [selectedShape]);

  const pasteCopiedShape = useCallback(() => {
    if (!copiedShapeRef.current) return false;
    const previousShapes = shapesRef.current;
    const duplicated = cloneShapeForDuplicate(copiedShapeRef.current);
    const nextShapes = [...previousShapes, duplicated];
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(duplicated.id);
    setActiveTool("select");
    recordHistory(previousShapes, nextShapes);
    setPanelMessage("Pasted selection.");
    return true;
  }, [recordHistory]);

  const moveSelectedShapeLayer = useCallback((direction) => {
    if (!selectedShape) return;

    const previousShapes = shapesRef.current;
    const currentIndex = previousShapes.findIndex((shape) => shape.id === selectedShape.id);
    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= previousShapes.length) {
      return;
    }

    const nextShapes = [...previousShapes];
    [nextShapes[currentIndex], nextShapes[nextIndex]] = [
      nextShapes[nextIndex],
      nextShapes[currentIndex],
    ];

    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    recordHistory(previousShapes, nextShapes);
  }, [recordHistory, selectedShape]);

  const createTextShapeFromContent = useCallback((text, point = null) => {
    const trimmedText = text.trim();
    if (!trimmedText) return false;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return false;

    const origin = point || getViewportCenter(viewportRef.current, rect);
    const width = Math.min(360, Math.max(180, trimmedText.length * 8));
    const height = trimmedText.length > 60 ? 136 : 112;

    const newShape = {
      id: generateId("text"),
      type: "text",
      x: origin.x,
      y: origin.y,
      w: width,
      h: height,
      text: trimmedText,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      font: currentFont,
      fontWeight: currentFontWeight,
      fontStyle: currentFontStyle,
      textDecoration: currentTextDecoration,
      align: currentAlign,
      fill: currentFill,
      backgroundColor: activeTool === "note" ? "#f3ad47" : currentBackgroundColor,
      fontSize: currentFontSize,
      textTransform: currentTextTransform,
      dash: currentDash,
    };

    const previousShapes = shapesRef.current;
    const nextShapes = [...previousShapes, newShape];
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(newShape.id);
    setActiveTool("select");
    recordHistory(previousShapes, nextShapes);
    return true;
  }, [
    currentAlign,
    currentColor,
    currentDash,
    currentFill,
    currentBackgroundColor,
    currentFontSize,
    currentTextTransform,
    currentFont,
    currentFontWeight,
    currentFontStyle,
    currentTextDecoration,
    currentStrokeWidth,
    recordHistory,
    activeTool,
  ]);

  const createMediaShape = useCallback(async (file, kind, point = null) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPanelMessage("");

    try {
      validateMediaFile(file, "image");
      const src = await readFileAsDataUrl(file);
      const center = point || getViewportCenter(viewportRef.current, rect);

      // Get natural dimensions of image
      let naturalWidth = 280;
      let naturalHeight = 200;

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          naturalWidth = img.naturalWidth;
          naturalHeight = img.naturalHeight;
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });

      let width = naturalWidth;
      let height = naturalHeight;

      const padding = 80;
      const currentScale = viewportRef.current.scale || 1;
      const maxWidth = (rect.width > padding ? rect.width - padding : rect.width) / currentScale;
      const maxHeight = (rect.height > padding ? rect.height - padding : rect.height) / currentScale;

      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio);
        width = width * scale;
        height = height * scale;
      }

      const newShape = {
        id: generateId("image"),
        type: "image",
        x: center.x - width / 2,
        y: center.y - height / 2,
        w: width,
        h: height,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        src,
        fileName: file.name,
      };

      const previousShapes = shapesRef.current;
      const nextShapes = [...previousShapes, newShape];
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      setSelectedId(newShape.id);
      setActiveTool("select");
      recordHistory(previousShapes, nextShapes);
      setPanelMessage(`Image added (${Math.round(naturalWidth)}x${Math.round(naturalHeight)}).`);
    } catch (error) {
      setPanelMessage(error.message || "Upload failed.");
    }
  }, [currentColor, currentStrokeWidth, recordHistory]);

  const triggerMediaPicker = useCallback(() => {
    setPanelMessage("");
    imageInputRef.current?.click();
  }, []);

  const updateSelectedText = useCallback((text) => {
    if (!selectedShape || (selectedShape.type !== "text" && selectedShape.type !== "note")) return;
    const previousShapes = shapesRef.current;
    const nextShapes = previousShapes.map((shape) =>
      shape.id === selectedShape.id ? { ...shape, text } : shape
    );
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    recordHistory(previousShapes, nextShapes);
  }, [recordHistory, selectedShape]);

  const createCenteredText = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const center = getViewportCenter(viewportRef.current, rect);
    const previousShapes = shapesRef.current;
    const isNote = activeTool === "note";
    const newShape = {
      id: generateId(isNote ? "note" : "text"),
      type: isNote ? "note" : "text",
      x: center.x - 100,
      y: center.y - 60,
      w: 200,
      h: 120,
      text: draftText.trim() || "New text",
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      font: currentFont,
      fontWeight: currentFontWeight,
      fontStyle: currentFontStyle,
      textDecoration: currentTextDecoration,
      align: currentAlign,
      fill: currentFill,
      backgroundColor: isNote ? "#f3ad47" : currentBackgroundColor,
      fontSize: currentFontSize,
      textTransform: currentTextTransform,
      dash: currentDash,
    };

    const nextShapes = [...previousShapes, newShape];
    setShapes(nextShapes);
    shapesRef.current = nextShapes;
    setSelectedId(newShape.id);
    setActiveTool("select");
    recordHistory(previousShapes, nextShapes);
  }, [
    currentAlign,
    currentColor,
    currentDash,
    currentFill,
    currentBackgroundColor,
    currentFontSize,
    currentTextTransform,
    currentFont,
    currentFontWeight,
    currentFontStyle,
    currentTextDecoration,
    currentStrokeWidth,
    draftText,
    recordHistory,
    activeTool,
  ]);

  useEffect(() => {
    function onKeyDown(event) {
      const isModifier = event.metaKey || event.ctrlKey;
      const typingInField = isTypingTarget(event.target);

      if (!typingInField && event.key === " ") {
        event.preventDefault();
        setIsSpacePanning(true);
        return;
      }

      if (isModifier && event.key.toLowerCase() === "z" && !event.shiftKey) {
        if (typingInField) return;
        event.preventDefault();
        handleUndo();
        return;
      }

      if (
        (isModifier && event.key.toLowerCase() === "y") ||
        (isModifier && event.shiftKey && event.key.toLowerCase() === "z")
      ) {
        if (typingInField) return;
        event.preventDefault();
        handleRedo();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        if (typingInField) return;
        event.preventDefault();
        deleteShape(selectedId);
        return;
      }

      if (isModifier && event.key.toLowerCase() === "a") {
        if (typingInField) return;
        event.preventDefault();
        if (shapesRef.current.length) {
          setSelectedId(ALL_SELECTION);
        }
        return;
      }

      if (isModifier && event.key.toLowerCase() === "c") {
        if (typingInField || !selectedShape) return;
        event.preventDefault();
        copySelectedShape();
        return;
      }

      if (isModifier && event.key.toLowerCase() === "d") {
        if (typingInField || !selectedShape) return;
        event.preventDefault();
        duplicateSelectedShape();
        return;
      }

      if (!isModifier && !editingText) {
        // Don't change tool if user is typing in a selected text shape
        if (selectedShape?.type === "text" || selectedShape?.type === "note") {
          return;
        }

        const toolShortcuts = {
          v: "select",
          h: "pan",
          d: "draw",
          e: "eraser",
          a: "arrow",
          t: "text",
          n: "note",
          r: "rect",
          o: "ellipse",
          s: "shape",
          u: "media",
        };

        const nextTool = toolShortcuts[event.key.toLowerCase()];
        if (nextTool) {
          setActiveTool(nextTool);
        }
      }
    }

    function onKeyUp(event) {
      if (event.key === " ") {
        setIsSpacePanning(false);
      }
    }

    function onCopy(event) {
      if (isTypingTarget(event.target) || !selectedShape) return;
      event.preventDefault();
      const payload = JSON.stringify(selectedShape);
      event.clipboardData?.setData("application/x-custom-draw-shape", payload);
      event.clipboardData?.setData("text/plain", payload);
      copySelectedShape();
    }

    async function onPaste(event) {
      if (isTypingTarget(event.target)) return;

      const shapePayload = event.clipboardData?.getData("application/x-custom-draw-shape");
      if (shapePayload) {
        event.preventDefault();
        try {
          const parsedShape = JSON.parse(shapePayload);
          setCopiedShape(parsedShape);
          copiedShapeRef.current = parsedShape;
          pasteCopiedShape();
          return;
        } catch {
          // Fall through to other paste handlers.
        }
      }

      const clipboardItems = Array.from(event.clipboardData?.items || []);
      const mediaItem = clipboardItems.find((item) =>
        item.kind === "file" &&
        item.type.startsWith("image/")
      );

      if (mediaItem) {
        const file = mediaItem.getAsFile();
        if (file) {
          event.preventDefault();
          await createMediaShape(file, "image");
        }
        return;
      }

      const clipboardText = event.clipboardData?.getData("text/plain")?.trim();
      if (clipboardText) {
        event.preventDefault();
        createTextShapeFromContent(clipboardText);
        return;
      }

      if (copiedShapeRef.current) {
        event.preventDefault();
        pasteCopiedShape();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("copy", onCopy);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("paste", onPaste);
    };
  }, [
    copySelectedShape,
    createMediaShape,
    createTextShapeFromContent,
    deleteShape,
    duplicateSelectedShape,
    handleRedo,
    handleUndo,
    isTypingTarget,
    pasteCopiedShape,
    selectedShape,
    selectedId,
  ]);

  const handleCanvasPointerDown = useCallback((event, override = null) => {
    if (editingText) {
      if (isTypingTarget(event.target)) {
        return;
      }
      commitTextEdit();
    }

    const point = toCanvasPoint(event.clientX, event.clientY);
    const pointerId = event.pointerId;

    if (override?.kind === 'resize' || override?.kind === 'bend') {
      interactionRef.current = {
        kind: override.kind,
        pointerId,
        handle: override.handle,
        shapeId: override.shapeId || selectedId,
        startPoint: point,
        startShapes: shapesRef.current,
        startBounds: selectedBounds,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    const targetId = event.target.closest("[data-shape-id]")?.getAttribute("data-shape-id");
    const targetShape = targetId
      ? shapesRef.current.find((shape) => shape.id === targetId)
      : null;

    if (activeTool === "eraser" && targetId) {
      deleteShape(targetId);
      return;
    }

    if (
      targetShape &&
      event.detail >= 2 &&
      (targetShape.type === "text" || targetShape.type === "note")
    ) {
      setSelectedId(targetId);
      beginTextEdit({ x: targetShape.x, y: targetShape.y }, targetShape);
      return;
    }

    if (
      (activeTool === "text" || activeTool === "note") &&
      targetShape &&
      (targetShape.type === "text" || targetShape.type === "note")
    ) {
      setSelectedId(targetId);
      return;
    }

    if (event.button === 1 || spacePanningRef.current || activeTool === "pan") {
      interactionRef.current = {
        kind: "pan",
        pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startViewport: viewportRef.current,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    if (targetId) {
      setSelectedId(targetId);
    } else if (activeTool === "select") {
      setSelectedId(null);
    }

    const previousShapes = shapesRef.current;

    if (activeTool === "select" && targetId) {
      interactionRef.current = {
        kind: "move-shape",
        pointerId,
        shapeId: targetId,
        startPoint: point,
        startShapes: previousShapes,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    if (activeTool === "draw") {
      const shapeId = generateId("draw");
      const newShape = {
        id: shapeId,
        type: "draw",
        points: [point, point],
        color: currentColor,
        strokeWidth: currentStrokeWidth,
      };
      const nextShapes = [...previousShapes, newShape];
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      setSelectedId(shapeId);
      interactionRef.current = {
        kind: "draw",
        pointerId,
        shapeId,
        startShapes: previousShapes,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    if (activeTool === "text" || activeTool === "note") {
      const shapeId = generateId(activeTool === "note" ? "note" : "text");
      const isNote = activeTool === "note";
      const newShape = {
        id: shapeId,
        type: isNote ? "note" : "text",
        x: point.x,
        y: point.y,
        w: 0,
        h: 0,
        text: "",
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        fill: currentFill,
        backgroundColor: isNote ? "#f3ad47" : currentBackgroundColor,
        dash: currentDash,
        font: currentFont,
        align: currentAlign,
        arrowHead: currentArrowHead,
        fontSize: currentFontSize,
        fontWeight: currentFontWeight,
        fontStyle: currentFontStyle,
        textDecoration: currentTextDecoration,
        textTransform: currentTextTransform,
      };
      const nextShapes = [...previousShapes, newShape];
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      setSelectedId(shapeId);
      interactionRef.current = {
        kind: "text-draft",
        pointerId,
        shapeId,
        startPoint: point,
        startShapes: previousShapes,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    if (activeTool === "arrow") {
      const shapeId = generateId("arrow");
      const newShape = {
        id: shapeId,
        type: "arrow",
        x: point.x,
        y: point.y,
        x2: point.x,
        y2: point.y,
        midpoint: null,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        dash: currentDash,
        arrowHead: currentArrowHead,
      };
      const nextShapes = [...previousShapes, newShape];
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      setSelectedId(shapeId);
      interactionRef.current = {
        kind: "arrow-draft",
        pointerId,
        shapeId,
        startShapes: previousShapes,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }

    if (
      activeTool === "rect" ||
      activeTool === "ellipse" ||
      activeTool === "media" ||
      activeTool === "shape"
    ) {
      if (activeTool === "media") {
        triggerMediaPicker();
        return;
      }

      const shapeId = generateId(activeTool === "shape" ? currentShapeType : activeTool);
      const newShape = {
        id: shapeId,
        type: activeTool === "shape" ? currentShapeType : activeTool,
        x: point.x,
        y: point.y,
        w: 0,
        h: 0,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        fill: "none",
        backgroundColor: "transparent",
        dash: currentDash,
      };

      const nextShapes = [...previousShapes, newShape];
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      setSelectedId(shapeId);
      interactionRef.current = {
        kind: "shape-draft",
        pointerId,
        shapeId,
        startPoint: point,
        startShapes: previousShapes,
      };
      event.currentTarget.setPointerCapture(pointerId);
      return;
    }
  }, [
    activeTool,
    commitTextEdit,
    currentAlign,
    currentColor,
    currentDash,
    currentFill,
    currentBackgroundColor,
    currentFontSize,
    currentTextTransform,
    currentFont,
    currentFontWeight,
    currentFontStyle,
    currentTextDecoration,
    currentShapeType,
    currentStrokeWidth,
    currentArrowHead,
    deleteShape,
    editingText,
    beginTextEdit,
    selectedBounds,
    selectedId,
    triggerMediaPicker,
    toCanvasPoint,
    isTypingTarget,
  ]);

  const handleCanvasPointerMove = useCallback((event) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    const point = toCanvasPoint(event.clientX, event.clientY);

    if (interaction.kind === "pan") {
      const deltaX = event.clientX - interaction.startClientX;
      const deltaY = event.clientY - interaction.startClientY;
      setViewport({
        ...interaction.startViewport,
        x: interaction.startViewport.x + deltaX,
        y: interaction.startViewport.y + deltaY,
      });
      return;
    }

    if (interaction.kind === "move-shape") {
      const offsetX = point.x - interaction.startPoint.x;
      const offsetY = point.y - interaction.startPoint.y;
      const nextShapes = interaction.startShapes.map((shape) => {
        if (shape.id !== interaction.shapeId) return shape;
        if (shape.type === "arrow") {
          return {
            ...shape,
            x: shape.x + offsetX,
            y: shape.y + offsetY,
            x2: shape.x2 + offsetX,
            y2: shape.y2 + offsetY,
          };
        }
        if (shape.type === "draw") {
          return {
            ...shape,
            points: shape.points.map((currentPoint) => ({
              x: currentPoint.x + offsetX,
              y: currentPoint.y + offsetY,
            })),
          };
        }
        return { ...shape, x: shape.x + offsetX, y: shape.y + offsetY };
      });
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "draw") {
      const nextShapes = shapesRef.current.map((shape) => {
        if (shape.id !== interaction.shapeId) return shape;
        const lastPoint = shape.points[shape.points.length - 1];
        if (distance(lastPoint, point) < 2) return shape;
        return { ...shape, points: [...shape.points, point] };
      });
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "shape-draft") {
      const nextShapes = shapesRef.current.map((shape) =>
        shape.id === interaction.shapeId
          ? normalizeShape({
              ...shape,
              w: point.x - interaction.startPoint.x,
              h: point.y - interaction.startPoint.y,
            })
          : shape
      );
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "text-draft") {
      const nextShapes = shapesRef.current.map((shape) =>
        shape.id === interaction.shapeId
          ? normalizeShape({
              ...shape,
              w: point.x - interaction.startPoint.x,
              h: point.y - interaction.startPoint.y,
            })
          : shape
      );
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "resize") {
      const offsetX = point.x - interaction.startPoint.x;
      const offsetY = point.y - interaction.startPoint.y;
      const bounds = interaction.startBounds;

      const nextShapes = interaction.startShapes.map((shape) => {
        if (shape.id !== interaction.shapeId) return shape;

        let nextX = shape.x;
        let nextY = shape.y;
        let nextW = shape.w;
        let nextH = shape.h;

        if (interaction.handle.includes("n")) {
          nextY = bounds.y + offsetY;
          nextH = bounds.h - offsetY;
        }
        if (interaction.handle.includes("s")) {
          nextH = bounds.h + offsetY;
        }
        if (interaction.handle.includes("w")) {
          nextX = bounds.x + offsetX;
          nextW = bounds.w - offsetX;
        }
        if (interaction.handle.includes("e")) {
          nextW = bounds.w + offsetX;
        }

        // Constraints
        nextW = Math.max(10, nextW);
        nextH = Math.max(10, nextH);

        return { ...shape, x: nextX, y: nextY, w: nextW, h: nextH };
      });

      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "bend") {
      const { startShapes, shapeId } = interaction;
      const shape = startShapes.find(s => s.id === shapeId);
      if (!shape) return;

      // Distance to line snapping
      const d = distToSegment(point, { x: shape.x, y: shape.y }, { x: shape.x2, y: shape.y2 });
      const snapThreshold = 10;
      
      const nextShapes = shapesRef.current.map((s) => {
        if (s.id !== shapeId) return s;
        return { ...s, midpoint: d < snapThreshold ? null : { x: point.x, y: point.y } };
      });
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
      return;
    }

    if (interaction.kind === "arrow-draft") {
      const nextShapes = shapesRef.current.map((shape) =>
        shape.id === interaction.shapeId
          ? {
              ...shape,
              x2: point.x,
              y2: point.y,
            }
          : shape
      );
      setShapes(nextShapes);
      shapesRef.current = nextShapes;
    }
  }, [toCanvasPoint]);

  const handleCanvasDoubleClick = useCallback((event) => {
    const targetId = event.target.closest("[data-shape-id]")?.getAttribute("data-shape-id");
    const resolvedId = targetId || selectedId;
    if (!resolvedId) return;

    const targetShape = shapesRef.current.find((shape) => shape.id === resolvedId);
    if (!targetShape) return;

    if (targetShape.type === "text" || targetShape.type === "note") {
      interactionRef.current = null;
      setSelectedId(resolvedId);
      setActiveTool("select");
      requestAnimationFrame(() => {
        beginTextEdit({ x: targetShape.x, y: targetShape.y }, targetShape);
      });
    }
  }, [beginTextEdit, selectedId]);

  const handleCanvasPointerUp = useCallback((event) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture(event.pointerId);

    if (
      interaction.kind === "move-shape" ||
      interaction.kind === "draw" ||
      interaction.kind === "shape-draft" ||
      interaction.kind === "text-draft" ||
      interaction.kind === "arrow-draft" ||
      interaction.kind === "resize" ||
      interaction.kind === "bend"
    ) {
      recordHistory(interaction.startShapes, shapesRef.current);
    }

    if (interaction.kind === "text-draft") {
      const textShape = shapesRef.current.find((shape) => shape.id === interaction.shapeId);
      if (textShape) {
        const nextW = textShape.w < 24 ? 200 : textShape.w;
        const nextH = textShape.h < 24 ? 120 : textShape.h;
        const nextShapes = shapesRef.current.map((shape) =>
          shape.id === interaction.shapeId
            ? { ...shape, w: nextW, h: nextH }
            : shape
        );
        setShapes(nextShapes);
        shapesRef.current = nextShapes;
        setEditingText({
          id: interaction.shapeId,
          x: textShape.x,
          y: textShape.y,
          w: nextW,
          h: nextH,
        });
        setDraftText("");
        setActiveTool("select");
      }
    }

    if (interaction.kind === "shape-draft") {
      setActiveTool("select");
    }

    if (interaction.kind === "arrow-draft") {
      setActiveTool("select");
    }

    interactionRef.current = null;
  }, [recordHistory]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (!event.ctrlKey && !event.metaKey) {
      setViewport((current) => ({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }));
      return;
    }

    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08;
    const nextScale = Math.min(2.5, Math.max(0.35, viewportRef.current.scale * zoomFactor));

    const worldX = (pointerX - viewportRef.current.x) / viewportRef.current.scale;
    const worldY = (pointerY - viewportRef.current.y) / viewportRef.current.scale;

    setViewport({
      scale: nextScale,
      x: pointerX - worldX * nextScale,
      y: pointerY - worldY * nextScale,
    });
  }, []);

  const handleCanvasDragOver = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleCanvasDrop = useCallback(async (event) => {
    event.preventDefault();

    const point = toCanvasPoint(event.clientX, event.clientY);
    const files = Array.from(event.dataTransfer?.files || []);
    const supportedFile = files.find(
      (file) => file.type.startsWith("image/")
    );

    if (supportedFile) {
      await createMediaShape(supportedFile, "image", point);
      return;
    }

    const droppedText = event.dataTransfer?.getData("text/plain")?.trim();
    if (droppedText) {
      createTextShapeFromContent(droppedText, point);
    }
  }, [createMediaShape, createTextShapeFromContent, toCanvasPoint]);

  return {
    activeTool,
    buildDrawPath,
    canvasRef,
    commitTextEdit,
    copySelectedShape,
    createMediaShape,
    createTextShapeFromContent,
    currentColor,
    currentStrokeWidth,
    currentFill,
    currentBackgroundColor,
    currentDash,
    currentFont,
    currentAlign,
    currentFontSize,
    currentTextTransform,
    currentShapeType,
    currentArrowHead,
    deleteShape,
    draftText,
    duplicateSelectedShape,
    editingText,
    handleCanvasDoubleClick,
    handleCanvasDragOver,
    handleCanvasDrop,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleRedo,
    handleUndo,
    handleWheel,
    history,
    imageInputRef,
    inspectorMode,
    isSpacePanning,
    moveSelectedShapeLayer,
    panelMessage,
    pasteCopiedShape,
    resetViewport,
    clearCanvas,
    applyColorToMode,
    selectedBounds,
    selectedId,
    setSelectedId,
    selectedShape,
    setActiveTool,
    setCurrentColor,
    setCurrentStrokeWidth,
    setCurrentFill,
    setCurrentBackgroundColor,
    setCurrentDash,
    setCurrentFont,
    setCurrentFontWeight,
    setCurrentFontStyle,
    setCurrentTextDecoration,
    setCurrentAlign,
    setCurrentFontSize,
    setCurrentTextTransform,
    setCurrentShapeType,
    setCurrentArrowHead,
    setDraftText,
    setEditingText,
    setPanelMessage,
    setViewport,
    setZoom,
    shapes,
    createCenteredText,
    triggerMediaPicker,
    updateSelectedText,
    viewport,
    videoInputRef,
    beginTextEdit,
    applyStylesToSelected,
  };
}
