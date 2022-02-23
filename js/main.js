'use strict';

const API_KEY = 'api_key=9e423027d44ac23fbe0304f005123b95&language=ru';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/movie/popular?' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const API_GENRES = BASE_URL + '/genre/movie/list?' + API_KEY;

const content = document.querySelector('.content');

const block1 = document.createElement('div');
block1.classList.add('card__block');
const block2 = document.createElement('div');
block2.classList.add('card__block');
const block3 = document.createElement('div');
block3.classList.add('card__block');

let lastActiveApi = '';

getMovies(API_URL);
getGenres(API_GENRES);

const genresBlock = document.querySelector('.genres__block');
const ul = document.createElement('ul');
ul.classList.add('genres__list');
ul.addEventListener('click', function (event) {
  const li = event.target.closest('li');

  if (!li) return;
  if (!ul.contains(li)) return;

  removeClassActive();
  li.classList.add('active');
  const genres = li.id;
  let apiGenreMovies =
    BASE_URL +
    `/discover/movie?with_genres=${genres}&sort_by=popularity.desc&vote_count.gte=10&` +
    API_KEY;

  getMovies(apiGenreMovies);
  addBlockEnd();
});

// const logo = document.querySelector('.header__logo');
// logo.addEventListener('click', () => {
//   removeClassActive();
//   getMovies(API_URL);
// });

const form = document.querySelector('#search');
form.addEventListener('submit', formSend);

const paginationBtn = document.createElement('button');
paginationBtn.classList.add('pagination__btn');
paginationBtn.innerText = 'показать еще';
paginationBtn.addEventListener('click', () => addNewPage(lastActiveApi));

content.addEventListener('click', e => {
  if (e.target.closest('.card')) {
    const movieId = e.target.closest('.card').id;
    const API_DETAILS_MOVIE =
      BASE_URL +
      `/movie/${movieId}?` +
      API_KEY +
      '&append_to_response=videos,similar';
    console.log(API_DETAILS_MOVIE);

    getDetailsMovie(API_DETAILS_MOVIE);
  }
});

function formSend(e) {
  e.preventDefault();

  const formDate = new FormData(form);
  const values = Object.fromEntries(formDate.entries());
  let searchApi =
    BASE_URL +
    '/search/movie?' +
    API_KEY +
    `&query=${values.search}&page=1&include_adult=true`;
  removeClassActive();
  getMovies(searchApi);
  addBlockEnd();
}

function getMovies(url, remove = true) {
  lastActiveApi = url;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data.results);
      showMovies(data.results, remove);
    });
}

function showMovies(data, remove) {
  if (remove) content.innerHTML = '';

  data.forEach(movie => {
    const { poster_path, title, vote_average, release_date, id } = movie;
    const release_year = release_date.slice(0, 4);
    const cardItem = document.createElement('div');
    cardItem.id = id;
    cardItem.classList.add('card__item', 'card');
    let colorRaring = null;
    if (vote_average < 5.5) {
      colorRaring = 'rgba(255, 0, 0, 0.8)';
    } else if (vote_average < 7.5) {
      colorRaring = 'rgb(241, 94, 5)';
    } else {
      colorRaring = 'rgb(0, 128, 0)';
    }
    cardItem.innerHTML = `
    <div class="card__poster"><img class="card__poster-images" src="${
      IMG_URL + poster_path
    }" alt="${title}" />
    <span class="card__rating" style="background: ${colorRaring}">${vote_average}</span>
    <span class="release__date">${release_year}</span>
    </div>
    <h1 class="card__title">${title}</h1>
    `;
    content.append(cardItem);
  });

  addBlockEnd();

  content.append(paginationBtn);
}

function getGenres(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const { genres } = data;
      showGenres(genres);
    });
}

function showGenres(data) {
  data.forEach(genre => {
    const { name, id } = genre;
    const li = document.createElement('li');
    li.classList.add('genres__item');
    li.id = id;
    li.innerText = name;
    ul.append(li);
  });

  genresBlock.append(ul);
}

function removeClassActive() {
  const li = ul.childNodes;

  li.forEach(el => {
    if (el.classList.contains('active')) el.classList.remove('active');
  });
}

function addNewPage(url) {
  if (url.indexOf('page=') === -1) {
    url += '&page=2';
    getMovies(url, false);
  } else {
    console.log(url[url.indexOf('page=') + 5]);
    let i = +url[url.indexOf('page=') + 5] + 1;
    url = url.replace(`page=${i - 1}`, `page=${i}`);
    getMovies(url, false);
  }
}

function addBlockEnd() {
  content.append(block1);
  content.append(block2);
  content.append(block3);
}
function getDetailsMovie(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      showMovie(data);
    });
}
function showMovie(data) {
  content.innerHTML = '';
  const {
    genres,
    overview,
    poster_path,
    release_date,
    runtime,
    title,
    vote_average
  } = data;

  let genresText = '';
  genres.forEach(genre => (genresText += genre.name + ' '));
  const blockMovie = document.createElement('div');
  blockMovie.classList.add('block__movie', 'movie');
  blockMovie.innerHTML = `
    <h2 class="movie__title">${title}</h2>
    <div class="movie__info">
      <div class="movie__poster"><img src="${
        IMG_URL + poster_path
      }" alt="${title}" /></div>
      <div class="movie__block-info">
        <ul class="movie__detailed-info detailed-info">
          <li class="detailed-info__item"><span>Рейтинг:</span> ${vote_average}</li>
          <li class="detailed-info__item"><span>Дата выхода:</span> ${release_date}</li>
          <li class="detailed-info__item"><span>Время:</span> ${runtime} мин.</li>
          <li class="detailed-info__item detailed-info__item_genres"><span>Жанр:</span> ${genresText}</li>
        </ul>
        <p class="movie__text-info">${overview}</p>
      </div>
    </div>
  `;

  const swiper = document.createElement('div');
  swiper.classList.add('swiper', 'swiper-video');
  swiper.innerHTML = `
  <div class="swiper-pagination"></div>
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
  `;

  const wrapperSwiper = document.createElement('div');
  wrapperSwiper.classList.add('swiper-wrapper');

  // const swiperVideo = document.querySelector('.swiper-video');
  // const videoSwiperWrapper = document.querySelector(
  //   '.swiper-video > .swiper-wrapper'
  // );
  // videoSwiperWrapper.innerHTML = '';
  const { results } = data.videos;
  results.forEach(video => {
    console.log(video);
    const blockItemVideo = document.createElement('div');
    blockItemVideo.classList.add('swiper-slide');
    blockItemVideo.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${video.key}"
      frameborder="0"
      allowfullscreen
      srcdoc="<style>*{padding:0;margin:0;overflow:hidden}
      html,body{height:100%}
      img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}
      span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}
      </style>
      <a href=https://www.youtube.com/embed/${video.key}?autoplay=1>
      <img src=https://img.youtube.com/vi/${video.key}/hqdefault.jpg alt='Demo video'>
      <span>▶</span>
      </a>"></iframe>
    `;

    wrapperSwiper.append(blockItemVideo);
  });
  swiper.prepend(wrapperSwiper);

  blockMovie.append(swiper);
  content.append(blockMovie);

  // FIXME: ___swiper_________

  new Swiper('.swiper-video', {
    // Optional parameters
    // direction: 'vertical',
    loop: true,

    // If we need pagination
    pagination: {
      el: '.swiper-pagination'
    },

    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }

    // And if we need scrollbar
    // scrollbar: {
    //   el: '.swiper-scrollbar'
    // }
  });
  // ____________________________
}
