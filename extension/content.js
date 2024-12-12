const newStyle = document.createElement('style');
newStyle.textContent = `
    .heralder-title {
        background-color: #ff3d3d26 !important;
    }
    .heralder-author {
        background-color: #1bbe9826 !important;
    }
    .heralder-date {
        background-color: #ffba0026 !important;
    }
    .heralder-subheadline {
        background-color: #a914ff26 !important;
    }
    .heralder-paragraph {
        background-color: #2295fc26 !important;
    }
    .heralder-header {
        background-color: #ff850047 !important;
    }
    body div.heralder-data {
        position: fixed;
        z-index: 999999999;
        right: 20px;
        bottom: 20px;
        font-family: "Times New Roman", Times, serif;
        font-size: 23px;
        font-weight: 100;
        color: #000000bf;
        line-height: 1em;
    }
    .heralder-controls > div, .heralder-submit {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position: relative;
        margin-top: 10px;
        padding: 4px 0px;
        text-align: center;
        cursor: pointer;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }
    .heralder-controls > div:before {
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        z-index: -2;
        content: '';
        height: 100%;
        width: 100%;
        background: white;
    }
    .heralder-controls > div:after {
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        z-index: -1;
        content: '';
        height: 100%;
        width: 30px;
        background: #f5f5f5;
    }
    .heralder-status {
        min-width: 30px;
    }
    .heralder-name {
        width: 100%;
        text-align: center;
        padding: 5px 20px;
    }
    .heralder-long-number {
        font-size: 18px;
    }
    .heralder-active {
        position: absolute;
        width: 15px;
        height: 15px;
        left: -25px;
        background-color: #ff6e6e;
        border-radius: 10px;
    }
    .heralder-submit {
        display: flex;
        justify-content: center;
        position: relative;
        background-color: #ffffff;
        color: #4d4d4c;
        border: 1px solid #9f9f9f;
        border-radius: 20px;
    }
    .heralder-submit span {
        font-weight: bold;
        margin-left: 5px;
    }
    .heralder-submit-error {
        display: none;
        position: absolute;
        right: 220px;
        background: #d600008f;
        color: #ffffff;
        font-size: 20px;
        padding: 0 5px;
        border-radius: 15px;
        text-wrap: nowrap;
    }
`;

document.head.appendChild(newStyle);

function findClosestCommonAncestor(elements) {
    if (!elements.length) return null;

    // Helper function to get all ancestors of a node
    function getAncestors(element) {
        const ancestors = [];
        while (element) {
            ancestors.push(element);
            element = element.parentElement;
        }
        return ancestors;
    }

    // Get all ancestors for the first element
    let commonAncestors = getAncestors(elements[0]);

    // Intersect ancestors list with each element's ancestor list
    for (let i = 1; i < elements.length; i++) {
        const elementAncestors = new Set(getAncestors(elements[i]));
        commonAncestors = commonAncestors.filter(ancestor => elementAncestors.has(ancestor));
    }

    // Return the closest common ancestor (the first in the filtered list)
    return commonAncestors.length ? commonAncestors[0] : null;
}

