/**
 * ==========================================================================
 * KALINAW SA KALAWAKAN CAMPSITE - WEBSITE LOGIC
 * Core Application Script
 * ==========================================================================
 */

// --- API KEYS CONFIGURATION ---
// Please replace these placeholders with your actual API keys.
const OPENWEATHER_API_KEY = ''; // OpenWeatherMap API Key
const STRIPE_PUBLISHABLE_KEY = ''; // Stripe Publishable Key (e.g. pk_test_...)
const ANTHROPIC_API_KEY = ''; // Anthropic API Key (e.g. sk-ant-...)

// Campsite Location Coordinates (Doña Remedios Trinidad, Bulacan)
const CAMPSITE_LAT = 14.9814;
const CAMPSITE_LON = 121.0544;

// --- CAMPSITE DATA & POLICIES (Loaded into Chatbot System Prompt & Local Engine) ---
const CAMPSITE_INFO = {
    name: "Kalinaw sa Kalawakan Campsite",
    location: "Doña Remedios Trinidad (DRT), Bulacan, Philippines",
    established: "2021",
    email: "kalinawsakalawakan@gmail.com",
    facebook: "https://www.facebook.com/KalinawsaKalawakanCampsiteDRTBulacan",
    instagram: "https://www.instagram.com/kalinawsakalawakan/",
    checkInOvernight: "2:00 PM",
    checkOutOvernight: "12:00 NN (next day)",
    checkInDaytour: "8:00 AM",
    checkOutDaytour: "8:00 PM",
    signal: "No WiFi available. Only Globe and TM cellular networks have signal/reception.",
    quietHours: "Starts strictly at 10:00 PM. Voices must be lowered, and all speakers, karaoke, or music devices must be turned off. Violations lead to warning, and after a 3rd warning, guests are evicted without refund.",
    poolHours: "8:00 AM - 8:00 PM only. Swimwear required, shower before swimming, no pets/eating/peeing/smoking/diving in pool, swim at your own risk (no lifeguard).",
    accommodations: {
        yakap: { name: "Yakap Room", type: "Kubo", rate: 1299, capacity: 2, mattress: "Full Mattress", extraRate: 350, inclusions: "Fan room, mattress, pillows, light, electric outlet, table & chairs, access to pool, common cooking area, parking, entrance fee included. No towel and blanket." },
        pahinga: { name: "Pahinga Room", type: "Kubo", rate: 1899, capacity: 3, mattress: "King Size Mattress", extraRate: 350, inclusions: "Fan room, King mattress, pillows, light, electric outlet, table & chairs, access to pool, cooking area, parking, entrance fee included. No towel and blanket." },
        maligaya: { name: "Maligaya Room", type: "Kubo", rate: 5999, capacity: 10, mattress: "2 King Size & 2 Full Mattress", extraRate: 350, inclusions: "Fan room, 4 mattresses, pillows, light, electric outlet, large table & chairs, access to pool, cooking area, parking, entrance fee included. No towel and blanket." },
        lambing: { name: "Lambing Cabin", type: "Aircon Cabin", rate: 2999, capacity: 2, mattress: "Double Bed Mattress", extraRate: 699, inclusions: "Airconditioned room, Double mattress, 2 pillows, 1 flatsheet, clothes rack, Japanese-style table/chairs, fan with light, outlet, pool & cooking access." },
        "tinatangi-yakap": { name: "Tinatangi Package (Yakap Room)", type: "Promo Package", rate: 2910, capacity: 2, inclusions: "Stay in Yakap Kubo + Breakfast for 2 + Public pool access + 1 Kalinaw Bath Set (1 hr w/ bath bomb) + 1 Bonfire set + Couple Yakap Mug." },
        "tinatangi-lambing": { name: "Tinatangi Package (Lambing Cabin)", type: "Promo Package", rate: 4610, capacity: 2, inclusions: "Stay in Lambing AC Cabin + Breakfast for 2 + Public pool access + 1 Kalinaw Bath Set (1 hr w/ bath bomb) + 1 Bonfire set + Couple Yakap Mug." },
        "tent-kapiling": { name: "Kapiling Tent", type: "Tent", rate: 999, capacity: 2, inclusions: "Pre-pitched tent, pool access, entrance fee included, good for 2 pax." },
        "tent-own": { name: "Own Tent Set-up", type: "Tent", rate: 350, capacity: 100, inclusions: "Pitch your own tent. Entrance fee, parking, and pool access included. Priced at ₱350 per head." },
        "cottage-silong": { name: "Silong Cottage", type: "Cottage (Daytour)", rate: 600, capacity: 6, inclusions: "Daytour cottage, good for 6 pax, entrance fee not included (Adult: ₱150, Kid: ₱100)." },
        "cottage-tambay": { name: "Tambay Cottage", type: "Cottage (Daytour)", rate: 1300, capacity: 10, inclusions: "Daytour cottage, good for 10 pax, entrance fee not included (Adult: ₱150, Kid: ₱100)." }
    },
    rentals: {
        pillow: { name: "Pillow", rate: 50 },
        blanket: { name: "Blanket (Kumot)", rate: 100 },
        towel: { name: "Towel", rate: 100 },
        sleepingBag: { name: "Sleeping Bag", rate: 100 },
        banigSmall: { name: "Banig (Small)", rate: 150 },
        banigLarge: { name: "Banig (Large)", rate: 200 },
        tableChairs: { name: "1 Table and 2 Chairs", rate: 150 },
        cookingSet: { name: "Cooking Set", rate: 500 },
        grill: { name: "Grill Only", rate: 150 },
        bonfire: { name: "Bonfire (1 set)", rate: 249 },
        basketball: { name: "Basketball Court (per hour)", rate: 200 }
    },
    corkages: {
        alcohol: { name: "Alcoholic Drinks Corkage", rate: 200 },
        butaneStove: { name: "Butane Stove / Kalan Corkage", rate: 50 },
        electricPhone: { name: "Phone Charging Corkage (per hr for tent)", rate: 50 },
        electricFan: { name: "Electric Fan Corkage", rate: 100 },
        electricKettle: { name: "Electric Kettle Corkage", rate: 50 },
        electricRiceCooker: { name: "Rice Cooker Corkage", rate: 100 },
        electricInduction: { name: "Induction Cooker Corkage (per use)", rate: 200 }
    },
    foodMenu: "Silog Breakfast Menu (7:00 AM - 10:00 PM everyday, ₱150 each): Hamsilog, Tocilog, Hotsilog, Cornedbeefsilog, Cornedtunasilog, Meatloafsilog."
};

// --- APPLICATION STATE ---
let appState = {
    selectedCheckIn: null,
    selectedCheckOut: null,
    currentCalendarYear: 2026,
    currentCalendarMonth: 4, // May (0-indexed: January is 0, May is 4)
    confirmedBookings: [], // Loaded from LocalStorage
    stripeInstance: null,
    stripeCardElement: null,
    activeFormStep: 1,
    galleryIndex: 0,
    chatHistory: [
        { role: 'assistant', text: 'Mabuhay! 🌿 Welcome to Kalinaw sa Kalawakan Campsite. I am your Camp Companion. How can I help you reconnect today?' }
    ]
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    showLoading(true);
    
    // Load existing bookings & draft reservation
    loadBookingsFromStorage();
    
    // Setup Navigation scrolled effects
    window.addEventListener('scroll', handleHeaderScroll);
    setupMobileMenu();
    setupSmoothScrolling();
    
    // Setup Image Gallery
    initGallery();
    
    // Setup Availability Calendar
    initCalendar();
    
    // Setup Booking Form Step navigation & validation
    initBookingForm();
    
    // Fetch Weather Data
    fetchWeather();
    
    // Initialize Stripe
    initStripe();
    
    // Setup Chatbot FAB & messages
    initChatbot();
    
    // Footer contact form submission
    setupContactForm();
    
    // Load Draft if exists
    loadBookingDraft();
    
    // Hide Loader
    setTimeout(() => {
        showLoading(false);
    }, 800);
}

