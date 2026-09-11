// Event ticker rotation, cycles through ticker items automatically
document.addEventListener('DOMContentLoaded', function () {
    const ticker = document.getElementById('eventTicker');
    if (!ticker) return;

    const items = ticker.querySelectorAll('.ticker-item');
    if (items.length <= 1) return;

    const isMobile = window.innerWidth <= 768;
    const itemHeight = isMobile ? 44 : 28;
    let idx = 0;

    // Set container height explicitly to match item height
    const container = ticker.closest('.ticker-container');
    if (container) container.style.height = itemHeight + 'px';

    setInterval(function () {
        idx = (idx + 1) % items.length;
        ticker.style.transform = 'translateY(-' + (idx * itemHeight) + 'px)';
    }, 3500);
});