function getMostCommonProperties(elements, n) {
    const Properties = new Map();

    elements.forEach(element => {
        // Get computed styles for each element
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        const fontSize = computedStyle.fontSize;

        // Create a key for the tag name, font-family, and font-size pair
        const key = `${element.tagName}|${fontFamily}|${fontSize}`;

        // Increment the count for this style combination
        Properties.set(key, (Properties.get(key) || 0) + 1);
    });

    // Convert the map to an array of [key, count] pairs, sorted by count in descending order
    const sortedProperties = Array.from(Properties.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count (the second item in each pair)
        .slice(0, n); // Get the top n items

    // Map the sorted entries to an array of objects with detailed properties
    return sortedProperties.map(([key, count]) => {
        const [tagName, fontFamily, fontSize] = key.split('|');
        return { tagName, fontFamily, fontSize, count };
    });
}

function findTitle() {
    const possibleTitles = [];
    possibleTitles.push(document.querySelector('title').textContent);
    document.querySelectorAll('meta[property$="title"], meta[name="title"], old-meta[property$="title"], old-meta[name="title"]').forEach(meta => {
        const title = meta.getAttribute('content');
        if (!possibleTitles.includes(title))
            possibleTitles.push(title);
    });
    for (const title of possibleTitles) {
        const titles = [... document.querySelectorAll('h1, h2, h3')].filter(x => title.includes(x.textContent) && x.offsetParent !== null);
        if (titles.length) {
            titles[0].classList.add('heralder-title');
            return;
        }
    }
}

function findAuthor() {
    const meta = document.querySelector('meta[property$="author"], meta[name="author"], old-meta[property$="author"], old-meta[name="author"]');
    if (meta) {
        const author = meta.getAttribute('content');
        if (author && author.length) {
            const elements = [... document.querySelectorAll('body *')].filter(x => {
                return x.childElementCount === 0 && x.offsetParent !== null && x.textContent === author;
            });
            if (elements.length)
                elements[0].classList.add('heralder-author');
        }
    }
}

function findParagraphs() {
    const longestElements = [... document.querySelectorAll('body *')].filter(x => {
        return (x.childElementCount === 0 && x.offsetParent !== null && x.textContent.length > 200 && !(x.tagName.slice(0, 1) == 'H' && x.tagName.length == 2));
    }).sort((a, b) => {
        if (a.textContent.length > b.textContent.length)
            return -1;
        else if (a.textContent.length < b.textContent.length)
            return 1;
        else
            return 0;
    });

    const paragraphsParent = findClosestCommonAncestor(longestElements.slice(0, 4));

    const paragraphProperties = getMostCommonProperties(longestElements.slice(0, 50)).slice(0, 2);
    const paragraphTags = paragraphProperties.map(x => x.tagName);
    const paragraphXPositions = longestElements.map(x => x.getBoundingClientRect().x);
    if (paragraphsParent) {
        [... paragraphsParent.querySelectorAll(paragraphTags.join(', ') + ', h1, h2, h3, h4, h5')].filter(x => x.offsetParent !== null && x.offsetWidth !== 0 && x.offsetHeight !== 0 && x.textContent.trim().length && !x.classList.value.includes('heralder')).forEach(child => {
            if (paragraphTags.includes(child.tagName) && !child.closest('.heralder-paragraph') && paragraphXPositions.includes(child.getBoundingClientRect().x)) {
                const style = window.getComputedStyle(child);
                const fontFamily = style.getPropertyValue('font-family');
                const fontSize = style.getPropertyValue('font-size');
                if (paragraphProperties.filter(p => p.tagName == child.tagName && p.fontFamily == fontFamily && p.fontSize == fontSize).length) {
                    child.classList.add('heralder-paragraph');
                }
            } else if (child.tagName.substr(0, 1) == 'H' && child.tagName.length == 2 && !isNaN(Number(child.tagName.substr(1, child.tagName.length))) && child.textContent.length > 3) {
                child.classList.add('heralder-header');
            }
        });
    }
}

function findSubheadline() {
    const possibleSubheads = [];
    document.querySelectorAll('meta[property$="description"], meta[name="description"], old-meta[property$="description"], old-meta[name="description"]').forEach(meta => {
        const subhead = meta.getAttribute('content');
        if (!possibleSubheads.includes(subhead))
            possibleSubheads.push(subhead);
    });
    for (const subhead of possibleSubheads) {
        const elements = [... document.querySelectorAll('body *')].filter(x => {
            return (
                x.childElementCount === 0 &&
                x.offsetParent !== null &&
                !x.classList.toString().includes('heralder') &&
                x.textContent.length >= subhead.length && subhead.includes(x.textContent)
            );
        });
        if (elements.length) {
            elements[0].classList.add('heralder-subheadline');
            return;
        }
    }
    // Try another way
    const startEl = document.querySelector('.heralder-title');
    const endEl = document.querySelector('.heralder-paragraph');
    if (startEl && endEl) {
        // Look for elements between the title and the first paragraph
        const allElements = [... document.querySelectorAll('body *')].filter(x => x.offsetParent !== null && x.textContent.length);
        const elements = allElements.slice(allElements.indexOf(startEl) + 1, allElements.indexOf(endEl) - 1).filter(x => x.childElementCount === 0 &&  x.textContent.length >= 40);
        if (elements.length) {
            elements[0].classList.add('heralder-subheadline');
        }
    }
}

function parseDate(s) {
    if (!s)
        return;
    const monthMap = {
        January: '01', Jan: '01',
        February: '02', Feb: '02',
        March: '03', Mar: '03',
        April: '04', Apr: '04',
        May: '05',
        June: '06', Jun: '06',
        July: '07', Jul: '07',
        August: '08', Aug: '08',
        September: '09', Sep: '09',
        October: '10', Oct: '10',
        November: '11', Nov: '11',
        December: '12', Dec: '12'
    };
    const datePatterns = [
        { 
            regex: /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/, 
            order: ['day', 'month', 'year'] 
        },
        { 
            regex: /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/, 
            order: ['month', 'day', 'year'] 
        }
    ];
    for (const {regex, order} of datePatterns) {
        const match = s.match(regex);
        if (match) {
            const dateParts = {};
            order.forEach((part, index) => {
                dateParts[part] = match[index + 1];
            });

            const monthNum = monthMap[dateParts.month];
            const day = dateParts.day.padStart(2, "0");
            const year = dateParts.year;

            // Format date as yyyy-mm-dd
            return `${year}-${monthNum}-${day}`;
        }
    }
}

function findPublishedDate() {
    const elements = [... document.querySelectorAll('body *')].filter(x => {
        return (
            x.childElementCount === 0 &&
            x.offsetParent !== null &&
            !x.classList.toString().includes('heralder')
        );
    });
    for (const element of elements) {
        const date = parseDate(element.textContent);
        if (date) {
            element.classList.add('heralder-date');
            return;
        }
    }
}

let dataContainer;
let activeSelection;
let hoverEnabled = false;
let selectedElements = new Set(); // Keep track of selected elements

function enableHoverSelection(selectionType) {
    if (hoverEnabled)
        disableHoverSelection();
    hoverEnabled = true;

    const heralderClass = `heralder-${selectionType}`;

    // Event listeners to add hover and click behavior
    const onMouseOver = (e) => {
        if (e.target == dataContainer || dataContainer.contains(e.target))
            return; // Ignore the extension buttons
        if (e.target.classList.toString().includes('heralder') || !e.target.textContent.length)
            return; // Ignore already selected elements, or empty elements
        e.target.classList.add(heralderClass, 'heralder-hover');
    };

    const onMouseOut = (e) => {
        if (e.target == dataContainer || dataContainer.contains(e.target))
            return; // Ignore the extension buttons
        if (e.target.classList.contains('heralder-hover')) {
            e.target.classList.remove(heralderClass, 'heralder-hover'); // Remove hover color if not selected
        }
    };

    const onClick = (e) => {
        if (e.target == dataContainer || dataContainer.contains(e.target))
            return; // Ignore the extension buttons
        if (e.target.classList.contains('heralder-hover')) {
            e.target.classList.remove('heralder-hover'); // Ensure the selection remains after click
            if (selectionType != 'paragraph' && selectionType != 'header') {
                document.querySelectorAll('.' + heralderClass).forEach(el => {
                    if (el !== e.target && !dataContainer.contains(el))
                        el.classList.remove(heralderClass);
                });
            }
            displayControls();
        } else if (e.target.classList.toString().includes('heralder')) {
            // Remove selection from an already selected element
            e.target.classList.forEach(x => {
                if (x.substr(0, 9) == 'heralder-') {
                    e.target.classList.remove(x);
                }
            });
            displayControls();
        }
        e.stopPropagation(); // Stop click from affecting other elements
        e.preventDefault();
    };

    // Attach event listeners to the document
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick);

    // Store the functions to allow removal later
    enableHoverSelection.onMouseOver = onMouseOver;
    enableHoverSelection.onMouseOut = onMouseOut;
    enableHoverSelection.onClick = onClick;
}