// --- UTILITIES ---
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        if (show) spinner.classList.remove('hidden');
        else spinner.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    
    toast.innerHTML = `
        <span class="material-icons-round">${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- NAVIGATION & UI SCROLL ---
function handleHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Active Navigation Highlighting on scroll
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentSectionId = 'hero';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            const icon = toggle.querySelector('span');
            if (menu.classList.contains('open')) {
                icon.textContent = 'close';
            } else {
                icon.textContent = 'menu';
            }
        });
        
        // Close menu when a link is clicked
        const links = menu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.querySelector('span').textContent = 'menu';
            });
        });
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// --- ABOUT SECTION GALLERY CAROUSEL ---
function initGallery() {
    const track = document.getElementById('gallery-track');
    const slides = Array.from(document.querySelectorAll('.gallery-slide'));
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const dotsContainer = document.getElementById('gallery-dots');
    
    if (!track || slides.length === 0) return;
    
    // Create Indicator Dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = Array.from(dotsContainer.querySelectorAll('.gallery-dot'));
    
    function updateSlideClasses() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
            if (index === appState.galleryIndex) {
                slide.classList.add('active');
                dots[index].classList.add('active');
            }
        });
    }
    
    function goToSlide(index) {
        appState.galleryIndex = index;
        updateSlideClasses();
    }
    
    function nextSlide() {
        let index = appState.galleryIndex + 1;
        if (index >= slides.length) index = 0;
        goToSlide(index);
    }
    
    function prevSlide() {
        let index = appState.galleryIndex - 1;
        if (index < 0) index = slides.length - 1;
        goToSlide(index);
    }
    
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Auto rotate every 5s
    let autoSlideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto-slide on hover
    const gallerySlider = document.querySelector('.gallery-slider');
    if (gallerySlider) {
        gallerySlider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        gallerySlider.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(nextSlide, 5000);
        });
    }
}

// --- AVAILABILITY CALENDAR ---
function initCalendar() {
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => changeCalendarMonth(-1));
        nextBtn.addEventListener('click', () => changeCalendarMonth(1));
    }
    
    renderCalendar();
}

function changeCalendarMonth(direction) {
    // Current local date limits
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let targetMonth = appState.currentCalendarMonth + direction;
    let targetYear = appState.currentCalendarYear;
    
    if (targetMonth > 11) {
        targetMonth = 0;
        targetYear++;
    } else if (targetMonth < 0) {
        targetMonth = 11;
        targetYear--;
    }
    
    // Block navigating to past months
    if (targetYear < currentYear || (targetYear === currentYear && targetMonth < currentMonth)) {
        showToast("Cannot view past dates", "warning");
        return;
    }
    
    appState.currentCalendarMonth = targetMonth;
    appState.currentCalendarYear = targetYear;
    
    renderCalendar();
}

// Generate realistic pseudo-booking statuses for dates
function getDateAvailability(dateStr) {
    // Check if in confirmed bookings (local state)
    const isUserBooked = appState.confirmedBookings.some(booking => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        const current = new Date(dateStr);
        // Normalize time
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        current.setHours(0,0,0,0);
        return current >= start && current <= end;
    });
    
    if (isUserBooked) return 'booked'; // Mark red for confirmed user bookings

    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const dateNum = dateObj.getDate();
    
    // Static algorithm for realistic calendar colors
    // Weekends (Fri, Sat) are usually highly booked
    if (dayOfWeek === 5 || dayOfWeek === 6) {
        if (dateNum % 3 === 0) return 'booked'; // Red
        return 'partial'; // Yellow
    }
    
    // Select weekdays are booked/partial
    if (dateNum % 7 === 0) return 'booked';
    if (dateNum % 5 === 0) return 'partial';
    
    return 'available'; // Green
}

function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    const headerTitle = document.getElementById('calendar-month-year');
    
    if (!daysContainer || !headerTitle) return;
    
    daysContainer.innerHTML = '';
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    headerTitle.textContent = `${monthNames[appState.currentCalendarMonth]} ${appState.currentCalendarYear}`;
    
    // Get first day of the month & total days in month
    const firstDayIndex = new Date(appState.currentCalendarYear, appState.currentCalendarMonth, 1).getDay();
    const totalDays = new Date(appState.currentCalendarYear, appState.currentCalendarMonth + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Render blank empty days for offset matching weekday columns
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day disabled';
        daysContainer.appendChild(emptyCell);
    }
    
    // Render actual day cells
    for (let day = 1; day <= totalDays; day++) {
        const cellDate = new Date(appState.currentCalendarYear, appState.currentCalendarMonth, day);
        const cellDateStr = cellDate.toISOString().split('T')[0];
        
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.setAttribute('data-date', cellDateStr);
        
        // Inner date label
        const dateNumSpan = document.createElement('span');
        dateNumSpan.textContent = day;
        cell.appendChild(dateNumSpan);
        
        // Block past dates
        if (cellDate < today) {
            cell.classList.add('disabled');
        } else {
            // Apply availability dot indicators
            const status = getDateAvailability(cellDateStr);
            cell.classList.add(`status-${status}`);
            
            const dot = document.createElement('span');
            dot.className = `day-status-dot ${status}`;
            cell.appendChild(dot);
            
            // Selection highlighting
            applyCellSelectionStyles(cell, cellDateStr, cellDate);
            
            // Add Date click listeners
            cell.addEventListener('click', () => handleDateCellClick(cellDateStr, status));
        }
        
        daysContainer.appendChild(cell);
    }
}

function applyCellSelectionStyles(cell, cellDateStr, cellDate) {
    const checkIn = appState.selectedCheckIn;
    const checkOut = appState.selectedCheckOut;
    
    if (checkIn && cellDateStr === checkIn) {
        cell.classList.add('selected');
    } else if (checkOut && cellDateStr === checkOut) {
        cell.classList.add('selected');
    } else if (checkIn && checkOut) {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        if (cellDate > inDate && cellDate < outDate) {
            cell.classList.add('in-range');
        }
    }
}

function handleDateCellClick(dateStr, status) {
    if (status === 'booked') {
        showToast("This date is fully booked. Please choose an available date.", "error");
        return;
    }
    
    const clickedDate = new Date(dateStr);
    
    // 1. No check-in selected yet, or both already selected -> set as check-in
    if (!appState.selectedCheckIn || (appState.selectedCheckIn && appState.selectedCheckOut)) {
        appState.selectedCheckIn = dateStr;
        appState.selectedCheckOut = null;
        showToast("Check-In date selected. Choose Check-Out date next.", "info");
    } 
    // 2. Check-in selected, click date BEFORE check-in -> reset as check-in
    else if (clickedDate < new Date(appState.selectedCheckIn)) {
        appState.selectedCheckIn = dateStr;
        showToast("Check-In date updated.", "info");
    } 
    // 3. Check-in selected, click date AFTER check-in -> set as check-out
    else {
        // Validate there are no FULLY BOOKED dates inside the selection range
        if (isRangeIntersectingBooked(appState.selectedCheckIn, dateStr)) {
            showToast("Your selection contains fully booked dates. Please try another range.", "error");
            return;
        }
        
        appState.selectedCheckOut = dateStr;
        showToast("Check-Out date selected. Dates applied to form.", "success");
        
        // Auto scroll to reservation form details step
        const bookingCard = document.getElementById('booking-section');
        if (bookingCard) {
            bookingCard.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Update date fields in HTML Form
    updateFormDateFields();
    
    // Refresh calendar look
    renderCalendar();
    
    // Save draft
    saveBookingDraft();
}

function isRangeIntersectingBooked(checkInStr, checkOutStr) {
    const start = new Date(checkInStr);
    const end = new Date(checkOutStr);
    
    // Iterate day-by-day and test
    let current = new Date(start);
    while (current <= end) {
        const curStr = current.toISOString().split('T')[0];
        if (getDateAvailability(curStr) === 'booked') {
            return true;
        }
        current.setDate(current.getDate() + 1);
    }
    return false;
}

function updateFormDateFields() {
    const inInput = document.getElementById('check-in-date');
    const outInput = document.getElementById('check-out-date');
    
    if (inInput) inInput.value = appState.selectedCheckIn || '';
    if (outInput) outInput.value = appState.selectedCheckOut || '';
    
    calculateAndRenderSummary();
}

// --- BOOKING FORM MULTI-STEP LOGIC ---
function initBookingForm() {
    const form = document.getElementById('reservation-form');
    if (!form) return;
    
    // Next Step Buttons
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.getAttribute('data-next'));
            if (validateStep(nextStep - 1)) {
                goToFormStep(nextStep);
            }
        });
    });
    
    // Previous Step Buttons
    document.querySelectorAll('.prev-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.getAttribute('data-prev'));
            goToFormStep(prevStep);
        });
    });
    
    // Form Input Listeners for Real-time Calculation & Storage Draft Sync
    const inputsToWatch = [
        'guest-name', 'guest-email', 'guest-phone',
        'accommodation-type', 'check-in-date', 'check-out-date',
        'guest-count', 'add-kawa-bath', 'kawa-flowers', 'kawa-bathbomb',
        'kawa-extension', 'corkage-alcohol', 'corkage-gas',
        'elec-fan', 'elec-kettle', 'elec-cooker'
    ];
    
    inputsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                if (id === 'accommodation-type') {
                    handleAccommodationChange();
                }
                if (id === 'check-in-date' || id === 'check-out-date') {
                    syncDatesFromFormInputs();
                }
                calculateAndRenderSummary();
                saveBookingDraft();
            });
        }
    });
    
    // Listeners for quantity rentals inputs
    document.querySelectorAll('.rental-input').forEach(input => {
        input.addEventListener('input', () => {
            calculateAndRenderSummary();
            saveBookingDraft();
        });
    });
    
    // Toggle Kawa Bath suboptions
    const kawaCheckbox = document.getElementById('add-kawa-bath');
    if (kawaCheckbox) {
        kawaCheckbox.addEventListener('change', function() {
            const group = document.getElementById('kawa-addons-group');
            const subCheckboxes = group.querySelectorAll('input[type="checkbox"]');
            if (this.checked) {
                group.classList.remove('disabled');
                subCheckboxes.forEach(cb => cb.disabled = false);
            } else {
                group.classList.add('disabled');
                subCheckboxes.forEach(cb => {
                    cb.checked = false;
                    cb.disabled = true;
                });
            }
        });
    }
    
    // Form submission -> Triggers stripe modal popup
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(4)) {
            openPaymentModal();
        }
    });
}

function handleAccommodationChange() {
    const accSelect = document.getElementById('accommodation-type');
    const selectedOpt = accSelect.options[accSelect.selectedIndex];
    if (!selectedOpt) return;
    
    const roomKey = selectedOpt.value;
    const roomInfo = CAMPSITE_INFO.accommodations[roomKey];
    
    // Update capacity hint labels
    const capacityInfo = document.getElementById('occupancy-info');
    if (capacityInfo && roomInfo) {
        if (roomKey === 'tent-own') {
            capacityInfo.textContent = "Camping in own tent. Standard rate is per head.";
        } else {
            capacityInfo.textContent = `Selected accommodation accommodates up to ${roomInfo.capacity} pax. Extra heads: ₱${roomInfo.extraRate}/head/night.`;
        }
    }
    
    // Conditional show electric corkage option if tent is selected
    const electricCorkageBox = document.getElementById('tent-electric-corkage');
    if (electricCorkageBox) {
        if (roomKey === 'tent-own' || roomKey === 'tent-kapiling') {
            electricCorkageBox.classList.remove('hidden');
        } else {
            electricCorkageBox.classList.add('hidden');
            // Uncheck sub corkages
            document.getElementById('elec-fan').checked = false;
            document.getElementById('elec-kettle').checked = false;
            document.getElementById('elec-cooker').checked = false;
        }
    }
}

function syncDatesFromFormInputs() {
    const inVal = document.getElementById('check-in-date').value;
    const outVal = document.getElementById('check-out-date').value;
    
    appState.selectedCheckIn = inVal || null;
    appState.selectedCheckOut = outVal || null;
    
    renderCalendar();
}

function goToFormStep(step) {
    document.querySelectorAll('.form-step').forEach(node => {
        node.classList.remove('active');
        if (parseInt(node.getAttribute('data-step')) === step) {
            node.classList.add('active');
        }
    });
    appState.activeFormStep = step;
}

function validateStep(stepNum) {
    let isValid = true;
    
    // Clear old errors
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    
    if (stepNum === 1) {
        const name = document.getElementById('guest-name').value.trim();
        const email = document.getElementById('guest-email').value.trim();
        const phone = document.getElementById('guest-phone').value.trim();
        
        if (name.length < 2) {
            document.getElementById('name-error').style.display = 'block';
            isValid = false;
        }
        
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById('email-error').style.display = 'block';
            isValid = false;
        }
        
        if (phone.length < 7) {
            document.getElementById('phone-error').style.display = 'block';
            isValid = false;
        }
    } 
    
    else if (stepNum === 2) {
        const roomType = document.getElementById('accommodation-type').value;
        const checkIn = document.getElementById('check-in-date').value;
        const checkOut = document.getElementById('check-out-date').value;
        const guests = parseInt(document.getElementById('guest-count').value) || 0;
        
        if (!roomType) {
            document.getElementById('accommodation-error').style.display = 'block';
            isValid = false;
        }
        if (!checkIn) {
            document.getElementById('check-in-error').style.display = 'block';
            isValid = false;
        }
        if (!checkOut) {
            document.getElementById('check-out-error').style.display = 'block';
            isValid = false;
        } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
            document.getElementById('check-out-error').textContent = "Check-out must be after check-in";
            document.getElementById('check-out-error').style.display = 'block';
            isValid = false;
        }
        if (guests <= 0) {
            document.getElementById('guests-error').style.display = 'block';
            isValid = false;
        }
    }
    
    return isValid;
}

// Interactive Accommodations selection listener ("Reserve" buttons)
document.querySelectorAll('.btn-reserve-select').forEach(btn => {
    btn.addEventListener('click', () => {
        const roomId = btn.getAttribute('data-room-id');
        const selectEl = document.getElementById('accommodation-type');
        if (selectEl) {
            selectEl.value = roomId;
            handleAccommodationChange();
            calculateAndRenderSummary();
            saveBookingDraft();
            
            // Go to step 2 of form immediately and scroll
            goToFormStep(2);
            document.getElementById('availability').scrollIntoView({ behavior: 'smooth' });
            showToast(`Selected: ${CAMPSITE_INFO.accommodations[roomId]?.name}. Please select dates in calendar or form.`, "info");
        }
    });
});

// --- PRICING & INVOICE GENERATOR ---
function calculateAndRenderSummary() {
    const summaryTbody = document.getElementById('summary-tbody');
    const summaryTotalEl = document.getElementById('summary-total-price');
    if (!summaryTbody || !summaryTotalEl) return;
    
    const roomKey = document.getElementById('accommodation-type').value;
    const checkInVal = document.getElementById('check-in-date').value;
    const checkOutVal = document.getElementById('check-out-date').value;
    const guestCount = parseInt(document.getElementById('guest-count').value) || 0;
    
    let total = 0;
    let summaryRows = [];
    
    if (!roomKey || !checkInVal || !checkOutVal) {
        summaryTbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Please complete Step 1 & 2 stay details to load pricing.</td></tr>';
        summaryTotalEl.textContent = '₱0.00';
        return;
    }
    
    // 1. Calculate Nights
    const inDate = new Date(checkInVal);
    const outDate = new Date(checkOutVal);
    let nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    
    // Day tour cottages fallback checks
    const roomInfo = CAMPSITE_INFO.accommodations[roomKey];
    const isDayTour = roomInfo && roomInfo.type.includes('Daytour');
    if (isDayTour) {
        nights = 1; // Cottages are consumable 8AM - 8PM, so 1 day
    } else if (nights <= 0) {
        nights = 1; // Default minimum 1 night
    }
    
    // 2. Base Room charge
    if (roomInfo) {
        let baseCost = 0;
        if (roomKey === 'tent-own') {
            // Own tent set up charges per head per night
            baseCost = roomInfo.rate * guestCount * nights;
            summaryRows.push({
                desc: `${roomInfo.name} (${guestCount} pax × ₱${roomInfo.rate} × ${nights} ${nights > 1 ? 'nights' : 'night'})`,
                price: baseCost
            });
        } else {
            baseCost = roomInfo.rate * nights;
            summaryRows.push({
                desc: `${roomInfo.name} (${nights} ${nights > 1 ? 'nights' : 'night'})`,
                price: baseCost
            });
        }
        total += baseCost;
        
        // 3. Extra Guest Fee charges (only if not 'tent-own' which is already charged per head)
        if (roomKey !== 'tent-own' && guestCount > roomInfo.capacity) {
            const extraPax = guestCount - roomInfo.capacity;
            const extraCost = extraPax * roomInfo.extraRate * nights;
            summaryRows.push({
                desc: `Extra Guest Fee (${extraPax} pax × ₱${roomInfo.extraRate} × ${nights} ${nights > 1 ? 'nights' : 'night'})`,
                price: extraCost
            });
            total += extraCost;
        }
    }
    
    // Check if Tinatangi package is selected (offers package exemptions on Kawa and Bonfires)
    const hasTinatangi = roomKey.startsWith('tinatangi');
    
    // 4. Kawa Bath Add-on calculations
    const isKawaChecked = document.getElementById('add-kawa-bath').checked;
    if (isKawaChecked) {
        // If they have the package, the base hot water and 1 bath bomb is already free!
        if (hasTinatangi) {
            summaryRows.push({ desc: '1-Hour Hot Kawa Bath (Included in Package)', price: 0 });
            
            // Check addons
            if (document.getElementById('kawa-flowers').checked) {
                total += 50;
                summaryRows.push({ desc: '↳ Add-on: Fresh Flowers', price: 50 });
            }
            if (document.getElementById('kawa-bathbomb').checked) {
                // First bath bomb is included in package. If checked, they only get charged if they want a second?
                // Let's assume the bath bomb tick is just confirmation of what they want, so free!
                summaryRows.push({ desc: '↳ Add-on: Package Bath Bomb', price: 0 });
            }
            if (document.getElementById('kawa-extension').checked) {
                total += 150;
                summaryRows.push({ desc: '↳ Add-on: 30 Mins Extension', price: 150 });
            }
        } else {
            let kawaCost = 349;
            total += kawaCost;
            summaryRows.push({ desc: '1-Hour Hot Kawa Bath', price: kawaCost });
            
            if (document.getElementById('kawa-flowers').checked) {
                total += 50;
                summaryRows.push({ desc: '↳ Add-on: Fresh Flowers', price: 50 });
            }
            if (document.getElementById('kawa-bathbomb').checked) {
                total += 120;
                summaryRows.push({ desc: '↳ Add-on: Scented Bath Bomb', price: 120 });
            }
            if (document.getElementById('kawa-extension').checked) {
                total += 150;
                summaryRows.push({ desc: '↳ Add-on: 30 Mins Extension', price: 150 });
            }
        }
    }
    
    // 5. Equipment Rentals
    const rentalsKeys = ['pillow', 'blanket', 'towel', 'cooking', 'grill', 'bonfire'];
    rentalsKeys.forEach(key => {
        const qtyInput = document.getElementById(`rent-${key}`);
        if (qtyInput) {
            const qty = parseInt(qtyInput.value) || 0;
            if (qty > 0) {
                let rate = 0;
                let descName = "";
                
                if (key === 'pillow') { rate = 50; descName = "Extra Pillows"; }
                if (key === 'blanket') { rate = 100; descName = "Blanket Rentals"; }
                if (key === 'towel') { rate = 100; descName = "Towel Rentals"; }
                if (key === 'cooking') { rate = 500; descName = "Cooking Set Rental"; }
                if (key === 'grill') { rate = 150; descName = "Grill Only Rental"; }
                if (key === 'bonfire') { 
                    rate = 249; 
                    descName = "Bonfire Set Setup";
                    
                    // Tinatangi package includes 1 Bonfire set free
                    if (hasTinatangi && qty >= 1) {
                        const billableQty = qty - 1;
                        if (billableQty > 0) {
                            const rentalCost = billableQty * rate;
                            total += rentalCost;
                            summaryRows.push({ desc: `${descName} (1 free package set + ${billableQty} extra)`, price: rentalCost });
                        } else {
                            summaryRows.push({ desc: `${descName} (1 set - Included in Package)`, price: 0 });
                        }
                        return; // Skip standard billing calculation
                    }
                }
                
                const rentalCost = qty * rate;
                total += rentalCost;
                summaryRows.push({
                    desc: `${descName} (${qty} × ₱${rate})`,
                    price: rentalCost
                });
            }
        }
    });
    
    // 6. Corkage Fees
    if (document.getElementById('corkage-alcohol').checked) {
        total += 200;
        summaryRows.push({ desc: 'Corkage: Alcoholic Drinks', price: 200 });
    }
    if (document.getElementById('corkage-gas').checked) {
        total += 50;
        summaryRows.push({ desc: 'Corkage: Gasul / Butane Stove', price: 50 });
    }
    
    // 7. Tent Electric Corkages (only relevant for tents)
    if (roomKey === 'tent-own' || roomKey === 'tent-kapiling') {
        if (document.getElementById('elec-fan').checked) {
            total += 100;
            summaryRows.push({ desc: 'Corkage: Electric Fan', price: 100 });
        }
        if (document.getElementById('elec-kettle').checked) {
            total += 50;
            summaryRows.push({ desc: 'Corkage: Electric Kettle', price: 50 });
        }
        if (document.getElementById('elec-cooker').checked) {
            total += 100;
            summaryRows.push({ desc: 'Corkage: Rice Cooker', price: 100 });
        }
    }
    
    // Render invoice rows
    summaryTbody.innerHTML = '';
    summaryRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.desc}</td>
            <td class="text-right">₱${row.price.toLocaleString()}</td>
        `;
        summaryTbody.appendChild(tr);
    });
    
    summaryTotalEl.textContent = `₱${total.toLocaleString()}`;
    
    // Return total and details list for payment screen
    return {
        total: total,
        summary: summaryRows
    };
}

