const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const form = document.querySelector('.booking-form, .contact-form');
const statusNode = document.querySelector('.form-note');
const year = document.getElementById('year');
const loader = document.getElementById('loading-screen');
const loaderStart = Date.now();

window.addEventListener('load', () => {
  if (!loader) {
    document.body.classList.remove('is-loading');
    return;
  }

  const minimumVisibleMs = 1700;
  const elapsed = Date.now() - loaderStart;
  const wait = Math.max(0, minimumVisibleMs - elapsed);

  window.setTimeout(() => {
    loader.classList.add('is-hidden');
    window.setTimeout(() => {
      document.body.classList.remove('is-loading');
    }, 500);
  }, wait);
});

if (year) {
  year.textContent = new Date().getFullYear();
}

// Active nav state highlighting
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const linkPage = href.split('/').pop() || 'index.html';
    
    if (linkPage === currentPage || (currentPage === '' && href.includes('index.html')) || (currentPage === 'index.html' && href.includes('index.html'))) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

highlightActiveNav();

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (form && statusNode) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      statusNode.textContent = 'Please complete the required fields before submitting.';
      statusNode.style.color = '#e27d4a';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    statusNode.textContent = '';

    try {
      // Replace with your Formspree endpoint: https://formspree.io/f/{YOUR_FORM_ID}
      // Sign up at formspree.io and create a form to get your endpoint
      const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
      
      const formData = new FormData(form);
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const successMessage = form.dataset.successMessage
          || 'Thanks! Your message has been received. We will contact you shortly.';
        statusNode.textContent = successMessage;
        statusNode.style.color = '#0f766e';
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      statusNode.textContent = 'There was an error sending your message. Please try again or call us directly.';
      statusNode.style.color = '#e27d4a';
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      console.error('Form submission error:', error);
    }
  });
}

const watchButton = document.querySelector('.watch-pill');
if (watchButton) {
  watchButton.addEventListener('click', () => {
    window.open('https://youtu.be/q0mbKsKG-ng?si=Dlyl3uIefwdaWg59', '_blank');
  });
}

const reviewTrigger = document.querySelector('[data-open-review]');
const reviewModal = document.getElementById('review-modal');
const reviewModalClose = reviewModal ? reviewModal.querySelector('.review-modal-close') : null;
const reviewForm = reviewModal ? reviewModal.querySelector('.review-modal-form') : null;
const reviewStarButtons = reviewModal ? Array.from(reviewModal.querySelectorAll('.review-star')) : [];

if (reviewTrigger && reviewModal) {
  let currentRating = 5;

  const setRating = (rating) => {
    currentRating = rating;
    reviewStarButtons.forEach((starButton, index) => {
      starButton.classList.toggle('is-active', index < rating);
    });
  };

  const openReviewModal = () => {
    reviewModal.classList.add('is-open');
    reviewModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
    const firstInput = reviewModal.querySelector('input');
    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 180);
    }
  };

  const closeReviewModal = () => {
    reviewModal.classList.remove('is-open');
    reviewModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
  };

  reviewTrigger.addEventListener('click', openReviewModal);

  if (reviewModalClose) {
    reviewModalClose.addEventListener('click', closeReviewModal);
  }

  reviewModal.addEventListener('click', (event) => {
    if (event.target === reviewModal) {
      closeReviewModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && reviewModal.classList.contains('is-open')) {
      closeReviewModal();
    }
  });

  reviewStarButtons.forEach((starButton) => {
    starButton.addEventListener('click', () => {
      const rating = Number(starButton.dataset.star);
      if (!Number.isNaN(rating)) {
        setRating(rating);
      }
    });
  });

  const loadSavedReviews = () => {
    const saved = JSON.parse(localStorage.getItem('shantha_tours_reviews') || '[]');
    const reviewStrip = document.querySelector('.review-strip');
    if (!reviewStrip) return;
    
    [...saved].reverse().forEach((review) => {
      const newReviewCard = document.createElement('article');
      newReviewCard.className = 'review-card';
      const initial = review.name.charAt(0).toUpperCase();
      const stars = '★'.repeat(review.rating);
      newReviewCard.innerHTML = `
        <div class="review-head">
          <span class="review-avatar">${initial}</span>
          <div>
            <h3>${review.name}</h3>
            <p>${review.country} • ${review.date}</p>
          </div>
        </div>
        <p class="review-stars">${stars}</p>
        <p class="review-copy">${review.text}</p>
      `;
      reviewStrip.insertBefore(newReviewCard, reviewStrip.firstChild);
    });
    
    const allCards = reviewStrip.querySelectorAll('.review-card');
    if (allCards.length > 3) {
      for (let i = 3; i < allCards.length; i++) {
        allCards[i].remove();
      }
    }
  };

  loadSavedReviews();

  if (reviewForm) {
    reviewForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!reviewForm.checkValidity()) {
        reviewForm.reportValidity();
        return;
      }

      const formData = new FormData(reviewForm);
      const name = formData.get('name') || 'Guest';
      const country = formData.get('country') || 'Unknown';
      const reviewText = formData.get('review') || '';
      
      const newReviewCard = document.createElement('article');
      newReviewCard.className = 'review-card';
      
      const initial = name.charAt(0).toUpperCase();
      const stars = '★'.repeat(currentRating);

      newReviewCard.innerHTML = `
        <div class="review-head">
          <span class="review-avatar">${initial}</span>
          <div>
            <h3>${name}</h3>
            <p>${country} • Just now</p>
          </div>
        </div>
        <p class="review-stars">${stars}</p>
        <p class="review-copy">${reviewText}</p>
      `;

      const reviewStrip = document.querySelector('.review-strip');
      if (reviewStrip) {
        reviewStrip.insertBefore(newReviewCard, reviewStrip.firstChild);
        
        const allCards = reviewStrip.querySelectorAll('.review-card');
        if (allCards.length > 3) {
          for (let i = 3; i < allCards.length; i++) {
            allCards[i].remove();
          }
        }
      }

      const saved = JSON.parse(localStorage.getItem('shantha_tours_reviews') || '[]');
      saved.unshift({
        name,
        country,
        rating: currentRating,
        text: reviewText,
        date: 'Just now'
      });
      localStorage.setItem('shantha_tours_reviews', JSON.stringify(saved.slice(0, 3)));

      reviewForm.reset();
      setRating(5);
      closeReviewModal();
    });
  }
}

