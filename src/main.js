import "./styles/style.scss";

const imageContainer = document.querySelector("#image-container");
const loader = document.querySelector(".loader");

function createUnsplashClient(user) {
  const apiKey = import.meta.env.VITE_ACCESS_KEY;

  return async function getPhotos(count, page) {
    const url = `https://api.unsplash.com/collections/${user}/photos/?client_id=${apiKey}&per_page=${count}&page=${page}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to Fetch: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching photos: ${error.message}`);
      return [];
    }
  };
}

const abstractPainting = createUnsplashClient(8646349);

function handleGridLayout(figure, width, height) {
  const aspectRatio = height / width;

  if (aspectRatio > 1.1) {
    figure.classList.add("row-span"); // Vertical (Portrait) images
  } else if (aspectRatio < 0.67) {
    figure.classList.add("column-span"); // Horizontal (Landscape) images
  }
}

function createFigureElement(photo) {
  const {
    alt_description,
    width,
    height,
    urls: { regular },
  } = photo;

  const figure = document.createElement("figure");
  figure.setAttribute("class", "gallery__item");
  handleGridLayout(figure, width, height);
  figure.innerHTML = `<img src="${regular}" alt="${alt_description}" width="${width}" height="${height}"/>`;
  return figure;
}

function displayPhotos(photos) {
  // Create fragment to minimize the number of reflows and repaints
  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    const figure = createFigureElement(photo);
    fragment.appendChild(figure);
  });

  imageContainer.appendChild(fragment);
}

function createImageLoader() {
  let currentPage = 1;
  let currentIndex = 0;
  const imagesPerPage = 30;

  return async function renderImages(count) {
    try {
      loader.style.display = 'block'; // Show loader
      const photos = await abstractPainting(imagesPerPage, currentPage);
      const selectedPhotos = photos.slice(currentIndex, currentIndex + count);
      displayPhotos(selectedPhotos);
      loader.style.display = 'none'; // Hide loader after displaying photos

      currentIndex += count;
      if (currentIndex >= imagesPerPage) {
        currentIndex = 0;
        currentPage++;
      }
    } catch (error) {
      console.error(`Error fetching photos: ${error.message}`);
    }
  };
}

const renderImages = createImageLoader();

// Initial fetch of images
renderImages(5);

// Event listener for infinite scrolling
window.onscroll = function() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    renderImages(5);
  }
};
