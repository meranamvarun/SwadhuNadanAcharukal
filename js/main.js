const whatsappNumber = "919495972251";

function buildOrderMessage(productName, size, quantity) {
  const bottleLabel = quantity === "1" ? "bottle" : "bottles";

  return [
    "Dear Swadhu Nadan Acharukal Team,",
    "",
    "I would like to place the following order:",
    `• Product Type: ${productName}`,
    `• Bottle Size: ${size}`,
    `• Quantity: ${quantity} ${bottleLabel}`,
    "",
    "Kindly share the total price and delivery details.",
    "നന്ദി.",
  ].join("\n");
}

document.querySelectorAll(".btn-whatsapp").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product || "Pickle";
    const sizeSelectId = button.dataset.sizeSelect;
    const sizeSelect = sizeSelectId ? document.getElementById(sizeSelectId) : null;
    const size = sizeSelect ? sizeSelect.value : "100g";
    const quantitySelectId = button.dataset.quantitySelect;
    const quantitySelect = quantitySelectId ? document.getElementById(quantitySelectId) : null;
    const quantity = quantitySelect ? quantitySelect.value : "1";
    const message = buildOrderMessage(product, size, quantity);
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

  if (sliderTrack && prevButton && nextButton) {
    let currentIndex = 0;
    let autoSlideTimer;
    let touchStartX = 0;

    const renderSlide = (index) => {
      sliderTrack.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
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

    sliderShell.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );

    sliderShell.addEventListener(
      "touchend",
      (event) => {
        const deltaX = event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(deltaX) < 40) {
          return;
        }

        if (deltaX > 0) {
          goToSlide(currentIndex - 1);
        } else {
          goToSlide(currentIndex + 1);
        }

        restartAutoSlide();
      },
      { passive: true }
    );

    updateControls();
    goToSlide(0);
    restartAutoSlide();
  }
}