const tourFilterButtons = document.querySelectorAll('.tour-filter button');
const tourDetailButtons = document.querySelectorAll('.tours-section .tour-cta');
const tourModal = document.getElementById('tour-modal');
const tourModalClose = tourModal ? tourModal.querySelector('.tour-modal-close') : null;
const tourModalKicker = document.getElementById('tour-modal-kicker');
const tourModalTitle = document.getElementById('tour-modal-title');
const tourModalDesc = document.getElementById('tour-modal-desc');
const tourModalImage = document.getElementById('tour-modal-image');
const tourModalFeatures = document.getElementById('tour-modal-features');

if (tourModal && tourDetailButtons.length) {
  const openTourModal = (tourCard) => {
    const titleNode = tourCard.querySelector('h3');
    const badgeNode = tourCard.querySelector('.tour-badge');
    const title = titleNode ? titleNode.textContent.trim() : 'Trending Tour';
    const badge = badgeNode ? badgeNode.textContent.trim() : 'Trending Tour';
    const image = tourCard.style.backgroundImage;
    const description = tourCard.dataset.tourDescription
      || 'Explore this featured route with a curated experience by Shantha Tours.';
    const features = (tourCard.dataset.tourFeatures || 'Private Transfer|Expert Guide|Flexible Stops')
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean);

    if (tourModalKicker) {
      tourModalKicker.textContent = badge;
    }
    if (tourModalTitle) {
      tourModalTitle.textContent = title;
    }
    if (tourModalDesc) {
      tourModalDesc.textContent = description;
    }
    if (tourModalImage && image) {
      tourModalImage.style.backgroundImage = image;
    }
    if (tourModalFeatures) {
      tourModalFeatures.innerHTML = features.map((feature) => `<li>${feature}</li>`).join('');
    }

    tourModal.classList.add('is-open');
    tourModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
  };

  const closeTourModal = () => {
    tourModal.classList.remove('is-open');
    tourModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
  };

  tourDetailButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const tourCard = button.closest('.tour-card');
      if (tourCard) {
        openTourModal(tourCard);
      }
    });
  });

  if (tourModalClose) {
    tourModalClose.addEventListener('click', closeTourModal);
  }

  tourModal.addEventListener('click', (event) => {
    if (event.target === tourModal) {
      closeTourModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && tourModal.classList.contains('is-open')) {
      closeTourModal();
    }
  });
}

const destinationButtons = document.querySelectorAll('.destination-card-btn');
const destinationModal = document.getElementById('destination-modal');
const destinationModalClose = destinationModal ? destinationModal.querySelector('.destination-modal-close') : null;
const destinationModalTitle = document.getElementById('destination-modal-title');
const destinationModalDescription = document.getElementById('destination-modal-description');
const destinationModalHours = document.getElementById('destination-modal-hours');
const destinationModalBestTime = document.getElementById('destination-modal-best-time');
const destinationModalRules = document.getElementById('destination-modal-rules');
const destinationModalNotes = document.getElementById('destination-modal-notes');
const destinationModalTip = document.getElementById('destination-modal-tip');
const destinationModalImage = document.getElementById('destination-modal-image');
const destinationModalMap = document.getElementById('destination-modal-map');

