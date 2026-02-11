const whatsappNumber = "919495972251";

function buildOrderMessage(productName, size, sizes) {
  return [
    "Hello Swadhu Nadan Acharukal,",
    `I would like to order *${productName}* (${size}).`,
    `Available sizes: ${sizes}.`,
    "Please share price and delivery details.",
  ].join("\n");
}

document.querySelectorAll(".btn-whatsapp").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product || "Pickle";
    const sizeSelectId = button.dataset.sizeSelect;
    const sizeSelect = sizeSelectId ? document.getElementById(sizeSelectId) : null;
    const size = sizeSelect ? sizeSelect.value : "100g";
    const sizes = "100g, 250g, 500g";
    const message = buildOrderMessage(product, size, sizes);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
});

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const sliderShell = document.querySelector(".intro-slider-shell");
if (sliderShell) {
  const sliderTrack = sliderShell.querySelector(".intro-slider-track");
  const slides = Array.from(sliderShell.querySelectorAll(".intro-slide"));
  const prevButton = sliderShell.querySelector(".intro-slider-prev");
  const nextButton = sliderShell.querySelector(".intro-slider-next");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;
  let autoSlideTimer;

  const renderSlide = (index) => {
    sliderTrack.style.transform = `translateX(-${index * 100}%)`;
  };

  const updateControls = () => {
    const hasMultipleSlides = slides.length > 1;
    prevButton.disabled = !hasMultipleSlides;
    nextButton.disabled = !hasMultipleSlides;
  };

  const goToSlide = (index) => {
    if (slides.length === 0) {
      return;
    }

    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    renderSlide(currentIndex);
  };

  const restartAutoSlide = () => {
    window.clearInterval(autoSlideTimer);

    if (prefersReducedMotion || slides.length < 2) {
      return;
    }

    autoSlideTimer = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  };

  prevButton.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    restartAutoSlide();
  });

  nextButton.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    restartAutoSlide();
  });

  sliderShell.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
      restartAutoSlide();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
      restartAutoSlide();
    }
  });

  updateControls();
  goToSlide(0);
  restartAutoSlide();
}
