const whatsappNumber = "919495972251";

function buildOrderMessage(productName, sizes) {
  return [
    "Hello Swadhu Nadan Acharukal,",
    `I would like to order *${productName}*.`,
    `Available sizes: ${sizes}.`,
    "Please share price and delivery details.",
  ].join("\n");
}

document.querySelectorAll(".btn-whatsapp").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const sizes = button.dataset.sizes;
    const message = buildOrderMessage(product, sizes);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
});

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
