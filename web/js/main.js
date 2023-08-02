document.addEventListener('DOMContentLoaded', (event) => {
    const navLinks = document.querySelectorAll('nav ul.nav-links a');
    const currentPathname = window.location.pathname;

    navLinks.forEach((link) => {
        if (link.getAttribute('href') === currentPathname) {
            link.classList.add('active-link');
        }
    });
});