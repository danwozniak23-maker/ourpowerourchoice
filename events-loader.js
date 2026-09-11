console.log('Events loader script loaded!');
const SHEET_ID = '1KfYBtVnwkE4kbRSR1VpPrnjbkLjnax1qILeg_xHf8QQ';
const SHEET_NAME = 'OurPower_Events';

function csvToRows(csv) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
        const ch = csv[i], next = csv[i+1];
        if (ch === '"') { if (inQuotes && next === '"') { field += '"'; i++; } else inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { row.push(field.trim()); field = ''; }
        else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && next === '\n') i++;
            row.push(field.trim());
            if (row.some(f => f)) rows.push(row);
            row = []; field = '';
        } else { field += ch; }
    }
    if (field || row.length) { row.push(field.trim()); if (row.some(f => f)) rows.push(row); }
    return rows;
}

async function fetchAndRenderEvents() {
    console.log('Starting to fetch events...');
    try {
        // Use Google Visualization API with CSV export
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csv = await response.text();
        console.log('CSV data received:', csv.substring(0, 200) + '...');
        const rows = csvToRows(csv);
        console.log('Parsed rows:', rows.length);
        
        if (rows.length < 2) {
            console.log('No events found in sheet');
            document.getElementById('eventsContainer').innerHTML = '<p style="color: #888;">No events found.</p>';
            return;
        }
        
        // First row is headers
        const headers = rows[0];
        const events = rows.slice(1);
        console.log('Headers:', headers);
        console.log('Events count:', events.length);
        
        // Map column indices
        const colIndex = (name) => headers.indexOf(name);
        
        // Render each event
        const container = document.getElementById('eventsContainer');
        if (!container) {
            console.error('Container #eventsContainer not found!');
            return;
        }
        
        console.log('Rendering events...');
        container.innerHTML = events.map(row => {
            const date = row[colIndex('Date')] || '';
            const title = row[colIndex('Title')] || '';
            const location = row[colIndex('Location')] || '';
            const address = row[colIndex('Address')] || '';
            const summary = row[colIndex('Summary')] || '';
            const category = row[colIndex('Category')] || '';
            const time = row[colIndex('Time')] || '';
            const action = row[colIndex('Action')] || '';
            
            // Use location, fall back to address if location is empty/dash
            const displayLocation = (location && location !== '—') ? location : address;
            
            // Determine category color
            let categoryColor = '#1a6b3a'; // default green
            if (category.toUpperCase().includes('TOWN HALL')) categoryColor = '#2d6a9f';
            if (category.toUpperCase().includes('CANVASS')) categoryColor = '#7b5ea7';
            if (category.toUpperCase().includes('PETITION') || category.toUpperCase().includes('PETITON')) categoryColor = '#1a6b3a';
            
            // Fix common typos
            const displayCategory = category.replace(/Petiton/gi, 'Petition');
            
            return `
                <div class="event-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                        <div>
                            <div class="event-date">${date}</div>
                            <h3>${title}</h3>
                            <div class="event-location">📍 ${displayLocation}</div>
                            <p style="margin-top: 0.75rem; color: #444;">${summary}</p>
                        </div>
                        <span style="background: ${categoryColor}; color: white; padding: 0.3rem 0.85rem; border-radius: 99px; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; white-space: nowrap;">${displayCategory}</span>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee; display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.95rem; color: #555;">
                        ${time ? `<span>🕗 ${time}</span>` : ''}
                        ${action ? `<span>🤝 ${action}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        console.log('Events rendered successfully');
        
    } catch (error) {
        console.error('Error fetching events:', error);
        const container = document.getElementById('eventsContainer');
        if (container) {
            container.innerHTML = '<p style="color: #888;">Unable to load events. Please check back soon.</p>';
        }
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', fetchAndRenderEvents);