// --- LOCAL STORAGE PERSISTENCE (DRAFTS & BOOKINGS) ---
function loadBookingsFromStorage() {
    const stored = localStorage.getItem('kalinaw_confirmed_bookings');
    if (stored) {
        try {
            appState.confirmedBookings = JSON.parse(stored);
        } catch (e) {
            console.error("Error loading confirmed bookings", e);
            appState.confirmedBookings = [];
        }
    }
}

function saveBookingDraft() {
    const draft = {
        name: document.getElementById('guest-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        roomType: document.getElementById('accommodation-type').value,
        checkIn: document.getElementById('check-in-date').value,
        checkOut: document.getElementById('check-out-date').value,
        guestCount: document.getElementById('guest-count').value,
        kawaBath: document.getElementById('add-kawa-bath').checked,
        kawaFlowers: document.getElementById('kawa-flowers').checked,
        kawaBathbomb: document.getElementById('kawa-bathbomb').checked,
        kawaExtension: document.getElementById('kawa-extension').checked,
        rentPillow: document.getElementById('rent-pillow').value,
        rentBlanket: document.getElementById('rent-blanket').value,
        rentTowel: document.getElementById('rent-towel').value,
        rentCooking: document.getElementById('rent-cooking').value,
        rentGrill: document.getElementById('rent-grill').value,
        rentBonfire: document.getElementById('rent-bonfire').value,
        corkageAlcohol: document.getElementById('corkage-alcohol').checked,
        corkageGas: document.getElementById('corkage-gas').checked,
        elecFan: document.getElementById('elec-fan').checked,
        elecKettle: document.getElementById('elec-kettle').checked,
        elecCooker: document.getElementById('elec-cooker').checked,
        activeStep: appState.activeFormStep
    };
    
    localStorage.setItem('kalinaw_booking_draft', JSON.stringify(draft));
    
    const indicator = document.getElementById('draft-indicator');
    if (indicator) {
        indicator.classList.remove('hidden');
        setTimeout(() => indicator.classList.add('hidden'), 2000);
    }
}

function loadBookingDraft() {
    const stored = localStorage.getItem('kalinaw_booking_draft');
    if (!stored) return;
    
    try {
        const draft = JSON.parse(stored);
        
        document.getElementById('guest-name').value = draft.name || '';
        document.getElementById('guest-email').value = draft.email || '';
        document.getElementById('guest-phone').value = draft.phone || '';
        document.getElementById('accommodation-type').value = draft.roomType || '';
        
        handleAccommodationChange();
        
        document.getElementById('check-in-date').value = draft.checkIn || '';
        document.getElementById('check-out-date').value = draft.checkOut || '';
        
        appState.selectedCheckIn = draft.checkIn || null;
        appState.selectedCheckOut = draft.checkOut || null;
        
        document.getElementById('guest-count').value = draft.guestCount || '2';
        
        // Kawa Bath
        document.getElementById('add-kawa-bath').checked = draft.kawaBath || false;
        const group = document.getElementById('kawa-addons-group');
        const subCheckboxes = group.querySelectorAll('input[type="checkbox"]');
        if (draft.kawaBath) {
            group.classList.remove('disabled');
            subCheckboxes.forEach(cb => cb.disabled = false);
            document.getElementById('kawa-flowers').checked = draft.kawaFlowers || false;
            document.getElementById('kawa-bathbomb').checked = draft.kawaBathbomb || false;
            document.getElementById('kawa-extension').checked = draft.kawaExtension || false;
        }
        
        // Rentals
        document.getElementById('rent-pillow').value = draft.rentPillow || '0';
        document.getElementById('rent-blanket').value = draft.rentBlanket || '0';
        document.getElementById('rent-towel').value = draft.rentTowel || '0';
        document.getElementById('rent-cooking').value = draft.rentCooking || '0';
        document.getElementById('rent-grill').value = draft.rentGrill || '0';
        document.getElementById('rent-bonfire').value = draft.rentBonfire || '0';
        
        // Corkage
        document.getElementById('corkage-alcohol').checked = draft.corkageAlcohol || false;
        document.getElementById('corkage-gas').checked = draft.corkageGas || false;
        
        // Electric Tent Corkages
        document.getElementById('elec-fan').checked = draft.elecFan || false;
        document.getElementById('elec-kettle').checked = draft.elecKettle || false;
        document.getElementById('elec-cooker').checked = draft.elecCooker || false;
        
        // Recalculate and go to saved step
        calculateAndRenderSummary();
        renderCalendar();
        
        if (draft.activeStep && draft.activeStep > 1 && draft.activeStep <= 4) {
            goToFormStep(draft.activeStep);
        }
    } catch (e) {
        console.error("Error parsing booking draft", e);
    }
}

function clearBookingDraft() {
    localStorage.removeItem('kalinaw_booking_draft');
}

// --- SECURE PAYMENT INTEGRATION (STRIPE & FALLBACK) ---
function initStripe() {
    if (STRIPE_PUBLISHABLE_KEY) {
        try {
            appState.stripeInstance = Stripe(STRIPE_PUBLISHABLE_KEY);
            const elements = appState.stripeInstance.elements();
            appState.stripeCardElement = elements.create('card', {
                style: {
                    base: {
                        color: '#213326',
                        fontFamily: '"Outfit", sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '16px',
                        '::placeholder': {
                            color: '#757575'
                        }
                    },
                    invalid: {
                        color: '#d32f2f',
                        iconColor: '#d32f2f'
                    }
                }
            });
            // Hide standard HTML mock card fields, display Stripe Card Element
            const mockCard = document.getElementById('mock-card-container');
            if (mockCard) mockCard.classList.add('hidden');
            
            // Mount Stripe Element
            appState.stripeCardElement.mount('#stripe-card-element');
        } catch (e) {
            console.error("Stripe initialization failed, falling back to mock card fields.", e);
        }
    } else {
        console.log("No Stripe Publishable Key set. Running in secure Credit Card simulation mode.");
        // Make sure local inputs are formatted beautifully
        setupMockCardFormatting();
    }
}

function setupMockCardFormatting() {
    const cardNo = document.getElementById('card-number');
    const cardExp = document.getElementById('card-expiry');
    const cardCvc = document.getElementById('card-cvc');
    
    if (cardNo) {
        cardNo.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            let chunks = val.match(/.{1,4}/g);
            this.value = chunks ? chunks.join(' ') : '';
        });
    }
    
    if (cardExp) {
        cardExp.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '');
            if (val.length >= 2) {
                this.value = val.substring(0, 2) + '/' + val.substring(2, 4);
            } else {
                this.value = val;
            }
        });
    }
    
    if (cardCvc) {
        cardCvc.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const detailsList = document.getElementById('payment-details-list');
    const totalEl = document.getElementById('payment-total-amount');
    
    if (!modal || !detailsList || !totalEl) return;
    
    // Get latest calculated totals
    const calc = calculateAndRenderSummary();
    if (!calc) return;
    
    // Inject details into payment modal screen
    detailsList.innerHTML = '';
    calc.summary.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.desc}</span> <span>₱${item.price.toLocaleString()}</span>`;
        detailsList.appendChild(li);
    });
    
    totalEl.textContent = `₱${calc.total.toLocaleString()}`;
    
    // Clear card errors & reset state
    document.getElementById('card-errors').textContent = '';
    
    modal.classList.remove('hidden');
    
    // Listeners for closing modal
    const closeBtn = document.getElementById('btn-close-payment');
    closeBtn.onclick = () => modal.classList.add('hidden');
    
    // Process payment submit
    const paymentForm = document.getElementById('payment-form');
    paymentForm.onsubmit = (e) => {
        e.preventDefault();
        processPaymentSubmit(calc.total);
    };
}

function processPaymentSubmit(amountCalculated) {
    const btnText = document.getElementById('payment-btn-text');
    const btnSpinner = document.getElementById('payment-btn-spinner');
    const errorEl = document.getElementById('card-errors');
    
    if (btnText && btnSpinner) {
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
    }
    
    errorEl.textContent = '';
    
    // Scenario A: Real Stripe.js Integration
    if (appState.stripeInstance && appState.stripeCardElement) {
        // Stripe.js card token logic:
        appState.stripeInstance.createToken(appState.stripeCardElement).then(result => {
            if (result.error) {
                // Show errors
                errorEl.textContent = result.error.message;
                // Restore button
                btnText.classList.remove('hidden');
                btnSpinner.classList.add('hidden');
            } else {
                // Send Token to your server to process charge.
                // Since this is client-side, we simulate server verification success after 1.5s
                console.log("Stripe Token created:", result.token);
                setTimeout(() => {
                    handlePaymentSuccess(amountCalculated);
                }, 1500);
            }
        });
    } 
    // Scenario B: Simulated CC Validation
    else {
        const cardNo = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExp = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;
        
        // Simple card validation
        if (cardNo.length < 15 || cardNo.length > 16) {
            errorEl.textContent = "Please enter a valid credit card number.";
            restorePaymentButton();
            return;
        }
        
        if (!cardExp.includes('/') || cardExp.length < 5) {
            errorEl.textContent = "Please enter a valid expiry date (MM/YY).";
            restorePaymentButton();
            return;
        }
        
        if (cardCvc.length < 3) {
            errorEl.textContent = "Please enter a valid CVC.";
            restorePaymentButton();
            return;
        }
        
        // Success simulation
        setTimeout(() => {
            handlePaymentSuccess(amountCalculated);
        }, 1500);
    }
    
    function restorePaymentButton() {
        if (btnText && btnSpinner) {
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    }
}

function handlePaymentSuccess(amount) {
    const payModal = document.getElementById('payment-modal');
    if (payModal) payModal.classList.add('hidden');
    
    // Restore pay button state
    const btnText = document.getElementById('payment-btn-text');
    const btnSpinner = document.getElementById('payment-btn-spinner');
    if (btnText && btnSpinner) {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
    
    // Save Confirmed Booking into state & LocalStorage
    const guestName = document.getElementById('guest-name').value;
    const guestEmail = document.getElementById('guest-email').value;
    const roomKey = document.getElementById('accommodation-type').value;
    const checkIn = document.getElementById('check-in-date').value;
    const checkOut = document.getElementById('check-out-date').value;
    
    const newBooking = {
        refId: 'KLN-' + Math.floor(100000 + Math.random() * 900000),
        name: guestName,
        email: guestEmail,
        room: CAMPSITE_INFO.accommodations[roomKey]?.name || roomKey,
        checkIn: checkIn,
        checkOut: checkOut,
        paid: amount
    };
    
    appState.confirmedBookings.push(newBooking);
    localStorage.setItem('kalinaw_confirmed_bookings', JSON.stringify(appState.confirmedBookings));
    
    // Setup Confirmation Overlay screen details
    document.getElementById('conf-guest-name').textContent = guestName;
    document.getElementById('conf-ref-id').textContent = newBooking.refId;
    document.getElementById('conf-accommodation').textContent = newBooking.room;
    
    // Format Dates nicely
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateRangeStr = `${new Date(checkIn).toLocaleDateString('en-US', options)} - ${new Date(checkOut).toLocaleDateString('en-US', options)}`;
    document.getElementById('conf-dates').textContent = dateRangeStr;
    document.getElementById('conf-amount').textContent = `₱${amount.toLocaleString()}.00`;
    document.getElementById('conf-email').textContent = guestEmail;
    
    // Reveal Confirmation modal
    const confModal = document.getElementById('confirmation-modal');
    if (confModal) confModal.classList.remove('hidden');
    
    // Reset Form & Clear local storage draft
    const form = document.getElementById('reservation-form');
    if (form) form.reset();
    clearBookingDraft();
    
    appState.selectedCheckIn = null;
    appState.selectedCheckOut = null;
    appState.activeFormStep = 1;
    
    // Refresh Calendar to show these dates as booked
    renderCalendar();
    
    // Close confirmation button logic
    const closeConfBtn = document.getElementById('btn-close-confirmation');
    closeConfBtn.onclick = () => {
        confModal.classList.add('hidden');
        goToFormStep(1);
        document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
        showToast("We look forward to welcoming you to Kalinaw sa Kalawakan! 🌿", "success");
    };
}

// --- LIVE WEATHER FEEDS & FORECASTS ---
function fetchWeather() {
    if (OPENWEATHER_API_KEY) {
        showWidgetLoader(true);
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${CAMPSITE_LAT}&lon=${CAMPSITE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${CAMPSITE_LAT}&lon=${CAMPSITE_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        
        Promise.all([
            fetch(currentUrl).then(res => res.json()),
            fetch(forecastUrl).then(res => res.json())
        ])
        .then(([currentData, forecastData]) => {
            renderWeatherData(currentData);
            renderForecastData(forecastData);
            showWidgetLoader(false);
        })
        .catch(err => {
            console.error("OpenWeather API fetch failed, loading default fallback forecast.", err);
            loadFallbackWeather();
            showWidgetLoader(false);
        });
    } else {
        // Run fallback simulation immediately
        loadFallbackWeather();
    }
}

function showWidgetLoader(show) {
    const card = document.getElementById('weather-card');
    if (!card) return;
    if (show) card.style.opacity = '0.6';
    else card.style.opacity = '1';
}

function renderWeatherData(data) {
    if (!data || !data.main) return;
    
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6); // conversion m/s to km/h
    const cond = data.weather[0].main;
    const desc = data.weather[0].description;
    
    // Ingest values
    document.getElementById('weather-temp').textContent = `${temp}°C`;
    document.getElementById('weather-condition').textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    document.getElementById('weather-humidity').textContent = `${humidity}%`;
    document.getElementById('weather-wind').textContent = `${windSpeed} km/h`;
    
    // Update main weather icon symbol
    const iconEl = document.getElementById('weather-icon');
    iconEl.className = 'material-icons-round';
    iconEl.textContent = getWeatherIconSymbol(cond);
    
    // Formatted local date
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById('weather-date').textContent = new Date().toLocaleDateString('en-US', options);
    
    updateCampingTips(cond);
}

function getWeatherIconSymbol(condition) {
    const cond = condition.toLowerCase();
    if (cond.includes('clear')) return 'wb_sunny';
    if (cond.includes('cloud')) return 'cloud';
    if (cond.includes('rain') || cond.includes('drizzle')) return 'grain';
    if (cond.includes('thunderstorm')) return 'thunderstorm';
    if (cond.includes('snow')) return 'ac_unit';
    if (cond.includes('mist') || cond.includes('fog')) return 'foggy';
    return 'wb_cloudy';
}

function updateCampingTips(condition) {
    const tipsBox = document.getElementById('weather-camping-tips');
    if (!tipsBox) return;
    
    const cond = condition.toLowerCase();
    let title = "";
    let desc = "";
    let icon = "wb_sunny";
    let iconColor = "text-amber";
    
    if (cond.includes('clear') || cond.includes('sunny')) {
        title = "Ideal Camping Conditions";
        desc = "skies are clear and dry. Perfect evening for stargazing, roasting marshmallows at the bonfire, and pitching tents directly under the heavens.";
        icon = "wb_sunny";
        iconColor = "text-amber";
    } else if (cond.includes('rain') || cond.includes('thunderstorm') || cond.includes('drizzle')) {
        title = "Rainy Conditions Forecasted";
        desc = "Pack heavy waterproof covers/tarps, keep electronics elevated inside plastic bags, check tent sealants, or upgrade your booking to our cozy Kubos/Lambing Cabin!";
        icon = "thunderstorm";
        iconColor = "text-danger";
    } else {
        // Cloudy / misty
        title = "Cool & Cozy Atmosphere";
        desc = "It's cool, breezy, and slightly cloudy. Perfect cozy mountain vibes! Great time to schedule a relaxing hot Kawa bath session or a warm cup of coffee.";
        icon = "cloud";
        iconColor = "text-muted";
    }
    
    tipsBox.innerHTML = `
        <div class="tip-card">
            <span class="material-icons-round ${iconColor}">${icon}</span>
            <p><strong>${title}:</strong> ${desc}</p>
        </div>
    `;
}

function renderForecastData(data) {
    const forecastGrid = document.getElementById('weather-forecast');
    if (!forecastGrid || !data || !data.list) return;
    
    forecastGrid.innerHTML = '';
    
    // OpenWeather 5-day return coordinates are divided in 3-hour blocks (40 items).
    // Filter index for 1 block every 24 hours (roughly index 8, 16, 24, 32, 39)
    const list = data.list;
    const dailyData = list.filter((_, idx) => idx % 8 === 0).slice(0, 5);
    
    dailyData.forEach(dayInfo => {
        const date = new Date(dayInfo.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(dayInfo.main.temp);
        const cond = dayInfo.weather[0].main;
        const iconSym = getWeatherIconSymbol(cond);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-day';
        forecastCard.innerHTML = `
            <span>${dayName}</span>
            <span class="material-icons-round">${iconSym}</span>
            <strong>${temp}°</strong>
        `;
        forecastGrid.appendChild(forecastCard);
    });
}

function loadFallbackWeather() {
    console.log("Loading realistic weather dataset fallback for DRT, Bulacan.");
    // Simulate Bulacan mountain climate
    const dummyCurrent = {
        main: { temp: 28, humidity: 65 },
        wind: { speed: 2.2 },
        weather: [{ main: 'Clouds', description: 'scattered clouds' }]
    };
    renderWeatherData(dummyCurrent);
    
    // Simulate 5 days
    const forecastGrid = document.getElementById('weather-forecast');
    if (forecastGrid) {
        forecastGrid.innerHTML = '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
        const temps = [29, 28, 30, 27, 29];
        const icons = ['wb_sunny', 'cloud', 'wb_sunny', 'thunderstorm', 'wb_cloudy'];
        
        days.forEach((day, index) => {
            const card = document.createElement('div');
            card.className = 'forecast-day';
            card.innerHTML = `
                <span>${day}</span>
                <span class="material-icons-round">${icons[index]}</span>
                <strong>${temps[index]}°</strong>
            `;
            forecastGrid.appendChild(card);
        });
    }
}

// --- CONVERSATIONAL AI CHATBOT (FAQ COMPANION) ---
function initChatbot() {
    const fab = document.getElementById('chatbot-fab');
    const panel = document.getElementById('chat-panel');
    const minimize = document.getElementById('chat-minimize');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const badge = document.getElementById('chat-badge');
    
    if (!fab || !panel) return;
    
    fab.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        fab.classList.toggle('open');
        
        // Hide badge notification count when chat is opened
        if (badge) badge.classList.add('hidden');
        
        if (!panel.classList.contains('hidden')) {
            document.getElementById('chat-input').focus();
            scrollToBottom();
        }
    });
    
    minimize.addEventListener('click', () => {
        panel.classList.add('hidden');
        fab.classList.remove('open');
    });
    
    // Quick Reply suggestion Chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            addUserMessage(query);
            processChatResponse(query);
        });
    });
    
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        
        chatInput.value = '';
        addUserMessage(text);
        
        // Add typing indicator bubble
        const typingId = addBotTypingBubble();
        
        setTimeout(() => {
            processChatResponse(text, typingId);
        }, 800);
    });
}

function addUserMessage(text) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.innerHTML = `
        <p>${escapeHTML(text)}</p>
        <span class="chat-time">${getCurrentTimeStr()}</span>
    `;
    
    box.appendChild(bubble);
    appState.chatHistory.push({ role: 'user', text: text });
    scrollToBottom();
}

function addBotTypingBubble() {
    const box = document.getElementById('chat-messages');
    if (!box) return null;
    
    const id = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.id = id;
    bubble.innerHTML = `
        <p class="typing-anim">Thinking...</p>
    `;
    
    box.appendChild(bubble);
    scrollToBottom();
    return id;
}

function replaceBotTypingWithText(typingId, responseText) {
    const typingBubble = document.getElementById(typingId);
    if (typingBubble) {
        // Detect and offer options based on keywords
        let options = [];
        const lowerText = responseText.toLowerCase();
        
        if (lowerText.includes('which room would you like details on') || lowerText.includes('we offer several accommodations')) {
            options = ['Yakap Room', 'Pahinga Room', 'Maligaya Room', 'Lambing Cabin', 'Tinatangi Package', 'Camping Tents'];
        } else if (lowerText.includes('kawa bath') && !lowerText.includes('inclusions') && !lowerText.includes('tinatangi')) {
            options = ['Kawa Bath Add-ons', 'Kawa Bath Benefits', 'How to Book'];
        } else if (lowerText.includes('corkages') || lowerText.includes('corkage')) {
            options = ['Alcoholic Corkage', 'Stove Corkage', 'Electric Corkage'];
        } else if (lowerText.includes('timings') || lowerText.includes('check-in') || lowerText.includes('checkin')) {
            options = ['Overnight Hours', 'Daytour Hours', 'Extension Fees'];
        } else if (lowerText.includes('pool') && !lowerText.includes('tinatangi') && !lowerText.includes('kubo')) {
            options = ['Pool Hours', 'Pool Rules'];
        } else if (lowerText.includes('welcome to') || lowerText.includes('mabuhay')) {
            options = ['Rates & Rooms', 'Quiet Hours', 'Food Menu', 'Kawa Bath', 'How to Book'];
        }
        
        let optionsHtml = '';
        if (options.length > 0) {
            optionsHtml = `<div class="chat-bubble-options">`;
            options.forEach(opt => {
                optionsHtml += `<button type="button" class="chat-option-btn" data-value="${opt}">${opt}</button>`;
            });
            optionsHtml += `</div>`;
        }

        // Format formatting blocks like bold markdown or newlines to HTML
        let formattedText = responseText
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        typingBubble.innerHTML = `
            <p>${formattedText}</p>
            ${optionsHtml}
            <span class="chat-time">${getCurrentTimeStr()}</span>
        `;
        
        // Add click listeners to option buttons
        if (options.length > 0) {
            const btns = typingBubble.querySelectorAll('.chat-option-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const val = this.getAttribute('data-value');
                    
                    // Disable all buttons in this message bubble
                    btns.forEach(b => b.disabled = true);
                    this.style.backgroundColor = 'var(--amber-primary)';
                    this.style.color = 'var(--pure-white)';
                    this.style.borderColor = 'var(--amber-primary)';
                    
                    handleOptionClick(val);
                });
            });
        }
        
        appState.chatHistory.push({ role: 'assistant', text: responseText });
        scrollToBottom();
    }
}

function handleOptionClick(value) {
    // 1. Add user message
    addUserMessage(value);
    
    // 2. Show thinking
    const typingId = addBotTypingBubble();
    
    // 3. Respond after brief delay
    setTimeout(() => {
        processChatResponse(value, typingId);
    }, 800);
}


function scrollToBottom() {
    const box = document.getElementById('chat-messages');
    if (box) {
        box.scrollTop = box.scrollHeight;
    }
}

function getCurrentTimeStr() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// System Prompt describing the campsite context
const ANTHROPIC_SYSTEM_PROMPT = `
You are the "Kalinaw Camp Companion", an assistant for Kalinaw sa Kalawakan Campsite in DRT, Bulacan.
Your role is to help users with reservation details, rates, policies, and FAQs.

