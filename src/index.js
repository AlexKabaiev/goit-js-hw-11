// Imports: SimpleLightbox, Notiflix & Axios
import fetchImages from './js/fetch-images';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

// HTML elements
const { searchForm, gallery, loadMoreBtn, endCollectionText } = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  endCollectionText: document.querySelector('.end-collection-text'),
};

// SimpleLightbox slider
let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

// Needed to query the Pixabay API
let currentPage = 1;
let currentHits = 0;
let searchQuery = '';

// Searching images
searchForm.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.searchQuery.value;
  currentPage = 1;

  if (searchQuery === '') {
    return;
  }

  // if (response.totalHits > 40) {
  //   loadMoreBtn.classList.remove('is-hidden');
  // } else {
  //   loadMoreBtn.classList.add('is-hidden');
  // }

  try {
    const response = await fetchImages(searchQuery, currentPage);
    currentHits = response.hits.length;

    if (response.totalHits > 0) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      gallery.innerHTML = '';
      renderCardImage(response.hits);
      lightbox.refresh();
      endCollectionText.classList.add('is-hidden');

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * -100,
        behavior: 'smooth',
      });
    }

    if (response.totalHits === 0) {
      gallery.innerHTML = '';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      // loadMoreBtn.classList.add('is-hidden');
      endCollectionText.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

// Function for markup for HTML gallery element
function renderCardImage(arr) {
  const markup = arr
    .map(item => {
      return ` 
    <div class="photo-card">
    <a class="gallery-item" href="${item.largeImageURL}">
          <img
           src="${item.webformatURL}"
            alt="${item.tags}"
           loading="lazy"
        /></a>
        <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${item.likes.toLocaleString()}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${item.views.toLocaleString()}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${item.comments.toLocaleString()}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${item.downloads.toLocaleString()}
    </p>
  </div>
        </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

// Load more button - function
// loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

// async function onClickLoadMoreBtn() {
//   currentPage += 1;
//   const response = await fetchImages(searchQuery, currentPage);
//   renderCardImage(response.hits);
//   lightbox.refresh();
//   currentHits += response.hits.length;

//   if (currentHits === response.totalHits) {
//     loadMoreBtn.classList.add('is-hidden');
//     endCollectionText.classList.remove('is-hidden');
//   }
// }

//Infinite scroll
async function checkPosition() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  const scrolled = window.scrollY;
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;
  if (position >= threshold) {
    await infiniteScroll();
  }
}

  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));

async function infiniteScroll() {
  try {
    currentPage += 1;
    const response = await fetchImages(searchQuery, currentPage);
    renderCardImage(response.hits);
    lightbox.refresh();
    currentHits += response.hits.length;

    if (currentHits === response.totalHits) {
      endCollectionText.classList.remove('is-hidden');
    }
  } catch (error) {
     console.log(error);
  }
}
