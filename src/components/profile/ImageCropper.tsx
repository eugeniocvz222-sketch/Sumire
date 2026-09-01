import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Crop as CropIcon,
  RotateCw,
  Maximize,
  Check,
  X,
  Grid,
  Move,
  Sparkles,
} from 'lucide-react'

export type CropAspectRatio = 'free' | '16:9' | '3:1' | '4:3' | '1:1' | 'circle'

interface ImageCropperProps {
  imageSrc: string
  initialAspect?: CropAspectRatio
  shape?: 'rect' | 'circle'
  onConfirm: (croppedDataUrl: string) => void
  onCancel: () => void
}

interface CropBox {
  x: number // percentage (0 - 100)
  y: number // percentage (0 - 100)
  w: number // percentage (0 - 100)
  h: number // percentage (0 - 100)
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  initialAspect = 'free',
  shape = 'rect',
  onConfirm,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [imgNatW, setImgNatW] = useState(0)
  const [imgNatH, setImgNatH] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<CropAspectRatio>(shape === 'circle' ? 'circle' : initialAspect)
  const [showGrid, setShowGrid] = useState(true)

  // Crop box in percentages relative to the displayed image
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 })

  // Active interaction: 'move' or handle name e.g. 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
  const [activeHandle, setActiveHandle] = useState<string | null>(null)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, box: { x: 10, y: 10, w: 80, h: 80 } })

  const onImageLoad = () => {
    const img = imgRef.current
    if (!img) return
    setImgNatW(img.naturalWidth)
    setImgNatH(img.naturalHeight)
    setLoaded(true)
    resetCropBox(aspect, img.naturalWidth, img.naturalHeight)
  }

  // Calculate initial crop box based on aspect ratio
  const resetCropBox = (newAspect: CropAspectRatio, nw = imgNatW, nh = imgNatH) => {
    if (nw === 0 || nh === 0) return

    const imgRatio = nw / nh
    let targetRatio = 1

    if (newAspect === '16:9') targetRatio = 16 / 9
    else if (newAspect === '3:1') targetRatio = 3 / 1
    else if (newAspect === '4:3') targetRatio = 4 / 3
    else if (newAspect === '1:1' || newAspect === 'circle') targetRatio = 1
    else {
      // Free aspect: take 80% of width/height
      setCropBox({ x: 10, y: 10, w: 80, h: 80 })
      return
    }

    let w = 85
    let h = 85

    if (imgRatio > targetRatio) {
      // Image is wider than target ratio
      w = (h * targetRatio) / imgRatio
    } else {
      // Image is taller than target ratio
      h = (w * imgRatio) / targetRatio
    }

    w = Math.min(95, Math.max(15, w))
    h = Math.min(95, Math.max(15, h))

    setCropBox({
      x: (100 - w) / 2,
      y: (100 - h) / 2,
      w,
      h,
    })
  }

  const handleAspectChange = (newAspect: CropAspectRatio) => {
    setAspect(newAspect)
    resetCropBox(newAspect)
  }

  // ─── Drag & Resize Handlers ───
  const startInteraction = (e: React.PointerEvent, handleType: string) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveHandle(handleType)
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeHandle || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const dx = ((e.clientX - dragStart.current.mouseX) / rect.width) * 100
      const dy = ((e.clientY - dragStart.current.mouseY) / rect.height) * 100
      const orig = dragStart.current.box

      let newX = orig.x
      let newY = orig.y
      let newW = orig.w
      let newH = orig.h

      const MIN_SIZE = 10

      if (activeHandle === 'move') {
        newX = Math.max(0, Math.min(100 - orig.w, orig.x + dx))
        newY = Math.max(0, Math.min(100 - orig.h, orig.y + dy))
      } else {
        // Handle resizing from corners and edges
        if (activeHandle.includes('e')) {
          newW = Math.max(MIN_SIZE, Math.min(100 - orig.x, orig.w + dx))
        }
        if (activeHandle.includes('s')) {
          newH = Math.max(MIN_SIZE, Math.min(100 - orig.y, orig.h + dy))
        }
        if (activeHandle.includes('w')) {
          const possibleW = orig.w - dx
          if (possibleW >= MIN_SIZE && orig.x + dx >= 0) {
            newX = orig.x + dx
            newW = possibleW
          }
        }
        if (activeHandle.includes('n')) {
          const possibleH = orig.h - dy
          if (possibleH >= MIN_SIZE && orig.y + dy >= 0) {
            newY = orig.y + dy
            newH = possibleH
          }
        }

        // Lock aspect ratio if not free
        if (aspect !== 'free' && imgNatW > 0 && imgNatH > 0) {
          const imgRatio = imgNatW / imgNatH
          let targetRatio = 1
          if (aspect === '16:9') targetRatio = 16 / 9
          if (aspect === '3:1') targetRatio = 3 / 1
          if (aspect === '4:3') targetRatio = 4 / 3
          if (aspect === '1:1' || aspect === 'circle') targetRatio = 1

          // Adjust height to match target ratio
          newH = (newW * imgRatio) / targetRatio
          if (newY + newH > 100) {
            newH = 100 - newY
            newW = (newH * targetRatio) / imgRatio
          }
        }
      }

      setCropBox({
        x: Math.max(0, Math.min(100 - MIN_SIZE, newX)),
        y: Math.max(0, Math.min(100 - MIN_SIZE, newY)),
        w: Math.max(MIN_SIZE, Math.min(100, newW)),
        h: Math.max(MIN_SIZE, Math.min(100, newH)),
      })
    },
    [activeHandle, aspect, imgNatW, imgNatH]
  )

  const onPointerUp = useCallback(() => {
    setActiveHandle(null)
  }, [])

  // ─── Perform Canvas Crop ───
  const handleConfirm = () => {
    if (!imgRef.current) return

    // If it's a GIF and no transformation was made, return directly
    if (imageSrc.includes('image/gif') && rotation === 0 && cropBox.w >= 98 && cropBox.h >= 98) {
      onConfirm(imageSrc)
      return
    }

    const img = imgRef.current
    const nw = img.naturalWidth
    const nh = img.naturalHeight

    // Calculate source pixel bounds based on crop percentages
    const srcX = Math.round((cropBox.x / 100) * nw)
    const srcY = Math.round((cropBox.y / 100) * nh)
    const srcW = Math.round((cropBox.w / 100) * nw)
    const srcH = Math.round((cropBox.h / 100) * nh)

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, srcW)
    canvas.height = Math.max(1, srcH)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Handle rotation if applied
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcW,
        srcH,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      )
    } else {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height)
    }

    const resultDataUrl = canvas.toDataURL('image/jpeg', 0.95)
    onConfirm(resultDataUrl)
  }

  // Estimated cropped pixel size
  const croppedPixelW = Math.round((cropBox.w / 100) * imgNatW)
  const croppedPixelH = Math.round((cropBox.h / 100) * imgNatH)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0c0c16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Estudio de Recorte & Encuadre</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono">
                  {croppedPixelW} × {croppedPixelH} px
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ajusta las esquinas del recuadro para recortar la parte exacta que deseas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Aspect Ratios & Tools */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Proporción:
            </span>
            {[
              { id: 'free', label: 'Libre' },
              { id: '3:1', label: '3:1 (Banner)' },
              { id: '16:9', label: '16:9' },
              { id: '4:3', label: '4:3' },
              { id: '1:1', label: '1:1 (Cuadrado)' },
              { id: 'circle', label: 'Círculo' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAspectChange(p.id as CropAspectRatio)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  aspect === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Additional Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showGrid
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Mostrar u ocultar cuadrícula"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Girar 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Interactive Crop Canvas Stage ─── */}
        <div className="p-4 sm:p-6 overflow-hidden flex-1 flex items-center justify-center bg-black select-none">
          <div
            ref={containerRef}
            className="relative inline-block max-w-full max-h-[50vh] overflow-hidden"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Base Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source to crop"
              onLoad={onImageLoad}
              draggable={false}
              className="max-w-full max-h-[50vh] object-contain block pointer-events-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            />

            {/* Dark Mask around the selection */}
            {loaded && (
              <>
                <div
                  className="absolute inset-0 bg-black/60 pointer-events-none"
                  style={{
                    clipPath:
                      aspect === 'circle'
                        ? `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
                        : undefined,
                  }}
                />

                {/* ─── Movable & Resizable Crop Box ─── */}
                <div
                  className={`absolute border-2 border-indigo-400 shadow-2xl transition-shadow ${
                    aspect === 'circle' ? 'rounded-full overflow-hidden' : ''
                  }`}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`,
                    cursor: activeHandle ? 'grabbing' : 'move',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  }}
                  onPointerDown={(e) => startInteraction(e, 'move')}
                >
                  {/* Grid Lines (Rule of thirds) */}
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-60">
                      <div className="border-r border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-r border-b border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-r border-white/25" />
                      <div className="border-r border-white/25" />
                      <div />
                    </div>
                  )}

                  {/* Corner Handles (NW, NE, SE, SW) */}
                  {aspect !== 'circle' && (
                    <>
                      <div
                        className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                        onPointerDown={(e) => startInteraction(e, 'nw')}
                      />
                      <div
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                        onPointerDown={(e) => startInteraction(e, 'ne')}
                      />
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                        onPointerDown={(e) => startInteraction(e, 'se')}
                      />
                      <div
                        className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                        onPointerDown={(e) => startInteraction(e, 'sw')}
                      />

                      {/* Edge Middle Handles */}
                      <div
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize shadow-md"
                        onPointerDown={(e) => startInteraction(e, 'n')}
                      />
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize shadow-md"
                        onPointerDown={(e) => startInteraction(e, 's')}
                      />
                      <div
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize shadow-md"
                        onPointerDown={(e) => startInteraction(e, 'w')}
                      />
                      <div
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize shadow-md"
                        onPointerDown={(e) => startInteraction(e, 'e')}
                      />
                    </>
                  )}

                  {/* Move Helper badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition">
                    <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[10px] text-white font-medium flex items-center gap-1">
                      <Move className="w-3 h-3 text-indigo-400" />
                      Mover
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-white/5 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>El recorte mantendrá la máxima resolución nítida.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!loaded}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-lg shadow-indigo-950/50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Aplicar Recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
