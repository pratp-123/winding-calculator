/**
 * UI Controller
 * Handles all DOM interactions, real-time updates, and mode switching
 */

// Application state
let appState = {
    isSWGMode: true,
    slotArea: null,
    rows: [],
    meanTurnLength: null,
    numberOfSlots: null,
    turnsCalc: {
        slotArea: null,
        fillFactor: 0.45,
        strands: []
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    setupEventListeners();
    initializeWindingTable();
    initializeTurnsCalculator();
    updateUI();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Mode toggle
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('change', handleModeToggle);
    }
    
    // Slot area input
    const slotAreaInput = document.getElementById('slotArea');
    if (slotAreaInput) {
        slotAreaInput.addEventListener('input', handleSlotAreaChange);
    }
    
    // Add row button
    const addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', handleAddRow);
    }
    
    // SWG reference button
    const showSWGBtn = document.getElementById('showSWGBtn');
    if (showSWGBtn) {
        showSWGBtn.addEventListener('click', showSWGModal);
    }
    
    // Modal close
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideSWGModal);
    }
    
    // Click outside modal to close
    const swgModal = document.getElementById('swgModal');
    if (swgModal) {
        swgModal.addEventListener('click', function(e) {
            if (e.target === swgModal) {
                hideSWGModal();
            }
        });
    }
    
    // SWG search and filter
    const swgSearch = document.getElementById('swgSearch');
    if (swgSearch) {
        swgSearch.addEventListener('input', updateSWGTable);
    }
    
    const swgFilter = document.getElementById('swgFilter');
    if (swgFilter) {
        swgFilter.addEventListener('change', updateSWGTable);
    }
    
    // Weight calculation inputs
    const meanTurnLengthInput = document.getElementById('meanTurnLength');
    if (meanTurnLengthInput) {
        meanTurnLengthInput.addEventListener('input', handleWeightInputChange);
    }
    
    const numberOfSlotsInput = document.getElementById('numberOfSlots');
    if (numberOfSlotsInput) {
        numberOfSlotsInput.addEventListener('input', handleWeightInputChange);
    }

    // Turns calculator inputs (separate section)
    const turnSlotAreaInput = document.getElementById('turnSlotArea');
    if (turnSlotAreaInput) {
        turnSlotAreaInput.addEventListener('input', handleTurnSlotAreaChange);
    }

    const fillFactorInput = document.getElementById('fillFactor');
    if (fillFactorInput) {
        fillFactorInput.addEventListener('input', handleFillFactorChange);
    }

    const addStrandRowBtn = document.getElementById('addStrandRowBtn');
    if (addStrandRowBtn) {
        addStrandRowBtn.addEventListener('click', handleAddStrandRow);
    }
}

/**
 * Initialize turns calculator with one empty strand row
 */
function initializeTurnsCalculator() {
    addStrandRow();
    updateTurnsCalculator();
}

function handleTurnSlotAreaChange() {
    const input = document.getElementById('turnSlotArea');
    const value = parseFloat(input?.value);

    const validation = validateSlotArea(value);
    const errorElement = document.getElementById('turnSlotAreaError');

    if (!validation.valid) {
        if (errorElement) {
            errorElement.textContent = validation.error;
            errorElement.style.display = 'block';
        }
        appState.turnsCalc.slotArea = null;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        appState.turnsCalc.slotArea = value;
    }

    updateTurnsCalculator();
}

function handleFillFactorChange() {
    const input = document.getElementById('fillFactor');
    const validation = validateFillFactor(input?.value);
    const errorElement = document.getElementById('fillFactorError');

    if (!validation.valid) {
        if (errorElement) {
            errorElement.textContent = validation.error;
            errorElement.style.display = 'block';
        }
        // keep last valid fillFactor in state
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        appState.turnsCalc.fillFactor = validation.value;
    }

    updateTurnsCalculator();
}

function handleAddStrandRow() {
    addStrandRow();
    updateTurnsCalculator();
}

function addStrandRow() {
    const tableBody = document.getElementById('strandTableBody');
    if (!tableBody) return;

    const rowIndex = appState.turnsCalc.strands.length;
    const row = document.createElement('tr');
    row.dataset.strandRowIndex = rowIndex;

    const rowData = { gauge: '', qty: '' };
    appState.turnsCalc.strands.push(rowData);

    row.innerHTML = `
        <td class="row-number">${rowIndex + 1}</td>
        <td>
            <select class="strand-gauge-select" data-strand-row="${rowIndex}">
                <option value="">Select Gauge</option>
                ${getSortedGauges().map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
        </td>
        <td>
            <input type="number" class="strand-qty-input" data-strand-row="${rowIndex}" step="1" min="1" placeholder="Qty">
        </td>
        <td class="strand-area-cell">—</td>
        <td class="strand-row-area-cell">—</td>
        <td>
            <button class="btn btn-danger btn-small remove-strand-row-btn" data-strand-row="${rowIndex}">Remove</button>
        </td>
    `;

    tableBody.appendChild(row);
    setupStrandRowEventListeners(row, rowIndex);
}

