import "./styles/style.scss";

const imageContainer = document.querySelector("#image-container");
const loader = document.querySelector(".loader");

/**
 * Creates an Unsplash client for fetching photos.
 * @param {number} user - The user ID for the Unsplash collection.
 * @returns {Function} - A function that fetches photos from the Unsplash API.
 */
function createUnsplashClient(user) {
  const apiKey = import.meta.env.VITE_ACCESS_KEY;

  /**
   * Fetches photos from the Unsplash API.
   * @param {number} count - Number of photos to fetch.
   * @param {number} page - The page number to fetch.
   * @returns {Promise<Object[]>} - A promise that resolves to an array of photo objects.
   */
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

/**
 * Adjusts the layout of an image in the grid based on its aspect ratio.
 * @param {HTMLElement} figure - The figure element containing the image.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 */
function handleGridLayout(figure, width, height) {
  const aspectRatio = height / width;

  if (aspectRatio > 1.1) {
    figure.classList.add("row-span"); // Vertical (Portrait) images
  } else if (aspectRatio < 0.67) {
    figure.classList.add("column-span"); // Horizontal (Landscape) images
  }
}

/**
 * Creates a figure element for a photo.
 * @param {Object} photo - The photo object.
 * @param {string} photo.alt_description - The alt description of the photo.
 * @param {number} photo.width - The width of the photo.
 * @param {number} photo.height - The height of the photo.
 * @param {Object} photo.urls - The URLs of the photo.
 * @param {string} photo.urls.regular - The regular URL of the photo.
 * @param {string} photo.urls.small - The small URL of the photo.
 * @returns {HTMLElement} - The created figure element.
 */
function createFigureElement(photo) {
  const {
    alt_description,
    width,
    height,
    urls: { regular, small },
  } = photo;

  const imageUrl = window.innerWidth < 768 ? small : regular;

  const figure = document.createElement("figure");
  figure.setAttribute("class", "gallery__item");
  handleGridLayout(figure, width, height);
  figure.innerHTML = `<img src="${imageUrl}" alt="${alt_description}" width="${width}" height="${height}"/>`;
  return figure;
}

/**
 * Displays a list of photos in the image container.
 * @param {Object[]} photos - An array of photo objects to display.
 */
function displayPhotos(photos) {
  // Create fragment to minimize the number of reflows and repaints
  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    const figure = createFigureElement(photo);
    fragment.appendChild(figure);
  });

  imageContainer.appendChild(fragment);
}

/**
 * Creates an image loader function that fetches and displays images.
 * @returns {Function} - A function to fetch and display images.
 */
function createImageLoader() {
  let currentPage = 1;
  let currentIndex = 0;
  const imagesPerPage = 30;

  /**
   * Fetches and displays a specific number of images.
   * @param {number} count - The number of images to fetch and display.
   * @returns {Promise<void>}
   */
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

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
    console.log('scrolled')
    renderImages(5);
}})