function disableHoverSelection() {
    if (!hoverEnabled)
        return;
    hoverEnabled = false;

    // Remove event listeners from the document
    document.removeEventListener('mouseover', enableHoverSelection.onMouseOver);
    document.removeEventListener('mouseout', enableHoverSelection.onMouseOut);
    document.removeEventListener('click', enableHoverSelection.onClick);
}

function activateSelection(selectionType) {
    let activeEl = document.querySelector('.heralder-data .heralder-active');
    if (activeEl)
        activeEl.remove();
    if (selectionType === activeSelection) {
        activeSelection = null;
        disableHoverSelection();
        return;
    }
    activeSelection = selectionType;
    activeEl = document.createElement('div');
    activeEl.classList.add('heralder-active');
    document.querySelector(`.heralder-data .heralder-${selectionType}`).appendChild(activeEl);
    enableHoverSelection(selectionType);
}

function getSelected(selector) {
    return [... document.querySelectorAll(selector)].filter(x => !x.classList.contains('heralder-hover') && !dataContainer.contains(x));
}

function displayControls() {
    const statusMissing = '&ndash;'
    const statusOK = '&#10003;';
    const classNames = ['title', 'subheadline', 'author', 'date', 'paragraph', 'header'];
    if (!dataContainer) {
        dataContainer = document.createElement('div');
        dataContainer.classList.add('heralder-data');
        dataContainer.innerHTML = `
        <div class="heralder-controls">
            <div class="heralder-title" data-type="title"><div class="heralder-status"></div><div class="heralder-name">Title</div></div>
            <div class="heralder-subheadline" data-type="subheadline"><div class="heralder-status"></div><div class="heralder-name">Subheadline</div></div>
            <div class="heralder-author" data-type="author"><div class="heralder-status"></div><div class="heralder-name">Author</div></div>
            <div class="heralder-date" data-type="date"><div class="heralder-status"></div><div class="heralder-name">Published date</div></div>
            <div class="heralder-paragraph" data-type="paragraph"><div class="heralder-status heralder-number"></div><div class="heralder-name">Paragraphs</div></div>
            <div class="heralder-header" data-type="header"><div class="heralder-status heralder-number"></div><div class="heralder-name">Headers</div></div>
        </div>
        <div class="heralder-submit">Submit<span>&rarr;</span><div class="heralder-submit-error"></div></div>
        `;
        document.body.appendChild(dataContainer);
        document.querySelectorAll('.heralder-controls > div').forEach(child => {
            child.addEventListener('click', () => activateSelection(child.getAttribute('data-type')));
        });
        document.querySelector('.heralder-submit').addEventListener('click', submitPage);
    }
    for (const name of classNames) {
        const numElements = getSelected(`.heralder-${name}`).length;
        const statusEl = dataContainer.querySelector(`.heralder-${name} .heralder-status`);
        if (numElements) {
            if (name == 'paragraph' || name == 'header') {
                statusEl.textContent = numElements;
                if (numElements >= 100)
                    statusEl.classList.add('heralder-long-number');
                else
                    statusEl.classList.remove('heralder-long-number');
            } else {
                statusEl.innerHTML = statusOK;
            }
        } else {
            statusEl.innerHTML = statusMissing;
        }
    }
}

