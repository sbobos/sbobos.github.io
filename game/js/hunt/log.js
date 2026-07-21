import { hunt } from '../state.js';
import { escapeHtml } from '../utils.js';

/* ---------- LOG ---------- */

export function logMsg(text, cls){
  hunt.log.push({text, cls: cls || 'l-hit'});
  renderLog();
}

export function renderLog(){
  const el = document.getElementById('hunt-log');
  if (!el) return;
  el.innerHTML = hunt.log.map(l => `<div class="${l.cls}">${escapeHtml(l.text)}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}
