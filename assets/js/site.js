const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const currentPage = document.body.dataset.page;
document.querySelectorAll('[data-nav]').forEach((link) => {
  if (link.dataset.nav === currentPage) link.classList.add('is-current');
});

const themeLabels = { all: '01', embodiment: '02', 'small-data': '03', authorship: '04', literacy: '05' };
const themeButtons = document.querySelectorAll('[data-theme]');
const atlasLabel = document.querySelector('#atlas-label');

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    document.querySelectorAll('.theme-chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.theme === theme));
    if (atlasLabel && themeLabels[theme]) atlasLabel.textContent = themeLabels[theme];
  });
});

document.querySelectorAll('.filter-group').forEach((group) => {
  const buttons = group.querySelectorAll('.filter-button');
  const section = group.closest('section');
  const items = section.querySelectorAll('[data-type]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      items.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.type !== filter; });
    });
  });
});
