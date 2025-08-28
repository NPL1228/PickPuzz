function deepSearch(obj, searchTerm) {
    for (let key in obj) {
        const value = obj[key];

        if (typeof value === "object" && value !== null) {
            if (deepSearch(value, searchTerm)) return true; // recursive search
        } else {
            if (String(value).toLowerCase().includes(searchTerm)) return true;
        }
    }
    return false;
}
function applyFilters(products, params) {
    return products.filter(product => {
        // Price filter
        const min = parseInt(params.get("min") || 0);
        const max = parseInt(params.get("max") || 1000000);
        if (product.price < min || product.price > max) return false;

        // Material filter
        const materialFilter = params.get("material");
        if (materialFilter) {
            const allowedMaterials = materialFilter.split(",");
            if (!allowedMaterials.some(filter => 
                product.details.material?.toLowerCase() === filter.toLowerCase()
            )) {
                return false;
            }
        }

        // Pieces filter
        const piecesFilter = params.get("pieces");
        if (piecesFilter) {
            const ranges = piecesFilter.split(",");
            let match = false;
            for (let range of ranges) {
                if (range.includes("-")) {
                    let [low, high] = range.split("-").map(Number);
                    // Handle products with "-" pieces (accessories)
                    if (product.details.pieces === "-") {
                        // Skip pieces filter for accessories
                        continue;
                    }
                    if (product.details.pieces >= low && product.details.pieces <= high) {
                        match = true;
                        break;
                    }
                } else if (range.includes("+")) {
                    let low = parseInt(range);
                    // Handle products with "-" pieces (accessories)
                    if (product.details.pieces === "-") {
                        // Skip pieces filter for accessories
                        continue;
                    }
                    if (product.details.pieces >= low) {
                        match = true;
                        break;
                    }
                }
            }
            // If no pieces filter matched and we have pieces filters, exclude the product
            if (!match && piecesFilter) {
                return false;
            }
        }

        return true; // passed all filters
    });
}

// Function to remove individual filter criteria
function removeIndividualFilter(filterType, filterValue) {
    const urlParams = new URLSearchParams(window.location.search);
    
    switch (filterType) {
        case 'price':
            // Reset price to default
            urlParams.delete('min');
            urlParams.delete('max');
            break;
            
        case 'material':
            // Remove specific material from material parameter
            const currentMaterials = urlParams.get('material');
            if (currentMaterials) {
                const materials = currentMaterials.split(',').filter(m => 
                    m.toLowerCase() !== filterValue.toLowerCase()
                );
                if (materials.length > 0) {
                    urlParams.set('material', materials.join(','));
                } else {
                    urlParams.delete('material');
                }
            }
            break;
            
        case 'pieces':
            // Remove specific pieces range from pieces parameter
            const currentPieces = urlParams.get('pieces');
            if (currentPieces) {
                const pieces = currentPieces.split(',').filter(p => {
                    if (p === '1000+') {
                        return filterValue !== '1000+ pieces';
                    } else if (p.includes('-')) {
                        return p !== filterValue.split(' ')[0]; // Remove "pieces" text
                    }
                    return true;
                });
                if (pieces.length > 0) {
                    urlParams.set('pieces', pieces.join(','));
                } else {
                    urlParams.delete('pieces');
                }
            }
            break;
    }
    
    // Redirect to updated URL
    const newUrl = urlParams.toString() ? `search.html?${urlParams.toString()}` : "search.html";
    window.location.href = newUrl;
}

