// Supabase Configuration
const SUPABASE_URL = 'https://scernchnrrfmdxtqrxrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZXJuY2hucnJmbWR4dHFyeHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTYxNDYsImV4cCI6MjA3MjM3MjE0Nn0.UWUcsuPl5JJ7Batu6PBt4gMyTiosTqTQJ6Ile0eFV_U';

let supabaseClient;

/**
 * Initialize Supabase client
 */
function initSupabase() {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const { data, error } = await supabaseClient.from('apbd_data').select('count');
        if (error) throw error;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

/**
 * Fetch all data from database
 */
async function fetchAllData() {
    try {
        showLoading();
        const { data, error } = await supabaseClient
            .from('apbd_data')
            .select('*')
            .order('tahun', { ascending: true })
            .order('kategori', { ascending: true })
            .order('subkategori', { ascending: true });

        if (error) throw error;
        
        console.log(`✅ Fetched ${data?.length || 0} records`);
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching data:', error);
        showError('Gagal mengambil data dari database');
        return [];
    } finally {
        hideLoading();
    }
}

/**
 * Fetch data by category
 */
async function fetchDataByCategory(kategori) {
    try {
        showLoading();
        const { data, error } = await supabaseClient
            .from('apbd_data')
            .select('*')
            .eq('kategori', kategori)
            .order('tahun', { ascending: true })
            .order('subkategori', { ascending: true });

        if (error) throw error;
        
        console.log(`✅ Fetched ${data?.length || 0} records for ${kategori}`);
        return data || [];
    } catch (error) {
        console.error(`❌ Error fetching ${kategori} data:`, error);
        showError(`Gagal mengambil data ${kategori}`);
        return [];
    } finally {
        hideLoading();
    }
}

/**
 * Insert new data
 */
async function insertData(dataObj) {
    try {
        showLoading();
        
        // Validate data
        const validation = validateDataInput(dataObj);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Prepare data for insertion
        const insertData = {
            tahun: parseInt(dataObj.tahun),
            kategori: dataObj.kategori.trim(),
            subkategori: dataObj.subkategori.trim(),
            keterangan: dataObj.keterangan.trim(),
            nilai: parseFloat(dataObj.nilai) || 0,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('apbd_data')
            .insert([insertData])
            .select();

        if (error) throw error;
        
        console.log('✅ Data inserted successfully:', data);
        showSuccess('Data berhasil ditambahkan!');
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('❌ Error inserting data:', error);
        showError(`Gagal menambahkan data: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

/**
 * Update existing data
 */
async function updateData(id, dataObj) {
    try {
        showLoading();
        
        // Validate data
        const validation = validateDataInput(dataObj);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Prepare data for update
        const updateData = {
            tahun: parseInt(dataObj.tahun),
            kategori: dataObj.kategori.trim(),
            subkategori: dataObj.subkategori.trim(),
            keterangan: dataObj.keterangan.trim(),
            nilai: parseFloat(dataObj.nilai) || 0,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('apbd_data')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        
        console.log('✅ Data updated successfully:', data);
        showSuccess('Data berhasil diperbarui!');
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('❌ Error updating data:', error);
        showError(`Gagal memperbarui data: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

/**
 * Delete data by ID
 */
async function deleteData(id) {
    try {
        showLoading();
        
        const { error } = await supabaseClient
            .from('apbd_data')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        console.log(`✅ Data with ID ${id} deleted successfully`);
        showSuccess('Data berhasil dihapus!');
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting data:', error);
        showError(`Gagal menghapus data: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

/**
 * Delete multiple data entries
 */
async function deleteMultipleData(ids) {
    try {
        showLoading();
        
        const { error } = await supabaseClient
            .from('apbd_data')
            .delete()
            .in('id', ids);

        if (error) throw error;
        
        console.log(`✅ ${ids.length} data entries deleted successfully`);
        showSuccess(`${ids.length} data berhasil dihapus!`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting multiple data:', error);
        showError(`Gagal menghapus data: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

/**
 * Get data statistics
 */
async function getDataStatistics() {
    try {
        const data = await fetchAllData();
        
        const stats = {
            totalEntries: data.length,
            categories: [...new Set(data.map(item => item.kategori))].length,
            subcategories: [...new Set(data.map(item => item.subkategori))].length,
            yearRange: {
                min: Math.min(...data.map(item => item.tahun)),
                max: Math.max(...data.map(item => item.tahun))
            },
            totalValue: data.reduce((sum, item) => sum + (parseFloat(item.nilai) || 0), 0),
            byCategory: {}
        };

        // Calculate totals by category
        data.forEach(item => {
            const kategori = item.kategori;
            if (!stats.byCategory[kategori]) {
                stats.byCategory[kategori] = {
                    total: 0,
                    count: 0,
                    subcategories: new Set()
                };
            }
            stats.byCategory[kategori].total += parseFloat(item.nilai) || 0;
            stats.byCategory[kategori].count++;
            stats.byCategory[kategori].subcategories.add(item.subkategori);
        });

        // Convert sets to arrays for easier use
        Object.keys(stats.byCategory).forEach(kategori => {
            stats.byCategory[kategori].subcategories = Array.from(stats.byCategory[kategori].subcategories);
        });

        return stats;
    } catch (error) {
        console.error('❌ Error getting statistics:', error);
        return null;
    }
}

/**
 * Search data with filters
 */
async function searchData(filters = {}) {
    try {
        showLoading();
        
        let query = supabaseClient.from('apbd_data').select('*');
        
        // Apply filters
        if (filters.kategori) {
            query = query.eq('kategori', filters.kategori);
        }
        
        if (filters.tahun) {
            query = query.eq('tahun', filters.tahun);
        }
        
        if (filters.subkategori) {
            query = query.ilike('subkategori', `%${filters.subkategori}%`);
        }
        
        if (filters.keterangan) {
            query = query.ilike('keterangan', `%${filters.keterangan}%`);
        }
        
        if (filters.minNilai) {
            query = query.gte('nilai', filters.minNilai);
        }
        
        if (filters.maxNilai) {
            query = query.lte('nilai', filters.maxNilai);
        }
        
        // Apply sorting
        query = query.order('tahun', { ascending: true })
                    .order('kategori', { ascending: true })
                    .order('subkategori', { ascending: true });

        const { data, error } = await query;
        
        if (error) throw error;
        
        console.log(`✅ Search returned ${data?.length || 0} records`);
        return data || [];
    } catch (error) {
        console.error('❌ Error searching data:', error);
        showError('Gagal melakukan pencarian data');
        return [];
    } finally {
        hideLoading();
    }
}

/**
 * Validate data input
 */
function validateDataInput(dataObj) {
    const errors = [];
    
    // Check required fields
    if (!dataObj.tahun || isNaN(parseInt(dataObj.tahun))) {
        errors.push('Tahun harus berupa angka');
    } else {
        const tahun = parseInt(dataObj.tahun);
        if (tahun < 2017 || tahun > 2024) {
            errors.push('Tahun harus antara 2017-2024');
        }
    }
    
    if (!dataObj.kategori || dataObj.kategori.trim().length === 0) {
        errors.push('Kategori tidak boleh kosong');
    } else {
        const validCategories = ['Pendapatan', 'Pembelanjaan', 'Pembiayaan'];
        if (!validCategories.includes(dataObj.kategori)) {
            errors.push('Kategori harus salah satu dari: ' + validCategories.join(', '));
        }
    }
    
    if (!dataObj.subkategori || dataObj.subkategori.trim().length === 0) {
        errors.push('Subkategori tidak boleh kosong');
    }
    
    if (!dataObj.keterangan || dataObj.keterangan.trim().length === 0) {
        errors.push('Keterangan tidak boleh kosong');
    }
    
    if (!dataObj.nilai || isNaN(parseFloat(dataObj.nilai))) {
        errors.push('Nilai harus berupa angka');
    } else {
        const nilai = parseFloat(dataObj.nilai);
        if (nilai < 0) {
            errors.push('Nilai tidak boleh negatif');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        message: errors.join(', ')
    };
}

/**
 * Export data to CSV format
 */
async function exportToCSV() {
    try {
        showLoading();
        const data = await fetchAllData();
        
        if (data.length === 0) {
            showWarning('Tidak ada data untuk diekspor');
            return;
        }
        
        // Create CSV content
        const headers = ['ID', 'Tahun', 'Kategori', 'Subkategori', 'Keterangan', 'Nilai'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.id,
                row.tahun,
                `"${row.kategori}"`,
                `"${row.subkategori}"`,
                `"${row.keterangan}"`,
                row.nilai
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `APBD_Blora_${new Date().getFullYear()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Data berhasil diekspor ke CSV');
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        showError('Gagal mengekspor data');
    } finally {
        hideLoading();
    }
}

/**
 * Bulk import data from CSV
 */
async function importFromCSV(csvText) {
    try {
        showLoading();
        
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const dataRows = lines.slice(1);
        
        const importData = [];
        const errors = [];
        
        dataRows.forEach((line, index) => {
            if (line.trim() === '') return; // Skip empty lines
            
            const values = line.split(',').map(val => val.replace(/"/g, '').trim());
            
            const rowData = {
                tahun: values[1],
                kategori: values[2],
                subkategori: values[3],
                keterangan: values[4],
                nilai: values[5]
            };
            
            const validation = validateDataInput(rowData);
            if (validation.isValid) {
                importData.push({
                    tahun: parseInt(rowData.tahun),
                    kategori: rowData.kategori,
                    subkategori: rowData.subkategori,
                    keterangan: rowData.keterangan,
                    nilai: parseFloat(rowData.nilai),
                    created_at: new Date().toISOString()
                });
            } else {
                errors.push(`Baris ${index + 2}: ${validation.message}`);
            }
        });
        
        if (errors.length > 0) {
            showError(`Terdapat ${errors.length} data yang tidak valid:\n${errors.slice(0, 5).join('\n')}`);
            return { success: false, errors };
        }
        
        // Insert data in batches
        const batchSize = 100;
        let totalInserted = 0;
        
        for (let i = 0; i < importData.length; i += batchSize) {
            const batch = importData.slice(i, i + batchSize);
            const { error } = await supabaseClient.from('apbd_data').insert(batch);
            
            if (error) throw error;
            totalInserted += batch.length;
        }
        
        showSuccess(`${totalInserted} data berhasil diimpor`);
        return { success: true, count: totalInserted };
    } catch (error) {
        console.error('❌ Error importing data:', error);
        showError(`Gagal mengimpor data: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

// Initialize Supabase when this script loads
document.addEventListener('DOMContentLoaded', function() {
    if (!initSupabase()) {
        showError('Gagal menginisialisasi koneksi database. Periksa konfigurasi Supabase.');
    }
});
