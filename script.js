document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Function to set the theme (light or dark)
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<span class="icon">☀️</span>'; // Sun icon for light theme
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        } else {
            body.classList.remove('light-theme');
            themeToggle.innerHTML = '<span class="icon">🌙</span>'; // Moon icon for dark theme
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        }
        localStorage.setItem('theme', theme); // Save theme preference to local storage
    }

    // Check for saved theme preference or system preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        // If no saved preference, use system preference if it's light
        setTheme('light');
    } else {
        setTheme('dark'); // Default to dark theme
    }

    // Add event listener to the theme toggle button
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });

    // --- Logic for displaying publications ---

    // Configuration for the publications dashboard on the homepage
    const config = {
        numberOfLatestPublications: 2 // Easily change this number to display more or fewer latest publications
    };

    // Function to create the HTML element for a single publication
    // `isDashboard` parameter controls whether to show full details (publications page) or simplified ones (dashboard)
    function createPublicationElement(pub, isDashboard = false) {
        const publicationElement = document.createElement('div');
        publicationElement.classList.add('publication-item'); // Base CSS class for styling

        // Check if image exists, otherwise use a placeholder
        const imageSrc = pub.image ? pub.image : 'images/placeholder_cover.jpg'; // Ensure you have a placeholder image

        // Construct the journal and year info string using 'pub.journal' and 'pub.year'
        // This ensures compatibility with your publicationsData.js structure
        const journalAndYearInfo = pub.journal && pub.year ?
                                   `<p class="pub-journal-info">${pub.journal} <span>(${pub.year})</span></p>` :
                                   (pub.journal ? `<p class="pub-journal-info">${pub.journal}</p>` :
                                   (pub.year ? `<p class="pub-journal-info"><span>(${pub.year})</span></p>` : ''));

        publicationElement.innerHTML = `
            <div class="pub-image-wrapper">
                <img src="${imageSrc}" alt="Cover of ${pub.title}">
            </div>
            <div class="pub-details">
                <span class="pub-type-label">${pub.type}</span>
                <h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>
                <p class="pub-authors">${pub.authors}</p>
                ${journalAndYearInfo} ${!isDashboard ? `
                    <button class="toggle-abstract-btn">Show Abstract</button>
                    <div class="pub-abstract-content">
                        <p class="pub-abstract">${pub.abstract}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // Add event listener for the abstract toggle button (only if not dashboard)
        if (!isDashboard) {
            const toggleButton = publicationElement.querySelector('.toggle-abstract-btn');
            const abstractContent = publicationElement.querySelector('.pub-abstract-content');

            if (toggleButton && abstractContent) {
                toggleButton.addEventListener('click', () => {
                    abstractContent.classList.toggle('show-abstract');
                    if (abstractContent.classList.contains('show-abstract')) {
                        toggleButton.textContent = 'Hide Abstract';
                        // Set max-height to scrollHeight for smooth transition when showing
                        abstractContent.style.maxHeight = abstractContent.scrollHeight + 'px';
                    } else {
                        toggleButton.textContent = 'Show Abstract';
                        // Set max-height to 0 for smooth transition when hiding
                        abstractContent.style.maxHeight = '0';
                    }
                });
            }
        }

        return publicationElement;
    }

    // Populate the Publications page (publications.html)
    const journalArticlesContainer = document.getElementById('journal-articles-container');
    const workingPapersContainer = document.getElementById('working-papers-container');

    // Check if the 'publications' array is defined (from publicationsData.js)
    if (typeof publications !== 'undefined') {
        // Sort publications by year (most recent first), then by ID for stable order if years are equal
        const sortedPublications = [...publications].sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));

        if (journalArticlesContainer) {
            // Filter by 'type' property as defined in publicationsData.js (e.g., "Journal Article")
            const journalArticles = sortedPublications.filter(pub => pub.type === 'Journal Article');
            journalArticles.forEach(pub => {
                journalArticlesContainer.appendChild(createPublicationElement(pub, false)); // Not a dashboard item, show full details
            });
        }

        if (workingPapersContainer) {
            // Filter by 'type' property as defined in publicationsData.js (e.g., "Working Paper")
            const workingPapers = sortedPublications.filter(pub => pub.type === 'Working Paper');
            workingPapers.forEach(pub => {
                workingPapersContainer.appendChild(createPublicationElement(pub, false)); // Not a dashboard item
            });
        }
    } else {
        console.warn("Publications data is not defined. Make sure publicationsData.js is loaded correctly.");
    }

    // Populate the Latest Publications section on the homepage (index.html)
    const latestPublicationsDashboard = document.getElementById('latest-publications-dashboard');
    if (latestPublicationsDashboard && typeof publications !== 'undefined') {
        // Sort publications for the dashboard (most recent first)
        const sortedPublicationsForDashboard = [...publications].sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));

        // Slice the array to get only the desired number of latest items
        const latestItems = sortedPublicationsForDashboard.slice(0, config.numberOfLatestPublications);

        latestItems.forEach(pub => {
            // Pass true for isDashboard to use simplified rendering (no abstract toggle on homepage)
            latestPublicationsDashboard.appendChild(createPublicationElement(pub, true));
        });
    }
});