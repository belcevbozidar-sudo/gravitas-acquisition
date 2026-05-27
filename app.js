// GRAVITAS ACQUISITION - INTERACTIVE CORE ENGINE

document.addEventListener("DOMContentLoaded", () => {
    // 1. Header scroll effect
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // 2. Initialize ROI Calculator
    initROICalculator();

    // 3. Initialize CRM Simulator controls
    initCRMSimulator();

    // 4. Initialize Quiz progress
    updateQuizProgress();
});

/* ==========================================
   ROI CALCULATOR LOGIC
   ========================================== */
function initROICalculator() {
    const avgDealSlider = document.getElementById("avg-deal-slider");
    const adsBudgetSlider = document.getElementById("ads-budget-slider");
    
    if (avgDealSlider && adsBudgetSlider) {
        avgDealSlider.addEventListener("input", calculateROI);
        adsBudgetSlider.addEventListener("input", calculateROI);
        
        // Run initial calculation
        calculateROI();
    }
}

function calculateROI() {
    const V = parseInt(document.getElementById("avg-deal-slider").value); // Avg Deal Size (BGN)
    const B = parseInt(document.getElementById("ads-budget-slider").value); // Monthly Ads Budget (BGN)
    
    // Updates slider indicator labels
    document.getElementById("avg-deal-display").textContent = `${V.toLocaleString('bg-BG')} лв.`;
    
    const euroEquivalent = Math.round(B / 2);
    document.getElementById("ads-budget-display").textContent = `${B.toLocaleString('bg-BG')} лв. (${euroEquivalent} €)`;
    
    // Mathematical variables:
    // Our service cost is 2,000 € which is approximately 4,000 лв.
    // Total investment over 2 months = 4,000 лв. (us) + 2 * monthly ad budget (B)
    const serviceCostBGN = 4000;
    const totalInvestment = serviceCostBGN + (2 * B);
    
    // A. Breakeven contracts = Total Investment / Avg Deal size
    const breakevenVal = totalInvestment / V;
    document.getElementById("breakeven-contracts").textContent = breakevenVal.toFixed(1);
    
    // B. Projected revenue assuming a conservative 10 closed contracts
    const projectedContractsCount = 10;
    const projectedRevenue = V * projectedContractsCount;
    document.getElementById("proj-revenue").textContent = `${projectedRevenue.toLocaleString('bg-BG')} лв.`;
    
    // C. Net ROI % = ((Revenue - Investment) / Investment) * 100
    const netProfit = projectedRevenue - totalInvestment;
    const roiPercentage = (netProfit / totalInvestment) * 100;
    document.getElementById("net-roi").textContent = `${Math.round(roiPercentage).toLocaleString('bg-BG')}%`;
}


/* ==========================================
   CRM SYSTEM SIMULATOR LOGIC
   ========================================== */
let simInterval = null;
let isPlaying = false;
let currentSimStep = 1;
const totalSimSteps = 4;

function initCRMSimulator() {
    // Reset display elements state
    updateSimulationUI();
}

function toggleSimulation() {
    const playBtn = document.getElementById("btn-play-simulation");
    const statusLabel = document.getElementById("sim-status-label");
    
    if (isPlaying) {
        // Pause simulation
        clearInterval(simInterval);
        isPlaying = false;
        playBtn.textContent = "Стартирай Симулацията";
        statusLabel.textContent = "Статус: На пауза";
    } else {
        // Play simulation
        isPlaying = true;
        playBtn.textContent = "Спри Симулацията";
        statusLabel.textContent = "Статус: Активна симулация";
        
        // Run step loop
        simInterval = setInterval(() => {
            currentSimStep = currentSimStep >= totalSimSteps ? 1 : currentSimStep + 1;
            updateSimulationUI();
        }, 3200);
    }
}

function updateSimulationUI() {
    // 1. Update active steps indicators
    for (let i = 1; i <= totalSimSteps; i++) {
        const indicator = document.getElementById(`sim-step-${i}-indicator`);
        const slide = document.getElementById(`slide-step-${i}`);
        
        if (indicator) {
            indicator.classList.remove("active", "completed");
            if (i === currentSimStep) {
                indicator.classList.add("active");
            } else if (i < currentSimStep) {
                indicator.classList.add("completed");
            }
        }
        
        if (slide) {
            slide.classList.remove("active");
            if (i === currentSimStep) {
                slide.classList.add("active");
            }
        }
    }
    
    // Dynamic SMS message or CRM log alerts console mock
    const logConsoleLabel = document.getElementById("sim-status-label");
    if (isPlaying && logConsoleLabel) {
        logConsoleLabel.textContent = `Статус: Етап ${currentSimStep} активен...`;
    }
}


