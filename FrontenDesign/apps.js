function switchTab(type) {
            // 1. Update the visual Active State of tabs
            const tabs = document.querySelectorAll('.tab-btn');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Find the specific button clicked and add active class
            // (Using event.currentTarget to match the clicked button in a real scenario, 
            // but here searching by text content for simplicity based on the 'type' arg)
            const typeMap = {
                'buy': 'Buy',
                'rent': 'Rent',
                'shortlet': 'Short Let',
                'land': 'Land'
            };
            
            // Find the button with the matching text and activate it
            Array.from(tabs).find(t => t.textContent.trim() === typeMap[type]).classList.add('active');

            // 2. Update the Search Logic (Placeholder & Hidden Value)
            const input = document.getElementById('searchInput');
            const hiddenCat = document.getElementById('categoryInput');
            
            hiddenCat.value = type;

            switch(type) {
                case 'buy':
                    input.placeholder = "Search sale (e.g. 3 bed flat in Lagos)";
                    break;
                case 'rent':
                    input.placeholder = "Search rent (e.g. Office space in Abuja)";
                    break;
                case 'shortlet':
                    input.placeholder = "Search short let (e.g. Vacation home in Lekki)";
                    break;
                case 'land':
                    input.placeholder = "Search land (e.g. 500sqm in Ibeju)";
                    break;
            }
        }

        function performSearch() {
            const category = document.getElementById('categoryInput').value;
            const query = document.getElementById('searchInput').value;
            
            // This is where you would connect to your backend
            alert(`Performing search for: \nCategory: ${category} \nQuery: ${query}`);
        }



// for property index chart


// --- 1. DATA SIMULATION (To power the dynamic content) ---
const priceData = {
    // Shared data for State Cards
    statePrices: [
        { name: "LAGOS", index: 292, price: 84.69, change: 292.09, unit: 'million', isBuy: true, isRent: false },
        { name: "ABUJA", index: 312, price: 96.00, change: 312.78, unit: 'million', isBuy: true, isRent: false },
        { name: "OYO", index: 383, price: 31.60, change: 383.86, unit: 'million', isBuy: true, isRent: false },
        { name: "OGUN", index: 230, price: 11.56, change: 230.09, unit: 'million', isBuy: true, isRent: false },
        { name: "RIVERS", index: 173, price: 41.58, change: 173.28, unit: 'million', isBuy: true, isRent: false },
        // Add rent data for toggling
        { name: "LAGOS (Rent)", index: 150, price: 3.5, change: 15.00, unit: 'million/year', isBuy: false, isRent: true },
        { name: "ABUJA (Rent)", index: 160, price: 2.8, change: 20.00, unit: 'million/year', isBuy: false, isRent: true }
    ],
    
    // Data for the Price Change Graph (Chart.js)
    chart: {
        price: [4000000, 4200000, 5500000, 7800000, 11000000, 15000000, 18500000],
        index: [100, 105, 137, 195, 275, 375, 462],
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
    },

    // Data for Historical List
    historical: [
        { date: '6 months ago', price: 206.00, change: 0.00 },
        { date: '1 year ago', price: 188.33, change: 21.57 },
        { date: '2 years ago', price: 142.34, change: 90.57 }
    ],

    // Data for Market Overview (Top Gainers/Losers) - LIMITED to 4 items for quick loading
    marketOverview: {
        gainers: [
            { location: "Along Ijebu ...", type: "shop-in-a-mall", change: 313.33, price: 31000000 },
            { location: "River Bank ...", type: "residential-land", change: 59.38, price: 12750000 },
            { location: "Uyo Akwa ...", type: "commercial-land", change: 437400.00, price: 3500000000, unit: '/year' },
            { location: "Umuahia South ...", type: "commercial-land", change: 15100.00, price: 380000000 },
        ],
        losers: [
            { location: "Ikota Lekki ...", type: "mini-flat", change: -33.33, price: 2000000, unit: '/year' },
            { location: "Close to ...", type: "detached-duplex", change: -66.67, price: 250000000 },
            { location: "Oroma Estate, ...", type: "mixed-use-land", change: -98.33, price: 2500000 },
            { location: "YEMOJA STREET, ...", type: "blocks-of-flats", change: -90.91, price: 35000000 },
        ]
    }
};

let currentChartInstance = null;
let currentMode = 'buy';
let currentView = 'price';

// --- 2. RENDER FUNCTIONS ---

