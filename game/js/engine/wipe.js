/**
 * Wipe — a short fade-through-color used to hide a scene swap (village →
 * interior, tab → tab, or anywhere a layout jump needs to happen invisibly).
 *
 * Required CSS on the element you pass in:
 *   #wipe { opacity: 0; pointer-events: none; transition: opacity 260ms ease; }
 *   #wipe.show { opacity: 1; }
 *
 * Usage:
 *   const wipe = new Wipe(document.getElementById('wipe'));
 *   wipe.to(() => {
 *     // swap scenes / reset camera here — runs at the peak of the wipe
 *   });
 */
export class Wipe {
  constructor(wipeEl, { holdMs = 260 } = {}) {
    this.wipeEl = wipeEl;
    this.holdMs = holdMs;
  }

  to(callback) {
    this.wipeEl.classList.add('show');
    setTimeout(() => {
      callback();
      requestAnimationFrame(() => this.wipeEl.classList.remove('show'));
    }, this.holdMs);
  }
}
