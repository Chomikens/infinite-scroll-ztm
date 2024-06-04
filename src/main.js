import "./styles/style.scss";

const imageConatiner = document.querySelector("#image-container");
const loader = document.querySelector(".loader");

function createUnsplashClient() {
  const apiKey = import.meta.env.VITE_ACCESS_KEY;

  return async function getPhotos(count = 5, page = 1) {
    const url = `https://api.unsplash.com/collections/8646349/photos/?client_id=${apiKey}&per_page=${count}&page=${page}`;
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

const unsplash = createUnsplashClient();

function displayPhotos(photos) {
    // Create fragment for minimizes the number of reflows and repaints
  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    // Destructuring
    const { alt_description, width, height, urls: { regular }} = photo;

    const figure = document.createElement("figure");
    figure.setAttribute("class", "gallery__item");

    const aspectRatio = height / width;

    if (aspectRatio > 1.1) {
      figure.classList.add('row-span'); // Vertical (Portrait) images
    } else if (aspectRatio < 0.6) {
      figure.classList.add('column-span'); // Horizontal (Landscape) images
    } 
    figure.innerHTML = `<img src="${regular}" alt="${alt_description}"/>`;
    fragment.appendChild(figure);
  });

  imageConatiner.appendChild(fragment);
}

async function renderImages(count) {
    try {
      const photos = await unsplash(count);
      displayPhotos(photos);
    } catch (error) {
      console.error(`Error fetching photos: ${error.message}`);
    }
  }

  renderImages(50);