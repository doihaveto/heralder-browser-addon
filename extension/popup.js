const isFirefox = typeof browser !== 'undefined';
const _browser = isFirefox ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        const [tab] = await _browser.tabs.query({active: true, currentWindow: true});
        if (tab?.id) {
            _browser.scripting.executeScript({
                target: {tabId: tab.id},
                func: () => {
                    if (!document.querySelector('.heralder-controls')) {
                        return true; // Indicates script should be injected
                    }
                    activateControls();
                    return false; // Script already injected
                }
            },
            (results) => {
                if (results[0]?.result) {
                    _browser.scripting.executeScript({
                        target: {tabId: tab.id},
                        files: ['content.js']
                    });
                }
            });
        }
    })();

    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const endpointUrlInput = document.getElementById('endpointUrl');

    // Load saved settings
    if (isFirefox) {
        browser.storage.local.get('endpointUrl').then(data => {
            if (data.endpointUrl) {
                endpointUrlInput.value = data.endpointUrl;
            }
        });
    } else {
        chrome.storage.sync.get('endpointUrl', (data) => {
            if (data.endpointUrl) {
                endpointUrlInput.value = data.endpointUrl;
            }
        });
    }

    // Save endpoint URL on change
    endpointUrlInput.addEventListener('input', () => {
        const endpointUrl = endpointUrlInput.value;
        if (isFirefox) {
            browser.storage.local.set({ endpointUrl });
        } else {
            chrome.storage.sync.set({ endpointUrl });
        }
    });

    // Toggle settings panel open/close
    settingsButton.addEventListener('click', () => {
        console.log('a');
        if (settingsPanel.classList.contains('open')) {
            settingsPanel.classList.remove('open');
            document.querySelector('#symbol').innerHTML = '&#x23F7;';
        } else {
            settingsPanel.classList.add('open');
            document.querySelector('#symbol').innerHTML = '&#x23F6;';
        }
    });
});
