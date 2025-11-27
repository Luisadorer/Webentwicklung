// NAME HANDLING
function getUserName() {
    return localStorage.getItem("username") || "";
}

function requireUserName(callback) {
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


// Kommentarfunktion
function loadComments(ort) { // Kommentare laden
    return JSON.parse(localStorage.getItem("comments_" + ort) || "[]"); //keine Kommentare ->leeres Array
}

function saveComments(ort, comments) { // Kommentare speichern
    localStorage.setItem("comments_" + ort, JSON.stringify(comments));
}

document.querySelectorAll('.ort').forEach(section => { // Für jeden Ort
    const ort = section.dataset.ort; // Ort-ID holen
    const input = section.querySelector('.comment-input'); // Eingabefeld
    const button = section.querySelector('.comment-submit');// Senden-Button
    const list = section.querySelector('.comment-list');// Kommentar-Liste

    let comments = loadComments(ort); // Kommentare laden

    // Anzeige vorhandener Kommentare
    comments.forEach(c => createCommentBox(c));

    function createCommentBox(c) { // Kommentar-Box erstellen
        const box = document.createElement('div');
        box.classList.add('comment-box'); // Klasse hinzufügen
        box.innerHTML = `<strong>${c.user}</strong> (${c.date}):<br>${c.text}`; // Kommentarinhalt

        // Löschen
        const delBtn = document.createElement('button'); // Löschen-Button
        delBtn.textContent = 'x';
        delBtn.classList.add('delete-comment'); // Klasse hinzufügen

        delBtn.addEventListener('click', () => { // Klick auf Löschen
            box.remove();
            comments = comments.filter(comment => comment !== c); // Kommentar aus Array entfernen
            saveComments(ort, comments); // Kommentare speichern
        });

        box.appendChild(delBtn); // Button zur Box hinzufügen
        list.appendChild(box);// Box zur Liste hinzufügen
    }

    // Kommentar absenden
    button.addEventListener('click', () => { // Klick auf Senden

        requireUserName((name) => { //erst ausführen wenn Name vorhanden
            const text = input.value.trim(); // Eingabetext holen und trimmen
            if (!text) return; // nichts tun, wenn Text leer ist

            const now = new Date(); // aktuelles Datum
            const dateString = now.toLocaleDateString("de-DE") + " "; // Datum formatieren

            const commentObj = { // Kommentarobjekt erstellen
                user: name,
                text: text,
                date: dateString
            };

            comments.push(commentObj); // Kommentar zum Array hinzufügen
            saveComments(ort, comments);

            createCommentBox(commentObj); // Kommentar-Box erstellen
            input.value = '';
        });

    });

    // Wishlist laden
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]"); // Wishlist aus localStorage

    document.querySelectorAll('.ort').forEach(section => { // Für jeden Ort
        const ortId = section.dataset.ort;

        // Herz-Button erstellen
        const heart = document.createElement('span'); // Herz-Element
        heart.classList.add('wishlist-heart');
        heart.innerHTML = '♥'; // Herzsymbol
        if (wishlist.includes(ortId)) heart.classList.add('active'); // falls in Wishlist, aktivieren
        section.appendChild(heart);

        // Klick auf Herz
        heart.addEventListener('click', () => {
            if (wishlist.includes(ortId)) {
                // Entfernen
                wishlist = wishlist.filter(id => id !== ortId);
                heart.classList.remove('active');
            } else {
                // Hinzufügen
                wishlist.push(ortId);
                heart.classList.add('active');
            }
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        });
    });

    // Enter-Taste
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            button.click();
        }
    });
});

