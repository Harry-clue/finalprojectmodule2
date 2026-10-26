const wordInput = document.getElementById('wordInput');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');

searchButton.addEventListener('click', () => {
    const query = wordInput.value.trim();
    if (query) {
        fetchDefinition(query);
    }
});

async function fetchDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            throw new Error('Word not found');
        }
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        resultsDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
    }
}   

function displayResults(data) {
    const entry = data[0];
    resultsDiv.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold mb-2';
    title.textContent = entry.word;
    resultsDiv.appendChild(title);

    const phonetic = entry.phonetic || entry.phonetics.find(p => p.text)?.text;
    if (phonetic) {
        const phoneticElement = document.createElement('p');
        phoneticElement.textContent = phonetic;
        resultsDiv.appendChild(phoneticElement);
    }

    let audioUrl = entry.phonetics?.find(p => p.audio)?.audio;
    if (audioUrl) {
        if (audioUrl.startsWith('//')) audioUrl = 'https:' + audioUrl;

        const audio = new Audio(audioUrl);
        const btn = document.createElement('button');  
        btn.textContent = '▶ Play';

        btn.addEventListener('click', async () => {
            try {
                if (audio.paused) {
                    audio.currentTime = 0;
                    await audio.play();
                } else {
                    audio.pause();
                }
            } catch (err) {
                console.error('Playback failed:', err);
                btn.textContent = 'Audio unavailable';
                btn.disabled = true;
            }
        });

        audio.addEventListener('play', () => (btn.textContent = '⏸ Pause'));
        audio.addEventListener('pause', () => (btn.textContent = '▶ Play'));
        audio.addEventListener('ended', () => (btn.textContent = '▶ Play'));

        resultsDiv.appendChild(btn);
    }

    entry.meanings.forEach(meaning => {
        const h3 = document.createElement('h3');
        h3.className = 'text-xl font-semibold mt-4';
        h3.textContent = meaning.partOfSpeech;
        resultsDiv.appendChild(h3);

        const ul = document.createElement('ul');
        ul.className = 'list-disc pl-5 space-y-1';
        meaning.definitions.forEach(def => {
            const li = document.createElement('li');
            li.textContent = def.definition;
            ul.appendChild(li);
        });
        resultsDiv.appendChild(ul);
    });
}