if (destinationModal && destinationButtons.length) {
  const destinationInfo = {
    Mirissa: {
      hours: 'Beach access: 24 hours, Whale watching tours: 6:30 AM to 1:00 PM',
      bestTime: 'November to April',
      rules: [
        'Use reef-safe sunscreen before entering the water.',
        'Keep at least 100m distance from whales and dolphins during tours.',
        'Do not litter on the beach or leave plastic behind.'
      ],
      notes: [
        'Morning sea is calmer for boat trips.',
        'Bring a hat, light cover, and water for midday heat.'
      ],
      tip: 'Tip: Book whale tours one day early for best departure slots.',
      map: 'https://www.google.com/maps/search/?api=1&query=Mirissa+Sri+Lanka'
    },
    Arugambay: {
      hours: 'Surf points: daylight hours, Lagoon activities: 7:00 AM to 5:00 PM',
      bestTime: 'May to September',
      rules: [
        'Respect flagged surf zones and local safety instructions.',
        'Avoid entering restricted dune or turtle nesting areas.',
        'Wear life jackets for lagoon or boat activities.'
      ],
      notes: [
        'Peak surfing waves are usually early morning and late afternoon.',
        'ATMs and pharmacies are limited in some areas.'
      ],
      tip: 'Tip: Carry cash for small beach-side shops and rentals.',
      map: 'https://www.google.com/maps/search/?api=1&query=Arugam+Bay+Sri+Lanka'
    },
    Tangalle: {
      hours: 'Public beaches: 24 hours, Turtle centers: 8:00 AM to 6:00 PM',
      bestTime: 'December to April',
      rules: [
        'Swim only in safe marked sections due to strong currents.',
        'Do not use flash photography near turtle nesting sites.',
        'Avoid loud music around protected coastal areas at night.'
      ],
      notes: [
        'Some coves are rocky; water shoes are recommended.',
        'Sunset viewpoints are busiest after 5:00 PM.'
      ],
      tip: 'Tip: Ask locals about current sea conditions before swimming.',
      map: 'https://www.google.com/maps/search/?api=1&query=Tangalle+Sri+Lanka'
    },
    Benthota: {
      hours: 'Beach access: 24 hours, Water sports: 8:30 AM to 5:00 PM',
      bestTime: 'November to April',
      rules: [
        'Follow instructor briefing before jet ski or banana rides.',
        'Wear approved safety equipment for all motorized activities.',
        'Respect private resort beach boundaries.'
      ],
      notes: [
        'Mornings are ideal for calmer sea and clearer water.',
        'Advance booking is recommended on weekends.'
      ],
      tip: 'Tip: Combine Bentota River safari with beach time in one day.',
      map: 'https://www.google.com/maps/search/?api=1&query=Bentota+Sri+Lanka'
    },
    Uppuveli: {
      hours: 'Beach access: 24 hours, Snorkeling trips: 7:00 AM to 4:00 PM',
      bestTime: 'May to September',
      rules: [
        'Do not touch coral reefs or marine life.',
        'Use designated operators for Pigeon Island trips.',
        'Keep beaches clean and carry back waste.'
      ],
      notes: [
        'Clear visibility for snorkeling is usually before noon.',
        'Boat departures may shift with weather and tide.'
      ],
      tip: 'Tip: Bring a dry bag to protect valuables on boat rides.',
      map: 'https://www.google.com/maps/search/?api=1&query=Uppuveli+Sri+Lanka'
    },
    Yala: {
      hours: 'National Park: 6:00 AM to 6:00 PM',
      bestTime: 'February to July',
      rules: [
        'Remain inside safari vehicles at all times.',
        'Do not feed, call, or provoke wild animals.',
        'Silence and low voice are required near sightings.'
      ],
      notes: [
        'Early morning entries improve leopard sighting chances.',
        'Carry ID and park permit details before arrival.'
      ],
      tip: 'Tip: Use neutral-colored clothing to reduce disturbance to wildlife.',
      map: 'https://www.google.com/maps/search/?api=1&query=Yala+National+Park+Sri+Lanka'
    },
    Udawalava: {
      hours: 'National Park: 6:00 AM to 6:00 PM',
      bestTime: 'Year-round, best in dry months from May to September',
      rules: [
        'Photography without flash is recommended.',
        'Do not stand through sunroof in animal zones.',
        'Follow ranger instructions at all checkpoints.'
      ],
      notes: [
        'Elephant sightings are frequent near water points.',
        'Roads can be dusty; carry eye protection if needed.'
      ],
      tip: 'Tip: Pair this with the elephant transit home visit nearby.',
      map: 'https://www.google.com/maps/search/?api=1&query=Udawalawe+National+Park+Sri+Lanka'
    },
    Wasgamuwa: {
      hours: 'National Park: 6:00 AM to 6:00 PM',
      bestTime: 'June to September',
      rules: [
        'Entry only with authorized safari driver/guide.',
        'No smoking or alcohol inside the park.',
        'Keep noise low to avoid disturbing animal movement.'
      ],
      notes: [
        'Less crowded than major parks, allowing quieter safaris.',
        'Road conditions may vary after rain.'
      ],
      tip: 'Tip: Carry binoculars for distant wildlife observation.',
      map: 'https://www.google.com/maps/search/?api=1&query=Wasgamuwa+National+Park+Sri+Lanka'
    },
    'Galle Fort': {
      hours: 'Fort area: open all day, Museums: 9:00 AM to 5:00 PM',
      bestTime: 'December to April',
      rules: [
        'Dress modestly when entering churches and cultural buildings.',
        'Do not climb on fragile heritage walls.',
        'Respect residents and keep lanes clear.'
      ],
      notes: [
        'Late afternoon is best for lighthouse and rampart walks.',
        'Many cafes close by around 10:00 PM.'
      ],
      tip: 'Tip: Visit the fort at sunset for cooler weather and great photos.',
      map: 'https://www.google.com/maps/search/?api=1&query=Galle+Fort+Sri+Lanka'
    },
    Sigiriya: {
      hours: 'Sigiriya Rock Fortress: 6:30 AM to 5:30 PM',
      bestTime: 'January to April',
      rules: [
        'No touching or photographing frescoes in restricted areas.',
        'Use stair rails and follow one-way climbing instructions.',
        'Carry enough water; avoid littering on the route.'
      ],
      notes: [
        'Climb early morning to avoid heat and crowd.',
        'Comfortable shoes are essential for steep steps.'
      ],
      tip: 'Tip: Combine with Pidurangala for panoramic views of Sigiriya.',
      map: 'https://www.google.com/maps/search/?api=1&query=Sigiriya+Sri+Lanka'
    },
    Kandy: {
      hours: 'Temple of the Tooth: 5:30 AM to 8:00 PM',
      bestTime: 'December to April',
      rules: [
        'Wear clothing that covers shoulders and knees at temples.',
        'Remove footwear and hats before sacred areas.',
        'Photography may be limited in specific interior zones.'
      ],
      notes: [
        'Ceremony times are popular; expect queues.',
        'Botanical garden closes by late afternoon.'
      ],
      tip: 'Tip: Plan temple visit around evening puja for rich cultural atmosphere.',
      map: 'https://www.google.com/maps/search/?api=1&query=Kandy+Sri+Lanka'
    },
    Ella: {
      hours: 'Most viewpoints and trails: 6:00 AM to 6:30 PM',
      bestTime: 'January to March and July to September',
      rules: [
        'Stay on marked trails near cliff edges.',
        'Do not block railway tracks for photos.',
        'Respect tea estate private boundaries.'
      ],
      notes: [
        'Weather changes quickly; carry a light rain layer.',
        'Sunrise trips start very early for best visibility.'
      ],
      tip: 'Tip: Start hikes before 8:00 AM for clear views and cooler weather.',
      map: 'https://www.google.com/maps/search/?api=1&query=Ella+Sri+Lanka'
    },
    'Nuwara Eliya': {
      hours: 'Public gardens/lake: 8:00 AM to 6:00 PM',
      bestTime: 'February to April',
      rules: [
        'Follow tea factory safety zones during tours.',
        'Avoid entering plantation fields without guide permission.',
        'Maintain quiet in heritage garden areas.'
      ],
      notes: [
        'Evenings can be cold; carry warm layers.',
        'Rain showers are common throughout the year.'
      ],
      tip: 'Tip: Include tea tasting sessions in the afternoon when factories are active.',
      map: 'https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka'
    },
    Polonaruwa: {
      hours: 'Ancient City Archaeological Site: 7:00 AM to 6:00 PM',
      bestTime: 'May to September',
      rules: [
        'Do not climb protected ruins or statue bases.',
        'Remove hats and shoes at religious monuments where required.',
        'Use only authorized bicycle/tuk routes inside the complex.'
      ],
      notes: [
        'Large site area requires 3 to 4 hours minimum.',
        'Carry sun protection; shade is limited in open zones.'
      ],
      tip: 'Tip: Hiring a local guide helps understand site history and layout quickly.',
      map: 'https://www.google.com/maps/search/?api=1&query=Polonnaruwa+Sri+Lanka'
    },
    'Little Adams Peak': {
      hours: 'Trail access: 5:30 AM to 6:30 PM',
      bestTime: 'January to March',
      rules: [
        'Do not step beyond marked photo ledges.',
        'Wear stable footwear for dirt and stone paths.',
        'Carry back all waste from the trail.'
      ],
      notes: [
        'Easy-to-moderate trail, usually 45 to 60 minutes each way.',
        'Cloud cover increases later in the day.'
      ],
      tip: 'Tip: Sunrise climb gives the clearest views of Ella Gap.',
      map: 'https://www.google.com/maps/search/?api=1&query=Little+Adams+Peak+Ella+Sri+Lanka'
    },
    'Pidurangala Rock': {
      hours: 'Site access: 5:00 AM to 6:00 PM',
      bestTime: 'January to April',
      rules: [
        'Respect temple zone dress code before the climb section.',
        'Use caution on final boulder climb and avoid risky poses.',
        'Do not leave litter near cave temple areas.'
      ],
      notes: [
        'Steeper than Little Adams Peak; moderate fitness recommended.',
        'Best known for direct views of Sigiriya Rock.'
      ],
      tip: 'Tip: Carry a flashlight for pre-sunrise starts.',
      map: 'https://www.google.com/maps/search/?api=1&query=Pidurangala+Rock+Sri+Lanka'
    },
    'Adams Peak': {
      hours: 'Pilgrim trail access: open seasonally, best from 2:00 AM to sunrise',
      bestTime: 'December to May (pilgrim season)',
      rules: [
        'Respect religious practices and maintain queue discipline.',
        'Avoid loud music and disruptive behavior on steps.',
        'Keep warm clothes and lights for night ascent.'
      ],
      notes: [
        'Night climb is common to witness sunrise at summit.',
        'Temperature drops significantly at higher elevation.'
      ],
      tip: 'Tip: Begin climb early evening if traveling with children or seniors.',
      map: 'https://www.google.com/maps/search/?api=1&query=Adams+Peak+Sri+Lanka'
    },
    Anuradhapura: {
      hours: 'Sacred sites: 7:00 AM to 6:00 PM, Archaeological museum: 9:00 AM to 5:00 PM',
      bestTime: 'December to March',
      rules: [
        'Dress modestly and remove footwear at sacred areas.',
        'Do not photograph ancient frescoes or interior temple sanctuaries.',
        'Maintain respectful silence at pilgrimage sites and during ceremonies.'
      ],
      notes: [
        'Hire a guide to understand the historical significance of the ancient cities.',
        'The site is vast; plan at least 4-5 hours for comprehensive visit.'
      ],
      tip: 'Tip: Visit during early morning to experience the sacred atmosphere with fewer crowds.',
      map: 'https://www.google.com/maps/search/?api=1&query=Anuradhapura+Sri+Lanka'
    },
    Jaffna: {
      hours: 'Fort and temples: 7:00 AM to 5:00 PM, Local museums: 9:00 AM to 4:00 PM',
      bestTime: 'April to September',
      rules: [
        'Wear respectful clothing when visiting temples and cultural sites.',
        'Seek permission before photographing local religious ceremonies.',
        'Respect local customs and traditions in this culturally significant region.'
      ],
      notes: [
        'Jaffna Library and surrounding markets showcase rich cultural heritage.',
        'Ferry ride to nearby islands is a unique coastal experience.'
      ],
      tip: 'Tip: Connect with local guides to gain deeper insights into Jaffna\'s vibrant Tamil culture and history.',
      map: 'https://www.google.com/maps/search/?api=1&query=Jaffna+Sri+Lanka'
    }
  };

  const closeDestinationModal = () => {
    destinationModal.classList.remove('is-open');
    destinationModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
  };

  const openDestinationModal = (card) => {
    const titleNode = card.querySelector('h3');
    const descriptionNode = card.querySelector('p');
    const imageNode = card.querySelector('.destination-card-image');
    const title = titleNode ? titleNode.textContent.trim() : 'Destination';
    const description = descriptionNode ? descriptionNode.textContent.trim() : 'Destination information is available on request.';
    const image = imageNode ? imageNode.style.backgroundImage : '';
    const details = destinationInfo[title] || {
      hours: 'Most public sites operate between 7:00 AM and 6:00 PM',
      bestTime: 'Dry season months are generally preferred',
      rules: [
        'Respect local culture, dress codes, and signage.',
        'Avoid littering and single-use plastics where possible.',
        'Follow guide and authority instructions for safety.'
      ],
      notes: [
        'Carry water, sunscreen, and comfortable footwear.',
        'Start early to avoid crowds and midday heat.'
      ],
      tip: 'Tip: Contact Shantha Tours for a guided day plan.'
    };

    if (destinationModalTitle) {
      destinationModalTitle.textContent = title;
    }
    if (destinationModalDescription) {
      destinationModalDescription.textContent = description;
    }
    if (destinationModalHours) {
      destinationModalHours.textContent = details.hours;
    }
    if (destinationModalBestTime) {
      destinationModalBestTime.textContent = details.bestTime;
    }
    if (destinationModalRules) {
      destinationModalRules.innerHTML = details.rules.map((rule) => `<li>${rule}</li>`).join('');
    }
    if (destinationModalNotes) {
      destinationModalNotes.innerHTML = details.notes.map((note) => `<li>${note}</li>`).join('');
    }
    if (destinationModalTip) {
      destinationModalTip.textContent = details.tip;
    }
    if (destinationModalMap) {
      const fallbackMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, Sri Lanka`)}`;
      destinationModalMap.href = details.map || fallbackMap;
    }
    if (destinationModalImage && image) {
      destinationModalImage.style.backgroundImage = image;
    }

    destinationModal.classList.add('is-open');
    destinationModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
  };

  destinationButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const card = button.closest('.destination-card');
      if (card) {
        openDestinationModal(card);
      }
    });
  });

  if (destinationModalClose) {
    destinationModalClose.addEventListener('click', closeDestinationModal);
  }

  destinationModal.addEventListener('click', (event) => {
    if (event.target === destinationModal) {
      closeDestinationModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && destinationModal.classList.contains('is-open')) {
      closeDestinationModal();
    }
  });
}