Campsite Profile:
- Name: Kalinaw sa Kalawakan Campsite
- Location: Doña Remedios Trinidad (DRT), Bulacan, Philippines.
- Address: Kalinaw sa Kalawakan, Doña Remedios Trinidad, Philippines, 3009
- Email: kalinawsakalawakan@gmail.com
- Socials: FB: https://www.facebook.com/KalinawsaKalawakanCampsiteDRTBulacan , IG: https://www.instagram.com/kalinawsakalawakan/
- Established: 2021
- Signal Policy: Strictly NO WIFI. Only Globe and TM networks have signal reception in this mountain retreat. Tell campers to prepare for a digital detox!
- Quiet Hours: Quiet hours start strictly at 10:00 PM. Keep voices low. Turn off all speakers, karaoke, or sound systems. Disruptive guests are evicted on 3rd warning without refund.
- Pool Rules: Pool hours are 8:00 AM to 8:00 PM. Wear swimsuits. Shower first. Watch kids. No lifeguard. No peeing, smoking, pets, or food/drink inside the pool.
- Check In & Check Out:
  * Daytour: Check-in: 8:00 AM, Check-out: 8:00 PM
  * Overnight: Check-in: 2:00 PM, Check-out: 12:00 NN next day.
  * Adjustments/consumables (22 hours) or extensions have hourly fees: P100/hr for tents, P200/hr for Yakap Room, P250/hr for Pahinga Room, P600/hr for Maligaya Room, P350/hr for Lambing Cabin.

