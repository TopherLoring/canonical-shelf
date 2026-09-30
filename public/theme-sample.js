// Theme sample: applies ?theme=&mode= from the address, so the theme lab can show any theme in any mode.
const params = new URLSearchParams(location.search);
const html = document.documentElement;
if (params.get('theme')) html.dataset.theme = params.get('theme');
if (params.get('mode')) html.dataset.mode = params.get('mode');