if (tourFilterButtons.length) {
  tourFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tourFilterButtons.forEach((node) => {
        node.classList.remove('is-active');
        node.setAttribute('aria-selected', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
    });
  });
}

// Ensure service cards with missing images show a fallback
(() => {
  const svcCards = document.querySelectorAll('.svc-card[data-fallback]');
  svcCards.forEach((card) => {
    const bg = card.style.backgroundImage;
    const urlMatch = bg && bg.match(/url\(["']?(.*?)["']?\)/);
    const src = urlMatch ? urlMatch[1] : null;
    const fallback = card.dataset.fallback;
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      // image exists, nothing to do
    };
    img.onerror = () => {
      card.style.backgroundImage = `url('${fallback}')`;
    };
    img.src = src;
  });
})();

// Auto-scroll the service-strip from left to right and loop
(() => {
  const strip = document.querySelector('.service-strip');
  if (!strip) return;

  // pixels per second
  const speed = 30;
  let running = true;
  let rafId = null;
  let lastTimestamp = null;

  const maxScroll = () => Math.max(0, strip.scrollWidth - strip.clientWidth);

  // If items fit without overflow, duplicate content to allow visible auto-scroll
  if (maxScroll() === 0) {
    // Clone children once to create a scrollable strip
    strip.innerHTML = strip.innerHTML + strip.innerHTML;
  }

  function step(ts) {
    if (!lastTimestamp) lastTimestamp = ts;
    const delta = (ts - lastTimestamp) / 1000;
    lastTimestamp = ts;

    if (running) {
      strip.scrollLeft = Math.min(maxScroll(), strip.scrollLeft + speed * delta);
      if (strip.scrollLeft >= maxScroll() - 0.5) {
        // reached end — reset to start without visual jump by snapping
        strip.scrollLeft = 0;
      }
    }

    rafId = requestAnimationFrame(step);
  }

  // pause on pointer/keyboard interaction
  const pause = () => { running = false; };
  const resume = () => { running = true; lastTimestamp = null; };

  strip.addEventListener('mouseenter', pause);
  strip.addEventListener('mouseleave', resume);
  strip.addEventListener('pointerdown', pause);
  strip.addEventListener('pointerup', resume);
  strip.addEventListener('focusin', pause);
  strip.addEventListener('focusout', resume);

  rafId = requestAnimationFrame(step);

  // cleanup if needed (not used here but useful for SPA)
  // return () => { cancelAnimationFrame(rafId); };
})();

// Destination search: filter .svc-card and .destination-card by input
(() => {
  const input = document.getElementById('destination-search');
  if (!input) return;

  const cardsSelector = '.svc-card, .destination-card';
  const cards = () => Array.from(document.querySelectorAll(cardsSelector));

  const normalize = (s) => (s || '').toString().trim().toLowerCase();

  let debounceTimer = null;
  const debounce = (fn, wait = 200) => {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn(...args), wait);
    };
  };

  const performSearch = () => {
    const q = normalize(input.value);
    let found = false;
    cards().forEach((card) => {
      const title = normalize((card.querySelector('h3') || {}).textContent);
      const desc = normalize((card.querySelector('p') || {}).textContent);
      const text = `${title} ${desc}`;
      const match = q === '' || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) found = true;
    });

    // show or remove no-results message
    let noMsg = document.querySelector('.no-results');
    if (!found && q !== '') {
      if (!noMsg) {
        noMsg = document.createElement('div');
        noMsg.className = 'no-results';
        noMsg.textContent = 'No destinations found.';
        const section = document.getElementById('destinations');
        if (section) section.appendChild(noMsg);
      }
    } else if (noMsg) {
      noMsg.remove();
    }
  };

  input.addEventListener('input', debounce(performSearch, 180));
  // No entrance animation: search input will behave without scripted animations
})();