function setupStrandRowEventListeners(rowElement, rowIndex) {
    const gaugeSelect = rowElement.querySelector('.strand-gauge-select');
    if (gaugeSelect) {
        gaugeSelect.addEventListener('change', () => handleStrandRowInputChange(rowIndex));
    }

    const qtyInput = rowElement.querySelector('.strand-qty-input');
    if (qtyInput) {
        qtyInput.addEventListener('input', () => handleStrandRowInputChange(rowIndex));
    }

    const removeBtn = rowElement.querySelector('.remove-strand-row-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => handleRemoveStrandRow(rowIndex));
    }
}

function handleStrandRowInputChange(rowIndex) {
    const rowElement = document.querySelector(`tr[data-strand-row-index="${rowIndex}"]`);
    if (!rowElement) return;

    const rowData = appState.turnsCalc.strands[rowIndex];
    if (!rowData) return;

    const gaugeSelect = rowElement.querySelector('.strand-gauge-select');
    rowData.gauge = gaugeSelect ? gaugeSelect.value : '';

    const qtyInput = rowElement.querySelector('.strand-qty-input');
    rowData.qty = qtyInput ? qtyInput.value : '';

    updateStrandRowCalculations(rowIndex);
    updateTurnsCalculator();
}

function updateStrandRowCalculations(rowIndex) {
    const rowElement = document.querySelector(`tr[data-strand-row-index="${rowIndex}"]`);
    if (!rowElement) return;

    const rowData = appState.turnsCalc.strands[rowIndex];
    if (!rowData) return;

    const area = rowData.gauge ? getWireAreaFromSWG(rowData.gauge) : 0;
    const qty = parseFloat(rowData.qty || 0);
    const rowArea = area > 0 && qty > 0 ? area * qty : 0;

    const areaCell = rowElement.querySelector('.strand-area-cell');
    if (areaCell) areaCell.textContent = area > 0 ? formatNumber(area) : '—';

    const rowAreaCell = rowElement.querySelector('.strand-row-area-cell');
    if (rowAreaCell) rowAreaCell.textContent = rowArea > 0 ? formatNumber(rowArea) : '—';
}

function handleRemoveStrandRow(rowIndex) {
    const rowElement = document.querySelector(`tr[data-strand-row-index="${rowIndex}"]`);
    if (rowElement) rowElement.remove();

    appState.turnsCalc.strands.splice(rowIndex, 1);

    const tableBody = document.getElementById('strandTableBody');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.dataset.strandRowIndex = index;
            const rowNumberCell = row.querySelector('.row-number');
            if (rowNumberCell) rowNumberCell.textContent = index + 1;

            const inputs = row.querySelectorAll('[data-strand-row]');
            inputs.forEach(input => {
                input.dataset.strandRow = index;
            });
        });
    }

    updateTurnsCalculator();
}

function updateTurnsCalculator() {
    // Update row calculations display
    appState.turnsCalc.strands.forEach((_, index) => updateStrandRowCalculations(index));

    const totalWireArea = calculateTotalWireAreaFromStrands(appState.turnsCalc.strands);
    const totalStrandAreaElement = document.getElementById('totalStrandArea');
    if (totalStrandAreaElement) {
        totalStrandAreaElement.textContent = totalWireArea > 0 ? formatNumber(totalWireArea) : '—';
    }

    const slotArea = appState.turnsCalc.slotArea;
    const fillFactor = appState.turnsCalc.fillFactor;

    const turns = calculateTurnsFromFill(slotArea, fillFactor, totalWireArea);

    const turnsExactElement = document.getElementById('turnsExact');
    if (turnsExactElement) {
        turnsExactElement.textContent = turns.turnsExact > 0 ? formatNumber(turns.turnsExact, 4) : '—';
    }

    const turnsRoundedElement = document.getElementById('turnsRounded');
    if (turnsRoundedElement) {
        turnsRoundedElement.textContent = turns.turnsRounded > 0 ? String(turns.turnsRounded) : '—';
    }

    const turnsDoubleLayerElement = document.getElementById('turnsDoubleLayer');
    if (turnsDoubleLayerElement) {
        turnsDoubleLayerElement.textContent =
            turns.turnsRounded > 0 ? `${turns.doubleLayerTop} + ${turns.doubleLayerBottom}` : '—';
    }
}

