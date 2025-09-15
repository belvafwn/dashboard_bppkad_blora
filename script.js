/**
 * Main JavaScript file for BPPKAD Blora APBD Website
 * Contains utility functions, chart helpers, and UI management
 */

// Global variables
let currentCharts = [];

// Utility Functions
/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format currency in short format (K, M, B)
 */
function formatCurrencyShort(amount) {
    if (amount >= 1e12) {
        return 'Rp ' + (amount / 1e12).toFixed(1) + 'T';
    } else if (amount >= 1e9) {
        return 'Rp ' + (amount / 1e9).toFixed(1) + 'M';
    } else if (amount >= 1e6) {
        return 'Rp ' + (amount / 1e6).toFixed(1) + 'Jt';
    } else if (amount >= 1e3) {
        return 'Rp ' + (amount / 1e3).toFixed(1) + 'K';
    }
    return formatCurrency(amount);
}

/**
 * Generate colors for charts
 */
function generateChartColors(count) {
    const baseColors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

/**
 * Group data by specified field
 */
function groupDataBy(data, field) {
    return data.reduce((groups, item) => {
        const key = item[field];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Calculate totals by category
 */
function calculateTotalsByCategory(data) {
    const totals = {
        Pendapatan: 0,
        Pembelanjaan: 0,
        Pembiayaan: 0
    };
    
    data.forEach(item => {
        const kategori = item.kategori;
        const nilai = parseFloat(item.nilai) || 0;
        
        if (totals.hasOwnProperty(kategori)) {
            totals[kategori] += nilai;
        }
    });
    
    return totals;
}

/**
 * Calculate totals by year
 */
function calculateTotalsByYear(data) {
    const yearlyTotals = {};
    
    data.forEach(item => {
        const year = item.tahun;
        const kategori = item.kategori;
        const nilai = parseFloat(item.nilai) || 0;
        
        if (!yearlyTotals[year]) {
            yearlyTotals[year] = {
                Pendapatan: 0,
                Pembelanjaan: 0,
                Pembiayaan: 0
            };
        }
        
        if (yearlyTotals[year].hasOwnProperty(kategori)) {
            yearlyTotals[year][kategori] += nilai;
        }
    });
    
    return yearlyTotals;
}

// Chart Functions
/**
 * Destroy existing charts to prevent memory leaks
 */
function destroyExistingCharts() {
    currentCharts.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    currentCharts = [];
}

/**
 * Create category overview chart
 */
function createCategoryChart(data, kategori, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    // Group data by subcategory
    const subcategoryData = groupDataBy(data, 'subkategori');
    
    const labels = Object.keys(subcategoryData);
    const values = labels.map(label => 
        subcategoryData[label].reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0)
    );
    
    const colors = generateChartColors(labels.length);
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total ${kategori} (Rp)`,
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '80'),
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    currentCharts.push(chart);
    return chart;
}

/**
 * Create subcategory detail chart
 */
function createSubcategoryChart(data, subkategori, containerId) {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    // Group data by year for this subcategory
    const yearlyData = groupDataBy(data, 'tahun');
    const years = Object.keys(yearlyData).sort();
    const values = years.map(year => 
        yearlyData[year].reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0)
    );
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: `${subkategori} (Rp)`,
                data: values,
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    currentCharts.push(chart);
    return chart;
}

/**
 * Create comparison chart between subcategories
 */
function createComparisonChart(data, containerId, title = '') {
    const ctx = document.getElementById(containerId).getContext('2d');
    
    // Group by subcategory and year
    const subcategories = [...new Set(data.map(item => item.subkategori))];
    const years = [...new Set(data.map(item => item.tahun))].sort();
    
    const datasets = subcategories.map((subcat, index) => {
        const subcatData = data.filter(item => item.subkategori === subcat);
        const yearlyValues = years.map(year => {
            const yearData = subcatData.filter(item => item.tahun === year);
            return yearData.reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0);
        });
        
        const colors = generateChartColors(subcategories.length);
        
        return {
            label: subcat,
            data: yearlyValues,
            backgroundColor: colors[index],
            borderColor: colors[index],
            borderWidth: 2,
            borderRadius: 4
        };
    });
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                },
                title: {
                    display: !!title,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    currentCharts.push(chart);
    return chart;
}

// UI Management Functions
/**
 * Show loading overlay
 */
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * Show success message
 */
function showSuccess(message) {
    showMessage(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
    showMessage(message, 'error');
}

/**
 * Show warning message
 */
function showWarning(message) {
    showMessage(message, 'warning');
}

/**
 * Show message with specified type
 */
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.maxWidth = '400px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 5000);
    
    // Add click to dismiss
    messageDiv.addEventListener('click', () => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    });
}

/**
 * Create data table
 */
function createDataTable(data, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const {
        showActions = false,
        onEdit = null,
        onDelete = null,
        maxRows = 100
    } = options;
    
    let tableHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tahun</th>
                        <th>Kategori</th>
                        <th>Subkategori</th>
                        <th>Keterangan</th>
                        <th>Nilai</th>
                        ${showActions ? '<th>Aksi</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;
    
    const displayData = data.slice(0, maxRows);
    
    displayData.forEach((item, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.tahun}</td>
                <td>${item.kategori}</td>
                <td>${item.subkategori}</td>
                <td>${item.keterangan}</td>
                <td>${formatCurrency(item.nilai)}</td>
                ${showActions ? `
                    <td>
                        <div class="btn-group">
                            ${onEdit ? `<button class="btn btn-primary btn-small" onclick="editData(${item.id})">Edit</button>` : ''}
                            ${onDelete ? `<button class="btn btn-danger btn-small" onclick="confirmDelete(${item.id})">Hapus</button>` : ''}
                        </div>
                    </td>
                ` : ''}
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    if (data.length > maxRows) {
        tableHTML += `
            <div style="text-align: center; margin-top: 1rem; color: #666;">
                Menampilkan ${maxRows} dari ${data.length} data
            </div>
        `;
    }
    
    container.innerHTML = tableHTML;
}

/**
 * Confirm delete action
 */
function confirmDelete(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        deleteDataAndRefresh(id);
    }
}

/**
 * Delete data and refresh current page
 */
async function deleteDataAndRefresh(id) {
    const result = await deleteData(id);
    if (result.success) {
        // Refresh current page data
        const currentPage = getCurrentPage();
        if (currentPage === 'admin') {
            loadAdminData();
        } else {
            location.reload();
        }
    }
}

/**
 * Get current page name
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename.includes('admin')) return 'admin';
    if (filename.includes('pendapatan')) return 'pendapatan';
    if (filename.includes('pembelanjaan')) return 'pembelanjaan';
    if (filename.includes('pembiayaan')) return 'pembiayaan';
    return 'home';
}

/**
 * Initialize page based on current location
 */
function initializePage() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'admin':
            initAdminPage();
            break;
        case 'pendapatan':
            initCategoryPage('Pendapatan');
            break;
        case 'pembelanjaan':
            initCategoryPage('Pembelanjaan');
            break;
        case 'pembiayaan':
            initCategoryPage('Pembiayaan');
            break;
        case 'home':
        default:
            // Home page initialization is handled in index.html
            break;
    }
}

/**
 * Initialize category page (pendapatan, pembelanjaan, pembiayaan)
 */
async function initCategoryPage(kategori) {
    try {
        showLoading();
        
        // Fetch data for this category
        const data = await fetchDataByCategory(kategori);
        
        if (data.length === 0) {
            showWarning(`Tidak ada data ${kategori.toLowerCase()} yang tersedia.`);
            return;
        }
        
        // Update page title and summary
        updateCategoryPageSummary(data, kategori);
        
        // Create main category chart
        createCategoryChart(data, kategori, 'categoryChart');
        
        // Create subcategory charts
        createSubcategoryCharts(data);
        
        // Create data table
        createDataTable(data, 'dataTable');
        
    } catch (error) {
        console.error(`Error initializing ${kategori} page:`, error);
        showError(`Gagal memuat data ${kategori.toLowerCase()}.`);
    } finally {
        hideLoading();
    }
}

/**
 * Update category page summary information
 */
function updateCategoryPageSummary(data, kategori) {
    // Calculate totals
    const total = data.reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0);
    const subcategoriesCount = new Set(data.map(item => item.subkategori)).size;
    const entriesCount = data.length;
    
    // Update summary cards if they exist
    const totalElement = document.getElementById('categoryTotal');
    const subcategoriesElement = document.getElementById('subcategoriesCount');
    const entriesElement = document.getElementById('entriesCount');
    
    if (totalElement) totalElement.textContent = formatCurrency(total);
    if (subcategoriesElement) subcategoriesElement.textContent = subcategoriesCount;
    if (entriesElement) entriesElement.textContent = entriesCount;
}

/**
 * Create charts for each subcategory
 */
function createSubcategoryCharts(data) {
    const subcategoryContainer = document.getElementById('subcategoryCharts');
    if (!subcategoryContainer) return;
    
    // Group data by subcategory
    const subcategoryData = groupDataBy(data, 'subkategori');
    const subcategories = Object.keys(subcategoryData);
    
    if (subcategories.length <= 1) return;
    
    // Clear existing content
    subcategoryContainer.innerHTML = '';
    
    // Create chart for each subcategory
    subcategories.forEach((subcat, index) => {
        const chartId = `subchart-${index}`;
        const chartHTML = `
            <div class="subcategory-chart">
                <h3>${subcat}</h3>
                <div class="chart-wrapper">
                    <canvas id="${chartId}"></canvas>
                </div>
            </div>
        `;
        
        subcategoryContainer.insertAdjacentHTML('beforeend', chartHTML);
        
        // Create chart after DOM is updated
        setTimeout(() => {
            createSubcategoryChart(subcategoryData[subcat], subcat, chartId);
        }, 100);
    });
}

/**
 * Initialize admin page
 */
async function initAdminPage() {
    try {
        showLoading();
        
        // Load existing data for admin table
        await loadAdminData();
        
        // Initialize form handlers
        initializeAdminForm();
        
    } catch (error) {
        console.error('Error initializing admin page:', error);
        showError('Gagal memuat halaman admin.');
    } finally {
        hideLoading();
    }
}

/**
 * Load data for admin page
 */
async function loadAdminData() {
    const data = await fetchAllData();
    
    // Create admin table with actions
    createDataTable(data, 'adminDataTable', {
        showActions: true,
        onEdit: editData,
        onDelete: confirmDelete
    });
    
    // Update statistics
    updateAdminStatistics(data);
}

/**
 * Update admin page statistics
 */
function updateAdminStatistics(data) {
    const stats = {
        total: data.length,
        pendapatan: data.filter(item => item.kategori === 'Pendapatan').length,
        pembelanjaan: data.filter(item => item.kategori === 'Pembelanjaan').length,
        pembiayaan: data.filter(item => item.kategori === 'Pembiayaan').length
    };
    
    // Update stat elements if they exist
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(`stat-${key}`);
        if (element) element.textContent = stats[key];
    });
}

/**
 * Initialize admin form handlers
 */
function initializeAdminForm() {
    const form = document.getElementById('adminForm');
    if (!form) return;
    
    form.addEventListener('submit', handleAdminFormSubmit);
    
    // Add input validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearInputError);
    });
}

/**
 * Handle admin form submission
 */
async function handleAdminFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        tahun: formData.get('tahun'),
        kategori: formData.get('kategori'),
        subkategori: formData.get('subkategori'),
        keterangan: formData.get('keterangan'),
        nilai: formData.get('nilai')
    };
    
    // Validate data
    const validation = validateDataInput(data);
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }
    
    // Insert data
    const result = await insertData(data);
    if (result.success) {
        // Reset form
        event.target.reset();
        
        // Reload admin data
        await loadAdminData();
        
        showSuccess('Data berhasil ditambahkan!');
    }
}

/**
 * Validate individual input
 */
function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove existing error styling
    clearInputError(event);
    
    // Validate based on input type
    let isValid = true;
    let errorMessage = '';
    
    if (input.required && !value) {
        isValid = false;
        errorMessage = 'Field ini wajib diisi';
    } else if (input.type === 'number' && value && isNaN(value)) {
        isValid = false;
        errorMessage = 'Harus berupa angka';
    } else if (input.name === 'tahun' && value) {
        const year = parseInt(value);
        if (year < 2017 || year > 2024) {
            isValid = false;
            errorMessage = 'Tahun harus antara 2017-2024';
        }
    } else if (input.name === 'nilai' && value) {
        const nilai = parseFloat(value);
        if (nilai < 0) {
            isValid = false;
            errorMessage = 'Nilai tidak boleh negatif';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        showInputError(input, errorMessage);
    }
    
    return isValid;
}

/**
 * Show input error
 */
function showInputError(input, message) {
    input.style.borderColor = '#ef4444';
    input.style.backgroundColor = '#fef2f2';
    
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

/**
 * Clear input error styling
 */
function clearInputError(event) {
    const input = event.target;
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * Edit data (placeholder for future implementation)
 */
function editData(id) {
    showWarning('Fitur edit akan segera tersedia.');
}

/**
 * Export current page data
 */
async function exportCurrentPageData() {
    const currentPage = getCurrentPage();
    
    try {
        showLoading();
        
        let data;
        let filename;
        
        switch (currentPage) {
            case 'pendapatan':
                data = await fetchDataByCategory('Pendapatan');
                filename = 'APBD_Pendapatan_Blora';
                break;
            case 'pembelanjaan':
                data = await fetchDataByCategory('Pembelanjaan');
                filename = 'APBD_Pembelanjaan_Blora';
                break;
            case 'pembiayaan':
                data = await fetchDataByCategory('Pembiayaan');
                filename = 'APBD_Pembiayaan_Blora';
                break;
            default:
                data = await fetchAllData();
                filename = 'APBD_Lengkap_Blora';
        }
        
        if (data.length === 0) {
            showWarning('Tidak ada data untuk diekspor.');
            return;
        }
        
        // Create CSV content
        const headers = ['Tahun', 'Kategori', 'Subkategori', 'Keterangan', 'Nilai'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.tahun,
                `"${row.kategori}"`,
                `"${row.subkategori}"`,
                `"${row.keterangan}"`,
                row.nilai
            ].join(','))
        ].join('\n');
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().getFullYear()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Data berhasil diekspor!');
        
    } catch (error) {
        console.error('Export error:', error);
        showError('Gagal mengekspor data.');
    } finally {
        hideLoading();
    }
}

// Navigation Functions
/**
 * Set active navigation link
 */
function setActiveNavigation() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href) {
            const linkPage = href.split('/').pop().replace('.html', '');
            if (linkPage === currentPage || (linkPage === 'index' && currentPage === 'home')) {
                link.classList.add('active');
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set active navigation
    setActiveNavigation();
    
    // Initialize current page
    initializePage();
    
    // Add global error handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('Terjadi kesalahan sistem. Silakan coba lagi.');
    });
    
    // Add global error handler for regular errors
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showError('Terjadi kesalahan sistem. Silakan refresh halaman.');
    });
});

// Cleanup when page unloads
window.addEventListener('beforeunload', function() {
    destroyExistingCharts();
});
