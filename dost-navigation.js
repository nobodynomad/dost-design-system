const header = document.querySelector('.site-header');
const menu = header.querySelector('.site-menu');
const compact = window.matchMedia('(max-width: 82.5rem)');

function resetNavigation() {
  header.querySelectorAll('details[open]').forEach(item => { item.open = false; });
  menu.open = !compact.matches;
}

resetNavigation();
compact.addEventListener('change', resetNavigation);

function closeOutside(event) {
  for (const item of header.querySelectorAll('details[open]')) {
    if (item === menu && !compact.matches) continue;
    if (!item.contains(event.target)) item.open = false;
  }
}

document.addEventListener('click', closeOutside);
document.addEventListener('focusin', closeOutside);

header.addEventListener('click', event => {
  if (event.target.closest('a[href^="#"]')) resetNavigation();
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const search = header.querySelector('#site-search');
  if (search.matches(':popover-open')) {
    event.preventDefault();
    search.hidePopover();
    return;
  }
  const panel = header.querySelector('.models-menu[open], .site-language[open]')
    || (compact.matches && menu.open ? menu : null);
  if (panel) {
    panel.open = false;
    panel.querySelector('summary').focus();
  }
});
