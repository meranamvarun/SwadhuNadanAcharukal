// Transparent-to-dark scroll effect on the sticky header
const siteHeader = document.getElementById("site-header");
if (siteHeader) {
  const onHeaderScroll = () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 60);
  };
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();
}

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

  const closeMenu = () => setMenuState(false);

  navToggle.addEventListener("click", () => {
    const nextOpenState = !mainNav.classList.contains("is-open");
    setMenuState(nextOpenState);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!mainNav.classList.contains("is-open") || !isMobileViewport()) return;
    if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) closeMenu();
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
const productDetailPages = {
  "Mango Pickle": "mango-pickle-kerala.html",
  "Lemon Pickle": "lemon-pickle-kerala.html",
  "Gooseberry Pickle": "gooseberry-pickle-kerala.html",
  "Fish Pickle": "fish-pickle-kerala.html",
  "Beef Pickle": "beef-pickle-kerala.html",
};

function trackAnalyticsEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, eventParams);
}

function setupCtaClickTracking() {
  const selector = [
    ".hero-cta", ".home-shop-link", ".cta-button", ".btn-whatsapp", "button[type='submit']",
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

    if (documentHeight <= 0) return;

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
  if (!productCards.length || typeof window.IntersectionObserver !== "function") return;

  const viewedProducts = new Set();
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const productName = entry.target.dataset.productName || "unknown";
        if (viewedProducts.has(productName)) { currentObserver.unobserve(entry.target); return; }
        viewedProducts.add(productName);
        trackAnalyticsEvent("view_item", { item_name: productName, page_path: window.location.pathname });
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  productCards.forEach((card) => observer.observe(card));
}

function generateOrderId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `SWA-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${pad(Math.floor(Math.random()*100))}`;
}

function buildOrderMessage(orderId, productName, size, quantity, totalProductCost) {
  const numericQuantity = Number(quantity);
  const bottleLabel = numericQuantity === 1 ? "bottle" : "bottles";
  const cost = Number.isFinite(totalProductCost) ? totalProductCost : 0;

  return [
    "Dear Swadhu Nadan Acharukal Team,",
    "",
    "I would like to place the following order:",
    `• Order ID: ${orderId}`,
    `• Product: ${productName}`,
    `• Size: ${size}`,
    `• Quantity: ${numericQuantity} ${bottleLabel}`,
    `• Total Product Cost: ₹${cost}`,
    "",
    "Please share delivery details and confirmation. Thank you.",
    "നന്ദി.",
  ].join("\n");
}

function getSelectedProductUnitPrice(productName, size) {
  const inventory = window.SKU_INVENTORY;
  if (!inventory || !Array.isArray(inventory.items)) return 0;
  const productItem = inventory.items.find((item) => item.productName === productName);
  if (!productItem || !productItem.prices) return 0;
  return Number(productItem.prices[size]) || 0;
}

