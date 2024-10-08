const themeToggle = document.getElementById('theme-toggle');
const match = window.matchMedia('(prefers-color-scheme: dark)');

let mode = match.matches ? 'dark' : 'light';

function toggleTheme() {
  if (mode === 'dark') {
    mode = 'light';
    document.body.setAttribute('data-theme', mode);
  } else {
    mode = 'dark';
    document.body.setAttribute('data-theme', mode);
  }
}

if (match.matches) {
  document.body.setAttribute('data-theme', mode);
} else {
  document.body.setAttribute('data-theme', mode);
}

themeToggle.addEventListener('click', toggleTheme);

match.addEventListener('change', (e) => e.matches && toggleTheme());
