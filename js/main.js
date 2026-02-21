const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  document.body.classList.add("js-enabled");

  const isMobileViewport = () => window.matchMedia("(max-width: 640px)").matches;

  const setMenuState = (isOpen) => {
    mainNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", Boolean(isOpen && isMobileViewport()));
  };

  const closeMenu = () => {
    setMenuState(false);
  };

  navToggle.addEventListener("click", () => {
    const nextOpenState = !mainNav.classList.contains("is-open");
    setMenuState(nextOpenState);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!mainNav.classList.contains("is-open") || !isMobileViewport()) {
      return;
    }

    if (mainNav.contains(event.target) || navToggle.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      closeMenu();
    } else {
      document.body.classList.toggle("menu-open", mainNav.classList.contains("is-open"));
    }
  });
}

const whatsappNumber = "919495972251";

function trackAnalyticsEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, eventParams);
}

function setupCtaClickTracking() {
  const selector = [
    ".hero-cta",
    ".home-shop-link",
    ".cta-button",
    ".btn-whatsapp",
    "button[type='submit']",
  ].join(",");

  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => {
      const label =
        element.dataset.product ||
        element.textContent?.trim() ||
        element.getAttribute("aria-label") ||
        "unknown";

      trackAnalyticsEvent("cta_click", {
        cta_label: label,
        cta_destination: element.getAttribute("href") || "in-page",
        page_path: window.location.pathname,
      });
    });
  });
}

function setupScrollDepthTracking() {
  const milestones = [25, 50, 75, 100];
  const firedMilestones = new Set();

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const documentHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (documentHeight <= 0) {
      return;
    }

    const depth = Math.round((scrollTop / documentHeight) * 100);

    milestones.forEach((milestone) => {
      if (depth >= milestone && !firedMilestones.has(milestone)) {
        firedMilestones.add(milestone);
        trackAnalyticsEvent("scroll_depth", {
          scroll_depth_percent: milestone,
          page_path: window.location.pathname,
        });
      }
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupProductViewTracking() {
  const productCards = document.querySelectorAll(".product-card");

  if (!productCards.length || typeof window.IntersectionObserver !== "function") {
    return;
  }

  const viewedProducts = new Set();
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const productName = entry.target.dataset.productName || "unknown";

        if (viewedProducts.has(productName)) {
          currentObserver.unobserve(entry.target);
          return;
        }

        viewedProducts.add(productName);
        trackAnalyticsEvent("view_item", {
          item_name: productName,
          page_path: window.location.pathname,
        });
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  productCards.forEach((card) => {
    observer.observe(card);
  });
}

function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, "0");

  return `SWA-${year}${month}${day}-${hours}${minutes}${seconds}-${randomSuffix}`;
}

function buildOrderMessage(orderId, productName, size, quantity, totalProductCost) {
  const numericQuantity = Number(quantity);
  const bottleLabel = numericQuantity === 1 ? "bottle" : "bottles";
  const formattedTotalProductCost = Number.isFinite(totalProductCost)
    ? totalProductCost
    : 0;

  return [
    "Dear Swadhu Nadan Acharukal Team,",
    "",
    "I would like to place the following order:",
    `• Order ID: ${orderId}`,
    `• Product: ${productName}`,
    `• Size: ${size}`,
    `• Quantity: ${numericQuantity} ${bottleLabel}`,
    `• Total Product Cost: ₹${formattedTotalProductCost}`,
    "",
    "Please share delivery details and confirmation. Thank you.",
    "നന്ദി.",
  ].join("\n");
}

function getSelectedProductUnitPrice(productName, size) {
  const inventory = window.SKU_INVENTORY;

  if (!inventory || !Array.isArray(inventory.items)) {
    return 0;
  }

  const productItem = inventory.items.find((item) => item.productName === productName);
  if (!productItem || !productItem.prices) {
    return 0;
  }

  const unitPrice = productItem.prices[size];
  return Number(unitPrice) || 0;
}

function attachWhatsAppButtonListeners() {
  document.querySelectorAll(".btn-whatsapp").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.dataset.product || "Pickle";
      const sizeSelectId = button.dataset.sizeSelect;
      const sizeSelect = sizeSelectId ? document.getElementById(sizeSelectId) : null;
      const size = sizeSelect ? sizeSelect.value : "100g";
      const quantitySelectId = button.dataset.quantitySelect;
      const quantitySelect = quantitySelectId ? document.getElementById(quantitySelectId) : null;
      const quantity = quantitySelect ? quantitySelect.value : "1";
      const orderId = generateOrderId();
      const unitPrice = getSelectedProductUnitPrice(product, size);
      const totalProductCost = unitPrice * Number(quantity);
      const message = buildOrderMessage(orderId, product, size, quantity, totalProductCost);
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener");
    });
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatPriceMap(prices, weights) {
  return weights
    .map((weight) => {
      const price = prices[weight];
      return price ? `${weight}: ₹${price}` : `${weight}: N/A`;
    })
    .join(" | ");
}