Accommodations & Rates:
1. Kubo Fan Rooms:
   - Yakap Room (Good for 2, Full Mattress): ₱1,299/night. Inclusions: Fan room, mattress, pillows, light, electric outlet, table & chairs, pool & cooking access, parking. No towel/blanket.
   - Pahinga Room (Good for 3, King Mattress): ₱1,899/night. Same inclusions.
   - Maligaya Room (Good for 10, 2 King & 2 Full Mattress): ₱5,999/night. Same inclusions.
   - Kubo Extra Pax: ₱350/head/night (no extra mattress/pillow).
2. Lambing Cabin (Aircon Cabin):
   - Good for 2, Double bed mattress, Japanese table/chairs, clothes rack, air conditioning. ₱2,999/night.
   - Extra Pax: ₱699/head/night (includes extra mattress, sheets, pillow).
3. Tinatangi Couple Package (value promo package):
   - Includes stay for 2 pax, breakfast, pool access, 1 bonfire set, 1 couple Yakap Mug, and a 1-hour Kawa Bath w/ bath bomb.
   - Package Price: ₱2,910 with Yakap Room, or ₱4,610 with Lambing Cabin.
4. Tents:
   - Kapiling Tent (pre-pitched for 2): ₱999/night (includes entry fee).
   - Own Tent Pitching: ₱350/head/night. Includes entry fee.