/**
 * Handle mode toggle
 */
function handleModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    appState.isSWGMode = !modeToggle.checked;
    updateModeUI();
    updateWindingTableHeaders();
    recalculateAll();
}

/**
 * Update mode-specific UI elements
 */
function updateModeUI() {
    const gaugeHeader = document.getElementById('gaugeHeader');
    if (gaugeHeader) {
        gaugeHeader.textContent = appState.isSWGMode ? 'SWG Gauge' : 'Wire Diameter (mm)';
    }
    
    // Update all row inputs based on mode
    const tableBody = document.getElementById('windingTableBody');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            updateRowMode(row, index);
        });
    }
}

/**
 * Update row inputs based on current mode
 */
function updateRowMode(rowElement, rowIndex) {
    const gaugeCell = rowElement.querySelector('.gauge-input-cell');
    const diameterCell = rowElement.querySelector('.diameter-input-cell');
    
    if (appState.isSWGMode) {
        if (gaugeCell) gaugeCell.style.display = '';
        if (diameterCell) diameterCell.style.display = 'none';
    } else {
        if (gaugeCell) gaugeCell.style.display = 'none';
        if (diameterCell) diameterCell.style.display = '';
    }
}

/**
 * Update winding table headers
 */
function updateWindingTableHeaders() {
    const gaugeHeader = document.getElementById('gaugeHeader');
    if (gaugeHeader) {
        gaugeHeader.textContent = appState.isSWGMode ? 'SWG Gauge' : 'Wire Diameter (mm)';
    }
}

/**
 * Handle slot area input change
 */
function handleSlotAreaChange() {
    const input = document.getElementById('slotArea');
    const value = parseFloat(input.value);
    
    const validation = validateSlotArea(value);
    const errorElement = document.getElementById('slotAreaError');
    
    if (!validation.valid) {
        if (errorElement) {
            errorElement.textContent = validation.error;
            errorElement.style.display = 'block';
        }
        appState.slotArea = null;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        appState.slotArea = value;
    }
    
    recalculateAll();
}

/**
 * Initialize winding table with one empty row
 */
function initializeWindingTable() {
    addWindingRow();
}

/**
 * Handle add row button click
 */
function handleAddRow() {
    addWindingRow();
}

/**
 * Add a new row to the winding table
 */
