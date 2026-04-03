/**
 * SWG Database Module
 * Complete Standard Wire Gauge reference database
 * Includes gauges 10-40 with half gauges (15.5, 16.5, 17.5, etc.)
 * Data sourced from accurate SWG reference table
 */

const SWG_DATABASE = [
    // Gauge 10-15
    { gauge: "10", diameter_mm: 3.2512, area_sqmm: 8.3019 },
    { gauge: "11", diameter_mm: 2.9464, area_sqmm: 6.8183 },
    { gauge: "12", diameter_mm: 2.6416, area_sqmm: 5.4805 },
    { gauge: "13", diameter_mm: 2.3368, area_sqmm: 4.2888 },
    { gauge: "14", diameter_mm: 2.032, area_sqmm: 3.2429 },
    { gauge: "15", diameter_mm: 1.8288, area_sqmm: 2.6268 },
    
    // Half gauges
    { gauge: "15.5", diameter_mm: 1.7272, area_sqmm: 2.343 },
    
    // Gauge 16-20
    { gauge: "16", diameter_mm: 1.6256, area_sqmm: 2.0755 },
    { gauge: "16.5", diameter_mm: 1.524, area_sqmm: 1.8241 },
    { gauge: "17", diameter_mm: 1.4224, area_sqmm: 1.589 },
    { gauge: "17.5", diameter_mm: 1.3208, area_sqmm: 1.3701 },
    { gauge: "18", diameter_mm: 1.2192, area_sqmm: 1.1675 },
    { gauge: "18.5", diameter_mm: 1.1176, area_sqmm: 0.981 },
    { gauge: "19", diameter_mm: 1.016, area_sqmm: 0.8107 },
    { gauge: "19.5", diameter_mm: 0.9652, area_sqmm: 0.7317 },
    { gauge: "20", diameter_mm: 0.9144, area_sqmm: 0.6567 },
    
    // Gauge 21-25
    { gauge: "21", diameter_mm: 0.8128, area_sqmm: 0.5189 },
    { gauge: "21.5", diameter_mm: 0.762, area_sqmm: 0.456 },
    { gauge: "22", diameter_mm: 0.7112, area_sqmm: 0.3973 },
    { gauge: "22.5", diameter_mm: 0.6604, area_sqmm: 0.3425 },
    { gauge: "23", diameter_mm: 0.6096, area_sqmm: 0.2919 },
    { gauge: "23.5", diameter_mm: 0.5842, area_sqmm: 0.268 },
    { gauge: "24", diameter_mm: 0.5588, area_sqmm: 0.2452 },
    { gauge: "24.5", diameter_mm: 0.5334, area_sqmm: 0.2235 },
    { gauge: "25", diameter_mm: 0.508, area_sqmm: 0.2027 },
    
    // Gauge 26-30
    { gauge: "25.5", diameter_mm: 0.4826, area_sqmm: 0.1829 },
    { gauge: "26", diameter_mm: 0.4572, area_sqmm: 0.1642 },
    { gauge: "27", diameter_mm: 0.4166, area_sqmm: 0.1363 },
    { gauge: "28", diameter_mm: 0.3759, area_sqmm: 0.111 },
    { gauge: "29", diameter_mm: 0.3435, area_sqmm: 0.0927 },
    { gauge: "30", diameter_mm: 0.315, area_sqmm: 0.0779 },
    
    // Gauge 31-35
    { gauge: "31", diameter_mm: 0.2946, area_sqmm: 0.0682 },
    { gauge: "32", diameter_mm: 0.2743, area_sqmm: 0.0591 },
    { gauge: "33", diameter_mm: 0.254, area_sqmm: 0.0507 },
    { gauge: "34", diameter_mm: 0.2337, area_sqmm: 0.0429 },
    { gauge: "35", diameter_mm: 0.2134, area_sqmm: 0.0358 },
    
    // Gauge 36-40
    { gauge: "36", diameter_mm: 0.193, area_sqmm: 0.0293 },
    { gauge: "37", diameter_mm: 0.1727, area_sqmm: 0.0234 },
    { gauge: "38", diameter_mm: 0.1524, area_sqmm: 0.0182 },
    { gauge: "39", diameter_mm: 0.1321, area_sqmm: 0.0137 },
    { gauge: "40", diameter_mm: 0.1219, area_sqmm: 0.0117 }
];

/**
 * Get SWG data by gauge number
 * @param {string} gauge - SWG gauge number (e.g., "18", "17.5")
 * @returns {Object|null} SWG data object or null if not found
 */
function getSWGByGauge(gauge) {
    if (!gauge) return null;
    // Handle half gauge notation (15½ vs 15.5)
    const normalizedGauge = String(gauge).replace('½', '.5');
    return SWG_DATABASE.find(item => item.gauge === normalizedGauge) || null;
}

/**
 * Get all SWG entries
 * @returns {Array} Complete SWG database array
 */
function getAllSWG() {
    return SWG_DATABASE;
}

/**
 * Search SWG database
 * @param {string} query - Search query (gauge or diameter)
 * @param {string} filter - Filter type: 'all', 'whole', 'half'
 * @returns {Array} Filtered SWG entries
 */
function searchSWG(query = '', filter = 'all') {
    let results = SWG_DATABASE;
    
    // Apply filter
    if (filter === 'whole') {
        results = results.filter(item => !item.gauge.includes('.'));
    } else if (filter === 'half') {
        results = results.filter(item => item.gauge.includes('.'));
    }
    
    // Apply search query
    if (query) {
        const queryLower = query.toLowerCase();
        results = results.filter(item => 
            item.gauge.includes(queryLower) ||
            item.diameter_mm.toString().includes(queryLower) ||
            item.area_sqmm.toString().includes(queryLower)
        );
    }
    
    return results;
}

/**
 * Get sorted list of gauge numbers for dropdown
 * @returns {Array} Sorted array of gauge strings
 */
function getSortedGauges() {
    return SWG_DATABASE
        .map(item => item.gauge)
        .sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            return numB - numA; // Descending order (larger gauge first)
        });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SWG_DATABASE,
        getSWGByGauge,
        getAllSWG,
        searchSWG,
        getSortedGauges
    };
}