5. Day Tour Cottages (cottage required for daytour):
   - Daytour entry fee: Adult: ₱150, Kid: ₱100.
   - Silong Cottage (6 pax): ₱600
   - Tambay Cottage (10 pax): ₱1,300

Kalinaw Kawa Bath (Hot Tub):
- Rates: 1 hour hot water is ₱349. Add-ons: Flowers (+₱50), Bath bomb (+₱120), 30 mins extension (+₱150).

Rentals & Fees:
- Pillow: ₱50, Blanket: ₱100, Towel: ₱100, Sleeping Bag: ₱100, Cooking Set: ₱500, Grill: ₱150, Bonfire (1 set): ₱249, Basketball court: ₱200/hr.
- Corkages: Alcohol corkage is ₱200. Butane/Gas stove is ₱50.
- Electrical items (for tent guests): Phone charging P50/hr, Electric fan P100, Electric kettle P50, Rice cooker P100, Induction stove P200.

Food Menu:
- Breakfast Silogs (Ham, Toci, Hot, Corned Beef, Corned Tuna, Meatloaf with egg & rice) available 7AM - 10PM everyday for ₱150 each.

Guidelines for Chatbot:
- Keep answers polite, brief, clear, and nature-loving.
- Encourage users to book slots. If they ask how to book, explain that they can select their room, pick dates on the interactive calendar, fill out the form, and checkout!
- PWD & Senior Citizen discounts do not apply to Promo Rates.
`;

function processChatResponse(userInput, typingId) {
    // 1. Check if Anthropic API Key is configured. If so, attempt direct integration.
    if (ANTHROPIC_API_KEY) {
        callAnthropicAPI(userInput, typingId);
    } else {
        // 2. Offline fallback rule engine
        const offlineReply = getOfflineKeywordReply(userInput);
        replaceBotTypingWithText(typingId, offlineReply);
    }
}

// CLIENT-SIDE CALL TO ANTHROPIC CLAUDE MESSAGES API
function callAnthropicAPI(userInput, typingId) {
    // Prepare conversation messages history formatted for Claude
    const claudeMessages = appState.chatHistory.map(msg => ({
        role: msg.role,
        content: msg.text
    }));
    
    // We send a direct browser request. NOTE: Without local proxies, this might trigger CORS failures
    // in normal production environments. We handle that cleanly in catch() by falling back.
    fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'dangerouslyAllowBrowser': 'true' // In case of standard JS library headers proxying
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: ANTHROPIC_SYSTEM_PROMPT,
            messages: claudeMessages
        })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const replyText = data.content[0].text;
        replaceBotTypingWithText(typingId, replyText);
    })
    .catch(err => {
        console.warn("Anthropic API direct fetch blocked or failed. Running smart offline rules fallback.", err);
        const fallbackReply = getOfflineKeywordReply(userInput) + "\n\n*(Offline Companion Mode activated)*";
        replaceBotTypingWithText(typingId, fallbackReply);
    });
}

// SMART KEYWORD RULE ENGINE (OFFLINE MODE)
function getOfflineKeywordReply(userInput) {
    const text = userInput.toLowerCase();
    
    if (text.includes('hello') || text.includes('hi') || text.includes('mabuhay') || text.includes('good morning') || text.includes('good afternoon')) {
        return "Mabuhay! 🌿 Welcome to Kalinaw sa Kalawakan. I am here to help you coordinate your nature getaway. You can ask me about Kubo rates, rules, signal availability, menu, or check-in schedules!";
    }
    
    if (text.includes('rate') || text.includes('price') || text.includes('how much') || text.includes('room') || text.includes('kubo') || text.includes('cabin') || text.includes('accommodations')) {
        if (text.includes('yakap')) {
            return `**Yakap Room:** ₱1,299 per night. Good for 2 pax, featuring a Full Mattress. Inclusions: Fan, pillows, light, electric outlet, table & chairs, swimming pool access, parking, and common cooking area. (Towel & blanket not included).`;
        }
        if (text.includes('pahinga')) {
            return `**Pahinga Room:** ₱1,899 per night. Good for 3 pax, featuring a King Size Mattress. Inclusions: Fan, pillows, light, electric outlet, table & chairs, swimming pool access, parking, and common cooking area. (Towel & blanket not included).`;
        }
        if (text.includes('maligaya')) {
            return `**Maligaya Room:** ₱5,999 per night. Good for 10 pax, featuring 2 King Size & 2 Full Mattresses. Inclusions: Fan, pillows, light, electric outlet, table & chairs, swimming pool access, parking, and common cooking area. (Towel & blanket not included).`;
        }
        if (text.includes('lambing') || text.includes('cabin')) {
            return `**Lambing Cabin:** ₱2,999 per night. Good for 2 pax. Features airconditioning, Double Bed Mattress, 2 pillows, 1 flatsheet, clothes rack, Japanese-style table & chairs, fan, electrical outlet. Extra heads are ₱699/head.`;
        }
        if (text.includes('package') || text.includes('tinatangi')) {
            return `**Tinatangi Package (Couple Promo):** Includes pool access, breakfast for 2, 1 bonfire, 1 couple Yakap Mug, and 1 Kawa Bath Set w/ bath bomb. Rates: ₱2,910 with Yakap Kubo or ₱4,610 with Lambing Cabin. Excellent savings!`;
        }
        if (text.includes('tent') || text.includes('camping')) {
            return `**Tent Options:**\n- **Kapiling Tent:** ₱999/night. Good for 2. (Includes pool access & entrance fee).\n- **Pitch Own Tent:** ₱350 per head per night (Includes pool access & entrance fee).`;
        }
        if (text.includes('cottage') || text.includes('daytour')) {
            return `**Cottages (Daytour 8AM - 8PM):**\n- **Silong Cottage:** ₱600 (Good for 6)\n- **Tambay Cottage:** ₱1,300 (Good for 10)\n*Note: Daytour entrance fee is ₱150 for adults, ₱100 for kids (3-4ft).*`;
        }
        return `We offer several accommodations:\n1. **Yakap Room** (2 pax fan Kubo) - ₱1,299/night\n2. **Pahinga Room** (3 pax fan Kubo) - ₱1,899/night\n3. **Maligaya Room** (10 pax fan Kubo) - ₱5,999/night\n4. **Lambing Cabin** (2 pax Aircon Cabin) - ₱2,999/night\n5. **Tinatangi couple package** starting at ₱2,910\n6. **Camping Tents** starting at ₱350/head.\n\nWhich room would you like details on? (Type 'Yakap', 'Lambing', etc.)`;
    }
    
    if (text.includes('quiet') || text.includes('loud') || text.includes('noise') || text.includes('speaker') || text.includes('music') || text.includes('karaoke')) {
        return `**Quiet Hours Policy:** Starts strictly at **10:00 PM**. To preserve the serenity, please turn off speakers, karaoke, or music devices, and lower your voice. Disruptive behavior will get warnings; on the 3rd warning, you'll be evicted without refund. We respect nature and all campers! 🤫`;
    }
    
    if (text.includes('wifi') || text.includes('signal') || text.includes('internet') || text.includes('globe') || text.includes('tm')) {
        return `**Connectivity Policy:** There is **NO WIFI** available at the campsite. Mobile reception is limited; **only Globe and TM networks have signal**. It is the perfect place for a digital detox! 📶`;
    }
    
    if (text.includes('kawa') || text.includes('bath') || text.includes('hot water')) {
        return `**Kalinaw Kawa Bath:** A traditional wood-fired hot tub experience. Good for 1 hour. Rates: ₱349 (hot water only). Add-ons: Flowers (+₱50), Scented Bath Bomb (+₱120), 30-min extension (+₱150). Highly recommended for muscle relaxation and stress relief! 🛀`;
    }
    
    if (text.includes('checkin') || text.includes('checkout') || text.includes('time') || text.includes('schedule') || text.includes('hours')) {
        return `**Standard Timings:**\n- **Overnight Stay:** Check-in 2:00 PM, Check-out 12:00 NN next day.\n- **Daytour Stay:** Check-in 8:00 AM, Check-out 8:00 PM.\n\nHourly extensions: P100 (tents), P200 (Yakap), P250 (Pahinga), P600 (Maligaya), P350 (Lambing). Subject to availability.`;
    }
    
    if (text.includes('food') || text.includes('menu') || text.includes('silog') || text.includes('breakfast') || text.includes('eat')) {
        return `**Kalinaw Silog Menu (₱150 each, open 7AM - 10PM):** We serve Hamsilog, Tocilog, Hotsilog, Cornedbeefsilog, Cornedtunasilog, and Meatloafsilog. Perfect warm meal to kickstart your day! 🍳`;
    }
    
    if (text.includes('corkage') || text.includes('bring') || text.includes('drink') || text.includes('alcohol') || text.includes('stove')) {
        return `**Corkages:**\n- Alcoholic drinks: ₱200 flat fee.\n- Butane/Gasul stove cooking set: ₱50 flat fee.\n- Tent Electric corkage: Electric Fan (₱100), Electric Kettle (₱50), Rice Cooker (₱100), Induction stove (₱200/use). Phone charging (₱50/hr).`;
    }
    
    if (text.includes('pet') || text.includes('dog') || text.includes('cat')) {
        return `**Pet Policy:** Yes, own pets are allowed! We love furry friends. Please just be a responsible pet owner and keep them clean and controlled. Watch out for local stray cats/dogs; keep your food secure. 🐶🐱`;
    }
    
    if (text.includes('pool') || text.includes('swim')) {
        return `**Pool Rules:** Open 8:00 AM - 8:00 PM. Swimwear required, shower before entering, no lifeguard on duty, no running, no peeing, no pets in pool, and no food/drinks inside pool water. 🏊‍♂️`;
    }
    
    if (text.includes('how to book') || text.includes('book') || text.includes('reserve') || text.includes('booking')) {
        return `To reserve a spot:\n1. Browse our **Campsites/Accommodations**.\n2. Go to the **Calendar & Reservation** section.\n3. Click on available dates on the Calendar (check-in first, then check-out).\n4. Fill in your details, select any rentals/add-ons, and proceed to Stripe Secure Checkout!`;
    }
    
    if (text.includes('location') || text.includes('where') || text.includes('map') || text.includes('address') || text.includes('drt')) {
        return `**Location:** We are located at Kalinaw sa Kalawakan, Doña Remedios Trinidad (DRT), Bulacan, Philippines. You can find our exact location embedded in the Google Map at the bottom of the page! 🗺️`;
    }
    
    return "Thank you for reaching out! I want to help you. Try asking about 'Rates', 'Quiet hours', 'Kawa bath', 'Wifi signal', or 'Book a room'. 💚";
}

// --- CONTACT FORM SUBMISSION ---
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const msg = document.getElementById('contact-message').value;
            
            showLoading(true);
            
            // Simulate message sending delay
            setTimeout(() => {
                showLoading(false);
                showToast(`Thank you, ${name}! Your message has been sent to our caretakers.`, "success");
                contactForm.reset();
            }, 1000);
        });
    }
}
