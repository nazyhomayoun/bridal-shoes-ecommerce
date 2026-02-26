(() => {
  const CART_ITEMS_KEY = "sea_cart_items";
  const FAV_ITEMS_KEY = "sea_fav_items";
  const DISCOUNT_KEY = "sea_cart_discount";

  const initYear = () => {
    document.querySelectorAll(".js-year").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  const initMobileMenu = () => {
    const toggle = document.querySelector(".js-menu-toggle");
    const nav = document.querySelector(".js-main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  };

  const initWhatsAppFab = () => {
    if (document.querySelector(".js-whatsapp-fab")) return;
    const supportNumber = "989121234567";
    const text = encodeURIComponent("سلام، برای مشاوره خرید کفش عروس پیام می‌دهم.");
    const link = document.createElement("a");
    link.className = "whatsapp-fab js-whatsapp-fab";
    link.href = `https://wa.me/${supportNumber}?text=${text}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.ariaLabel = "چت آنلاین پشتیبانی در واتساپ";
    link.title = "پشتیبانی آنلاین";
    link.innerHTML = `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M19.11 17.29c-.27-.14-1.58-.78-1.82-.87-.24-.09-.42-.14-.6.13-.18.27-.69.87-.85 1.04-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.35-.8-.71-1.33-1.59-1.49-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.21-.5-.43-.43-.6-.44h-.51c-.18 0-.47.07-.71.34-.24.27-.91.89-.91 2.16s.93 2.49 1.06 2.67c.13.18 1.83 2.79 4.44 3.92.62.27 1.11.43 1.49.55.63.2 1.21.17 1.67.1.51-.08 1.58-.64 1.8-1.26.22-.62.22-1.15.15-1.26-.07-.11-.24-.18-.51-.31z"></path>
        <path d="M16.03 3.2c-6.98 0-12.63 5.64-12.63 12.6 0 2.22.58 4.4 1.69 6.33L3 29.4l7.44-1.94a12.7 12.7 0 0 0 5.59 1.33h.01c6.97 0 12.63-5.64 12.63-12.6S23.01 3.2 16.03 3.2zm0 23.44h-.01a10.78 10.78 0 0 1-5.49-1.5l-.39-.23-4.42 1.15 1.18-4.3-.25-.44a10.47 10.47 0 0 1-1.61-5.57c0-5.8 4.74-10.52 10.57-10.52 2.82 0 5.47 1.09 7.46 3.08a10.45 10.45 0 0 1 3.09 7.44c0 5.8-4.74 10.52-10.57 10.52z"></path>
      </svg>
    `;
    document.body.appendChild(link);
  };

  const safeParse = (value, fallback) => {
    try {
      const parsed = JSON.parse(value || "");
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const normalizeId = (value) =>
    String(value || "item")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-\u0600-\u06FF]/g, "") || "item";

  const extractNumber = (text) => Number(String(text || "").replace(/[^0-9]/g, "")) || 0;

  const toPrice = (value) => Number(value || 0) || 0;

  const formatPrice = (value) => `${Number(value).toLocaleString("en-US")} تومان`;

  const getCartItems = () => {
    const items = safeParse(localStorage.getItem(CART_ITEMS_KEY), []);
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && item.id)
      .map((item) => ({ ...item, qty: Math.max(1, Number(item.qty) || 1), price: toPrice(item.price) }));
  };

  const setCartItems = (items) => {
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
  };

  const getFavItems = () => {
    const items = safeParse(localStorage.getItem(FAV_ITEMS_KEY), []);
    if (!Array.isArray(items)) return [];
    return items.filter((item) => item && item.id).map((item) => ({ ...item, price: toPrice(item.price) }));
  };

  const setFavItems = (items) => {
    localStorage.setItem(FAV_ITEMS_KEY, JSON.stringify(items));
  };

  const getCartCount = () => getCartItems().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  const getFavCount = () => getFavItems().length;

  const renderHeaderCounts = () => {
    const cart = getCartCount();
    const fav = getFavCount();
    document.querySelectorAll(".js-cart-count").forEach((el) => {
      el.textContent = String(cart);
    });
    document.querySelectorAll(".js-fav-count").forEach((el) => {
      el.textContent = String(fav);
    });
  };

  const flashButton = (btn, doneText = "✓", duration = 850) => {
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = doneText;
    setTimeout(() => {
      btn.textContent = prev;
    }, duration);
  };

  const getProductDataFromElement = (element) => {
    const card = element?.closest(".product-card");
    if (card) {
      const title = card.querySelector("h3 a, h3")?.textContent?.trim() || "کفش عروس";
      const price = toPrice(card.dataset.price || extractNumber(card.querySelector(".price")?.textContent));
      const image = card.querySelector(".primary-image")?.getAttribute("src") || "";
      const meta = card.querySelector(".meta")?.textContent?.trim() || "";
      const id = card.dataset.productId || `${normalizeId(title)}-${price}`;
      return { id, title, price, image, meta };
    }

    const productTitle = document.querySelector(".product-info h1")?.textContent?.trim();
    const productPrice = extractNumber(document.querySelector(".price.large, .price")?.textContent);
    const productImage = document.querySelector("#main-product-image")?.getAttribute("src") || "";
    if (productTitle) {
      return {
        id: `${normalizeId(productTitle)}-${productPrice}`,
        title: productTitle,
        price: toPrice(productPrice),
        image: productImage,
        meta: "",
      };
    }

    return {
      id: `general-${Date.now()}`,
      title: "محصول انتخابی",
      price: 0,
      image: "",
      meta: "",
    };
  };

  const addCartItem = (item, qty = 1) => {
    if (!item?.id) return;
    const amount = Math.max(1, Number(qty) || 1);
    const items = getCartItems();
    const existing = items.find((entry) => entry.id === item.id);
    if (existing) {
      existing.qty += amount;
    } else {
      items.push({ ...item, qty: amount });
    }
    setCartItems(items);
    renderHeaderCounts();
    document.dispatchEvent(new Event("cart-items-changed"));
  };

  const changeCartItemQty = (id, delta) => {
    const items = getCartItems();
    const target = items.find((item) => item.id === id);
    if (!target) return;

    target.qty += Number(delta) || 0;
    const nextItems = items.filter((item) => item.qty > 0);
    setCartItems(nextItems);
    renderHeaderCounts();
    document.dispatchEvent(new Event("cart-items-changed"));
  };

  const removeCartItem = (id) => {
    const items = getCartItems().filter((item) => item.id !== id);
    setCartItems(items);
    renderHeaderCounts();
    document.dispatchEvent(new Event("cart-items-changed"));
  };

  const isFavorite = (id) => getFavItems().some((item) => item.id === id);

  const addFavItem = (item) => {
    if (!item?.id) return;
    const items = getFavItems();
    if (items.some((entry) => entry.id === item.id)) return;
    items.push({ ...item });
    setFavItems(items);
    renderHeaderCounts();
    document.dispatchEvent(new Event("favorites-changed"));
  };

  const removeFavItem = (id) => {
    const items = getFavItems().filter((item) => item.id !== id);
    setFavItems(items);
    renderHeaderCounts();
    document.dispatchEvent(new Event("favorites-changed"));
  };

  const updateFavButtonVisual = (btn, active) => {
    btn.classList.toggle("active", active);
    btn.textContent = active ? "♥" : "♡";
    btn.setAttribute("aria-pressed", String(active));
  };

  const initCartButtons = () => {
    document.querySelectorAll(".js-add-to-cart, .js-card-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = getProductDataFromElement(btn);
        addCartItem(item, 1);
        flashButton(btn);
      });
    });
  };

  const initThumbQuickAdd = () => {
    document.querySelectorAll(".js-thumb-add-cart").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = trigger.getAttribute("data-added-to-cart") === "true";
        if (added) {
          window.location.href = "cart.html";
          return;
        }
        const item = getProductDataFromElement(trigger);
        addCartItem(item, 1);
        trigger.setAttribute("data-added-to-cart", "true");
        trigger.textContent = "مشاهده سبد خرید";
      });
    });
  };

  const initHoverCartControls = () => {
    const categoryCards = document.querySelectorAll("#category-grid .product-card");
    if (!categoryCards.length) return;

    const itemByControl = new WeakMap();

    const renderControl = (el, qty) => {
      el.classList.remove("has-qty");
      if (qty > 0) {
        el.textContent = "مشاهده سبد خرید";
        el.setAttribute("data-added-to-cart", "true");
        return;
      }
      el.textContent = "افزودن به سبد خرید";
      el.setAttribute("data-added-to-cart", "false");
    };

    const getItemQty = (id) => {
      const item = getCartItems().find((entry) => entry.id === id);
      return item ? item.qty : 0;
    };

    categoryCards.forEach((card) => {
      const thumb = card.querySelector(".product-thumb");
      const oldBtn = card.querySelector(".js-card-cart");
      let control = card.querySelector(".js-hover-cart");
      if (!thumb) return;

      if (!control) {
        control = document.createElement("button");
        control.type = "button";
        control.className = "hover-cart-bar js-hover-cart";
        thumb.appendChild(control);
      }

      if (oldBtn) oldBtn.style.display = "none";
      const item = getProductDataFromElement(card);
      itemByControl.set(control, item);
      renderControl(control, getItemQty(item.id));

      control.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentItem = itemByControl.get(control);
        if (!currentItem) return;
        const added = control.getAttribute("data-added-to-cart") === "true";
        if (added) {
          window.location.href = "cart.html";
          return;
        }
        addCartItem(currentItem, 1);
        renderControl(control, getItemQty(currentItem.id));
      });
    });

    document.addEventListener("cart-items-changed", () => {
      document.querySelectorAll(".js-hover-cart").forEach((control) => {
        const item = itemByControl.get(control);
        if (!item) return;
        renderControl(control, getItemQty(item.id));
      });
    });
  };

  const initFavorites = () => {
    document.querySelectorAll(".js-fav-btn").forEach((btn) => {
      const item = getProductDataFromElement(btn);
      updateFavButtonVisual(btn, isFavorite(item.id));

      btn.addEventListener("click", () => {
        const active = btn.getAttribute("aria-pressed") === "true";
        if (active) {
          removeFavItem(item.id);
          updateFavButtonVisual(btn, false);
        } else {
          addFavItem(item);
          updateFavButtonVisual(btn, true);
        }
      });
    });
  };

  const initWishlistPage = () => {
    const page = document.querySelector("#wishlist-page");
    if (!page) return;

    const list = page.querySelector(".js-wishlist-list");
    const empty = page.querySelector(".js-wishlist-empty");

    if (!list || !empty) return;

    const render = () => {
      const items = getFavItems();
      list.innerHTML = "";
      empty.style.display = items.length ? "none" : "block";

      items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "list-card wishlist-card";
        card.innerHTML = `
          <img src="${item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}" alt="${item.title}" class="list-card-image" />
          <div class="list-card-content">
            <h3>${item.title}</h3>
            <p class="muted">${item.meta || "محصول ذخیره‌شده در علاقه‌مندی‌ها"}</p>
            <p class="price">${formatPrice(item.price)}</p>
          </div>
          <div class="list-card-actions">
            <button type="button" class="btn btn-primary js-wishlist-add" data-id="${item.id}">افزودن به سبد خرید</button>
            <button type="button" class="btn btn-secondary js-wishlist-remove" data-id="${item.id}">حذف</button>
          </div>
        `;
        list.appendChild(card);
      });
    };

    list.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const addBtn = target.closest(".js-wishlist-add");
      if (addBtn instanceof HTMLElement) {
        const id = addBtn.dataset.id || "";
        const item = getFavItems().find((entry) => entry.id === id);
        if (item) {
          addCartItem(item, 1);
          flashButton(addBtn, "✓ اضافه شد");
        }
        return;
      }

      const removeBtn = target.closest(".js-wishlist-remove");
      if (removeBtn instanceof HTMLElement) {
        const id = removeBtn.dataset.id || "";
        if (id) removeFavItem(id);
      }
    });

    document.addEventListener("favorites-changed", render);
    render();
  };

  const initCartPage = () => {
    const page = document.querySelector("#cart-page");
    if (!page) return;

    const list = page.querySelector(".js-cart-list");
    const empty = page.querySelector(".js-cart-empty");
    const summary = page.querySelector(".js-cart-summary");
    const subtotalEl = page.querySelector(".js-cart-subtotal");
    const shippingEl = page.querySelector(".js-cart-shipping");
    const discountEl = page.querySelector(".js-cart-discount");
    const totalEl = page.querySelector(".js-cart-total");
    const discountInput = page.querySelector(".js-discount-code");
    const discountButton = page.querySelector(".js-apply-discount");
    const discountMessage = page.querySelector(".js-discount-message");

    if (!list || !empty || !summary) return;

    let discountPercent = Math.max(0, Number(localStorage.getItem(DISCOUNT_KEY) || 0));

    const render = () => {
      const items = getCartItems();
      list.innerHTML = "";

      const hasItems = items.length > 0;
      empty.style.display = hasItems ? "none" : "block";
      summary.style.display = hasItems ? "block" : "none";

      items.forEach((item) => {
        const row = document.createElement("article");
        row.className = "list-card cart-card";
        row.innerHTML = `
          <img src="${item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}" alt="${item.title}" class="list-card-image" />
          <div class="list-card-content">
            <h3>${item.title}</h3>
            <p class="muted">${item.meta || "آیتم انتخابی"}</p>
            <p class="price">${formatPrice(item.price)}</p>
          </div>
          <div class="list-card-actions">
            <div class="qty-inline">
              <button type="button" class="icon-btn js-cart-plus" data-id="${item.id}" aria-label="افزایش تعداد">+</button>
              <span>${item.qty}</span>
              <button type="button" class="icon-btn js-cart-minus" data-id="${item.id}" aria-label="کاهش تعداد">-</button>
            </div>
            <button type="button" class="btn btn-secondary js-cart-remove" data-id="${item.id}">حذف</button>
          </div>
        `;
        list.appendChild(row);
      });

      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping = subtotal > 0 ? 120000 : 0;
      const discount = Math.round((subtotal * discountPercent) / 100);
      const total = Math.max(0, subtotal + shipping - discount);

      if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
      if (shippingEl) shippingEl.textContent = formatPrice(shipping);
      if (discountEl) discountEl.textContent = `${formatPrice(discount)} (${discountPercent}%)`;
      if (totalEl) totalEl.textContent = formatPrice(total);
    };

    list.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const plus = target.closest(".js-cart-plus");
      if (plus instanceof HTMLElement) {
        const id = plus.dataset.id || "";
        if (id) changeCartItemQty(id, 1);
        return;
      }

      const minus = target.closest(".js-cart-minus");
      if (minus instanceof HTMLElement) {
        const id = minus.dataset.id || "";
        if (id) changeCartItemQty(id, -1);
        return;
      }

      const remove = target.closest(".js-cart-remove");
      if (remove instanceof HTMLElement) {
        const id = remove.dataset.id || "";
        if (id) removeCartItem(id);
      }
    });

    discountButton?.addEventListener("click", () => {
      const code = String(discountInput?.value || "").trim().toUpperCase();
      if (code === "SEA10") {
        discountPercent = 10;
        if (discountMessage) discountMessage.textContent = "کد تخفیف 10% اعمال شد.";
      } else if (code === "BRIDE20") {
        discountPercent = 20;
        if (discountMessage) discountMessage.textContent = "کد تخفیف 20% اعمال شد.";
      } else {
        discountPercent = 0;
        if (discountMessage) discountMessage.textContent = "کد معتبر نیست.";
      }

      localStorage.setItem(DISCOUNT_KEY, String(discountPercent));
      render();
    });

    document.addEventListener("cart-items-changed", render);
    render();
  };

  const initProductGallery = () => {
    const mainImage = document.querySelector("#main-product-image");
    const thumbs = document.querySelectorAll(".thumb");
    if (!mainImage || !thumbs.length) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.getAttribute("data-image");
        if (!src) return;
        mainImage.setAttribute("src", src);
        thumbs.forEach((item) => item.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  };

  const initCardSwatches = () => {
    document.querySelectorAll(".product-card").forEach((card) => {
      const primaryImage = card.querySelector(".primary-image");
      const hoverImage = card.querySelector(".hover-image");
      const swatches = card.querySelectorAll(".js-swatch");
      if (!primaryImage || !swatches.length) return;

      swatches.forEach((swatch) => {
        swatch.addEventListener("click", () => {
          const image = swatch.getAttribute("data-image");
          if (!image) return;
          primaryImage.setAttribute("src", image);
          if (hoverImage) hoverImage.setAttribute("src", image);
          swatches.forEach((s) => s.classList.remove("active"));
          swatch.classList.add("active");
        });
      });
    });
  };

  const initSizeToggle = () => {
    const button = document.querySelector(".js-size-toggle");
    const extra = document.querySelector(".js-size-extra");
    if (!button || !extra) return;

    button.addEventListener("click", () => {
      const open = extra.classList.toggle("open");
      button.textContent = open ? "بستن سایزها" : "بیشتر...";
    });
  };

  const initCategoryFilters = () => {
    const grid = document.querySelector("#category-grid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".product-card"));
    const minPriceRange = document.querySelector("#min-price");
    const maxPriceRange = document.querySelector("#max-price");
    const minPriceLabel = document.querySelector("#min-price-label");
    const maxPriceLabel = document.querySelector("#max-price-label");
    const progress = document.querySelector(".js-price-progress");

    const sizeInputs = Array.from(document.querySelectorAll('input[name="size"]'));
    const heelInputs = Array.from(document.querySelectorAll('input[name="heel"]'));
    const colorInputs = Array.from(document.querySelectorAll('input[name="color"]'));
    const typeInputs = Array.from(document.querySelectorAll('input[name="type"]'));

    const applyButton = document.querySelector("#apply-filters");
    const resultsCount = document.querySelector("#results-count");
    const pagination = document.querySelector(".js-pagination");
    let noResults = document.querySelector(".js-no-results");

    if (!minPriceRange || !maxPriceRange) return;

    const minBound = Number(minPriceRange.min);
    const maxBound = Number(minPriceRange.max);
    const minGap = 150000;
    const pageSize = 8;

    let currentPage = 1;
    let filteredCards = cards;

    if (!noResults) {
      noResults = document.createElement("p");
      noResults.className = "no-results js-no-results";
      noResults.textContent = "هیچ محصولی یافت نشد...";
      grid.insertAdjacentElement("afterend", noResults);
    }

    const updatePriceUI = (source) => {
      let min = Number(minPriceRange.value);
      let max = Number(maxPriceRange.value);

      if (max - min < minGap) {
        if (source === "min") {
          min = max - minGap;
          minPriceRange.value = String(min);
        } else {
          max = min + minGap;
          maxPriceRange.value = String(max);
        }
      }

      if (minPriceLabel) minPriceLabel.textContent = formatPrice(min);
      if (maxPriceLabel) maxPriceLabel.textContent = formatPrice(max);

      if (progress) {
        const left = ((min - minBound) / (maxBound - minBound)) * 100;
        const right = ((maxBound - max) / (maxBound - minBound)) * 100;
        progress.style.left = `${left}%`;
        progress.style.right = `${right}%`;
      }
    };

    const updateResults = () => {
      const hasResults = filteredCards.length > 0;
      const totalPages = hasResults ? Math.ceil(filteredCards.length / pageSize) : 0;
      if (hasResults && currentPage > totalPages) currentPage = totalPages;

      cards.forEach((card) => {
        card.style.display = "none";
      });

      if (hasResults) {
        const start = (currentPage - 1) * pageSize;
        filteredCards.slice(start, start + pageSize).forEach((card) => {
          card.style.display = "block";
        });
      }

      if (resultsCount) resultsCount.textContent = `${filteredCards.length} محصول`;
      if (noResults) noResults.style.display = hasResults ? "none" : "block";

      if (!pagination) return;
      pagination.innerHTML = "";
      if (!hasResults) return;
      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `page-btn${page === currentPage ? " active" : ""}`;
        button.textContent = String(page);
        button.addEventListener("click", () => {
          currentPage = page;
          updateResults();
        });
        pagination.appendChild(button);
      }
    };

    const applyFilters = () => {
      const min = Number(minPriceRange.value);
      const max = Number(maxPriceRange.value);
      const sizes = sizeInputs.filter((input) => input.checked).map((input) => input.value);
      const heels = heelInputs.filter((input) => input.checked).map((input) => input.value);
      const colors = colorInputs.filter((input) => input.checked).map((input) => input.value);
      const types = typeInputs.filter((input) => input.checked).map((input) => input.value);

      const rawFiltered = cards.filter((card) => {
        const price = Number(card.dataset.price || 0);
        const size = card.dataset.size || "";
        const heel = card.dataset.heel || "";
        const color = card.dataset.color || "";
        const type = card.dataset.type || "";

        return (
          price >= min &&
          price <= max &&
          (!sizes.length || sizes.includes(size)) &&
          (!heels.length || heels.includes(heel)) &&
          (!colors.length || colors.includes(color)) &&
          (types.length > 0 && types.includes(type))
        );
      });

      filteredCards = rawFiltered;
      currentPage = 1;
      updateResults();
    };

    minPriceRange.addEventListener("input", () => {
      updatePriceUI("min");
      applyFilters();
    });

    maxPriceRange.addEventListener("input", () => {
      updatePriceUI("max");
      applyFilters();
    });

    applyButton?.addEventListener("click", applyFilters);

    [...sizeInputs, ...heelInputs, ...colorInputs, ...typeInputs].forEach((input) => {
      input.addEventListener("change", applyFilters);
    });

    updatePriceUI("min");
    applyFilters();
  };

  initYear();
  initMobileMenu();
  initWhatsAppFab();
  renderHeaderCounts();
  initCartButtons();
  initThumbQuickAdd();
  initHoverCartControls();
  initFavorites();
  initWishlistPage();
  initCartPage();
  initProductGallery();
  initCardSwatches();
  initSizeToggle();
  initCategoryFilters();
})();