function renderProductCardsFromInventory(gridSelector = "#product-grid", maxItems) {
  const productGrid = document.querySelector(gridSelector);
  const inventory = window.SKU_INVENTORY;

  if (!productGrid || !inventory || !Array.isArray(inventory.items)) {
    return;
  }

  const itemsToRender = typeof maxItems === "number" ? inventory.items.slice(0, maxItems) : inventory.items;

  const cards = itemsToRender
    .map((item) => {
      const slug = slugify(item.productName);
      const sizeSelectId = `size-${slug}`;
      const quantitySelectId = `qty-${slug}`;
      const weightOptions = item.weightCategories
        .map((weight) => `<option value="${weight}">${weight}</option>`)
        .join("");
      const quantityOptions = item.availableQuantities
        .map((qty) => {
          const bottleLabel = qty === 1 ? "bottle" : "bottles";
          return `<option value="${qty}">${qty} ${bottleLabel}</option>`;
        })
        .join("");

      return `
        <article class="product-card" data-product-name="${item.productName}">
          <img src="${item.displayPhoto}" alt="${item.productName}" />
          <h3>${item.productName}</h3>
          <p class="sizes">Price: <span>${formatPriceMap(item.prices, item.weightCategories)}</span></p>
          <label class="size-select-label" for="${sizeSelectId}">Choose size</label>
          <select id="${sizeSelectId}" class="size-select" aria-label="Choose size for ${item.productName}">
            ${weightOptions}
          </select>
          <label class="size-select-label" for="${quantitySelectId}">Number of bottles</label>
          <select id="${quantitySelectId}" class="size-select" aria-label="Choose number of bottles for ${item.productName}">
            ${quantityOptions}
          </select>
          <button class="order-button btn-whatsapp" type="button" data-product="${item.productName}" data-size-select="${sizeSelectId}" data-quantity-select="${quantitySelectId}">
            Order on WhatsApp
          </button>
        </article>
      `;
    })
    .join("");

  productGrid.innerHTML = cards;
}

renderProductCardsFromInventory();
renderProductCardsFromInventory("#product-grid-home");
attachWhatsAppButtonListeners();
setupCtaClickTracking();
setupScrollDepthTracking();
setupProductViewTracking();

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
    let pointerStartX = null;

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


    if (window.PointerEvent) {
      sliderShell.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "touch" && event.pointerType !== "pen") {
          return;
        }

        pointerStartX = event.clientX;
      });

      sliderShell.addEventListener("pointerup", (event) => {
        if (pointerStartX === null) {
          return;
        }

        const deltaX = event.clientX - pointerStartX;
        pointerStartX = null;

        if (Math.abs(deltaX) < 40) {
          return;
        }

        if (deltaX > 0) {
          goToSlide(currentIndex - 1);
        } else {
          goToSlide(currentIndex + 1);
        }

        restartAutoSlide();
      });

      sliderShell.addEventListener("pointercancel", () => {
        pointerStartX = null;
      });
    }

    updateControls();
    goToSlide(0);
    restartAutoSlide();
  }
}