const heroShowcase = document.querySelector('.hero-showcase');
const heroGallery = document.querySelector('.hero-gallery');
const heroPrev = document.querySelector('.hero-gallery-prev');
const heroNext = document.querySelector('.hero-gallery-next');
const heroTiles = heroGallery ? Array.from(heroGallery.querySelectorAll('.hero-tile')) : [];

if (heroShowcase && heroGallery && heroPrev && heroNext && heroTiles.length) {
  let activeIndex = Math.max(
    0,
    heroTiles.findIndex((tile) => tile.classList.contains('hero-tile-active'))
  );

  const setHeroSlide = (index) => {
    activeIndex = (index + heroTiles.length) % heroTiles.length;

    heroTiles.forEach((tile, tileIndex) => {
      tile.classList.toggle('hero-tile-active', tileIndex === activeIndex);
    });

    const selectedImage = heroTiles[activeIndex].style.backgroundImage;
    if (selectedImage) {
      heroShowcase.style.setProperty('--hero-image', selectedImage);
    }

    const activeTab = heroTiles[activeIndex];
    const tabWidth = activeTab.offsetWidth;
    const tabLeft = activeTab.offsetLeft;
    const containerWidth = heroGallery.clientWidth;
    const containerScrollLeft = heroGallery.scrollLeft;
    
    if (tabLeft < containerScrollLeft) {
      heroGallery.scrollLeft = tabLeft;
    } else if (tabLeft + tabWidth > containerScrollLeft + containerWidth) {
      heroGallery.scrollLeft = tabLeft + tabWidth - containerWidth;
    }
  };

  let autoCycleTimer = null;
  const autoSlideInterval = 4000;

  const startAutoCycle = () => {
    autoCycleTimer = window.setInterval(() => {
      setHeroSlide(activeIndex + 1);
    }, autoSlideInterval);
  };

  const resetAutoCycle = () => {
    if (autoCycleTimer) {
      window.clearInterval(autoCycleTimer);
    }
    startAutoCycle();
  };

  heroPrev.addEventListener('click', () => {
    setHeroSlide(activeIndex - 1);
    resetAutoCycle();
  });
  heroNext.addEventListener('click', () => {
    setHeroSlide(activeIndex + 1);
    resetAutoCycle();
  });

  heroTiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
      setHeroSlide(index);
      resetAutoCycle();
    });
  });

  setHeroSlide(activeIndex);
  startAutoCycle();
}

