
let ratings = JSON.parse(localStorage.getItem('ratings') || '{}');

document.querySelectorAll('.ort').forEach(ort => {
    const ortId = ort.dataset.ort;
    const starsContainer = ort.querySelector('.stars');
    const ratingText = ort.querySelector('.rating-display');
    let currentRating = ratings[ortId] || 0;

    // Sterne erzeugen
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.dataset.value = i;
        star.classList.add('star');
        starsContainer.appendChild(star);
    }

    // Funktion zum Aktualisieren der Sterne
    function updateStars(rating) {
        starsContainer.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('selected', s.dataset.value <= rating);
        });
        ratingText.textContent = rating ? `Du hast ${rating} Sterne vergeben.` : 'Noch keine Bewertung';
    }

    updateStars(currentRating);

    // Klick auf Sterne
    starsContainer.addEventListener('click', e => {
        if (!e.target.classList.contains('star')) return;
        const rating = parseInt(e.target.dataset.value);
        currentRating = rating;
        ratings[ortId] = rating;
        localStorage.setItem('ratings', JSON.stringify(ratings));
        updateStars(rating);
    });
});
class OrtBewertung {
    constructor(section) {
        this.section = section;
        this.starsContainer = section.querySelector('.stars');
        this.ratingDisplay = section.querySelector('.rating-display');
        this.commentInput = section.querySelector('.comment-input');
        this.commentSubmit = section.querySelector('.comment-submit');
        this.commentList = section.querySelector('.comment-list');
        this.rating = 0;
        this.initStars();
        this.initComments();
    }
};