async function renderSearchResults(params, containerId = 'resultsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const query = params.get("q")?.trim().toLowerCase() || "";

    // Load products
    await loadProductData();

    // Search with OR logic - match any field in the product
    let searched = query
        ? productsData.filter(product => {
            // Check multiple fields for search match (OR logic within each product)
            return (
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query) ||
                product.details?.material?.toLowerCase().includes(query) ||
                product.details?.size?.toLowerCase().includes(query) ||
                product.includes?.some(item => item.toLowerCase().includes(query)) ||
                deepSearch(product, query) // fallback to deep search
            );
        })
        : productsData;

    console.log(`Search results: ${searched.length} products found for query "${query}"`);

    // Apply filters with AND logic to search results
    let filtered = applyFilters(searched, params);
    
    console.log(`After filters: ${filtered.length} products remain`);
    console.log('Applied filters:', {
        min: params.get("min"),
        max: params.get("max"),
        material: params.get("material"),
        pieces: params.get("pieces")
    });

    if (filtered.length === 0) {
        // Create a more user-friendly no results display with filter management
        let noResultMsg = `
            <div class="no-results-container">
                <h2 class="no-results-title">No results found`;
    
        // Add search query if present
        if (query) {
            noResultMsg += ` for <span class="searchHighlight">"${query}"</span>`;
        }
    
        noResultMsg += `</h2>`;
    
        // Add compact filter summary header
        const activeFilters = [];
        if (params.get("min") || params.get("max")) {
            const min = params.get("min") || 0;
            const max = params.get("max") || 1000;
            activeFilters.push(`Price: RM${min}-RM${max}`);
        }
        if (params.get("material")) {
            const materials = params.get("material")
                .split(",")
                .map(m => m.charAt(0).toUpperCase() + m.slice(1))
                .join(", ");
            activeFilters.push(`Material: ${materials}`);
        }
        if (params.get("pieces")) {
            const pieces = params.get("pieces")
                .split(",")
                .map(p => p === "1000+" ? "1000+ pieces" : p + " pieces")
                .join(", ");
            activeFilters.push(`Pieces: ${pieces}`);
        }
    
        if (activeFilters.length > 0) {
            noResultMsg += `
                <div class="active-filters-summary">
                    <h3>Active Filters:</h3>
                    <div class="filter-tags">
                        ${activeFilters.map(detail => {
                            const filterType = detail.split(':')[0].toLowerCase();
                            const filterValue = detail.split(': ')[1];
                            return `<span class="filter-tag removable-filter" data-filter-type="${filterType}" data-filter-value="${filterValue}">
                                ${detail} <span class="remove-filter">×</span>
                            </span>`;
                        }).join("")}
                    </div>
                </div>
            `;
        }
    
        // Add action buttons
        noResultMsg += `
            <div class="no-results-actions">
                <button id="modifyFiltersBtn" class="action-btn first">
                    Modify Filters
                </button>
                <button id="clearAllFiltersBtn" class="action-btn second">
                    Reset All Filters
                </button>
                <button id="backToHomeBtn" class="action-btn third">
                    Back to Home
                </button>
            </div>
        </div>`;
    
        container.innerHTML = noResultMsg;
    
        // Attach event handlers for the new buttons
        const modifyBtn = document.getElementById("modifyFiltersBtn");
        const clearAllBtn = document.getElementById("clearAllFiltersBtn");
        const backBtn = document.getElementById("backToHomeBtn");
        
        if (modifyBtn) {
            modifyBtn.addEventListener("click", () => {
                // Open the filter menu
                const filterContainer = document.querySelector(".filterCatContainer");
                const overlay = document.querySelector(".overlay");
                if (filterContainer && overlay) {
                    filterContainer.classList.add("show");
                    overlay.classList.add("show");
                }
            });
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener("click", () => {
                // Clear all filters but keep search query if present
                const newParams = new URLSearchParams();
                if (query) {
                    newParams.set("q", query);
                }
                const newUrl = newParams.toString() ? `search.html?${newParams.toString()}` : "search.html";
                window.location.href = newUrl;
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }
        
        // Add click handlers for removable filter tags
        const removableFilters = container.querySelectorAll('.removable-filter');
        removableFilters.forEach(filterItem => {
            const removeBtn = filterItem.querySelector('.remove-filter');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const filterType = filterItem.dataset.filterType;
                    const filterValue = filterItem.dataset.filterValue;
                    removeIndividualFilter(filterType, filterValue);
                });
            }
        });
    
        return;
    }

    // Add header
    const header = document.createElement('h2');
    header.className = 'search-header';
    
    // Determine what criteria are active
    const hasSearch = query && query.trim() !== "";
    const hasFilters = params.get("min") || params.get("max") || params.get("material") || params.get("pieces");
    
    let headerText = "";
    
    if (hasSearch && hasFilters) {
        // Both search and filters
        headerText = `Search Found: <span class="searchHighlight">${filtered.length}</span> results for <span class="searchHighlight">"${query}"</span> with applied filters`;
        
        // Add filter details
        const filterDetails = [];
        if (params.get("min") || params.get("max")) {
            const min = params.get("min") || 0;
            const max = params.get("max") || 1000;
            filterDetails.push(`Price: RM${min}-RM${max}`);
        }
        if (params.get("material")) {
            const materials = params.get("material").split(",").map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ");
            filterDetails.push(`Material: ${materials}`);
        }
        if (params.get("pieces")) {
            const pieces = params.get("pieces").split(",").map(p => p === "1000+" ? "1000+ pieces" : p + " pieces").join(", ");
            filterDetails.push(`Pieces: ${pieces}`);
        }
        
        if (filterDetails.length > 0) {
            headerText += `<br><small>Filters: ${filterDetails.map(detail => {
                const filterType = detail.split(':')[0].toLowerCase();
                const filterValue = detail.split(': ')[1];
                return `<span class="filter-item removable-filter" data-filter-type="${filterType}" data-filter-value="${filterValue}">${detail} <span class="remove-filter">×</span></span>`;
            }).join(" ")}</small>`;
        }
        
    } else if (hasSearch) {
        // Only search
        headerText = `Search Found: <span class="searchHighlight">${filtered.length}</span> results for <span class="searchHighlight">"${query}"</span>`;
        
    } else if (hasFilters) {
        // Only filters
        headerText = `Filter Results: <span class="searchHighlight">${filtered.length}</span> products found`;
        
        // Add filter details
        const filterDetails = [];
        if (params.get("min") || params.get("max")) {
            const min = params.get("min") || 0;
            const max = params.get("max") || 1000;
            filterDetails.push(`Price: RM${min}-RM${max}`);
        }
        if (params.get("material")) {
            const materials = params.get("material").split(",").map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ");
            filterDetails.push(`Material: ${materials}`);
        }
        if (params.get("pieces")) {
            const pieces = params.get("pieces").split(",").map(p => p === "1000+" ? "1000+ pieces" : p + " pieces").join(", ");
            filterDetails.push(`Pieces: ${pieces}`);
        }
        
        if (filterDetails.length > 0) {
            headerText += `<br><small>Applied: ${filterDetails.map(detail => {
                const filterType = detail.split(':')[0].toLowerCase();
                const filterValue = detail.split(': ')[1];
                return `<span class="filter-item removable-filter" data-filter-type="${filterType}" data-filter-value="${filterValue}">${detail} <span class="remove-filter">×</span></span>`;
            }).join(" ")}</small>`;
        }
        
    } else {
        // No search, no filters - show all products
        headerText = `All Products: <span class="searchHighlight">${filtered.length}</span> products available`;
    }
    
    // Add filter management button if filters are active
    if (hasFilters) {
        headerText += `<br><button id="manageFiltersBtn" class="manage-filters-btn">Manage Filters</button>`;
    }
    
    header.innerHTML = headerText;
    container.appendChild(header);

    // Add click handlers for removable filters
    const removableFilters = container.querySelectorAll('.removable-filter');
    removableFilters.forEach(filterItem => {
        // Add click handler only for the remove button (×)
        const removeBtn = filterItem.querySelector('.remove-filter');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const filterType = filterItem.dataset.filterType;
                const filterValue = filterItem.dataset.filterValue;
                removeIndividualFilter(filterType, filterValue);
            });
        }
    });
    
    // Add click handler for manage filters button
    const manageFiltersBtn = document.getElementById("manageFiltersBtn");
    if (manageFiltersBtn) {
        manageFiltersBtn.addEventListener("click", () => {
            // Open the filter menu
            const filterContainer = document.querySelector(".filterCatContainer");
            const overlay = document.querySelector(".overlay");
            if (filterContainer && overlay) {
                filterContainer.classList.add("show");
                overlay.classList.add("show");
            }
        });
    }

    // Create grid
    const grid = document.createElement('div');
    grid.className = 'category-grid'; // reuse category grid styling from allProduct.css

    filtered.forEach(product => {
        grid.appendChild(createProductCard(product, { mode: "list" }));
    });
    container.appendChild(grid);
}


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("Page loaded with params:", urlParams.toString());
    console.log("Search query:", urlParams.get("q"));
    console.log("Filter params:", {
        min: urlParams.get("min"),
        max: urlParams.get("max"),
        material: urlParams.get("material"),
        pieces: urlParams.get("pieces")
    });

    await renderSearchResults(urlParams);

    // Enable Enter-to-search on this page (updates URL + re-renders without full reload)
    const searchInputEl = document.getElementById('search');
    if (searchInputEl) {
        searchInputEl.addEventListener('keydown', async (e) => {
            const isEnter = e.key === 'Enter' || e.which === 13;
            if (!isEnter) return;
            e.preventDefault();
            const query = (searchInputEl.value || '').trim();
            const params = new URLSearchParams(window.location.search);
            if (query) {
                params.set('q', query);
            } else {
                params.delete('q');
            }
            const newUrl = params.toString() ? `search.html?${params.toString()}` : 'search.html';
            window.history.replaceState(null, '', newUrl);
            await renderSearchResults(params);
        });
    }
});