/* ==========================================
   INTERACTIVE APPLICATION QUIZ LOGIC
   ========================================== */
let currentQuizStep = 1;
const totalQuizSteps = 5;

function handleCardSelection(cardElement, fieldName, value) {
    // Handle visual card active state toggle
    const gridContainer = cardElement.parentNode;
    const cards = gridContainer.querySelectorAll(".quiz-selection-card");
    cards.forEach(card => card.classList.remove("selected"));
    
    cardElement.classList.add("selected");
    
    // Update target input values
    const targetInput = document.getElementById(`input-${fieldName.replace('_', '-')}`);
    if (targetInput) {
        targetInput.value = value;
    }
    
    // Warning trigger condition for step 4 ad budget selector
    if (fieldName === 'ad_budget') {
        const warningBox = document.getElementById("budget-warning");
        if (value.includes("Не")) {
            warningBox.style.display = "flex";
        } else {
            warningBox.style.display = "none";
        }
    }
    
    // Ultra-smooth micro delay auto-advance (only for selection card step screens 1, 2, 3)
    if (currentQuizStep < 4) {
        setTimeout(() => {
            goToNextStep();
        }, 400);
    }
}

function goToNextStep() {
    // 1. Validation check
    if (!validateQuizStep()) {
        return;
    }
    
    if (currentQuizStep < totalQuizSteps) {
        // Toggle steps active visibility
        const currentActive = document.querySelector(`.main-quiz-step[data-step="${currentQuizStep}"]`);
        if (currentActive) currentActive.classList.remove("active");
        
        currentQuizStep++;
        
        const nextActive = document.querySelector(`.main-quiz-step[data-step="${currentQuizStep}"]`);
        if (nextActive) nextActive.classList.add("active");
        
        updateQuizProgress();
        
        // Scroll quiz box into focus smoothly
        document.getElementById("application-quiz").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
        // Handle form submit on final step
        submitApplicationForm();
    }
}

