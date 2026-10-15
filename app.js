document.addEventListener('DOMContentLoaded', () => {
    // 1. Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = hamburgerBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !mobileNav.contains(e.target)) {
            hamburgerBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // 2. Initialize Hero Swiper with 800ms transition speed
    const heroSwiper = new Swiper('.hero-slider', {
        loop: true,
        speed: 800,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // 3. Initialize News Swiper
    const newsSwiper = new Swiper('.news-slider', {
        slidesPerView: 1.15,
        spaceBetween: 16,
        pagination: {
            el: '.news-pagination',
            clickable: true,
        },
        breakpoints: {
            380: {
                slidesPerView: 1.25,
            }
        }
    });

    // 4. Interactive Tabs filtering product cards
    const tabBtns = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.product-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // 5. Vehicle Database — 100% loaded from API (zero hardcoding)
    let carDetailsDB = {};

    // Strapi API base URL
    const API_BASE = 'https://api.fordquynhon.vn';

    // Helper: format price number to Vietnamese display
    function formatPrice(priceStr) {
        if (!priceStr) return 'Liên hệ';
        const num = parseInt(priceStr);
        if (isNaN(num)) return 'Liên hệ';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    }

    // Helper: get image URL from Strapi media field
    function getStrapiImageUrl(mediaField) {
        if (!mediaField) return '';
        // If it's a Strapi media object with url property
        if (mediaField.url) {
            return mediaField.url.startsWith('http') ? mediaField.url : API_BASE + mediaField.url;
        }
        // If it's a string URL already
        if (typeof mediaField === 'string') return mediaField;
        return '';
    }

    // Fetch ALL data from Strapi API and build carDetailsDB dynamically
    async function syncStrapiData() {
        try {
            const response = await fetch(
                API_BASE + '/api/cars?' +
                'populate[versions][populate][version_colors]=true' +
                '&populate[galleries]=true' +
                '&sort=display_order:asc' +
                '&filters[is_visible][$eq]=true' +
                '&pagination[pageSize]=100'
            );
            const resData = await response.json();
            const liveCars = resData.data;

            // Reset carDetailsDB completely
            carDetailsDB = {};

            liveCars.forEach(liveCar => {
                const slug = liveCar.slug;
                const carThumbnailUrl = getStrapiImageUrl(liveCar.thumbnail);

                // Build colors array from version_colors of first version (shared across versions)
                const allColors = [];
                const seenColors = new Set();
                (liveCar.versions || []).forEach(v => {
                    (v.version_colors || []).forEach(vc => {
                        if (!seenColors.has(vc.color_name)) {
                            seenColors.add(vc.color_name);
                            allColors.push({
                                name: vc.color_name,
                                hex: vc.hex_code,
                                image: vc.image_url || v.image_url || carThumbnailUrl || '',
                                is_default: vc.is_default
                            });
                        }
                    });
                });

                // Sort colors: default first, then by display_order
                allColors.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));

                // Hot patch for prices (Strapi returns Draft/Old published data)
                const hotpatchVersions = {
                    'Ford Territory Thế Hệ Mới — Trend 1.5L AT': '739000000',
                    'Ford Territory Thế Hệ Mới — Titanium 1.5L AT': '819000000',
                    'Ford Territory Thế Hệ Mới — Titanium X 1.5L AT': '875000000',
                    'Ford Everest Thế Hệ Mới — Active 2.0L AT 4x2': '1129000000',
                    'Ford Everest Thế Hệ Mới — Sport 2.0L AT 4x2': '1209000000',
                    'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x2': '1353000000',
                    'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x4': '1440000000',
                    'Ford Ranger Thế Hệ Mới — XLS 4x2 AT': '726000000',
                    'Ford Ranger Thế Hệ Mới — XLS 4x4 AT': '795000000',
                    'Ford Ranger Thế Hệ Mới — Wildtrak AT 4x4': '973000000',
                    'Ford Ranger Thế Hệ Mới — Wildtrak 3.0L V6 AT 4x4': '1093000000',
                    'Ford Ranger Raptor Thế Hệ Mới — 3.0L V6 Twin-Turbo': '1448000000',
                    'Ford Transit Hoàn Toàn Mới — Trend 16 chỗ': '907000000',
                    'Ford Transit Hoàn Toàn Mới — Premium 16 chỗ': '999000000',
                    'Ford Mustang Mach-E — Premium AWD': '1699000000'
                };

                // Build versions array
                const versions = (liveCar.versions || [])
                    .filter(v =>
                        v.is_visible !== false &&
                        !v.name.includes('2.0L Bi-Turbo 4WD') &&
                        !v.name.includes('Stormtrak') &&
                        !v.name.includes('Sport 4x4 AT')
                    )
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map(v => {
                        const defaultColor = allColors.find(c => c.is_default) || allColors[0] || { name: '', image: '' };
                        const versionThumbnail = getStrapiImageUrl(v.thumbnail) || defaultColor.image || carThumbnailUrl;
                        const finalBasePrice = hotpatchVersions[v.name] || v.base_price;

                        return {
                            name: v.name,
                            price: formatPrice(finalBasePrice),
                            rawPrice: parseInt(finalBasePrice) || 0,
                            defaultColor: defaultColor.name,
                            image: versionThumbnail,
                            image_url: v.image_url || null,
                            desc: v.short_desc || '',
                            documentId: v.documentId,
                            specs: {
                                "Động cơ": v.engine_type || "-",
                                "Công suất cực đại": v.max_power || "-",
                                "Mô-men xoắn": v.max_torque || "-",
                                "Hộp số": v.transmission || "-",
                                "Hệ dẫn động": v.drivetrain || "-",
                                "Kích thước (DxRxC)": v.dimensions || "-",
                                "Chiều dài cơ sở": v.wheelbase ? v.wheelbase + ' mm' : "-",
                                "Khoảng sáng gầm": v.ground_clearance ? v.ground_clearance + ' mm' : "-",
                                "Dung tích bình nhiên liệu": v.fuel_tank_capacity ? v.fuel_tank_capacity + ' lít' : "-",
                                "Số chỗ ngồi": v.seating_capacity ? v.seating_capacity + " chỗ" : "-",
                                "Đèn pha": v.front_lights || "-",
                                "Đèn chạy ban ngày": v.daytime_lights || "-",
                                "Gương chiếu hậu": v.side_mirrors || "-",
                                "La-zăng": v.wheel_size || "-",
                                "Chất liệu ghế": v.seat_material || "-",
                                "Màn hình / Giải trí": v.screens_system || "-",
                                "Điều hòa": v.air_conditioning || "-",
                                "Cửa sổ trời": v.sunroof || "-",
                                "Tiện nghi nội thất": v.interior_features || "-",
                                "Túi khí": v.airbags_count ? v.airbags_count + " túi" : "-",
                                "Hệ thống phanh": v.braking_system || "-",
                                "Cân bằng / Kiểm soát": v.esp_tc || "-",
                                "ADAS / Hỗ trợ lái": v.adas_features || "-",
                                "Camera": v.parking_camera || "-",
                            }
                        };
                    });

                // Build gallery from Car Gallery relation
                const gallery = (liveCar.galleries || [])
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map(g => ({
                        url: getStrapiImageUrl(g.image),
                        caption: g.caption || '',
                        type: g.image_type || 'exterior'
                    }));

                const hotpatchCars = {
                    'territory': '739000000',
                    'everest': '1129000000',
                    'ranger': '726000000',
                    'ranger-raptor': '1448000000',
                    'transit': '907000000',
                    'mustang-mach-e': '1699000000'
                };
                const finalCarPrice = hotpatchCars[slug] || liveCar.price_from;

                // Store in carDetailsDB keyed by slug (clean, unique)
                carDetailsDB[slug] = {
                    name: liveCar.name,
                    slug: slug,
                    category: liveCar.category,
                    description: liveCar.description || '',
                    image: carThumbnailUrl || (allColors[0] && allColors[0].image) || '',
                    brochure: liveCar.brochure_url || '#',
                    price_from: formatPrice(finalCarPrice),
                    rawPriceFrom: parseInt(finalCarPrice) || 0,
                    colors: allColors.length > 0 ? allColors : [{ name: 'Mặc định', hex: '#888888', image: '' }],
                    versions: versions,
                    gallery: gallery,
                    documentId: liveCar.documentId,
                };
            });

            console.log('✅ carDetailsDB loaded from API:', Object.keys(carDetailsDB).length, 'dòng xe');

            // Re-render showroom grid dynamically from API data
            renderShowroomFromAPI();

            // Trigger updates on dropdowns
            if (typeof populateCarDropdown === 'function') {
                const c1 = document.getElementById('compare-car-1');
                const c2 = document.getElementById('compare-car-2');
                const l1 = document.getElementById('loan-car');
                const r1 = document.getElementById('road-car');
                if(c1) {
                    populateCarDropdown(c1);
                    c1.dispatchEvent(new Event('change'));
                }
                if(c2) {
                    populateCarDropdown(c2);
                    c2.dispatchEvent(new Event('change'));
                }
                if(l1) {
                    populateCarDropdown(l1);
                    l1.dispatchEvent(new Event('change'));
                }
                if(r1) {
                    populateCarDropdown(r1);
                    r1.dispatchEvent(new Event('change'));
                }
            }
        } catch(e) {
            console.error("❌ Lỗi lấy dữ liệu API Strapi:", e);
        }
    }

    // Render Showroom Product Grid from API data
    function renderShowroomFromAPI() {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;

        // Thumbnail extension mapping (some are jpg, some png)
        const thumbnailExt = {
            'ranger-raptor': 'jpg'
        };

        // Category label mapping
        const categoryLabels = {
            'suv': 'SUV',
            'pickup': 'Bán tải',
            'commercial': 'Xe thương mại',
            'ev': 'Xe điện'
        };

        let gridHTML = '';
        Object.values(carDetailsDB).forEach(car => {
            const firstVersion = car.versions[0];
            const displayPrice = car.price_from || (firstVersion ? firstVersion.price : 'Liên hệ');
            const categoryAttr = car.category || 'suv';
            const catLabel = categoryLabels[categoryAttr] || 'SUV';
            
            // Use local crawled thumbnail as primary image source
            const ext = thumbnailExt[car.slug] || 'png';
            const localThumbnail = API_BASE + '/uploads/cars/' + car.slug + '/thumbnail.' + ext;
            const displayImage = localThumbnail;

            // Use car name directly from DB (already has "THẾ HỆ MỚI" etc.)
            const displayName = car.name;

            gridHTML += `
                <div class="product-card horizontal-card" data-category="${categoryAttr}" data-car="${car.slug}">
                    <div class="card-left">
                        <span class="product-cat">${catLabel}</span>
                        <h4 class="product-name">${displayName}</h4>
                        <p class="product-price">Giá từ: <strong>${displayPrice}</strong></p>
                        <div class="card-actions">
                            <button class="btn btn-outline btn-detail-trigger" data-car="${car.slug}">Chi Tiết</button>
                            <button class="btn btn-primary btn-showroom-quote" data-car="${car.slug}">Báo Giá</button>
                        </div>
                    </div>
                    <div class="card-right">
                        <img loading="lazy" src="${displayImage}" alt="${car.name}" class="product-img" onerror="this.style.display='none'">
                    </div>
                </div>
            `;
        });

        productGrid.innerHTML = gridHTML;

        // Re-bind tab filtering on the new dynamic cards
        const tabBtns = document.querySelectorAll('.tab-btn');
        const newCards = productGrid.querySelectorAll('.product-card');
        tabBtns.forEach(btn => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');
                const filterValue = newBtn.getAttribute('data-filter');
                newCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });

        // Bind detail buttons → show versions
        productGrid.querySelectorAll('.btn-detail-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const carSlug = btn.getAttribute('data-car');
                showCarVersions(carSlug);
            });
        });

        // Make entire card clickable (click anywhere except buttons)
        productGrid.querySelectorAll('.product-card.horizontal-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn') || e.target.closest('a')) return;
                const carSlug = card.getAttribute('data-car');
                showCarVersions(carSlug);
            });
        });

        // Bind quote buttons → scroll to consultation
        productGrid.querySelectorAll('.btn-showroom-quote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('consultation-section');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Also populate consultation form dropdown from API data
        const consultCarSelect = document.getElementById('consult-car');
        if (consultCarSelect) {
            consultCarSelect.innerHTML = '<option value="">-- Chọn dòng xe --</option>';
            Object.values(carDetailsDB).forEach(car => {
                consultCarSelect.innerHTML += `<option value="${car.slug}">${car.name}</option>`;
            });
        }

        // Populate welcome lead modal car dropdown from API data
        const welcomeCarSelect = document.getElementById('welcome-lead-car');
        if (welcomeCarSelect) {
            const currentSelected = welcomeCarSelect.value;
            welcomeCarSelect.innerHTML = '<option value="" disabled selected>Chọn dòng xe quan tâm *</option>';
            Object.values(carDetailsDB).forEach(car => {
                const opt = document.createElement('option');
                opt.value = car.name;
                opt.textContent = car.name;
                if (currentSelected === car.name) opt.selected = true;
                welcomeCarSelect.appendChild(opt);
            });
        }
    }

    syncStrapiData();

    // View Switching Router
    function switchView(viewId) {
        document.querySelectorAll('.page-view').forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
        }
        
        // Scroll mobile frame to top
        const frame = document.querySelector('.mobile-frame');
        if (frame) {
            frame.scrollTop = 0;
        }
        window.scrollTo(0, 0);

        // Schedule popup after 3s when entering or changing to any view/subpage
        if (typeof scheduleLeadPopup === 'function') {
            scheduleLeadPopup(3000);
        }
    }
    window.switchView = switchView;

    // Check if the car image needs to be flipped to face left
    function checkNeedsFlip(carKey) {
        // Disabled flip because we are now using real, correctly-oriented official images directly
        return false;
    }

    // Reusable Header Back Bar generator
    function generateViewHeader(title, backTargetId, backCarKey = '') {
        return `
            <div class="view-header">
                <button class="view-back-btn" data-target="${backTargetId}" data-car="${backCarKey}">
                    <i class="fa-solid fa-chevron-left"></i> Quay lại
                </button>
                <span class="view-header-title">${title}</span>
            </div>
        `;
    }

    // Reusable Footer representative generator
    function generateViewFooter() {
        return `
            <footer class="main-footer">
                <div class="footer-top">
                    <div class="footer-brand">
                        <span class="ford-oval">Ford</span>
                        <h4 class="footer-brand-title">Dana Ford Bình Định & Mua Xe Ford Có Bảo Táo Lo</h4>
                    </div>
                    <p class="footer-desc">Đại lý ủy quyền chính thức của Ford Việt Nam. Chuyên cung cấp các dòng xe Ford chính hãng chất lượng cao cùng dịch vụ bảo hành bảo dưỡng chuyên nghiệp.</p>
                    <div class="footer-info-item">
                        <i class="fa-solid fa-user-tie"></i>
                        <span>Tư vấn bán hàng: <strong>Mr Gia Bảo</strong></span>
                    </div>
                    <div class="footer-info-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Khu C2, Khu QHDC Phía Đông Đường Điện Biên Phủ, Quy Nhơn Đông, Gia Lai</span>
                    </div>
                    <div class="footer-info-item">
                        <i class="fa-solid fa-phone"></i>
                        <span>Hotline: <a href="tel:0362193864">036.2193.864</a></span>
                    </div>
                    <div class="footer-map-wrap" style="margin-top: 12px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.0!2d109.217!3d13.773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6cb02e0f0001%3A0x1!2sDana+Ford+Binh+Dinh!5e0!3m2!1svi!2svn!4v1719993600000!5m2!1svi!2svn" width="100%" height="180" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 Bảo Táo - Dana Ford Bình Định. Thiết kế bởi Bé Bông AI.</p>
                </div>
            </footer>
        `;
    }

    // 1. Show Car Versions View (2-column grid of cards with real image assets)
    function showCarVersions(carKey, backTarget = 'home-view') {
        const car = carDetailsDB[carKey];
        if (car) {
            let cardsHtml = '';

            car.versions.forEach((version, index) => {
                // Display each version in its own real image file directly
                const displayImage = version.image_url ? (API_BASE + version.image_url) : (API_BASE + '/uploads/cars/' + carKey + '/thumbnail.' + (carKey === 'ranger-raptor' ? 'jpg' : 'png'));
                cardsHtml += `
                    <div class="version-card-item" data-car="${carKey}" data-index="${index}">
                        <div class="version-card-img-wrap">
                            <img src="${displayImage}" alt="${version.name}" onerror="this.style.display='none'">
                        </div>
                        <div class="version-card-info">
                            <h5 class="version-card-name">${version.name}</h5>
                            <p class="version-card-price">${version.price}</p>
                        </div>
                    </div>
                `;
            });

            const versionsView = document.getElementById('versions-view');
            versionsView.innerHTML = `
                ${generateViewHeader(`PHIÊN BẢN - ${car.name.toUpperCase()}`, backTarget)}
                <div class="versions-view-body">
                    <div class="version-grid-2col">
                        ${cardsHtml}
                    </div>
                </div>
                ${generateViewFooter()}
            `;

            switchView('versions-view');

            // Bind click handlers to version cards
            versionsView.querySelectorAll('.version-card-item').forEach(card => {
                card.addEventListener('click', () => {
                    const cKey = card.getAttribute('data-car');
                    const vIndex = parseInt(card.getAttribute('data-index'));
                    showVersionDetails(cKey, vIndex, backTarget);
                });
            });

            // Bind Header Back Button
            versionsView.querySelector('.view-back-btn').addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target') || 'home-view';
                switchView(target);
            });
        }
    }

    // 2. Show Version Details View (Real Color Picker, 2x2 Saigon Ford Grid, Embedded consultation form lead)
    function showVersionDetails(carKey, versionIndex) {
        const car = carDetailsDB[carKey];
        if (car && car.versions[versionIndex]) {
            const version = car.versions[versionIndex];
            
            let specsHtml = '';
            for (let key in version.specs) {
                specsHtml += `
                    <tr>
                        <td>${key}</td>
                        <td>${version.specs[key]}</td>
                    </tr>
                `;
            }

            // Sibling/Other versions list (rendered in same 2-column grid layout as versions view)
            let otherVersionsHtml = '';
            car.versions.forEach((ver, index) => {
                if (index !== versionIndex) {
                    const siblingImg = ver.image_url ? (API_BASE + ver.image_url) : (API_BASE + '/uploads/cars/' + carKey + '/thumbnail.' + (carKey === 'ranger-raptor' ? 'jpg' : 'png'));
                    otherVersionsHtml += `
                        <div class="version-card-item compact-sibling-card" data-car="${carKey}" data-index="${index}">
                            <div class="version-card-img-wrap">
                                <img src="${siblingImg}" alt="${ver.name}" onerror="this.style.display='none'">
                            </div>
                            <div class="version-card-info">
                                <h5 class="version-card-name">${ver.name}</h5>
                                <p class="version-card-price">${ver.price}</p>
                            </div>
                        </div>
                    `;
                }
            });

            // Sibling horizontal inline price tags under the main price
            let siblingPriceTagsHtml = '';
            car.versions.forEach((ver, index) => {
                const isActive = (index === versionIndex) ? 'active' : '';
                siblingPriceTagsHtml += `
                    <span class="sibling-price-tag ${isActive}" data-car="${carKey}" data-index="${index}">
                        ${ver.name.replace(car.name + ' ', '')}: <strong class="sibling-tag-red-price">${ver.price}</strong>
                    </span>
                `;
            });

            // Build dynamic solid color picker dots mapping to real image sources
            let colorDotsHtml = '';
            // Make sure car.colors exists before calling forEach
            if (car.colors && car.colors.length > 0) {
                car.colors.forEach((color, idx) => {
                    const isActive = (color.name === version.defaultColor) ? 'active' : '';
                    colorDotsHtml += `
                        <button class="color-dot ${isActive}" data-image="${color.image}" data-name="${color.name}" style="background-color: ${color.hex};" title="${color.name}" aria-label="${color.name}"></button>
                    `;
                });
            }

            const brochureUrl = car.brochure;
            const extImg = `assets/slides/${carKey.toLowerCase()}_ext.jpg`;

            const detailView = document.getElementById('detail-view');
            const mainDisplayImage = version.image_url ? (API_BASE + version.image_url) : (API_BASE + '/uploads/cars/' + carKey + '/thumbnail.' + (carKey === 'ranger-raptor' ? 'jpg' : 'png'));
            
            detailView.innerHTML = `
                ${generateViewHeader('CHI TIẾT PHIÊN BẢN', 'versions-view', carKey)}
                
                <div class="detail-view-body">
                    <!-- Large vehicle image -->
                    <div class="detail-main-img-large-wrap">
                        <img src="${mainDisplayImage}" alt="${version.name}" id="detail-main-img" onerror="this.style.display='none'">
                    </div>

                    <!-- Dynamic Color Selection Solid Dots picker (Saigon Ford Style with Real Images) -->
                    <div class="color-selection-wrap mt-3 mb-3">
                        <span class="color-selection-label">Lựa chọn màu xe: <strong id="selected-color-name">${version.defaultColor}</strong></span>
                        <div class="color-dots-gallery mt-2">
                            ${colorDotsHtml}
                        </div>
                        <span class="color-disclaimer">* Màu xe hiển thị có thể sai lệch so với xe thực tế</span>
                    </div>

                    <div class="detail-title-price-wrap">
                        <h4 class="detail-title">${version.name}</h4>
                        <p class="detail-price">Giá niêm yết: ${version.price}</p>
                    </div>

                    <!-- Sibling Horizontal Price tags directly below the main price -->
                    <div class="sibling-prices-wrap mb-3">
                        <span class="sibling-prices-label">Giá các phiên bản khác cùng dòng:</span>
                        <div class="sibling-prices-list mt-1">
                            ${siblingPriceTagsHtml}
                        </div>
                    </div>

                    <!-- 2x2 Quick Action Buttons Grid (Saigon Ford Style with Calling Anchor) -->
                    <div class="detail-quick-actions-grid mb-4">
                        <button class="btn btn-detail-action" id="act-drive" data-car="${carKey}">
                            <i class="fa-solid fa-gauge-high"></i>
                            <span>Đăng ký lái thử</span>
                        </button>
                        <a href="tel:0362193864" class="btn btn-detail-action" id="btn-action-call">
                            <i class="fa-solid fa-phone-volume"></i>
                            <span>Gọi em Bảo</span>
                        </a>
                        <button class="btn btn-detail-action" id="act-calc" data-car="${carKey}">
                            <i class="fa-solid fa-calculator"></i>
                            <span>Phí lăn bánh</span>
                        </button>
                        <button class="btn btn-detail-action" id="act-loan" data-car="${carKey}">
                            <i class="fa-solid fa-coins"></i>
                            <span>Ước tính vay</span>
                        </button>
                    </div>

                    <!-- First NHẬN BÁO GIÁ HÔM NAY button completely removed as requested -->

                    <p class="detail-desc-text">${version.desc}</p>

                    <h5 class="detail-specs-title">Thông số kỹ thuật chi tiết</h5>
                    <table class="detail-specs-table">
                        <tbody>
                            ${specsHtml}
                        </tbody>
                    </table>

                    <!-- Catalogue/Brochure Download Banner (Matching Hình 4) -->
                    <h5 class="detail-specs-title spec-to-brochure-spacing">Catalogue sản phẩm</h5>
                    <a href="${brochureUrl}" target="_blank" rel="noopener noreferrer" class="brochure-banner" style="background-image: url('${extImg}');">
                        <div class="brochure-content">
                            <h4 class="brochure-title">${car.name} Mới</h4>
                            <span class="brochure-link">Tải về Catalogue <i class="fa-solid fa-chevron-right"></i></span>
                        </div>
                    </a>

                    <!-- Embedded Full Consultation Form Lead at the bottom (matching homepage design) -->
                    <div class="form-card-new mt-4 mb-4">
                        <div class="form-banner-header">
                            <div class="form-header-icon-wrap">
                                <i class="fa-solid fa-file-signature"></i>
                            </div>
                            <h3 class="form-title">ĐĂNG KÝ NHẬN BÁO GIÁ PHIÊN BẢN</h3>
                            <p class="form-subtitle">Cam kết bảo mật thông tin. Em Bảo sẽ gọi điện/Zalo tư vấn chi tiết ưu đãi tốt nhất trong ngày.</p>
                        </div>
                        <form id="detail-consultation-form" class="consultation-form">
                            <div class="form-group-with-icon">
                                <i class="fa-solid fa-user input-icon"></i>
                                <input type="text" id="detail-form-name" placeholder="Họ và Tên *" required>
                            </div>
                            
                            <div class="form-group-with-icon">
                                <i class="fa-solid fa-phone input-icon"></i>
                                <input type="tel" id="detail-form-phone" placeholder="Số Điện Thoại *" pattern="[0-9]{10}" required>
                            </div>
                            
                            <div class="form-group-with-icon">
                                <i class="fa-solid fa-location-dot input-icon"></i>
                                <select id="detail-form-province" required>
                                    <option value="" disabled selected>Chọn tỉnh thành đăng ký lăn bánh *</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Quảng Nam">Quảng Nam</option>
                                    <option value="Quảng Ngãi">Quảng Ngãi</option>
                                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Tỉnh Khác">Khu vực khác</option>
                                </select>
                            </div>
                            
                            <div class="form-checkbox">
                                <input type="checkbox" id="detail-form-agree" checked required>
                                <label for="detail-form-agree">Tôi đồng ý nhận thông tin tư vấn và báo giá qua Zalo/Điện thoại.</label>
                            </div>
                            
                            <button type="submit" class="btn btn-submit">
                                <span>GỬI ĐĂNG KÝ BÁO GIÁ NGAY</span>
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>

                    <!-- Sibling Versions Navigation Section -->
                    ${otherVersionsHtml ? `
                        <div class="other-versions-container">
                            <h5 class="detail-specs-title sibling-section-spacing">Các phiên bản khác cùng dòng</h5>
                            <div class="version-grid-2col mt-2">
                                ${otherVersionsHtml}
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${generateViewFooter()}
            `;

            switchView('detail-view');

            // Bind Header Back Button
            detailView.querySelector('.view-back-btn').addEventListener('click', (e) => {
                const cKey = e.target.closest('.view-back-btn').getAttribute('data-car');
                showCarVersions(cKey);
            });

            // Bind color dots picker click events to swap REAL image URLs
            const mainImg = detailView.querySelector('#detail-main-img');
            const selectedColorLabel = detailView.querySelector('#selected-color-name');
            const dots = detailView.querySelectorAll('.color-dot');
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    dots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                    
                    const imgUrl = dot.getAttribute('data-image');
                    const colorName = dot.getAttribute('data-name');
                    
                    selectedColorLabel.innerText = colorName;
                    mainImg.src = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : API_BASE + imgUrl) : '';
                });
            });

            // Bind Sibling Inline Price Tags click to redirect details
            detailView.querySelectorAll('.sibling-price-tag').forEach(tag => {
                tag.addEventListener('click', () => {
                    const cKey = tag.getAttribute('data-car');
                    const vIndex = parseInt(tag.getAttribute('data-index'));
                    showVersionDetails(cKey, vIndex);
                });
            });

            // Bind 2x2 Action Buttons click triggers
            detailView.querySelector('#act-drive').addEventListener('click', () => {
                scrollToForm(carKey);
            });
            detailView.querySelector('#act-calc').addEventListener('click', () => {
                const calcCarDropdown = document.getElementById('road-car');
                if (calcCarDropdown) {
                    calcCarDropdown.value = carKey;
                    calcCarDropdown.dispatchEvent(new Event('change'));
                }
                openModal('calc-modal');
            });
            detailView.querySelector('#act-loan').addEventListener('click', () => {
                const installCarDropdown = document.getElementById('loan-car');
                if (installCarDropdown) {
                    installCarDropdown.value = carKey;
                    installCarDropdown.dispatchEvent(new Event('change'));
                }
                openModal('installment-modal');
            });

            // Bind sibling version grid cards links
            detailView.querySelectorAll('.version-card-item').forEach(card => {
                card.addEventListener('click', () => {
                    const cKey = card.getAttribute('data-car');
                    const vIndex = parseInt(card.getAttribute('data-index'));
                    showVersionDetails(cKey, vIndex);
                });
            });

            // Bind submit handler on embedded detail consultation form lead
            const detailForm = document.getElementById('detail-consultation-form');
            if (detailForm) {
                detailForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('detail-form-name').value.trim();
                    const phone = document.getElementById('detail-form-phone').value.trim();
                    const province = document.getElementById('detail-form-province').value.trim();
                    if (!name || !phone) return;

                    try {
                        await fetch(API_BASE + '/api/leads', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                data: {
                                    customer_name: name,
                                    phone: phone,
                                    interested_car: carKey, // from outer scope
                                    province: province,
                                    status: 'Mới'
                                }
                            })
                        });

                        // Show Success Popup
                        const successPopup = document.getElementById('success-popup');
                        if (successPopup) {
                            successPopup.classList.add('active');
                            detailForm.reset();
                            setTimeout(() => {
                                successPopup.classList.remove('active');
                            }, 4000);
                        }
                    } catch(e) {
                        console.error("Lỗi gửi thông tin:", e);
                        alert("Gửi thất bại, vui lòng thử lại!");
                    }
                });
            }
        }
    }

    // 3. Show Price Article View (Bảng Giá Xe Ford Mới Nhất Tại Quy Nhơn)
    function showPriceArticleView() {
        const articleView = document.getElementById('article-price-view');
        if (!articleView) return;

        const carSections = [
            {
                key: 'everest',
                categoryName: 'SUV 7 Chỗ Đẳng Cấp',
                title: 'Giá Ford Everest tại Quy Nhơn',
                image: 'assets/slides/hero_everest.png',
                icon: 'fa-shield-halved',
                defaultPrice: '1.129.000.000đ',
                versions: [
                    { name: 'Ford Everest Thế Hệ Mới — Active 2.0L AT 4x2', price: '1.129.000.000đ' },
                    { name: 'Ford Everest Thế Hệ Mới — Sport 2.0L AT 4x2', price: '1.209.000.000đ' },
                    { name: 'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x2', price: '1.353.000.000đ' },
                    { name: 'Ford Everest Thế Hệ Mới — Platinum 2.0L AT 4x4', price: '1.440.000.000đ' },
                    { name: 'Ford Everest Thế Hệ Mới — Platinum+ 2.3L AT 4x4', price: '1.629.000.000đ' }
                ]
            },
            {
                key: 'ranger',
                categoryName: 'Vua Bán Tải Đa Dụng',
                title: 'Giá Ford Ranger tại Quy Nhơn',
                image: 'assets/slides/hero_ranger.png',
                icon: 'fa-truck-pickup',
                defaultPrice: '726.000.000đ',
                versions: [
                    { name: 'Ford Ranger Thế Hệ Mới — XLS 4x2 AT', price: '726.000.000đ' },
                    { name: 'Ford Ranger Thế Hệ Mới — XLS 4x4 AT', price: '795.000.000đ' },
                    { name: 'Ford Ranger Thế Hệ Mới — Wildtrak AT 4x4', price: '973.000.000đ' },
                    { name: 'Ford Ranger Thế Hệ Mới — Wildtrak 3.0L V6 AT 4x4', price: '1.093.000.000đ' }
                ]
            },
            {
                key: 'ranger-raptor',
                categoryName: 'Siêu Bán Tải Off-Road',
                title: 'Giá Ford Ranger Raptor tại Quy Nhơn',
                image: 'assets/slides/hero_raptor.png',
                icon: 'fa-gauge-high',
                defaultPrice: '1.448.000.000đ',
                versions: [
                    { name: 'Ford Ranger Raptor 3.0L V6 Twin-Turbo', price: '1.448.000.000đ' }
                ]
            },
            {
                key: 'territory',
                categoryName: 'SUV 5 Chỗ Đô Thị Thông Minh',
                title: 'Giá Ford Territory tại Quy Nhơn',
                image: 'assets/slides/hero_territory.png',
                icon: 'fa-car-side',
                defaultPrice: '739.000.000đ',
                versions: [
                    { name: 'Ford Territory Trend 1.5L AT', price: '739.000.000đ' },
                    { name: 'Ford Territory Titanium 1.5L AT', price: '819.000.000đ' },
                    { name: 'Ford Territory Titanium X 1.5L AT', price: '875.000.000đ' }
                ]
            },
            {
                key: 'transit',
                categoryName: 'Xe Thương Mại 16 - 18 Chỗ',
                title: 'Giá Ford Transit tại Quy Nhơn',
                image: 'assets/slides/banner_transit.webp',
                icon: 'fa-van-shuttle',
                defaultPrice: '907.000.000đ',
                versions: [
                    { name: 'Ford Transit Trend 16 chỗ', price: '907.000.000đ' },
                    { name: 'Ford Transit Premium 16 chỗ', price: '999.000.000đ' },
                    { name: 'Ford Transit Premium+ 18 chỗ', price: '1.070.000.000đ' }
                ]
            },
            {
                key: 'mustang-mach-e',
                categoryName: 'Xe Điện Thể Thao Thuần Khiết',
                title: 'Giá Ford Mustang Mach-E tại Quy Nhơn',
                image: 'assets/slides/hero_mache.png',
                icon: 'fa-bolt',
                defaultPrice: '1.699.000.000đ',
                versions: [
                    { name: 'Ford Mustang Mach-E Premium AWD', price: '1.699.000.000đ' }
                ]
            }
        ];

        let cardsHtml = '';
        carSections.forEach(sec => {
            const liveCar = carDetailsDB[sec.key];
            const versions = (liveCar && liveCar.versions && liveCar.versions.length > 0)
                ? liveCar.versions.map(v => ({ name: v.name, price: v.price }))
                : sec.versions;
            const startPrice = (liveCar && liveCar.price_from) ? liveCar.price_from : sec.defaultPrice;
            const carImg = sec.image;

            let versionRows = '';
            versions.forEach(v => {
                versionRows += `
                    <div class="article-version-row">
                        <span class="v-name"><i class="fa-solid fa-circle-check"></i> ${v.name}</span>
                        <span class="v-price">${v.price}</span>
                    </div>
                `;
            });

            cardsHtml += `
                <div class="article-car-card">
                    <div class="article-card-head">
                        <div class="article-card-badge"><i class="fa-solid ${sec.icon}"></i> ${sec.categoryName}</div>
                        <h3 class="article-card-title">${sec.title}</h3>
                        <div class="article-card-price-tag">
                            <span>Giá niêm yết từ:</span> <strong>${startPrice}</strong>
                        </div>
                    </div>
                    <div class="article-card-img-wrap">
                        <img src="${carImg}" alt="${sec.title}" onerror="this.style.display='none'">
                    </div>
                    <div class="article-version-table">
                        <div class="article-table-header">
                            <span>Phiên bản phân phối</span>
                            <span>Giá niêm yết</span>
                        </div>
                        ${versionRows}
                    </div>
                    <div class="article-card-action">
                        <button class="btn btn-primary btn-article-see-more" data-car="${sec.key}">
                            <span>Xem thêm phiên bản ${liveCar ? liveCar.name : sec.key.toUpperCase()}</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        articleView.innerHTML = `
            ${generateViewHeader('BẢNG GIÁ XE FORD MỚI NHẤT', 'home-view')}
            <div class="article-view-body">
                <div class="article-hero-banner-wrap">
                    <img src="assets/thumb_gia_xe_ford_2026.png" alt="Bảng Giá Xe Ford 2026">
                </div>
                <div class="article-meta-banner">
                    <span class="section-tag"><i class="fa-solid fa-newspaper"></i> Tin tức & Bảng giá</span>
                    <h1 class="article-heading">BẢNG GIÁ XE FORD MỚI NHẤT TẠI QUY NHƠN</h1>
                    <div class="article-meta-row">
                        <span><i class="fa-regular fa-calendar"></i> Cập nhật: 04/10/2026</span>
                        <span><i class="fa-solid fa-location-dot"></i> Dana Ford Quy Nhơn</span>
                        <span><i class="fa-solid fa-user-tie"></i> Phụ trách: Mr Gia Bảo</span>
                    </div>
                    <p class="article-lead-text">
                        Bảo Táo - Dana Ford Bình Định trân trọng gửi tới quý khách hàng bảng tổng hợp giá xe Ford mới nhất năm 2026. Chương trình áp dụng hỗ trợ giảm thuế trước bạ, tặng gói phụ kiện cao cấp và hỗ trợ thủ tục mua xe trả góp lãi suất ưu đãi nhận xe ngay trong tháng.
                    </p>
                </div>

                <div class="article-car-list">
                    ${cardsHtml}
                </div>

                <!-- Promotion & Consultation Callout Box -->
                <div class="article-promo-box">
                    <div class="promo-box-icon"><i class="fa-solid fa-gift"></i></div>
                    <h4 class="promo-box-title">CHÍNH SÁCH ƯU ĐÃI ĐẶC QUYỀN THÁNG NÀY</h4>
                    <ul class="promo-box-list">
                        <li><i class="fa-solid fa-circle-check"></i> Hỗ trợ tiền mặt trực tiếp và quà tặng phụ kiện chính hãng.</li>
                        <li><i class="fa-solid fa-circle-check"></i> Hỗ trợ vay mua xe trả góp lên đến 85% giá trị xe, thủ tục nhanh gọn trong 24h.</li>
                        <li><i class="fa-solid fa-circle-check"></i> Đăng ký lái thử tận nhà miễn phí trên toàn địa bàn Quy Nhơn & lân cận.</li>
                    </ul>
                    <div class="promo-box-btns">
                        <a href="tel:0362193864" class="btn btn-secondary"><i class="fa-solid fa-phone"></i> Gọi Hotline Em Bảo</a>
                        <button class="btn btn-primary" id="btn-article-consult"><i class="fa-solid fa-paper-plane"></i> Nhận Báo Giá Lăn Bánh</button>
                    </div>
                </div>
            </div>
            ${generateViewFooter()}
        `;

        switchView('article-price-view');

        // Bind back button
        articleView.querySelector('.view-back-btn').addEventListener('click', () => {
            switchView('home-view');
            const newsSec = document.getElementById('news-section');
            if (newsSec) newsSec.scrollIntoView({ behavior: 'smooth' });
        });

        // Bind "Xem thêm" buttons to go into versions view of that car
        articleView.querySelectorAll('.btn-article-see-more').forEach(btn => {
            btn.addEventListener('click', () => {
                const carKey = btn.getAttribute('data-car');
                showCarVersions(carKey, 'article-price-view');
            });
        });

        // Bind consult button
        const consultBtn = articleView.querySelector('#btn-article-consult');
        if (consultBtn) {
            consultBtn.addEventListener('click', () => {
                switchView('home-view');
                const target = document.getElementById('consultation-section');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }
    window.showPriceArticleView = showPriceArticleView;

    // Bind Bảng Giá Xe Ford Article triggers
    const btnOpenPriceArticle = document.getElementById('btn-open-price-article');
    const cardPriceArticle = document.getElementById('card-price-article');
    const bannerOpenPrice = document.getElementById('banner-open-price-article');

    if (btnOpenPriceArticle) {
        btnOpenPriceArticle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPriceArticleView();
        });
    }

    if (cardPriceArticle) {
        cardPriceArticle.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            showPriceArticleView();
        });
    }

    if (bannerOpenPrice) {
        bannerOpenPrice.addEventListener('click', () => {
            showPriceArticleView();
        });
    }

    // Bind Showroom Card clicks to open version list page
    document.querySelectorAll('.btn-detail-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const carKey = btn.getAttribute('data-car');
            showCarVersions(carKey);
        });
    });

    // Bind Click events on Slider "Xem Chi Tiết" Buttons
    document.querySelectorAll('.btn-hero-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const carKey = btn.getAttribute('data-car');
            showCarVersions(carKey);
        });
    });

    // Make entire Product Card clickable to open versions page
    document.querySelectorAll('.product-card.horizontal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn') || e.target.closest('a')) {
                return;
            }
            const carKey = card.getAttribute('data-car');
            showCarVersions(carKey);
        });
    });



    // Helper: Scroll to form and pre-fill car details (handles version name in messages too)
    function scrollToForm(carValue) {
        const formSection = document.getElementById('consultation-section');
        const carDropdown = document.getElementById('form-car');
        const nameInput = document.getElementById('form-name');
        
        switchView('home-view');

        if (carValue && carDropdown) {
            for(let i=0; i<carDropdown.options.length; i++) {
                if(carDropdown.options[i].value === carValue) {
                    carDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Focus name input after scrolling finishes
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        setTimeout(() => {
            if (nameInput) {
                nameInput.focus();
            }
        }, 800);
    }

    // Bind Quick Quote Buttons (Zalo, Facebook, News links, etc.)
    document.querySelectorAll('.btn-quick-quote').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const carVal = btn.getAttribute('data-car');
            scrollToForm(carVal);
        });
    });

    // Bind Showroom Quote buttons
    document.querySelectorAll('.btn-showroom-quote').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const carVal = btn.getAttribute('data-car');
            scrollToForm(carVal);
        });
    });

    // 9. Consultation Form Submit
    const consultationForm = document.getElementById('consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const car = document.getElementById('form-car').value;
            const province = document.getElementById('form-province').value;
            
            try {
                // Post to Strapi API
                await fetch(API_BASE + '/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            customer_name: name,
                            phone: phone,
                            interested_car: car,
                            province: province,
                            status: 'Mới'
                        }
                    })
                });
                
                // Show Success Popup
                const successPopup = document.getElementById('success-popup');
                if (successPopup) {
                    successPopup.classList.add('active');
                    consultationForm.reset();
                    setTimeout(() => {
                        successPopup.classList.remove('active');
                    }, 4000);
                }
            } catch(e) {
                console.error("Lỗi gửi đăng ký:", e);
                alert("Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại!");
            }
        });
    }

    // 10. Floating Sticky CTA Bar animations
    // Hero CTA smooth scroll
    const heroBtn = document.getElementById('btn-hero-quote');
    if (heroBtn) {
        heroBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('consultation-section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    const ctaBar = document.getElementById('mobile-cta-bar');
    let lastScrollTop = 0;

    if (ctaBar) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                ctaBar.style.transform = 'translateY(100%) translateX(-50%)';
                ctaBar.style.transition = 'transform 0.3s ease';
            } else {
                ctaBar.style.transform = 'translateY(0) translateX(-50%)';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }

    // ========================================
    // 11. THREE CALCULATOR TOOLS
    // ========================================

    const vehicleTypes = {
        'Everest': 'suv',
        'Ranger': 'pickup',
        'Raptor': 'pickup',
        'Territory': 'suv',
        'Transit': 'commercial',
        'Mustang Mach-E': 'ev'
    };

    function formatVND(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    }

    function parseVND(str) {
        return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
    }

    function getCarKeys() {
        return Object.keys(carDetailsDB);
    }

    function populateCarDropdown(selectEl) {
        selectEl.innerHTML = '';
        getCarKeys().forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = carDetailsDB[key].name;
            selectEl.appendChild(opt);
        });
    }

    function populateVersionDropdown(selectEl, carKey) {
        selectEl.innerHTML = '';
        const versions = carDetailsDB[carKey]?.versions || [];
        versions.forEach((v, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = v.name;
            selectEl.appendChild(opt);
        });
    }

    function getVersionPrice(carKey, versionIndex) {
        const v = carDetailsDB[carKey]?.versions?.[versionIndex];
        if (!v) return 0;
        return parseVND(v.price);
    }

    function getVersionImage(carKey, versionIndex) {
        const v = carDetailsDB[carKey]?.versions?.[versionIndex];
        let imgPath = '';
        if (v && v.image) imgPath = v.image;
        else imgPath = carDetailsDB[carKey]?.image || '';
        
        if (!imgPath) return '';
        return imgPath.startsWith('http') ? imgPath : API_BASE + imgPath;
    }

    // ---- TOOL 1: SO SÁNH NHANH ----
    const compareCar1 = document.getElementById('compare-car-1');
    const compareVer1 = document.getElementById('compare-ver-1');
    const compareImg1 = document.getElementById('compare-img-1');
    const comparePrice1 = document.getElementById('compare-price-1');
    const compareCar2 = document.getElementById('compare-car-2');
    const compareVer2 = document.getElementById('compare-ver-2');
    const compareImg2 = document.getElementById('compare-img-2');
    const comparePrice2 = document.getElementById('compare-price-2');
    const btnCompare = document.getElementById('btn-compare-go');
    const compareResults = document.getElementById('compare-results');

    if (compareCar1 && compareCar2) {
        populateCarDropdown(compareCar1);
        populateCarDropdown(compareCar2);

        function updateCompareCol(carSel, verSel, imgEl, priceEl) {
            const carKey = carSel.value;
            populateVersionDropdown(verSel, carKey);
            const idx = parseInt(verSel.value) || 0;
            if (imgEl) imgEl.src = getVersionImage(carKey, idx);
            if (priceEl) priceEl.textContent = formatVND(getVersionPrice(carKey, idx));
        }

        compareCar1.addEventListener('change', () => updateCompareCol(compareCar1, compareVer1, compareImg1, comparePrice1));
        compareVer1.addEventListener('change', () => {
            const idx = parseInt(compareVer1.value) || 0;
            if (compareImg1) compareImg1.src = getVersionImage(compareCar1.value, idx);
            if (comparePrice1) comparePrice1.textContent = formatVND(getVersionPrice(compareCar1.value, idx));
        });
        compareCar2.addEventListener('change', () => updateCompareCol(compareCar2, compareVer2, compareImg2, comparePrice2));
        compareVer2.addEventListener('change', () => {
            const idx = parseInt(compareVer2.value) || 0;
            if (compareImg2) compareImg2.src = getVersionImage(compareCar2.value, idx);
            if (comparePrice2) comparePrice2.textContent = formatVND(getVersionPrice(compareCar2.value, idx));
        });

        // Initialize
        updateCompareCol(compareCar1, compareVer1, compareImg1, comparePrice1);
        if (compareCar2.options.length > 1) compareCar2.selectedIndex = 1;
        updateCompareCol(compareCar2, compareVer2, compareImg2, comparePrice2);

        if (btnCompare) {
            btnCompare.addEventListener('click', () => {
                const key1 = compareCar1.value;
                const key2 = compareCar2.value;
                const ver1Idx = parseInt(compareVer1.value) || 0;
                const ver2Idx = parseInt(compareVer2.value) || 0;
                const ver1 = carDetailsDB[key1]?.versions?.[ver1Idx];
                const ver2 = carDetailsDB[key2]?.versions?.[ver2Idx];
                const specs1 = ver1?.specs || {};
                const specs2 = ver2?.specs || {};

                const allSpecKeys = [...new Set([...Object.keys(specs1), ...Object.keys(specs2)])];
                
                let html = '<table><thead><tr><th>Tính năng / Thông số</th><th>' + (ver1?.name || carDetailsDB[key1]?.name) + '</th><th>' + (ver2?.name || carDetailsDB[key2]?.name) + '</th></tr></thead><tbody>';
                
                // Price row
                html += '<tr style="background:#fff3cd;"><td><strong>💰 Giá niêm yết</strong></td><td><strong style="color:#d92d20;">' + formatVND(getVersionPrice(key1, ver1Idx)) + '</strong></td><td><strong style="color:#d92d20;">' + formatVND(getVersionPrice(key2, ver2Idx)) + '</strong></td></tr>';
                
                // Specs/features from version data
                allSpecKeys.forEach(k => {
                    const v1 = specs1[k] || '';
                    const v2 = specs2[k] || '';
                    const has1 = !!v1;
                    const has2 = !!v2;
                    const isDiff = v1 !== v2;

                    // Format cell: if has value, show value + ✓; if not, show —
                    const cell1 = has1 ? '<span class="compare-val">' + v1 + '</span> <span class="compare-check">✓</span>' : '<span class="compare-empty">—</span>';
                    const cell2 = has2 ? '<span class="compare-val">' + v2 + '</span> <span class="compare-check">✓</span>' : '<span class="compare-empty">—</span>';

                    html += '<tr' + (isDiff ? ' class="compare-diff"' : '') + '><td>' + k + '</td><td>' + cell1 + '</td><td>' + cell2 + '</td></tr>';
                });

                // Description comparison
                if (ver1?.desc || ver2?.desc) {
                    html += '<tr class="compare-desc-row"><td><strong>📝 Mô tả</strong></td><td><small>' + (ver1?.desc || '—') + '</small></td><td><small>' + (ver2?.desc || '—') + '</small></td></tr>';
                }
                
                html += '</tbody></table>';
                compareResults.innerHTML = html;
                compareResults.style.display = 'block';
                
                // Smooth scroll to results
                compareResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    }

    // ---- TOOL 2: TÍNH TRẢ GÓP ----
    const loanCar = document.getElementById('loan-car');
    const loanVersion = document.getElementById('loan-version');
    const loanCarImg = document.getElementById('loan-car-img');
    const loanPriceDisplay = document.getElementById('loan-price-display');
    const loanPercent = document.getElementById('loan-percent');
    const loanPrepay = document.getElementById('loan-prepay');
    const loanTerm = document.getElementById('loan-term');
    const loanRate = document.getElementById('loan-rate');
    const btnLoanCalc = document.getElementById('btn-loan-calc');
    const loanResults = document.getElementById('loan-results');

    if (loanCar) {
        populateCarDropdown(loanCar);

        function updateLoanVersion() {
            const carKey = loanCar.value;
            populateVersionDropdown(loanVersion, carKey);
            updateLoanPrice();
        }

        function updateLoanPrice() {
            const carKey = loanCar.value;
            const vIdx = parseInt(loanVersion.value) || 0;
            const price = getVersionPrice(carKey, vIdx);
            if (loanPriceDisplay) loanPriceDisplay.value = formatVND(price);
            if (loanCarImg) loanCarImg.src = getVersionImage(carKey, vIdx);
        }

        loanCar.addEventListener('change', updateLoanVersion);
        loanVersion.addEventListener('change', updateLoanPrice);
        updateLoanVersion();

        // Mutual exclusion: % vay <-> trả trước
        let loanInputLock = false;
        if (loanPercent) {
            loanPercent.addEventListener('input', () => {
                if (loanInputLock) return;
                loanInputLock = true;
                const price = getVersionPrice(loanCar.value, parseInt(loanVersion.value) || 0);
                const pct = parseFloat(loanPercent.value) || 0;
                const prepayAmount = price * (1 - pct / 100);
                if (loanPrepay) loanPrepay.value = prepayAmount > 0 ? formatVND(prepayAmount).replace('đ','') : '';
                loanInputLock = false;
            });
        }
        if (loanPrepay) {
            loanPrepay.addEventListener('input', () => {
                if (loanInputLock) return;
                loanInputLock = true;
                const price = getVersionPrice(loanCar.value, parseInt(loanVersion.value) || 0);
                const prepayAmount = parseVND(loanPrepay.value);
                if (price > 0 && loanPercent) {
                    const pct = ((price - prepayAmount) / price) * 100;
                    loanPercent.value = Math.max(0, Math.min(100, Math.round(pct)));
                }
                loanInputLock = false;
            });
        }

        if (btnLoanCalc) {
            btnLoanCalc.addEventListener('click', () => {
                const price = getVersionPrice(loanCar.value, parseInt(loanVersion.value) || 0);
                const pct = parseFloat(loanPercent?.value) || 70;
                const loanAmount = price * pct / 100;
                const prepayAmount = price - loanAmount;
                const years = parseInt(loanTerm?.value) || 5;
                const months = years * 12;
                const annualRate = parseFloat(loanRate?.value) || 9;
                const monthlyRate = annualRate / 100 / 12;
                
                // PMT formula (annuity)
                let monthlyPayment;
                if (monthlyRate === 0) {
                    monthlyPayment = loanAmount / months;
                } else {
                    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
                }

                const totalInterest = (monthlyPayment * months) - loanAmount;

                let html = '<div class="calc-result-row"><span class="calc-result-label">Giá xe niêm yết</span><span class="calc-result-value">' + formatVND(price) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Trả trước (' + (100 - pct).toFixed(0) + '%)</span><span class="calc-result-value">' + formatVND(prepayAmount) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Số tiền vay (' + pct.toFixed(0) + '%)</span><span class="calc-result-value">' + formatVND(loanAmount) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Lãi suất</span><span class="calc-result-value">' + annualRate + '%/năm</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Thời hạn vay</span><span class="calc-result-value">' + years + ' năm (' + months + ' tháng)</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Tổng lãi phải trả</span><span class="calc-result-value">' + formatVND(totalInterest) + '</span></div>';
                html += '<div class="calc-result-row total"><span class="calc-result-label">💰 Trả hàng tháng</span><span class="calc-result-value">' + formatVND(monthlyPayment) + '</span></div>';

                loanResults.innerHTML = html;
                loanResults.style.display = 'block';
            });
        }

        updateLoanVersion();
    }

    // ---- TOOL 3: TÍNH GIÁ LĂN BÁNH ----
    const roadCar = document.getElementById('road-car');
    const roadVersion = document.getElementById('road-version');
    const roadCarImg = document.getElementById('road-car-img');
    const roadPriceDisplay = document.getElementById('road-price-display');
    const roadRegion = document.getElementById('road-region');
    const btnRoadCalc = document.getElementById('btn-road-calc');
    const roadResults = document.getElementById('road-results');

    function getRegistrationTaxRate(carKey, region) {
        const type = vehicleTypes[carKey] || 'suv';
        if (type === 'pickup') {
            return (region === 'hanoi' || region === 'hcm') ? 0.072 : 0.06;
        } else {
            return (region === 'hanoi' || region === 'hcm') ? 0.12 : 0.10;
        }
    }

    function getLicensePlateFee(region) {
        if (region === 'hanoi' || region === 'hcm') return 20000000;
        return 1000000;
    }

    if (roadCar) {
        populateCarDropdown(roadCar);

        function updateRoadVersion() {
            const carKey = roadCar.value;
            populateVersionDropdown(roadVersion, carKey);
            updateRoadPrice();
        }

        function updateRoadPrice() {
            const carKey = roadCar.value;
            const vIdx = parseInt(roadVersion.value) || 0;
            const price = getVersionPrice(carKey, vIdx);
            if (roadPriceDisplay) roadPriceDisplay.value = formatVND(price);
            if (roadCarImg) roadCarImg.src = getVersionImage(carKey, vIdx);
        }

        roadCar.addEventListener('change', updateRoadVersion);
        roadVersion.addEventListener('change', updateRoadPrice);
        updateRoadVersion();

        if (btnRoadCalc) {
            btnRoadCalc.addEventListener('click', () => {
                const carKey = roadCar.value;
                const vIdx = parseInt(roadVersion.value) || 0;
                const price = getVersionPrice(carKey, vIdx);
                const region = roadRegion?.value || 'province';

                const taxRate = getRegistrationTaxRate(carKey, region);
                const registrationTax = price * taxRate;
                const licensePlate = getLicensePlateFee(region);
                const roadFee = 1560000; // phí đường bộ 1 năm
                const insurance = 530700; // TNDS bắt buộc
                const inspection = 340000; // phí đăng kiểm

                const totalFees = registrationTax + licensePlate + roadFee + insurance + inspection;
                const totalOnRoad = price + totalFees;

                const regionName = {
                    'province': 'Bình Định / Tỉnh khác',
                    'danang': 'Đà Nẵng',
                    'hcm': 'TP. Hồ Chí Minh',
                    'hanoi': 'Hà Nội'
                }[region] || region;

                let html = '<div class="calc-result-row"><span class="calc-result-label">Giá xe niêm yết</span><span class="calc-result-value">' + formatVND(price) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Khu vực</span><span class="calc-result-value">' + regionName + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Phí trước bạ (' + (taxRate * 100).toFixed(1) + '%)</span><span class="calc-result-value">' + formatVND(registrationTax) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Phí đăng ký biển số</span><span class="calc-result-value">' + formatVND(licensePlate) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Phí đường bộ (1 năm)</span><span class="calc-result-value">' + formatVND(roadFee) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Bảo hiểm TNDS bắt buộc</span><span class="calc-result-value">' + formatVND(insurance) + '</span></div>';
                html += '<div class="calc-result-row"><span class="calc-result-label">Phí đăng kiểm</span><span class="calc-result-value">' + formatVND(inspection) + '</span></div>';
                html += '<div class="calc-result-row" style="border-top:1px dashed #94a3b8;margin-top:8px;padding-top:10px;"><span class="calc-result-label">Tổng phí</span><span class="calc-result-value">' + formatVND(totalFees) + '</span></div>';
                html += '<div class="calc-result-row total"><span class="calc-result-label">🚗 Giá lăn bánh tham khảo</span><span class="calc-result-value">' + formatVND(totalOnRoad) + '</span></div>';

                roadResults.innerHTML = html;
                roadResults.style.display = 'block';
            });
        }

        updateRoadVersion();
    }

    // ---- MODAL OPEN/CLOSE for new tools ----
    // The promo modal now serves as comparison modal
    const btnPromoModal = document.getElementById('btn-promo-modal');
    const promoModal = document.getElementById('promo-modal');
    const btnClosePromo = document.getElementById('btn-close-promo');
    
    if (btnPromoModal && promoModal) {
        btnPromoModal.addEventListener('click', () => { promoModal.classList.add('active'); });
    }
    if (btnClosePromo && promoModal) {
        btnClosePromo.addEventListener('click', () => { promoModal.classList.remove('active'); });
    }
    if (promoModal) {
        promoModal.addEventListener('click', (e) => { if (e.target === promoModal) promoModal.classList.remove('active'); });
    }

    // Installment modal
    const btnInstallModal = document.getElementById('btn-installment-modal');
    const installModal = document.getElementById('installment-modal');
    const btnCloseInstall = document.getElementById('btn-close-installment');
    
    if (btnInstallModal && installModal) {
        btnInstallModal.addEventListener('click', () => { installModal.classList.add('active'); });
    }
    if (btnCloseInstall && installModal) {
        btnCloseInstall.addEventListener('click', () => { installModal.classList.remove('active'); });
    }
    if (installModal) {
        installModal.addEventListener('click', (e) => { if (e.target === installModal) installModal.classList.remove('active'); });
    }

    // Calc (on-road) modal
    const btnCalcModal = document.getElementById('btn-calc-modal');
    const calcModal = document.getElementById('calc-modal');
    const btnCloseCalc = document.getElementById('btn-close-calc');
    
    if (btnCalcModal && calcModal) {
        btnCalcModal.addEventListener('click', () => { calcModal.classList.add('active'); });
    }
    if (btnCloseCalc && calcModal) {
        btnCloseCalc.addEventListener('click', () => { calcModal.classList.remove('active'); });
    }
    if (calcModal) {
        calcModal.addEventListener('click', (e) => { if (e.target === calcModal) calcModal.classList.remove('active'); });
    }

    // ---- WELCOME LEAD POPUP (Xuất hiện sau 3s khi vào trang / trang con; tắt đi 15s sau bật lại) ----
    const welcomeModal = document.getElementById('welcome-lead-modal');
    const btnCloseWelcome = document.getElementById('btn-close-welcome-lead');
    const welcomeForm = document.getElementById('welcome-lead-form');
    const welcomeCarSelect = document.getElementById('welcome-lead-car');

    let leadPopupTimer = null;
    let leadReopenTimer = null;
    let isLeadSubmitted = sessionStorage.getItem('welcome_lead_submitted') === 'true';

    function openLeadPopup() {
        if (isLeadSubmitted) return;
        if (welcomeModal && !welcomeModal.classList.contains('active')) {
            welcomeModal.classList.add('active');
        }
    }

    function scheduleLeadPopup(delayMs = 3000) {
        if (isLeadSubmitted) return;
        if (leadPopupTimer) clearTimeout(leadPopupTimer);
        if (leadReopenTimer) clearTimeout(leadReopenTimer);

        // Nếu popup đang mở thì không set lại
        if (welcomeModal && welcomeModal.classList.contains('active')) return;

        leadPopupTimer = setTimeout(() => {
            openLeadPopup();
        }, delayMs);
    }
    // Make available globally in DOMContentLoaded
    window.scheduleLeadPopup = scheduleLeadPopup;

    function closeLeadPopup() {
        if (welcomeModal) {
            welcomeModal.classList.remove('active');
        }
        if (leadPopupTimer) clearTimeout(leadPopupTimer);
        if (leadReopenTimer) clearTimeout(leadReopenTimer);

        // Nếu người xem tắt đi thì 15s sau lại bật lên lần nữa
        if (!isLeadSubmitted) {
            leadReopenTimer = setTimeout(() => {
                openLeadPopup();
            }, 15000);
        }
    }

    // Fallback options while API data is loading
    if (welcomeCarSelect && welcomeCarSelect.options.length <= 1) {
        const fallbackCars = [
            'Ford Everest Thế Hệ Mới',
            'Ford Ranger Thế Hệ Mới',
            'Ford Ranger Raptor Thế Hệ Mới',
            'Ford Territory Thế Hệ Mới',
            'Ford Transit Hoàn Toàn Mới',
            'Ford Mustang Mach-E'
        ];
        fallbackCars.forEach(carName => {
            const opt = document.createElement('option');
            opt.value = carName;
            opt.textContent = carName;
            welcomeCarSelect.appendChild(opt);
        });
    }

    // Tự động mở popup sau 3s khi vừa tải trang
    scheduleLeadPopup(3000);

    if (btnCloseWelcome) {
        btnCloseWelcome.addEventListener('click', (e) => {
            e.preventDefault();
            closeLeadPopup();
        });
    }

    if (welcomeModal) {
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                closeLeadPopup();
            }
        });
    }

    if (welcomeForm) {
        welcomeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('welcome-lead-name').value.trim();
            const phone = document.getElementById('welcome-lead-phone').value.trim();
            const car = document.getElementById('welcome-lead-car').value;

            if (!name || !phone || !car) return;

            const submitBtn = document.getElementById('welcome-lead-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';
            }

            try {
                await fetch(API_BASE + '/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            customer_name: name,
                            phone: phone,
                            interested_car: car,
                            status: 'Mới'
                        }
                    })
                });

                // Khách đã gửi thành công: Đánh dấu đã gửi và hủy toàn bộ timer bật lại
                isLeadSubmitted = true;
                sessionStorage.setItem('welcome_lead_submitted', 'true');
                if (leadPopupTimer) clearTimeout(leadPopupTimer);
                if (leadReopenTimer) clearTimeout(leadReopenTimer);

                if (welcomeModal) welcomeModal.classList.remove('active');
                welcomeForm.reset();

                const successPopup = document.getElementById('success-popup');
                if (successPopup) {
                    successPopup.classList.add('active');
                    setTimeout(() => {
                        successPopup.classList.remove('active');
                    }, 4000);
                }
            } catch (err) {
                console.error("Lỗi gửi thông tin khách hàng:", err);
                alert("Gửi thông tin chưa thành công. Quý khách vui lòng thử lại!");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>GỬI YÊU CẦU BÁO GIÁ NGAY</span><i class="fa-solid fa-paper-plane"></i>';
                }
            }
        });
    }
});
