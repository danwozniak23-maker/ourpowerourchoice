function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking on a nav link
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('navLinks').classList.remove('active');
        });
    });
});
