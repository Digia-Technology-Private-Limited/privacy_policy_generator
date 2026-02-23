document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const landingView = document.getElementById('landing-view');
    const generatorView = document.getElementById('generator-view');
    const resultView = document.getElementById('result-view');
    const privacyView = document.getElementById('privacy-page-view');
    const termsView = document.getElementById('terms-page-view');
    const gdprView = document.getElementById('gdpr-page-view');
    const loadingOverlay = document.getElementById('loading-overlay');

    const startBtns = document.querySelectorAll('.start-generator-btn');
    const homeLink = document.getElementById('home-link');

    const form = document.getElementById('policy-form');
    const steps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progress-bar');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const generateBtn = document.getElementById('generate-btn');

    const policyResult = document.getElementById('policy-result');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');

    const websiteUrlContainer = document.getElementById('website-url-container');
    const typeRadios = document.querySelectorAll('input[name="type"]');

    // Country Dropdown Elements
    const countryDropdown = document.getElementById('country-dropdown');
    const countryTrigger = document.getElementById('country-trigger');
    const countryMenu = document.getElementById('country-menu');
    const countrySearch = document.getElementById('country-search');
    const countryList = document.getElementById('country-list');
    const countryInput = document.getElementById('country-input');
    const selectedCountryText = document.getElementById('selected-country');

    let currentStep = 0;

    // Navigation
    const showView = (viewId) => {
        [landingView, generatorView, resultView, privacyView, termsView, gdprView].forEach(v => v.style.display = 'none');
        if (viewId === 'landing') landingView.style.display = 'block';
        if (viewId === 'generator') generatorView.style.display = 'block';
        if (viewId === 'result') resultView.style.display = 'block';
        if (viewId === 'privacy') privacyView.style.display = 'block';
        if (viewId === 'terms') termsView.style.display = 'block';
        if (viewId === 'gdpr') gdprView.style.display = 'block';
        window.scrollTo(0, 0);
    };

    startBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showView('generator');
            updateStep();
        });
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('landing');
    });

    // Handle all anchor links (e.g., from footer)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip "Generator" which uses class-based trigger

            e.preventDefault();
            const targetId = href.substring(1);

            // Check if it's one of our new topic views
            const topicViews = ['privacy', 'terms', 'gdpr'];
            if (topicViews.includes(targetId)) {
                showView(targetId);
                return;
            }

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Ensure landing view is visible if we're in generator/result/etc
                if (landingView.style.display === 'none') {
                    showView('landing');
                }

                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Logic
    const updateStep = () => {
        steps.forEach((step, index) => {
            step.style.display = index === currentStep ? 'block' : 'none';
        });

        // Update buttons
        prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';

        if (currentStep === steps.length - 1) {
            nextBtn.style.display = 'none';
            generateBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            generateBtn.style.display = 'none';
        }

        // Update Progress Bar
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
    };

    nextBtn.addEventListener('click', () => {
        if (validateStep()) {
            currentStep++;
            updateStep();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateStep();
    });

    const validateStep = () => {
        const activeStep = steps[currentStep];
        const inputs = activeStep.querySelectorAll('input[required]');
        let valid = true;

        inputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = 'red';
                valid = false;
            } else {
                input.style.borderColor = 'var(--gray-300)';
            }
        });

        return valid;
    };

    // Toggle Website URL field
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'website') {
                websiteUrlContainer.style.display = 'block';
                websiteUrlContainer.querySelector('input').required = true;
            } else {
                websiteUrlContainer.style.display = 'none';
                websiteUrlContainer.querySelector('input').required = false;
            }
        });
    });

    // Policy Generation
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Show loading
        loadingOverlay.style.display = 'flex';

        setTimeout(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Get arrays for checkboxes
            const personalData = formData.getAll('data');
            const thirdParties = formData.getAll('services');

            const policyHtml = generatePrivacyPolicy({
                ...data,
                personalData,
                thirdParties
            });

            policyResult.innerHTML = policyHtml;
            loadingOverlay.style.display = 'none';
            showView('result');
        }, 1500); // Simulate generation
    });

    const generatePrivacyPolicy = (data) => {
        const date = new Date().toLocaleDateString();
        const typeLabel = data.type === 'app' ? 'mobile application' : 'website';
        const target = data.type === 'app' ? data.companyName : (data.websiteUrl || data.companyName);

        let policy = `<h1>Privacy Policy</h1>`;
        policy += `<p><strong>Last Updated:</strong> ${date}</p>`;
        policy += `<p>This Privacy Policy describes how <strong>${data.companyName}</strong> ("we", "us", or "our") collects, uses, and shares your personal information when you use our ${typeLabel} located at ${target} (the "Service").</p>`;

        policy += `<h2>1. Information We Collect</h2>`;
        if (data.personalData.length > 0) {
            policy += `<p>When you interact with our Service, we may collect the following types of personal information:</p>`;
            policy += `<ul>`;
            data.personalData.forEach(item => {
                policy += `<li>${item}</li>`;
            });
            policy += `</ul>`;
        } else {
            policy += `<p>We do not collect any personally identifiable information from our users.</p>`;
        }

        if (data.cookies === 'yes') {
            policy += `<h2>2. Cookies and Tracking Technologies</h2>`;
            policy += `<p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.</p>`;
        }

        policy += `<h2>3. Third-Party Services</h2>`;
        if (data.thirdParties.length > 0) {
            policy += `<p>We use the following third-party services which may collect information used to identify you:</p>`;
            policy += `<ul>`;
            data.thirdParties.forEach(service => {
                policy += `<li>${service}</li>`;
            });
            policy += `</ul>`;
        } else {
            policy += `<p>We do not use any third-party services that collect user data.</p>`;
        }

        if (data.payments === 'yes') {
            policy += `<h2>4. Payment Processing</h2>`;
            policy += `<p>We provide paid products and/or services within the Service. In that case, we use third-party services for payment processing (e.g., payment processors). We will not store or collect your payment card details.</p>`;
        }

        policy += `<h2>5. Contact Us</h2>`;
        policy += `<p>If you have any questions about this Privacy Policy, please contact us at:</p>`;
        policy += `<ul>`;
        policy += `<li><strong>Email:</strong> ${data.email}</li>`;
        policy += `<li><strong>Country:</strong> ${data.country}</li>`;
        policy += `</ul>`;

        policy += `<div style="margin-top: 40px; font-style: italic; color: #666; font-size: 0.9rem;">--- Generated by PolicyForge ---</div>`;

        return policy;
    };

    // Actions
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(policyResult.innerText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.remove('btn-secondary');
            copyBtn.classList.add('btn-primary');
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('btn-primary');
                copyBtn.classList.add('btn-secondary');
            }, 2000);
        });
    });

    downloadBtn.addEventListener('click', () => {
        const text = policyResult.innerText;
        const companyName = new FormData(form).get('companyName') || 'Privacy_Policy';
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${companyName.replace(/\s+/g, '_')}_Privacy_Policy.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    // --- Searchable Country Dropdown Logic ---
    let allCountries = [];

    // Fetch countries
    fetch('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
        .then(res => res.json())
        .then(data => {
            allCountries = data.sort((a, b) => a.name.localeCompare(b.name));
            renderCountries(allCountries);
        })
        .catch(err => console.error('Error fetching countries:', err));

    const renderCountries = (countries) => {
        countryList.innerHTML = '';
        countries.forEach(country => {
            const li = document.createElement('li');
            li.className = 'dropdown-item';
            li.innerHTML = `<span class="flag">${country.emoji}</span> <span class="name">${country.name}</span>`;
            li.addEventListener('click', () => selectCountry(country));
            countryList.appendChild(li);
        });
    };

    const selectCountry = (country) => {
        countryInput.value = country.name;
        selectedCountryText.innerHTML = `<span class="flag">${country.emoji}</span> ${country.name}`;
        closeDropdown();

        // Remove error styling if present
        countryTrigger.style.borderColor = 'var(--gray-300)';
    };

    const closeDropdown = () => {
        countryMenu.style.display = 'none';
        // Reset search state
        countrySearch.value = '';
        renderCountries(allCountries);
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        const isOpen = countryMenu.style.display === 'flex';
        if (isOpen) {
            closeDropdown();
        } else {
            countryMenu.style.display = 'flex';
            countrySearch.focus();
        }
    };

    countryTrigger.addEventListener('click', toggleDropdown);

    countrySearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allCountries.filter(c =>
            c.name.toLowerCase().includes(term)
        );
        renderCountries(filtered);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!countryDropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    // Prevent closing when clicking search
    countrySearch.addEventListener('click', (e) => e.stopPropagation());

    // Update validation for custom dropdown
    const originalValidateStep = validateStep;
    validateStep = () => {
        let valid = originalValidateStep();
        if (currentStep === 0 && !countryInput.value) {
            countryTrigger.style.borderColor = 'red';
            valid = false;
        }
        return valid;
    };
});
