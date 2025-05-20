document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Funzione per impostare il tema
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<span class="icon">☀️</span>'; // Icona sole per tema chiaro
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        } else {
            body.classList.remove('light-theme');
            themeToggle.innerHTML = '<span class="icon">🌙</span>'; // Icona luna per tema scuro
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        }
        localStorage.setItem('theme', theme); // Salva la preferenza nel browser
    }

    // Controlla la preferenza del tema salvata o del sistema all'avvio
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // Se non c'è una preferenza salvata, usa la preferenza di sistema
        setTheme('light');
    } else {
        setTheme('dark'); // Predefinito: tema scuro
    }

    // Aggiungi un event listener al bottone
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });
});