function attachWhatsAppButtonListeners() {
  document.querySelectorAll(".btn-whatsapp").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.dataset.product || "Pickle";
      const sizeSelect = button.dataset.sizeSelect ? document.getElementById(button.dataset.sizeSelect) : null;
      const size = sizeSelect ? sizeSelect.value : "100g";
      const quantitySelect = button.dataset.quantitySelect ? document.getElementById(button.dataset.quantitySelect) : null;
      const quantity = quantitySelect ? quantitySelect.value : "1";
      const orderId = generateOrderId();
      const unitPrice = getSelectedProductUnitPrice(product, size);
      const totalProductCost = unitPrice * Number(quantity);
      const message = buildOrderMessage(orderId, product, size, quantity, totalProductCost);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatPriceMap(prices, weights) {
  return weights.map((w) => (prices[w] ? `${w}: ₹${prices[w]}` : `${w}: N/A`)).join(" | ");
}

function renderProductCardsFromInventory(gridSelector = "#product-grid", maxItems) {
  const productGrid = document.querySelector(gridSelector);
  const inventory = window.SKU_INVENTORY;
  if (!productGrid || !inventory || !Array.isArray(inventory.items)) return;

  const itemsToRender = typeof maxItems === "number" ? inventory.items.slice(0, maxItems) : inventory.items;
  const shouldShowKnowMore = gridSelector === "#product-grid";

  productGrid.innerHTML = itemsToRender.map((item) => {
    const slug = slugify(item.productName);
    const sizeSelectId = `size-${slug}`;
    const quantitySelectId = `qty-${slug}`;
    const weightOptions = item.weightCategories.map((w) => `<option value="${w}">${w}</option>`).join("");
    const quantityOptions = item.availableQuantities.map((qty) => {
      return `<option value="${qty}">${qty} ${qty === 1 ? "bottle" : "bottles"}</option>`;
    }).join("");
    const detailPage = productDetailPages[item.productName];
    const knowMoreMarkup = shouldShowKnowMore && detailPage
      ? `<a class="know-more-link" href="${detailPage}">Know More</a>` : "";

    return `
      <article class="product-card" data-product-name="${item.productName}">
        <img src="${item.displayPhoto}" alt="${item.productName}" />
        <h3>${item.productName}</h3>
        <p class="sizes">Price: <span>${formatPriceMap(item.prices, item.weightCategories)}</span></p>
        <label class="size-select-label" for="${sizeSelectId}">Choose size</label>
        <select id="${sizeSelectId}" class="size-select" aria-label="Choose size for ${item.productName}">${weightOptions}</select>
        <label class="size-select-label" for="${quantitySelectId}">Number of bottles</label>
        <select id="${quantitySelectId}" class="size-select" aria-label="Choose number of bottles for ${item.productName}">${quantityOptions}</select>
        <button class="order-button btn-whatsapp" type="button" data-product="${item.productName}" data-size-select="${sizeSelectId}" data-quantity-select="${quantitySelectId}">
          Order on WhatsApp
        </button>
        ${knowMoreMarkup}
      </article>
    `;
  }).join("");
}

renderProductCardsFromInventory();
renderProductCardsFromInventory("#product-grid-home");
attachWhatsAppButtonListeners();
setupCtaClickTracking();
setupScrollDepthTracking();
setupProductViewTracking();

const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Image slider
const sliderShell = document.querySelector(".intro-slider-shell");
if (sliderShell) {
  const sliderTrack = sliderShell.querySelector(".intro-slider-track");
  const slides = Array.from(sliderShell.querySelectorAll(".intro-slide"));
  const prevButton = sliderShell.querySelector(".intro-slider-prev");
  const nextButton = sliderShell.querySelector(".intro-slider-next");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (sliderTrack && prevButton && nextButton) {
    let currentIndex = 0, autoSlideTimer, touchStartX = 0, pointerStartX = null;

    const renderSlide = (i) => { sliderTrack.style.transform = `translate3d(-${i * 100}%, 0, 0)`; };
    const updateControls = () => { const m = slides.length > 1; prevButton.disabled = !m; nextButton.disabled = !m; };
    const goToSlide = (i) => {
      if (!slides.length) return;
      currentIndex = i < 0 ? slides.length - 1 : i >= slides.length ? 0 : i;
      renderSlide(currentIndex);
    };
    const restartAutoSlide = () => {
      window.clearInterval(autoSlideTimer);
      if (prefersReducedMotion || slides.length < 2) return;
      autoSlideTimer = window.setInterval(() => goToSlide(currentIndex + 1), 4500);
    };

    prevButton.addEventListener("click", () => { goToSlide(currentIndex - 1); restartAutoSlide(); });
    nextButton.addEventListener("click", () => { goToSlide(currentIndex + 1); restartAutoSlide(); });

    sliderShell.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goToSlide(currentIndex - 1); restartAutoSlide(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToSlide(currentIndex + 1); restartAutoSlide(); }
    });

    sliderShell.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    sliderShell.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      goToSlide(dx > 0 ? currentIndex - 1 : currentIndex + 1);
      restartAutoSlide();
    }, { passive: true });

    if (window.PointerEvent) {
      sliderShell.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
        pointerStartX = e.clientX;
      });
      sliderShell.addEventListener("pointerup", (e) => {
        if (pointerStartX === null) return;
        const dx = e.clientX - pointerStartX;
        pointerStartX = null;
        if (Math.abs(dx) < 40) return;
        goToSlide(dx > 0 ? currentIndex - 1 : currentIndex + 1);
        restartAutoSlide();
      });
      sliderShell.addEventListener("pointercancel", () => { pointerStartX = null; });
    }

    updateControls();
    goToSlide(0);
    restartAutoSlide();
  }
}
