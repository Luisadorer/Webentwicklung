// NAME HANDLING
function getUserName() {
    return localStorage.getItem("username") || ""; //gespeicherten Namen holen
}

function requireUserName(callback) { // Callback-Funktion, die den Namen erhält
    let name = getUserName();

    if (name) {
        callback(name); //wenn kein Name hinterlegt ist, Popup 
        return;
    }

    // Popup öffnen
    const modal = document.getElementById("nameModal");
    const input = document.getElementById("modalNameInput");
    modal.style.display = "flex";
    input.value = "";

    const saveBtn = document.getElementById("modalNameSave"); // Dom-Elemnt zum speichern

    saveBtn.onclick = () => {
        const enteredName = input.value.trim(); //Eingabe holen und trimmen
        if (!enteredName) return; // nichts tun, wenn kein Name eingegeben wurde

        localStorage.setItem("username", enteredName); // Name speichern
        modal.style.display = "none";

        callback(enteredName);
    };
}


// STERNEBEWERTUNG
let ratings = JSON.parse(localStorage.getItem('ratings') || '{}'); // Bewertungen laden

document.querySelectorAll('.ort').forEach(ort => { // Für jeden Ort
    const ortId = ort.dataset.ort; // Ort-ID holen
    const starsContainer = ort.querySelector('.stars');
    const ratingText = ort.querySelector('.rating-display');// Anzeige-Element für Bewertung
    let currentRating = ratings[ortId] || 0;// Aktuelle Bewertung holen

    // Sterne bauen
    for (let i = 1; i <= 5; i++) { //for schleife für 5 Sterne
        const star = document.createElement('span');
        star.textContent = '★';
        star.dataset.value = i;
        star.classList.add('star');
        starsContainer.appendChild(star); // Stern zum Container hinzufügen
    }

    function updateStars(rating) { // Sterne aktualisieren
        starsContainer.querySelectorAll('.star').forEach(s => { // Alle Sterne durchgehen
            s.classList.toggle('selected', s.dataset.value <= rating); // ausgewählte Sterne markieren
        });
        ratingText.textContent = rating ? `Du hast ${rating} Sterne vergeben.` : 'Noch keine Bewertung'; // Bewertungstext aktualisieren
    }

    updateStars(currentRating);

    // Klick auf Stern
    starsContainer.addEventListener('click', e => { // Event-objekt für klick auf sterne
        if (!e.target.classList.contains('star')) return; // Nur reagieren, wenn ein Stern geklickt wurde

        requireUserName(() => { //erst ausführen wenn Name vorhanden
            const rating = parseInt(e.target.dataset.value); //liest wert
            currentRating = rating;
            ratings[ortId] = rating;
            localStorage.setItem('ratings', JSON.stringify(ratings)); // Bewertungen speichern
            updateStars(rating);
        });
    });
});

async function requestJsonWithGET(url) {
    const response = await fetch(url);
    console.log('Response:', response);
    const jsonData = await response.json();
    return jsonData;
}

// Kommentarfunktion
async function loadComments(ort) {
    const data = await requestJsonWithGET(
        'http://localhost:3000/?ort=' + ort //holt kommentare vom Server und wird als JSON zurückgegeben
    );
    return data;
}

function saveComments(ort, comments) { // Kommentare im Browser speichern
    localStorage.setItem("comments_" + ort, JSON.stringify(comments));
}

async function sendJsonWithPOST(url, jsonData) { //sendet Kommentar an Speicher und Server speichert ihn in MongoDB
    const response = await fetch(url, { //fetch=HTTP-Anfrage
        method: 'post',
        headers: { //JSON-Daten werden gesendet
            'Content-Type': 'application/json'
        },
        body: jsonData

    });
}
//Löschen-Funktion aus MongoDB über ID
async function sendDeleteRequest(id) {
    await fetch('http://localhost:3000/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });
}

async function initializeComments() { //Hauptfunktion für Kommentare 

    const ortellemente = document.querySelectorAll('.ort'); // Alle Orte holen
    for (const section of ortellemente) {// Für jeden Ort
        const ort = section.dataset.ort; // Ort-ID holen
        const input = section.querySelector('.comment-input'); // Eingabefeld
        const button = section.querySelector('.comment-submit');// Senden-Button
        const list = section.querySelector('.comment-list');// Kommentar-Liste

        let comments = await loadComments(ort); // Anfrage an Server, MongoDB-Abfrage, Kommentare kommen zurück, comments ist Array 

        // Anzeige vorhandener Kommentare
        comments.forEach(c => createCommentBox(c)); // Für jeden Kommentar Box erstellen

        function createCommentBox(c) { // Kommentar-Box erstellen
            const box = document.createElement('div');
            box.classList.add('comment-box'); // Klasse hinzufügen
            box.innerHTML = `<strong>${c.user}</strong> (${c.date}):<br>${c.text}`; // Kommentarinhalt

            // Löschen
            const delBtn = document.createElement('button'); // Löschen-Button
            delBtn.textContent = 'x';
            delBtn.classList.add('delete-comment'); // Klasse hinzufügen

            delBtn.addEventListener('click', async () => {

                // Kommentar im Browser sofort entfernen
                box.remove();

                // Kommentar aus MongoDB löschen
                await sendDeleteRequest(c._id);

                // Kommentare neu vom Server laden (sauberer Zustand)
                comments = await loadComments(ort);

                // Liste neu anzeigen
                list.innerHTML = '';
                comments.forEach(c => createCommentBox(c));
            });


            box.appendChild(delBtn);
            list.appendChild(box);
        }

        // Kommentar absenden
        button.addEventListener('click', () => {

            requireUserName(async (name) => {
                const text = input.value.trim();
                if (!text) return;

                const now = new Date();
                const dateString = now.toLocaleDateString("de-DE") + " ";

                const commentObj = {
                    user: name,
                    text: text,
                    date: dateString,
                    ort: ort
                };

                const jsonData = JSON.stringify(commentObj);
                await sendJsonWithPOST('http://localhost:3000/', jsonData); //MongoDB speichert

                list.innerHTML = '';
                comments = await loadComments(ort); //immer aktuelle Kommentare laden
                comments.forEach(c => createCommentBox(c));

                input.value = '';

            });
        });

        // Wishlist
        let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

        document.querySelectorAll('.ort').forEach(section => {
            const ortId = section.dataset.ort;

            const heart = document.createElement('span');
            heart.classList.add('wishlist-heart');
            heart.innerHTML = '♥';
            if (wishlist.includes(ortId)) heart.classList.add('active');
            section.appendChild(heart);

            heart.addEventListener('click', () => {
                if (wishlist.includes(ortId)) {
                    wishlist = wishlist.filter(id => id !== ortId);
                    heart.classList.remove('active');
                } else {
                    wishlist.push(ortId);
                    heart.classList.add('active');
                }
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
            });
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                button.click();
            }
        });
    }
}
initializeComments();