const itineraryCtaButtons = document.querySelectorAll('.itinerary-cta');
const itineraryModal = document.getElementById('itinerary-modal');
const itineraryModalClose = itineraryModal ? itineraryModal.querySelector('.itinerary-modal-close') : null;
const itineraryModalTitle = document.getElementById('itinerary-modal-title');
const itineraryModalDays = document.getElementById('itinerary-modal-days');
const itineraryModalDescription = document.getElementById('itinerary-modal-description');
const itineraryModalRoute = document.getElementById('itinerary-modal-route');
const itineraryModalTags = document.getElementById('itinerary-modal-tags');
const itineraryModalIncluded = document.getElementById('itinerary-modal-included');
const itineraryModalMapImage = document.getElementById('itinerary-modal-map-image');
const itineraryModalMapLink = document.getElementById('itinerary-modal-map-link');

if (itineraryModal && itineraryCtaButtons.length) {
  const itineraryData = {
    'Coastal Paradise': {
      days: '8 DAYS',
      highlights: ['Beach', 'Wildlife', 'Culture'],
      description: 'Experience pristine beaches, whale watching, and iconic landmarks. A perfect blend of relaxation and adventure.',
      route: 'Airport ⇨ Kandy ⇨ Nuwaraeliya ⇨ Ella ⇨ Yala ⇨ Mirissa ⇨ Galle ⇨ Benthota ⇨ Colombo',
      mapImage: 'assets/sl-map-route1.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Kandy+Nuwara+Eliya+Ella+Yala+Mirissa+Galle+Bentota+Sri+Lanka',
      included: [
        'Private chauffeur & luxury vehicles',
        'All meals and accommodations included',
        'Whale watching tour at Mirissa',
        'Galle Fort historical guided tour',
        '24/7 dedicated travel support'
      ]
    },
    'Complete Island Tour': {
      days: '10 DAYS',
      highlights: ['Comprehensive', 'All Regions'],
      description: 'Visit all major attractions across Sri Lanka. From highlands to coast, covering beaches, temples, and wildlife sanctuaries.',
      route: 'Airport ⇨ Kandy ⇨ Dambulla ⇨ Polonnaruwa ⇨ Negombo ⇨ Nuwaraeliya ⇨ Ella ⇨ Mirissa ⇨ Galle ⇨ Colombo',
      mapImage: 'assets/sl-map-route2.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Kandy+Dambulla+Polonnaruwa+Negombo+Nuwara+Eliya+Ella+Mirissa+Galle+Sri+Lanka',
      included: [
        'Complete guided tours at all major sites',
        'Tea factory visits with tastings',
        'Temple ceremonies and cultural experiences',
        'Wildlife safari in Yala National Park',
        'Beach relaxation and water activities',
        'Premium accommodations throughout'
      ]
    },
    'Cultural Heritage': {
      days: '5 DAYS',
      highlights: ['Culture', 'History'],
      description: 'Immerse in Sri Lanka\'s rich cultural heritage. Ancient temples, UNESCO sites, and traditional villages await exploration.',
      route: 'Airport ⇨ Kandy ⇨ Polonnaruwa ⇨ Trincomalee ⇨ Anuradhapura ⇨ Negombo ⇨ Colombo',
      mapImage: 'assets/sl-map-route3.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Kandy+Polonnaruwa+Trincomalee+Anuradhapura+Negombo+Sri+Lanka',
      included: [
        'Access to UNESCO World Heritage sites',
        'Ancient temple ceremonies and blessings',
        'Archaeological site expert guides',
        'Traditional village interactions',
        'Cultural cooking classes',
        'Meals at heritage restaurants'
      ]
    },
    'Adventure & Safari': {
      days: '12 DAYS',
      highlights: ['Adventure', 'Wildlife'],
      description: 'Thrilling safari experiences combined with hiking and water sports. Perfect for adventure seekers seeking adrenaline-pumping activities.',
      route: 'Airport ⇨ Dambulla ⇨ Yala Safari ⇨ Udawalava ⇨ Climb Adam\'s Peak ⇨ Ella Hiking ⇨ Mirissa Surfing ⇨ Galle',
      mapImage: 'assets/sl-map-route5.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Dambulla+Yala+Udawalawe+Adams+Peak+Ella+Mirissa+Galle+Sri+Lanka',
      included: [
        'Multiple wildlife safaris with expert trackers',
        'Adam\'s Peak sunrise climb experience',
        'Ella hiking trails with scenic viewpoints',
        'Surfing lessons at Mirissa Beach',
        'Jungle trekking activities',
        'Adventure photography support',
        'Professional adventure guides throughout'
      ]
    },
    'Ultimate Sri Lanka': {
      days: '15 DAYS',
      highlights: ['Premium', 'Luxury'],
      description: 'The complete Sri Lankan experience. Luxury accommodations, private experiences, and exclusive access to hidden locations.',
      route: 'Airport ⇨ Kandy ⇨ Nuwaraeliya ⇨ Ella ⇨ Udawalava ⇨ Yala ⇨ Mirissa ⇨ Bentota ⇨ Galle ⇨ Sigiriya ⇨ Colombo',
      mapImage: 'assets/sri-lankan-travel-map.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Kandy+Nuwara+Eliya+Ella+Udawalawe+Yala+Mirissa+Bentota+Galle+Sigiriya+Sri+Lanka',
      included: [
        'Luxury 5-star resort stays',
        'Private yacht experiences',
        'Exclusive wildlife safaris',
        'Helicopter scenic tours',
        'Spa and wellness treatments daily',
        'Personal concierge service',
        'Gourmet fine dining throughout',
        'VIP access to all attractions'
      ]
    },
    'North & East Explorer': {
      days: '11 DAYS',
      highlights: ['Exploration', 'Authentic'],
      description: 'Discover the less-traveled northern and eastern regions. Pristine beaches, quiet towns, and authentic cultural interactions.',
      route: 'Airport ⇨ Kandy ⇨ Dambulla ⇨ Anuradhapura ⇨ Jaffna ⇨ Trincomalee ⇨ Arugambe ⇨ Colombo',
      mapImage: 'assets/Sri Lanka Map.png',
      mapLink: 'https://www.google.com/maps/search/?api=1&query=Kandy+Dambulla+Anuradhapura+Jaffna+Trincomalee+Arugam+Bay+Sri+Lanka',
      included: [
        'Jaffna peninsula cultural tour',
        'Pristine beach explorations',
        'Local fishing village experiences',
        'Ancient historical site visits',
        'Coral reef snorkeling',
        'Authentic local cuisine experiences',
        'Homestay cultural stays included'
      ]
    }
  };

  const openItineraryModal = (card) => {
    const titleNode = card.querySelector('.itinerary-title');
    const daysNode = card.querySelector('.itinerary-days-num');
    const descNode = card.querySelector('.itinerary-description');
    const routeNode = card.querySelector('.itinerary-route');
    const tagsNodes = card.querySelectorAll('.itinerary-tag');

    const title = titleNode ? titleNode.textContent.trim() : 'Itinerary';
    const data = itineraryData[title] || itineraryData['Coastal Paradise'];

    if (itineraryModalTitle) {
      itineraryModalTitle.textContent = title;
    }
    if (itineraryModalDays) {
      itineraryModalDays.textContent = data.days;
    }
    if (itineraryModalDescription) {
      itineraryModalDescription.textContent = data.description;
    }
    if (itineraryModalRoute) {
      itineraryModalRoute.innerHTML = `<strong>Route:</strong> ${data.route}`;
    }
    if (itineraryModalMapImage) {
      itineraryModalMapImage.src = data.mapImage || 'assets/sl-map-route1.png';
      itineraryModalMapImage.alt = `${title} Sri Lanka route map`;
    }
    if (itineraryModalMapLink) {
      itineraryModalMapLink.href = data.mapLink || 'https://www.google.com/maps/search/?api=1&query=Sri+Lanka+Travel+Route';
    }
    if (itineraryModalTags) {
      itineraryModalTags.innerHTML = data.highlights
        .map((tag) => `<span class="itinerary-modal-tag">${tag}</span>`)
        .join('');
    }
    if (itineraryModalIncluded) {
      itineraryModalIncluded.innerHTML = data.included
        .map((item) => `<li>${item}</li>`)
        .join('');
    }

    itineraryModal.classList.add('is-open');
    itineraryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
  };

  const closeItineraryModal = () => {
    itineraryModal.classList.remove('is-open');
    itineraryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
  };

  itineraryCtaButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const card = button.closest('.itinerary-card');
      if (card) {
        openItineraryModal(card);
      }
    });
  });

  if (itineraryModalClose) {
    itineraryModalClose.addEventListener('click', closeItineraryModal);
  }

  itineraryModal.addEventListener('click', (event) => {
    if (event.target === itineraryModal) {
      closeItineraryModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && itineraryModal.classList.contains('is-open')) {
      closeItineraryModal();
    }
  });
}

const revealNodes = document.querySelectorAll('.section-reveal');

if ('IntersectionObserver' in window && revealNodes.length) {
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add('is-visible'));
}
