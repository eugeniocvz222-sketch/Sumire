import React, { useEffect, useRef } from 'react'

interface PlasmaProps {
  className?: string
  speed?: number
  scale?: number
}

export const Plasma: React.FC<PlasmaProps> = ({
  className = '',
  speed = 0.5,
  scale = 1.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    })

    if (!gl) return

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    // Smooth Cascading Plasma Shader (Optimized for minimal GPU load)
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_scale;

      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        uv *= u_scale;

        // Downward vertical flow
        float t = u_time * 0.35;
        vec2 p = uv;
        p.y += t * 1.0;

        // Domain warping
        vec2 q = p;
        q = rot(0.35 + sin(t * 0.15) * 0.15) * q;
        q.x += sin(q.y * 2.0 + t * 0.7) * 0.4;
        q.y += cos(q.x * 1.6 + t * 0.5) * 0.3;

        // Fluid Wave Interference
        float f1 = sin(q.x * 2.2 + q.y * 1.6 + t);
        float f2 = sin(q.y * 2.8 - t * 1.1) * 0.5;
        float f = (f1 + f2) * 0.5 + 0.5;

        // Central vertical beam concentration
        float centerGlow = exp(-uv.x * uv.x * 1.6);

        // Chromatic RGB Color Palette
        vec3 colRed = vec3(0.90, 0.10, 0.25);
        vec3 colViolet = vec3(0.55, 0.12, 0.92);
        vec3 colMagenta = vec3(0.80, 0.15, 0.60);
        vec3 colCyan = vec3(0.12, 0.55, 0.85);

        vec3 plasma = mix(colRed, colViolet, sin(f * 3.1415 + t * 0.4) * 0.5 + 0.5);
        plasma = mix(plasma, colMagenta, cos(f * 2.0 + q.y * 0.7) * 0.5 + 0.5);
        plasma = mix(plasma, colCyan, sin(q.x * 1.4 + t * 0.3) * 0.25 + 0.12);

        plasma *= centerGlow * 0.8;

        // Deep OLED Black Background
        vec3 bg = vec3(0.02, 0.02, 0.04);
        vec3 color = bg + plasma * smoothstep(0.1, 0.9, f);

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)
      if (!shader) return null
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const positionLocation = gl.getAttribLocation(program, 'position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const scaleLocation = gl.getUniformLocation(program, 'u_scale')

    // Low resolution canvas to ensure zero GPU strain
    const resize = () => {
      const width = Math.min(window.innerWidth, 720)
      const height = Math.min(window.innerHeight, 540)

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    let animationFrameId: number
    let startTime = performance.now()
    let lastRenderTime = 0
    const targetFpsInterval = 1000 / 30 // Smooth 30 FPS throttle to save 100% PC freeze

    const render = (time: number) => {
      // Immediately skip if tab is hidden/in background
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      // Throttle FPS to keep GPU cool and freeze-free
      if (time - lastRenderTime >= targetFpsInterval) {
        lastRenderTime = time
        const elapsed = (time - startTime) * 0.001 * speed

        gl.useProgram(program)
        gl.enableVertexAttribArray(positionLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
        gl.uniform1f(timeLocation, elapsed)
        gl.uniform1f(scaleLocation, scale)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      if (positionBuffer) gl.deleteBuffer(positionBuffer)
      if (program) gl.deleteProgram(program)
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
    }
  }, [speed, scale])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Deep Pure Black Base */}
      <div className="absolute inset-0 bg-[#030306]" />

      {/* Downward Falling Plasma Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        style={{
          transform: 'scale(1.05)',
        }}
      />

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/80 pointer-events-none" />
    </div>
  )
}
