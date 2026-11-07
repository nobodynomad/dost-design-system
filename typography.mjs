export function readTypeMetrics(style, role, viewport, rootSize) {
  const prefix = `--type-${role}-`;
  const size = style.getPropertyValue(`${prefix}size-${viewport}`).trim();
  const leading = Number(style.getPropertyValue(`${prefix}leading-${viewport}`));
  const weight = Number(style.getPropertyValue(`${prefix}weight`));
  const tracking = style.getPropertyValue(`${prefix}tracking`).trim();
  if (!/^\d*\.?\d+rem$/.test(size) || !(leading > 0) || !(weight > 0) || !(rootSize > 0) || !tracking) {
    throw new Error(`Missing or invalid typography role: ${role}/${viewport}`);
  }
  return { size: parseFloat(size) * rootSize, leading, weight, tracking };
}

if (typeof document !== 'undefined') {
  const format = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
  const rows = [...document.querySelectorAll('[data-type-role]')];

  function renderScale() {
    const viewport = document.querySelector('input[name="viewport"]:checked').value;
    const style = getComputedStyle(document.documentElement);
    const rootSize = parseFloat(style.fontSize);
    for (const row of rows) {
      const role = row.dataset.typeRole;
      row.querySelector('[data-type-viewport]').dataset.typeViewport = viewport;
      for (const cell of row.querySelectorAll('[data-size]')) {
        cell.textContent = format.format(readTypeMetrics(style, role, cell.dataset.size, rootSize).size);
      }
      const metric = readTypeMetrics(style, role, viewport, rootSize);
      row.querySelector('[data-reading]').textContent =
        `Начертание ${metric.weight}\nИнтерлиньяж ${format.format(metric.size * metric.leading)} px · ${format.format(metric.leading)}\nТрекинг ${metric.tracking}`;
    }
  }

  for (const input of document.querySelectorAll('input[name="viewport"]')) {
    input.addEventListener('change', renderScale);
  }
  window.addEventListener('resize', renderScale);
  renderScale();
}