function goToPrevStep() {
    if (currentQuizStep > 1) {
        const currentActive = document.querySelector(`.main-quiz-step[data-step="${currentQuizStep}"]`);
        if (currentActive) currentActive.classList.remove("active");
        
        currentQuizStep--;
        
        const prevActive = document.querySelector(`.main-quiz-step[data-step="${currentQuizStep}"]`);
        if (prevActive) prevActive.classList.add("active");
        
        updateQuizProgress();
        
        // Scroll quiz box into focus smoothly
        document.getElementById("application-quiz").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function validateQuizStep() {
    if (currentQuizStep === 1) {
        const val = document.getElementById("input-niche").value;
        if (!val) {
            alert("Моля, изберете вашата ниша, за да продължите.");
            return false;
        }
    } else if (currentQuizStep === 2) {
        const val = document.getElementById("input-avg-deal").value;
        if (!val) {
            alert("Моля, посочете средния ви размер на сделките.");
            return false;
        }
        
        // Alert if low budget
        if (val === "Под 5 000 лв.") {
            const confirmLow = confirm("Нашата придобиваща система е проектирана изключително за бизнеси със сделки над 5,000 лв. Сделки под този праг не оправдават високата ни цена за менажиране. Желаете ли все пак да кандидатствате?");
            return confirmLow;
        }
    } else if (currentQuizStep === 3) {
        const val = document.getElementById("input-capacity").value;
        if (!val) {
            alert("Моля, посочете оперативния капацитет на екипа ви.");
            return false;
        }
    } else if (currentQuizStep === 4) {
        const val = document.getElementById("input-ad-budget").value;
        if (!val) {
            alert("Моля, изберете отношението ви към рекламния бюджет.");
            return false;
        }
        if (val.includes("Не")) {
            const forceClose = confirm("Без покриване на рекламния бюджет Meta Ads няма да работи. Сигурни ли сте, че желаете да подадете неквалифицирана кандидатура?");
            return forceClose;
        }
    } else if (currentQuizStep === 5) {
        // Checks fields validity manually
        const comp = document.getElementById("company-name").value.trim();
        const own = document.getElementById("owner-name").value.trim();
        const phone = document.getElementById("owner-phone").value.trim();
        const email = document.getElementById("owner-email").value.trim();
        const story = document.getElementById("owner-story").value.trim();
        
        if (!comp || !own || !phone || !email || !story) {
            alert("Моля, попълнете всички контактни полета.");
            return false;
        }
    }
    return true;
}

function updateQuizProgress() {
    const progressPercent = (currentQuizStep / totalQuizSteps) * 100;
    const progressFill = document.getElementById("quiz-main-progress");
    
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    document.getElementById("quiz-step-indicator-text").textContent = `Стъпка ${currentQuizStep} от ${totalQuizSteps}`;
    document.getElementById("quiz-step-percent-text").textContent = `${Math.round(progressPercent)}% завършено`;
    
    // Updates action buttons states
    const prevBtn = document.getElementById("btn-quiz-prev");
    const nextBtn = document.getElementById("btn-quiz-next");
    
    if (prevBtn && nextBtn) {
        if (currentQuizStep === 1) {
            prevBtn.style.display = "none";
        } else {
            prevBtn.style.display = "inline-flex";
        }
        
        if (currentQuizStep === totalQuizSteps) {
            nextBtn.innerHTML = `
                Изпрати Кандидатурата
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            `;
            nextBtn.style.background = "var(--accent-gold-gradient)";
            nextBtn.style.boxShadow = "0 10px 25px -5px rgba(251, 191, 36, 0.4), 0 0 30px rgba(251, 191, 36, 0.15)";
        } else {
            nextBtn.innerHTML = `
                Продължи
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            `;
            nextBtn.style.background = "var(--primary-gradient)";
            nextBtn.style.boxShadow = "0 10px 25px -5px rgba(16, 185, 129, 0.35)";
        }
    }
}

function submitApplicationForm() {
    // Hide current form container fields
    const currentActiveStep = document.querySelector(`.main-quiz-step[data-step="${currentQuizStep}"]`);
    if (currentActiveStep) currentActiveStep.classList.remove("active");
    
    document.getElementById("quiz-nav-actions").style.display = "none";
    
    // Show success panel screen slide
    const successPanel = document.getElementById("quiz-success-panel");
    if (successPanel) successPanel.classList.add("active");
    
    // Update progress numbers
    document.getElementById("quiz-main-progress").style.width = "100%";
    document.getElementById("quiz-step-indicator-text").textContent = "Кандидатурата е подадена успешно!";
    document.getElementById("quiz-step-percent-text").textContent = "100% завършено";
    
    // Gather values Object details
    const leadPayload = {
        niche: document.getElementById("input-niche").value,
        avgDealSize: document.getElementById("input-avg-deal").value,
        teamCapacity: document.getElementById("input-capacity").value,
        willingToInvestMetaAds: document.getElementById("input-ad-budget").value,
        companyName: document.getElementById("company-name").value,
        ownerFullName: document.getElementById("owner-name").value,
        phone: document.getElementById("owner-phone").value,
        email: document.getElementById("owner-email").value,
        story: document.getElementById("owner-story").value,
        capturedAt: new Date().toISOString()
    };
    
    // Display simulated CRM ingest logs
    console.log("🔥 [GRAVITAS INGESTION CORE] Dynamic payload received and synchronized to HubSpot CRM Pipeline...");
    console.table(leadPayload);
}

function handleFormSubmit(event) {
    event.preventDefault();
}


/* ==========================================
   FAQ ACCORDION LOGIC
   ========================================== */
function toggleFaq(faqItem) {
    // Verify if it is currently open
    const isOpen = faqItem.classList.contains("open");
    
    // Close other FAQ blocks
    const allFaqs = document.querySelectorAll(".faq-item");
    allFaqs.forEach(item => {
        item.classList.remove("open");
        const answer = item.querySelector(".faq-answer");
        if (answer) {
            answer.style.maxHeight = null;
        }
    });
    
    // Toggle state for current item
    if (!isOpen) {
        faqItem.classList.add("open");
        const answer = faqItem.querySelector(".faq-answer");
        if (answer) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    }
}