function submitFormInNewTab(url, formData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    const isFirefox = typeof browser !== 'undefined';
    if (!isFirefox)
        form.target = '_blank';

    Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

async function storageGet(keys, callback) {
    const isFirefox = typeof browser !== 'undefined';
    if (isFirefox) {
        const result = await browser.storage.local.get(keys);
        callback(result);        
    }
    return chrome.storage.sync.get(keys, callback);
}

function submitPage() {
    const errorEl = document.querySelector('.heralder-submit-error');
    errorEl.style.display = '';
    storageGet(['endpointUrl'], (storageData) => {
        const endpointUrl = storageData.endpointUrl;
        if (!endpointUrl) {
            errorEl.textContent = 'Please enter the Heralder URL in the settings';
            errorEl.style.display = 'block';
            return;
        }
        const data = {
            url: window.location.href,
            title: '',
            subheadline: '',
            author: '',
            publishedDate: null,
            content: null,
        }
        const title = getSelected(`.heralder-title`);
        if (title.length)
            data.title = title[0].textContent;
        const subheadline = getSelected(`.heralder-subheadline`);
        if (subheadline.length)
            data.subheadline = subheadline[0].textContent;
        const author = getSelected(`.heralder-author`);
        if (author.length)
            data.author = author[0].textContent;
        const publishedDate = getSelected(`.heralder-date`);
        if (publishedDate.length)
            data.publishedDate = parseDate(publishedDate[0].textContent);
        data.content = getSelected(`.heralder-paragraph, .heralder-header`).map(x => {
            if (x.classList.contains('heralder-header'))
                return `# ${x.textContent}`;
            return x.textContent;
        }).join('\n');
        let url = endpointUrl;
        if (url.substr(url.length - 1, 1) !== '/')
            url += '/';
        url += 'api/ext/submit';
        submitFormInNewTab(url, data);
    });
}

function activateControls() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
    });

    setTimeout(() => {
        findTitle();
        findAuthor();
        findSubheadline();
        findParagraphs();
        findPublishedDate();
        displayControls();
    }, 10);
}

activateControls();