function addWindingRow() {
    const tableBody = document.getElementById('windingTableBody');
    if (!tableBody) return;
    
    const rowIndex = appState.rows.length;
    const row = document.createElement('tr');
    row.dataset.rowIndex = rowIndex;
    
    // Create row data object
    const rowData = {
        gauge: '',
        diameter: '',
        turns: '',
        wires: ''
    };
    
    appState.rows.push(rowData);
    
    // Build row HTML
    row.innerHTML = `
        <td class="row-number">${rowIndex + 1}</td>
        <td class="gauge-input-cell" style="display: ${appState.isSWGMode ? '' : 'none'}">
            <select class="gauge-select" data-row="${rowIndex}">
                <option value="">Select Gauge</option>
                ${getSortedGauges().map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
        </td>
        <td class="diameter-input-cell" style="display: ${appState.isSWGMode ? 'none' : ''}">
            <input type="number" class="diameter-input" data-row="${rowIndex}" step="0.0001" min="0.0001" placeholder="mm">
        </td>
        <td>
            <input type="number" class="turns-input" data-row="${rowIndex}" step="0.01" min="0.01" placeholder="Turns">
        </td>
        <td>
            <input type="number" class="wires-input" data-row="${rowIndex}" step="1" min="1" placeholder="Wires">
        </td>
        <td class="wire-area-cell">—</td>
        <td class="row-total-area-cell">—</td>
        <td>
            <button class="btn btn-danger btn-small remove-row-btn" data-row="${rowIndex}">Remove</button>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Setup row event listeners
    setupRowEventListeners(row, rowIndex);
}

/**
 * Setup event listeners for a row
 */
function setupRowEventListeners(rowElement, rowIndex) {
    // Gauge select (SWG mode) - update immediately on selection
    const gaugeSelect = rowElement.querySelector('.gauge-select');
    if (gaugeSelect) {
        gaugeSelect.addEventListener('change', () => {
            handleRowInputChange(rowIndex);
        });
    }
    
    // Diameter input (mm mode) - update immediately on input
    const diameterInput = rowElement.querySelector('.diameter-input');
    if (diameterInput) {
        diameterInput.addEventListener('input', () => {
            handleRowInputChange(rowIndex);
        });
    }
    
    // Turns input
    const turnsInput = rowElement.querySelector('.turns-input');
    if (turnsInput) {
        turnsInput.addEventListener('input', () => handleRowInputChange(rowIndex));
    }
    
    // Wires input
    const wiresInput = rowElement.querySelector('.wires-input');
    if (wiresInput) {
        wiresInput.addEventListener('input', () => handleRowInputChange(rowIndex));
    }
    
    // Remove button
    const removeBtn = rowElement.querySelector('.remove-row-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => handleRemoveRow(rowIndex));
    }
}

/**
 * Handle row input change
 */
function handleRowInputChange(rowIndex) {
    const rowElement = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (!rowElement) return;
    
    const rowData = appState.rows[rowIndex];
    if (!rowData) return;
    
    // Get current values
    if (appState.isSWGMode) {
        const gaugeSelect = rowElement.querySelector('.gauge-select');
        rowData.gauge = gaugeSelect ? gaugeSelect.value : '';
    } else {
        const diameterInput = rowElement.querySelector('.diameter-input');
        rowData.diameter = diameterInput ? diameterInput.value : '';
    }
    
    const turnsInput = rowElement.querySelector('.turns-input');
    rowData.turns = turnsInput ? turnsInput.value : '';
    
    const wiresInput = rowElement.querySelector('.wires-input');
    rowData.wires = wiresInput ? wiresInput.value : '';
    
    // Validate and update row
    updateRowCalculations(rowIndex);
    recalculateAll();
}

/**
 * Update calculations for a specific row
 */
function updateRowCalculations(rowIndex) {
    const rowElement = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (!rowElement) return;
    
    const rowData = appState.rows[rowIndex];
    if (!rowData) return;
    
    // Get wire area immediately when gauge/diameter is selected (even if turns/wires are empty)
    let wireArea = 0;
    if (appState.isSWGMode) {
        if (rowData.gauge) {
            wireArea = getWireAreaFromSWG(rowData.gauge);
        }
    } else {
        if (rowData.diameter) {
            wireArea = calculateWireAreaFromDiameter(parseFloat(rowData.diameter || 0));
        }
    }
    
    // Update wire area display immediately
    const wireAreaCell = rowElement.querySelector('.wire-area-cell');
    if (wireAreaCell) {
        wireAreaCell.textContent = wireArea > 0 ? formatNumber(wireArea) : '—';
    }
    
    // Calculate row total area only when all required fields are filled
    let rowTotalArea = 0;
    const validation = validateWindingRow(rowData, appState.isSWGMode);
    
    if (!validation.isEmpty && validation.valid) {
        // Calculate row total area
        rowTotalArea = calculateRowTotalArea(
            wireArea,
            parseFloat(rowData.turns || 0),
            parseFloat(rowData.wires || 0)
        );
    }
    
    // Update total area display
    const rowTotalAreaCell = rowElement.querySelector('.row-total-area-cell');
    if (rowTotalAreaCell) {
        rowTotalAreaCell.textContent = rowTotalArea > 0 ? formatNumber(rowTotalArea) : '—';
    }
}

/**
 * Handle remove row
 */
function handleRemoveRow(rowIndex) {
    // Remove from DOM
    const rowElement = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    if (rowElement) {
        rowElement.remove();
    }
    
    // Remove from state
    appState.rows.splice(rowIndex, 1);
    
    // Update row numbers and data attributes
    const tableBody = document.getElementById('windingTableBody');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.dataset.rowIndex = index;
            const rowNumberCell = row.querySelector('.row-number');
            if (rowNumberCell) {
                rowNumberCell.textContent = index + 1;
            }
            
            // Update all data-row attributes
            const inputs = row.querySelectorAll('[data-row]');
            inputs.forEach(input => {
                input.dataset.row = index;
            });
        });
    }
    
    recalculateAll();
}

/**
 * Recalculate all values and update UI
 */
function recalculateAll() {
    // Update slot percentages
    if (appState.slotArea) {
        const { slot45, slot42 } = calculateSlotPercentages(appState.slotArea);
        const slot45Element = document.getElementById('slot45');
        const slot42Element = document.getElementById('slot42');
        
        if (slot45Element) slot45Element.textContent = formatNumber(slot45);
        if (slot42Element) slot42Element.textContent = formatNumber(slot42);
    } else {
        const slot45Element = document.getElementById('slot45');
        const slot42Element = document.getElementById('slot42');
        if (slot45Element) slot45Element.textContent = '—';
        if (slot42Element) slot42Element.textContent = '—';
    }
    
    // Update all row calculations
    appState.rows.forEach((rowData, index) => {
        updateRowCalculations(index);
    });
    
    // Calculate total copper area
    const totalCopperArea = calculateTotalCopperArea(appState.rows, appState.isSWGMode);
    const totalCopperAreaElement = document.getElementById('totalCopperArea');
    if (totalCopperAreaElement) {
        totalCopperAreaElement.textContent = formatNumber(totalCopperArea);
    }
    
    // Calculate Total Copper Area per Group (Wire Area × Wires per Turn)
    const totalCopperAreaPerGroup = calculateTotalCopperAreaPerGroup(appState.rows, appState.isSWGMode);
    const totalCopperAreaPerGroupElement = document.getElementById('totalCopperAreaPerGroup');
    if (totalCopperAreaPerGroupElement) {
        totalCopperAreaPerGroupElement.textContent = formatNumber(totalCopperAreaPerGroup);
    }
    
    // Calculate fill percentage
    let fillPercent = 0;
    if (appState.slotArea && totalCopperArea > 0) {
        fillPercent = calculateFillPercentage(totalCopperArea, appState.slotArea);
    }
    
    const fillPercentageElement = document.getElementById('fillPercentage');
    if (fillPercentageElement) {
        fillPercentageElement.textContent = formatPercentage(fillPercent);
        
        // Update color based on fill percentage
        const fillStatus = validateFillPercentage(fillPercent, appState.slotArea, totalCopperArea);
        fillPercentageElement.className = 'summary-value fill-percentage ' + fillStatus.color;
    }
    
    // Update fill progress bar
    const fillProgressBar = document.getElementById('fillProgressBar');
    if (fillProgressBar) {
        const percentage = Math.min(fillPercent, 100);
        fillProgressBar.style.width = percentage + '%';
        fillProgressBar.className = 'fill-progress ' + (fillPercent <= 45 ? 'green' : fillPercent <= 50 ? 'yellow' : 'red');
    }
    
    // Update fill status
    const fillStatusElement = document.getElementById('fillStatus');
    if (fillStatusElement && appState.slotArea) {
        const fillStatus = validateFillPercentage(fillPercent, appState.slotArea, totalCopperArea);
        fillStatusElement.textContent = 'Status: ' + fillStatus.message;
        fillStatusElement.className = 'fill-status ' + fillStatus.color;
    }
    
    // Calculate copper weight
    const meanTurnLength = parseFloat(document.getElementById('meanTurnLength')?.value || 0);
    const numberOfSlots = parseFloat(document.getElementById('numberOfSlots')?.value || 0);
    
    const copperWeight = calculateCopperWeight(
        totalCopperArea,
        meanTurnLength > 0 ? meanTurnLength : null,
        numberOfSlots > 0 ? numberOfSlots : null,
        appState.rows,
        appState.isSWGMode
    );
    
    const copperWeightElement = document.getElementById('copperWeight');
    if (copperWeightElement) {
        copperWeightElement.textContent = copperWeight > 0 ? formatNumber(copperWeight) + ' g' : '—';
    }

    // Keep turns calculator updated without interfering with other UI
    updateTurnsCalculator();
}

/**
 * Handle weight input changes
 */
function handleWeightInputChange() {
    recalculateAll();
}

/**
 * Show SWG reference modal
 */
function showSWGModal() {
    const modal = document.getElementById('swgModal');
    if (modal) {
        modal.style.display = 'block';
        updateSWGTable();
    }
}

/**
 * Hide SWG reference modal
 */
function hideSWGModal() {
    const modal = document.getElementById('swgModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Update SWG reference table
 */
function updateSWGTable() {
    const searchInput = document.getElementById('swgSearch');
    const filterSelect = document.getElementById('swgFilter');
    const tableBody = document.getElementById('swgTableBody');
    
    if (!tableBody) return;
    
    const query = searchInput ? searchInput.value : '';
    const filter = filterSelect ? filterSelect.value : 'all';
    
    const results = searchSWG(query, filter);
    
    tableBody.innerHTML = results.map(item => `
        <tr>
            <td>${item.gauge}</td>
            <td>${formatNumber(item.diameter_mm)}</td>
            <td>${formatNumber(item.area_sqmm)}</td>
        </tr>
    `).join('');
}

/**
 * Update entire UI
 */
function updateUI() {
    updateModeUI();
    recalculateAll();
}

