/**
 * Camera — pushes a "world" element toward a target point via CSS transform,
 * and can reset instantly (no animation) once hidden behind a wipe.
 *
 * It knows nothing about villages, buildings, or scenes. It only toggles
 * a class on the element you give it — all actual motion (duration, easing,
 * scale amount) lives in your CSS, next to the rest of Ironveil's motion
 * design, not buried in JS.
 *
 * Required CSS on the element you pass in:
 *   #world { transition: transform 1000ms cubic-bezier(.65,0,.35,1); }
 *   #world.zooming { transform: scale(2.6); }
 *
 * Usage:
 *   const camera = new Camera(document.getElementById('world'));
 *   await camera.panInto('80%', '70%');   // origin as CSS percentages or px
 *   // ...hide the seam behind a wipe, swap scenes...
 *   camera.resetSilently();               // only call this while hidden
 */
export class Camera {
  constructor(worldEl, { zoomClass = 'zooming' } = {}) {
    this.worldEl = worldEl;
    this.zoomClass = zoomClass;
  }

  /** Sets the pivot point and triggers the zoom-in transition.
   *  Resolves once the CSS transition actually finishes. */
  panInto(originX, originY) {
    return new Promise((resolve) => {
      this.worldEl.style.transformOrigin = `${originX} ${originY}`;
      this.worldEl.classList.add(this.zoomClass);
      this.worldEl.addEventListener(
        'transitionend',
        function onEnd() {
          this.removeEventListener('transitionend', onEnd);
          resolve();
        },
        { once: true },
      );
    });
  }

  /** Removes the zoom class with NO transition — only safe to call while
   *  the world is fully hidden behind a wipe, otherwise it'll visibly snap. */
  resetSilently() {
    this.worldEl.classList.remove(this.zoomClass);
  }
}
