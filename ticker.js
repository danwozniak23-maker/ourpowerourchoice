// ── Our Power Our Choice — Dynamic Event Ticker ──────────────────────────────
// Fetches from OurPower_Events tab in the shared Google Sheet.
// Column order: date (YYYY-MM-DD), type, title, description, location, time

const SHEET_ID = '1KfYBtVnwkE4kbRSR1VpPrnjbkLjnax1qILeg_xHf8QQ';

function csvToRows(csv) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
        const ch = csv[i], next = csv[i + 1];
        if (ch === '"') {
            if (inQuotes && next === '"') { field += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            row.push(field.trim()); field = '';
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && next === '\n') i++;
            row.push(field.trim());
            if (row.some(f => f)) rows.push(row);
            row = []; field = '';
        } else { field += ch; }
    }
    if (field || row.length) { row.push(field.trim()); if (row.some(f => f)) rows.push(row); }
    return rows.slice(1); // skip header row
}

async function initTicker() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=OurPower_Events`;
        const rows = csvToRows(await (await fetch(url)).text());

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const upcoming = rows.filter(r => {
            if (!r[0]) return false;
            const [y, m, d] = r[0].split('-').map(Number);
            return new Date(y, m - 1, d) >= today;
        });

        const ticker = document.getElementById('eventTicker');
        if (!ticker) return;

        if (!upcoming.length) {
            ticker.innerHTML = '<div style="font-size:1rem;line-height:28px;">Check back soon for new event dates!</div>';
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const itemHeight = isMobile ? 44 : 28;

        ticker.innerHTML = upcoming.map(r => {
            const [y, m, d] = r[0].split('-').map(Number);
            const dateStr = new Date(y, m - 1, d).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
            const title = r[2] ? ' — ' + r[2] : '';
            const location = r[4] ? ' | ' + r[4] : '';
            const time = r[5] ? ', ' + r[5] : '';
            if (isMobile) {
                return `<div class="ticker-item"><strong>${dateStr}</strong>${title}${location}${time}</div>`;
            }
            return `<div class="ticker-item"><strong>${dateStr}</strong>${title}${location}${time}</div>`;
        }).join('');

        // Set container height
        const container = ticker.closest('.ticker-container');
        if (container) container.style.height = itemHeight + 'px';

        if (upcoming.length > 1) {
            let idx = 0;
            setInterval(() => {
                idx = (idx + 1) % upcoming.length;
                ticker.style.transform = `translateY(-${idx * itemHeight}px)`;
            }, 3500);
        }
    } catch (e) {
        const ticker = document.getElementById('eventTicker');
        if (ticker) ticker.innerHTML = '<div class="ticker-item">Check back soon for new event dates!</div>';
    }
}

// ── Banner loader ─────────────────────────────────────────────────────────────
// Fetches from OurPower_Banner tab.
// Column order: active (yes/no), title, body, where

async function initBanner() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=OurPower_Banner`;
        const rows = csvToRows(await (await fetch(url)).text());
        if (!rows.length) return;

        const [active, title, body, where] = rows[0];
        if (!active || active.toLowerCase() !== 'yes') return;

        const banner = document.getElementById('opoc-alert-banner');
        if (!banner) return;

        document.getElementById('banner-title').textContent = title || '';
        document.getElementById('banner-body').textContent = body || '';
        const whereEl = document.getElementById('banner-where');
        if (where && whereEl) whereEl.innerHTML = '<strong>📍 Where:</strong> ' + where;
        banner.style.display = 'block';
    } catch (e) {
        console.error('Banner load error:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTicker();
    initBanner();
});
