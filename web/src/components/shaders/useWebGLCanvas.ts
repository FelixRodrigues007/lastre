import { useEffect, useRef } from "react";

type ShaderSource = {
  vertex: string;
  fragment: string;
};

type Uniforms = Record<string, number | [number, number]>;

/** Acquire the GL context this far outside the viewport, release beyond it. */
const VIEWPORT_MARGIN = "300px 0px";

const KNOWN_UNIFORMS = ["u_time", "u_resolution", "u_speed", "u_intensity", "u_grain", "u_hue"] as const;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, { vertex, fragment }: ShaderSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertex);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

type UseWebGLCanvasOptions = {
  shaders: ShaderSource;
  uniforms?: Uniforms | (() => Uniforms);
  className?: string;
  /**
   * Acquire/release the WebGL context as the canvas nears the viewport.
   * Caps live contexts to what is actually on screen — browsers hard-limit
   * concurrent contexts (~16) and silently drop the oldest past it.
   */
  lazy?: boolean;
};

/** Minimal WebGL fullscreen-quad hook — no external deps, viewport-pooled context. */
export function useWebGLCanvas({
  shaders,
  uniforms = {},
  className = "",
  lazy = true,
}: UseWebGLCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest uniforms without re-running the effect (props may be a fresh closure each render).
  const uniformsRef = useRef(uniforms);
  uniformsRef.current = uniforms;

  const { vertex, fragment } = shaders;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion: render one static frame (atmosphere without animation),
    // never a blank canvas — backdrops with no photo would otherwise read as dead space.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // GL state — (re)created on acquire, torn down on release / context loss.
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uniformLocs: Record<string, WebGLUniformLocation | null> = {};
    let raf = 0;
    let start = performance.now();
    let w = 0;
    let h = 0;
    // A canvas whose WebGL context is lost paints the browser's broken-content
    // glyph. Hide it while contextless so the CSS fallback behind shows instead,
    // and reveal it again the moment a real frame lands.
    let painted = false;
    const showCanvas = () => {
      if (painted) return;
      painted = true;
      canvas.style.visibility = "visible";
    };
    const hideCanvas = () => {
      painted = false;
      canvas.style.visibility = "hidden";
    };

    // Tracks whether the canvas is currently within the viewport margin, so a
    // context lost to GPU eviction (not to scroll-out) can be re-acquired.
    let visible = !lazy;
    let reacquireTimer = 0;
    let reacquireTries = 0;

    const resize = () => {
      if (!gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const render = (now: number) => {
      if (!gl || !program) return;
      // Animated: keep looping. Reduced motion: draw exactly one frame.
      if (!reduced) raf = requestAnimationFrame(render);

      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      const t = (now - start) * 0.001;
      const source = uniformsRef.current;
      const u = typeof source === "function" ? source() : source;

      if (uniformLocs.u_time) gl.uniform1f(uniformLocs.u_time, t);
      if (uniformLocs.u_resolution) gl.uniform2f(uniformLocs.u_resolution, w, h);
      if (uniformLocs.u_speed) gl.uniform1f(uniformLocs.u_speed, (u.u_speed as number) ?? 1);
      if (uniformLocs.u_intensity) gl.uniform1f(uniformLocs.u_intensity, (u.u_intensity as number) ?? 1);
      if (uniformLocs.u_grain) gl.uniform1f(uniformLocs.u_grain, (u.u_grain as number) ?? 0.5);
      if (uniformLocs.u_hue) gl.uniform1f(uniformLocs.u_hue, (u.u_hue as number) ?? 52);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      showCanvas();
    };

    const acquire = () => {
      if (gl) return;
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
      if (!gl) return;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      program = createProgram(gl, { vertex, fragment });
      if (!program) {
        gl = null;
        return;
      }

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      uniformLocs = {};
      KNOWN_UNIFORMS.forEach((name) => {
        uniformLocs[name] = gl!.getUniformLocation(program!, name);
      });

      // Re-anchor the clock so a re-acquired canvas doesn't jump in time.
      start = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
      reacquireTries = 0;
    };

    // Re-acquire after the browser evicts the context (e.g. too many live WebGL
    // contexts across tabs). Backs off and gives up after a few tries so a truly
    // unavailable GPU doesn't spin forever.
    const scheduleReacquire = () => {
      if (reacquireTimer || !visible || gl) return;
      reacquireTimer = window.setTimeout(() => {
        reacquireTimer = 0;
        if (!visible || gl) return;
        acquire();
        if (!gl && reacquireTries < 8) {
          reacquireTries += 1;
          scheduleReacquire();
        }
      }, 500 + reacquireTries * 500);
    };

    const release = () => {
      cancelAnimationFrame(raf);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      gl = null;
      program = null;
      buffer = null;
      uniformLocs = {};
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      hideCanvas();
      gl = null;
      program = null;
      buffer = null;
      uniformLocs = {};
      // The browser only fires webglcontextrestored for contexts it chooses to
      // restore — eviction under pressure isn't one of them. If we're still on
      // screen, drive the recovery ourselves instead of staying blank.
      if (visible) scheduleReacquire();
    };
    const onContextRestored = () => acquire();

    // Animated mode repaints every RAF frame; reduced mode must repaint once on resize.
    const onResize = () => (reduced ? render(performance.now()) : resize());

    // Start hidden: the canvas is only ever revealed once it paints a real
    // frame (showCanvas in render). A canvas that never acquires a context, or
    // loses one, therefore shows the CSS fallback behind it — never the
    // browser's broken-content glyph.
    hideCanvas();

    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);
    window.addEventListener("resize", onResize);

    let observer: IntersectionObserver | undefined;
    if (lazy && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          visible = !!entry?.isIntersecting;
          if (visible) {
            acquire();
          } else {
            // Set visible first so the loseContext() below doesn't re-acquire.
            release();
          }
        },
        { rootMargin: VIEWPORT_MARGIN, threshold: 0 },
      );
      observer.observe(canvas);
    } else {
      acquire();
    }

    return () => {
      visible = false;
      if (reacquireTimer) clearTimeout(reacquireTimer);
      observer?.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      window.removeEventListener("resize", onResize);
      release();
    };
  }, [vertex, fragment, lazy]);

  return { canvasRef, className: `shader-canvas ${className}`.trim() };
}