// Function to format currency
const formatNaira = (amount, unit = '') => {
    // Simple way to format millions for the state cards
    if (unit === 'million') {
        return `₦GR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    }
    // Standard large number formatting
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${unit}`;
};

// Renders the State Cards based on Buy/Rent mode
const renderStateCards = (mode) => {
    const container = document.getElementById('state-cards-container');
    container.innerHTML = '';
    
    // Filter data based on the current mode
    const filteredData = priceData.statePrices.filter(item => item[`is${mode.charAt(0).toUpperCase() + mode.slice(1)}`]);
    
    filteredData.slice(0, 5).forEach(data => { // Limit to first 5 for the row display
        const card = document.createElement('div');
        card.className = 'state-card';
        card.innerHTML = `
            <div class="state-header">
                <h3>${data.name}</h3>
                <span class="index-value">Index ${data.index}</span>
            </div>
            <p class="price-value">${formatNaira(data.price, data.unit)}</p>
            <p class="change-value green">${data.change.toFixed(2)} % <i class="fas fa-arrow-up"></i></p>
        `;
        container.appendChild(card);
    });
};

// Renders the Historical Price List
const renderHistoricalList = () => {
    const container = document.getElementById('historical-list');
    let listHTML = '<h4>Historical Price</h4><ul>';
    
    priceData.historical.forEach(item => {
        // Assume historical prices are in millions for display purposes
        listHTML += `
            <li>
                <span class="date">${item.date}</span>
                <span class="price">${formatNaira(item.price * 1000000)}</span>
                <span class="change green">${item.change.toFixed(2)} <i class="fas fa-arrow-up"></i></span>
            </li>
        `;
    });

    listHTML += '</ul>';
    container.innerHTML = listHTML;
};


// Renders the Top Gainers and Losers
const renderMarketOverview = () => {
    const gainersList = document.getElementById('gainers-list');
    const losersList = document.getElementById('losers-list');

    // Render Gainers (Limited to 4 in data structure)
    gainersList.innerHTML = priceData.marketOverview.gainers.map(item => `
        <div class="data-item">
            <div class="property-info">
                <p class="location">${item.location}</p>
                <p class="type">${item.type}</p>
            </div>
            <div class="change-tag green-text">
                ${item.change.toFixed(2)} % <i class="fas fa-arrow-up"></i>
            </div>
            <div class="price">
                ${formatNaira(item.price, item.unit)}
            </div>
        </div>
    `).join('');

    // Render Losers (Limited to 4 in data structure)
    losersList.innerHTML = priceData.marketOverview.losers.map(item => `
        <div class="data-item">
            <div class="property-info">
                <p class="location">${item.location}</p>
                <p class="type">${item.type}</p>
            </div>
            <div class="change-tag red-text">
                ${item.change.toFixed(2)} % <i class="fas fa-arrow-up"></i>
            </div>
            <div class="price">
                ${formatNaira(item.price, item.unit)}
            </div>
        </div>
    `).join('');
};

// Renders the main Price Change Chart
const renderChart = (view) => {
    if (currentChartInstance) {
        currentChartInstance.destroy(); // Destroy previous instance
    }

    const ctx = document.getElementById('priceChangeChart').getContext('2d');
    const dataKey = view;
    const isPrice = view === 'price';
    const labelText = isPrice ? 'Price (NGN)' : 'Index Value';

    // FIX: Replaced var(--color-primary) with its hex value (#3f51b5)
    const PRIMARY_COLOR = '#3f51b5';

    const config = {
        type: 'line',
        data: {
            labels: priceData.chart.labels,
            datasets: [{
                label: labelText,
                data: priceData.chart[dataKey],
                borderColor: PRIMARY_COLOR, // Fixed value
                backgroundColor: 'rgba(63, 81, 181, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: PRIMARY_COLOR, // Fixed value
                pointRadius: 4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            // Display the label correctly on the Y-axis
                            return isPrice ? formatNaira(value, 'million') : value.toLocaleString();
                        }
                    }
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (isPrice) {
                                // Assume context.parsed.y is the number of millions
                                return `NGN ${context.parsed.y.toLocaleString()} million`;
                            }
                            return `${context.parsed.y.toLocaleString()} Index`;
                        }
                    }
                }
            }
        }
    };

    currentChartInstance = new Chart(ctx, config);
};


// --- 3. EVENT HANDLERS ---

const setupEventListeners = () => {
    // Helper function for tab/toggle logic
    const setupToggle = (containerId, selector) => {
        document.getElementById(containerId).addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll(`#${containerId} ${selector}`).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                return e.target;
            }
            return null;
        });
    };

    // 1. Buy/Rent Toggle
    document.getElementById('buy-rent-toggle').addEventListener('click', (e) => {
        const target = setupToggle('buy-rent-toggle', '.btn');
        if (target) {
            currentMode = target.getAttribute('data-mode');
            renderStateCards(currentMode);
        }
    });

    // 2. Property Type Tabs (House, Lands, etc.)
    document.getElementById('property-type-tabs').addEventListener('click', (e) => {
        const target = setupToggle('property-type-tabs', '.tab-btn');
        if (target) {
            console.log(`Filtering by Property Type: ${target.getAttribute('data-type')}`);
        }
    });

    // 3. Bedroom Tabs
    document.getElementById('bedroom-tabs').addEventListener('click', (e) => {
        const target = setupToggle('bedroom-tabs', '.tab-btn');
        if (target) {
            console.log(`Filtering by Bedrooms: ${target.getAttribute('data-bedrooms')}`);
        }
    });

    // 4. Price/Index Toggle
    document.getElementById('price-index-toggle').addEventListener('click', (e) => {
        const target = setupToggle('price-index-toggle', '.toggle-btn');
        if (target) {
            currentView = target.getAttribute('data-view');
            renderChart(currentView);
        }
    });

    // 5. State Select to Toggle Market Overview
    document.getElementById('state-select').addEventListener('change', (e) => {
        const selectedState = e.target.value;
        const trendsSection = document.getElementById('trends-chart-section');
        const marketSection = document.getElementById('market-overview-section');
        
        if (selectedState === 'lagos' || selectedState === 'abuja') {
            trendsSection.classList.add('hidden');
            marketSection.classList.remove('hidden');
            renderMarketOverview();
        } else {
            trendsSection.classList.remove('hidden');
            marketSection.classList.add('hidden');
        }
    });
};


// --- 4. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial renders
    renderStateCards(currentMode);
    renderHistoricalList();
    renderChart(currentView);

    // Setup interactivity
    setupEventListeners();
});