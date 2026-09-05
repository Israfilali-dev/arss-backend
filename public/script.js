// =======================================
// ARSS ENTERTAINMENT — FRONTEND + ADMIN
// Talks to the Node/Express/PostgreSQL/Cloudinary backend.
// Configure the backend URL via window.API_BASE_URL (set in a <script> tag
// before this file loads — see index.html / admin.html).
// =======================================

const API_BASE = window.API_BASE_URL || "http://localhost:5000/api";

// --- Low-level API helper -----------------------------------------------
// Always sends the httpOnly auth cookie (credentials: "include"). Never
// touches localStorage/sessionStorage for the token — the browser manages
// the cookie itself, so the JS here never even sees it.
async function api(path, { method = "GET", body, isForm = false } = {}) {
  const opts = { method, credentials: "include", headers: {} };

  if (body !== undefined) {
    if (isForm) {
      opts.body = body; // FormData — browser sets the multipart Content-Type
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* no JSON body, fine for some responses */
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// --- UI helpers -----------------------------------------------------------
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  const m = document.getElementById("toastMsg");
  if (!t || !m) return;
  m.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-3");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("opacity-0", "translate-y-3"), 2800);
}

function withLoading(button, label, fn) {
  return async (...args) => {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = label;
    try {
      await fn(...args);
    } catch (err) {
      toast(err.message || "Something went wrong.");
      if (err.status === 401) handleSessionExpired();
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  };
}

// =======================================
// BOOTSTRAP
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("filmsGrid")) loadPublicSite();
  if (document.getElementById("adminLoginSection")) setupAdminPage();
  setupPublicInteractions();
});

// =======================================
// PUBLIC SITE
// =======================================
async function loadPublicSite() {
  const results = await Promise.allSettled([
    api("/hero"),
    api("/about"),
    api("/films"),
    api("/team"),
    api("/gallery"),
    api("/testimonials"),
    api("/services"),
    api("/footer"),
    api("/settings"),
  ]);
  const [hero, about, films, team, gallery, testimonials, services, footer, settings] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null
  );

  if (hero) renderHero(hero);
  if (about) renderAbout(about);
  if (films) renderFilmsPublic(films);
  if (team) renderTeamPublic(team);
  if (gallery) renderGalleryPublic(gallery);
  if (testimonials) renderTestimonialsPublic(testimonials);
  if (services) renderServicesPublic(services);
  if (footer) renderFooterPublic(footer);
  if (settings) renderSettingsPublic(settings);
}

function renderHero(hero) {
  if (hero.headline) {
    const words = hero.headline.trim().split(" ");
    const last = words.pop();
    document.getElementById("heroHeadline").innerHTML =
      `${escapeHtml(words.join(" "))} <span style="color:var(--crimson-bright);">${escapeHtml(last)}</span>`;
  }
  if (hero.subheadline) document.getElementById("heroSubheadline").textContent = hero.subheadline;

  const ctaPrimary = document.getElementById("heroCtaPrimary");
  if (hero.ctaPrimaryText) ctaPrimary.textContent = hero.ctaPrimaryText;
  if (hero.ctaPrimaryLink) ctaPrimary.setAttribute("href", hero.ctaPrimaryLink);

  const ctaSecondary = document.getElementById("heroCtaSecondary");
  if (hero.ctaSecondaryText) ctaSecondary.textContent = hero.ctaSecondaryText;
  if (hero.ctaSecondaryLink) ctaSecondary.setAttribute("href", hero.ctaSecondaryLink);

  document.querySelectorAll('[data-stat="films"]').forEach((el) => hero.statFilms && (el.textContent = hero.statFilms));
  document.querySelectorAll('[data-stat="years"]').forEach((el) => hero.statYears && (el.textContent = hero.statYears));
  document.querySelectorAll('[data-stat="awards"]').forEach((el) => hero.statAwards && (el.textContent = hero.statAwards));

  const tiles = document.querySelectorAll("#heroCollage .collage-tile");
  (hero.heroImages || []).forEach((img, i) => {
    if (tiles[i]) {
      tiles[i].style.backgroundImage = `url("${img.url}")`;
      tiles[i].style.backgroundSize = "cover";
      tiles[i].style.backgroundPosition = "center";
    }
  });
}

function renderAbout(about) {
  document.querySelectorAll('[data-about="heading"]').forEach((el) => about.heading && (el.textContent = about.heading));
  document.querySelectorAll('[data-about="p1"]').forEach((el) => about.paragraph1 && (el.textContent = about.paragraph1));
  document.querySelectorAll('[data-about="p2"]').forEach((el) => about.paragraph2 && (el.textContent = about.paragraph2));
}

function renderFilmsPublic(films) {
  const grid = document.getElementById("filmsGrid");
  if (!grid) return;
  grid.innerHTML = films
    .map(
      (f) => `
      <div class="film-card rounded-sm overflow-hidden">
        <div class="poster-wrap"><img src="${f.posterUrl || "https://via.placeholder.com/300x450/17110f/C9A24B?text=Poster"}" alt="${escapeHtml(f.title)}" loading="lazy"></div>
        <div class="p-5">
          <div class="flex items-center justify-between text-[11px] uppercase tracking-widest text-[var(--gold)] mb-2">
            <span>${escapeHtml(f.category)}</span><span>${escapeHtml(f.year)}</span>
          </div>
          <h3 class="font-display text-lg text-[var(--cream)]">${escapeHtml(f.title)}</h3>
          <p class="text-[var(--muted)] text-sm mt-2 leading-relaxed">${escapeHtml(f.description)}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderTeamPublic(team) {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;
  grid.innerHTML = team
    .map(
      (m) => `
      <div class="team-card rounded-sm overflow-hidden">
        <div class="team-photo"><img src="${m.photoUrl || "https://via.placeholder.com/300/1c1514/C9A24B?text=Team"}" alt="${escapeHtml(m.name)}" loading="lazy"></div>
        <div class="p-4">
          <div class="font-display text-base text-[var(--cream)]">${escapeHtml(m.name)}</div>
          <div class="text-xs uppercase tracking-widest text-[var(--gold)] mt-1">${escapeHtml(m.role)}</div>
          <p class="text-[var(--muted)] text-xs mt-2 leading-relaxed">${escapeHtml(m.bio)}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderGalleryPublic(images) {
  const section = document.getElementById("gallery");
  const grid = document.getElementById("galleryGrid");
  if (!section || !grid) return;
  if (!images.length) return section.classList.add("hidden");
  section.classList.remove("hidden");
  grid.innerHTML = images
    .map(
      (img) => `
      <div class="collage-tile rounded-sm overflow-hidden aspect-square">
        <img src="${img.url}" alt="${escapeHtml(img.caption || "Gallery image")}" loading="lazy" class="w-full h-full object-cover">
      </div>`
    )
    .join("");
}

function renderTestimonialsPublic(items) {
  const section = document.getElementById("testimonials");
  const grid = document.getElementById("testimonialsGrid");
  if (!section || !grid) return;
  if (!items.length) return section.classList.add("hidden");
  section.classList.remove("hidden");
  grid.innerHTML = items
    .map(
      (t) => `
      <div class="film-card p-6 rounded-sm">
        <p class="text-[var(--cream)] text-sm leading-relaxed italic">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
        <div class="mt-5 flex items-center gap-3">
          <img src="${t.photoUrl || "https://via.placeholder.com/80/1c1514/C9A24B?text=%20"}" class="w-10 h-10 rounded-full object-cover" alt="${escapeHtml(t.name)}">
          <div>
            <div class="text-sm text-[var(--cream)]">${escapeHtml(t.name)}</div>
            <div class="text-xs text-[var(--muted)]">${escapeHtml(t.roleOrProject)}</div>
          </div>
        </div>
      </div>`
    )
    .join("");
}

function renderServicesPublic(services) {
  const section = document.getElementById("services");
  const grid = document.getElementById("servicesGrid");
  if (!section || !grid) return;
  if (!services.length) return section.classList.add("hidden");
  section.classList.remove("hidden");
  grid.innerHTML = services
    .map(
      (s) => `
      <div class="team-card p-6 rounded-sm">
        <h3 class="font-display text-lg text-[var(--cream)]">${escapeHtml(s.title)}</h3>
        <p class="text-[var(--muted)] text-sm mt-3 leading-relaxed">${escapeHtml(s.description)}</p>
      </div>`
    )
    .join("");
}

function renderFooterPublic(footer) {
  const map = {
    phoneDisplay: footer.phone,
    phoneDisplay2: footer.phone,
    phoneDisplay3: footer.phone,
    email: footer.email,
    email2: footer.email,
    address: footer.address,
    copyright: footer.copyrightText,
  };
  Object.entries(map).forEach(([key, value]) => {
    if (!value) return;
    document.querySelectorAll(`[data-footer="${key}"]`).forEach((el) => (el.textContent = value));
  });

  const wa = document.getElementById("whatsappBtn");
  if (wa && footer.phone) {
    const digits = footer.phone.replace(/[^\d]/g, "");
    wa.setAttribute("href", `https://wa.me/${digits}`);
  }
}

function renderSettingsPublic(settings) {
  if (settings.tagline) {
    document.querySelectorAll("#navTagline").forEach((el) => (el.textContent = settings.tagline));
  }
  if (settings.logoUrl) {
    document.querySelectorAll("#logoImg, #footerLogoImg").forEach((img) => {
      img.src = settings.logoUrl;
      img.classList.remove("hidden");
    });
    const fallback = document.getElementById("logoFallback");
    if (fallback) fallback.classList.add("hidden");
  }

  const social = document.getElementById("footerSocial");
  if (social && settings.socialLinks) {
    const links = settings.socialLinks;
    const entries = ["facebook", "instagram", "youtube", "twitter"].filter((k) => links[k]);
    social.innerHTML = entries
      .map((k) => `<a href="${links[k]}" target="_blank" rel="noopener" class="hover:text-[var(--gold)]">${k}</a>`)
      .join("");

    if (links.whatsapp) {
      const wa = document.getElementById("whatsappBtn");
      if (wa) wa.setAttribute("href", links.whatsapp);
    }
  }
}

function setupPublicInteractions() {
  const mobileBtn = document.getElementById("mobileBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
    document.querySelectorAll("#mobileMenu a").forEach((a) => a.addEventListener("click", () => mobileMenu.classList.add("hidden")));
  }

  const form = document.getElementById("enquiryForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const fd = new FormData(e.target);
      const payload = {
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
      };
      await withLoading(submitBtn, "Sending...", async () => {
        await api("/enquiries", { method: "POST", body: payload });
        e.target.reset();
        toast("Enquiry sent — we'll be in touch.");
      })();
    });
  }

  const nav = document.getElementById("mainNav");
  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        nav.style.background = "rgba(10,8,7,0.88)";
        nav.style.backdropFilter = "blur(10px)";
        nav.style.borderBottom = "1px solid var(--line)";
      } else {
        nav.style.background = "transparent";
        nav.style.backdropFilter = "none";
        nav.style.borderBottom = "1px solid transparent";
      }
    });
  }
}

// =======================================
// ADMIN PANEL
// =======================================
let adminState = { films: [], team: [], services: [], gallery: [], testimonials: [], hero: null };
let currentItemType = null; // "film" | "team" | "service" | "testimonial"
let currentEditId = null;

function handleSessionExpired() {
  const loginSection = document.getElementById("adminLoginSection");
  const dashboardSection = document.getElementById("adminDashboardSection");
  if (!loginSection || !dashboardSection) return;
  dashboardSection.classList.add("hidden");
  dashboardSection.classList.remove("flex");
  loginSection.classList.remove("hidden");
  loginSection.classList.add("flex");
  toast("Your session expired — please log in again.");
}

function setupAdminPage() {
  const loginSection = document.getElementById("adminLoginSection");
  const dashboardSection = document.getElementById("adminDashboardSection");
  const userInput = document.getElementById("adminUser");
  const passInput = document.getElementById("adminPass");
  const loginBtn = document.getElementById("loginSubmit");

  function showDashboard() {
    loginSection.classList.add("hidden");
    loginSection.classList.remove("flex");
    dashboardSection.classList.remove("hidden");
    dashboardSection.classList.add("flex");
    loadAdminDashboard();
  }

  // If a session cookie is already valid, skip straight to the dashboard.
  api("/auth/me")
    .then(showDashboard)
    .catch(() => {});

  const doLogin = withLoading(loginBtn, "Logging in...", async () => {
    document.getElementById("loginError").classList.add("hidden");
    await api("/auth/login", {
      method: "POST",
      body: { username: userInput.value.trim(), password: passInput.value },
    });
    showDashboard();
  });

  loginBtn.addEventListener("click", async () => {
    try {
      await doLogin();
    } catch (err) {
      document.getElementById("loginError").textContent = err.message || "Incorrect username or password.";
      document.getElementById("loginError").classList.remove("hidden");
    }
  });
  passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loginBtn.click(); });

  document.getElementById("adminLogout").addEventListener("click", async () => {
    try { await api("/auth/logout", { method: "POST" }); } catch (e) { /* ignore */ }
    handleSessionExpired();
    passInput.value = "";
  });

  document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".admin-panel-tab").forEach((p) => p.classList.add("hidden"));
      document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
      document.getElementById("adminTitle").textContent = btn.textContent;
    });
  });

  setupAdminForms();
}

async function loadAdminDashboard() {
  try {
    const [enquiries, films, team, about, footer, settings, services, gallery, testimonials, hero] = await Promise.all([
      api("/enquiries"),
      api("/films/admin"),
      api("/team"),
      api("/about"),
      api("/footer"),
      api("/settings"),
      api("/services"),
      api("/gallery"),
      api("/testimonials"),
      api("/hero"),
    ]);

    adminState = { films, team, services, gallery, testimonials, hero };

    renderEnquiries(enquiries);
    renderFilmAdmin(films);
    renderTeamAdmin(team);
    renderServiceAdmin(services);
    renderGalleryAdmin(gallery);
    renderTestimonialAdmin(testimonials);

    document.getElementById("aboutHeadingInput").value = about.heading || "";
    document.getElementById("aboutP1Input").value = about.paragraph1 || "";
    document.getElementById("aboutP2Input").value = about.paragraph2 || "";
    document.getElementById("statFilms").value = hero.statFilms || "";
    document.getElementById("statYears").value = hero.statYears || "";
    document.getElementById("statAwards").value = hero.statAwards || "";

    document.getElementById("footerPhoneInput").value = footer.phone || "";
    document.getElementById("footerEmailInput").value = footer.email || "";
    document.getElementById("footerAddressInput").value = footer.address || "";
    document.getElementById("footerCopyrightInput").value = footer.copyrightText || "";

    const social = settings.socialLinks || {};
    document.getElementById("socialWhatsappInput").value = social.whatsapp || "";
    document.getElementById("socialFacebookInput").value = social.facebook || "";
    document.getElementById("socialInstagramInput").value = social.instagram || "";
    document.getElementById("socialYoutubeInput").value = social.youtube || "";

    document.getElementById("heroHeadlineInput").value = hero.headline || "";
    document.getElementById("heroSubheadlineInput").value = hero.subheadline || "";
    document.getElementById("ctaPrimaryTextInput").value = hero.ctaPrimaryText || "";
    document.getElementById("ctaPrimaryLinkInput").value = hero.ctaPrimaryLink || "";
    document.getElementById("ctaSecondaryTextInput").value = hero.ctaSecondaryText || "";
    document.getElementById("ctaSecondaryLinkInput").value = hero.ctaSecondaryLink || "";
    renderHeroImageList(hero.heroImages || []);

    if (settings.logoUrl) {
      document.getElementById("logoPreview").style.backgroundImage = `url("${settings.logoUrl}")`;
      document.getElementById("logoPreview").style.backgroundSize = "cover";
      document.getElementById("logoPreview").style.backgroundPosition = "center";
    }
  } catch (err) {
    if (err.status === 401) return handleSessionExpired();
    toast(err.message || "Failed to load dashboard.");
  }
}

function renderEnquiries(enquiries) {
  const list = document.getElementById("enquiryList");
  const empty = document.getElementById("noEnquiries");
  if (!enquiries.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  list.innerHTML = enquiries
    .map(
      (en) => `
      <div class="p-5 rounded-sm flex justify-between gap-4" style="background:#0F0C0B;border:1px solid var(--line);">
        <div class="min-w-0">
          <div class="text-sm text-[var(--cream)]">${escapeHtml(en.name)} <span class="text-xs text-[var(--muted)]">— ${escapeHtml(en.phone)}</span></div>
          <p class="text-xs text-[var(--muted)] mt-1">${escapeHtml(en.message)}</p>
          <p class="text-[10px] text-[var(--muted)] mt-1">${new Date(en.createdAt).toLocaleString()}</p>
        </div>
        <button class="text-xs text-[var(--crimson-glow)] shrink-0" data-delete-enquiry="${en.id}">Delete</button>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-delete-enquiry]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await api(`/enquiries/${btn.dataset.deleteEnquiry}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    });
  });
}

function renderFilmAdmin(films) {
  const list = document.getElementById("filmAdminList");
  list.innerHTML = films
    .map(
      (f) => `
      <div class="film-card rounded-sm overflow-hidden">
        <div class="poster-wrap"><img src="${f.posterUrl || "https://via.placeholder.com/300x450/17110f/C9A24B?text=Poster"}" alt="${escapeHtml(f.title)}"></div>
        <div class="p-4">
          <div class="text-xs uppercase tracking-widest text-[var(--gold)]">${escapeHtml(f.category)} · ${escapeHtml(f.year)} · ${f.status}</div>
          <h3 class="font-display text-base text-[var(--cream)] mt-1">${escapeHtml(f.title)}</h3>
          <div class="flex gap-4 mt-3 text-xs">
            <button class="text-[var(--gold)]" data-edit-film="${f.id}">Edit</button>
            <button class="text-[var(--crimson-glow)]" data-delete-film="${f.id}">Delete</button>
          </div>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-edit-film]").forEach((btn) => btn.addEventListener("click", () => openItemModal("film", btn.dataset.editFilm)));
  list.querySelectorAll("[data-delete-film]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this film?")) return;
      try {
        await api(`/films/${btn.dataset.deleteFilm}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

function renderTeamAdmin(team) {
  const list = document.getElementById("teamAdminList");
  list.innerHTML = team
    .map(
      (m) => `
      <div class="team-card rounded-sm overflow-hidden">
        <div class="team-photo"><img src="${m.photoUrl || "https://via.placeholder.com/300/1c1514/C9A24B?text=Team"}" alt="${escapeHtml(m.name)}"></div>
        <div class="p-4">
          <div class="font-display text-base text-[var(--cream)]">${escapeHtml(m.name)}</div>
          <div class="text-xs uppercase tracking-widest text-[var(--gold)] mt-1">${escapeHtml(m.role)}</div>
          <div class="flex gap-4 mt-3 text-xs">
            <button class="text-[var(--gold)]" data-edit-team="${m.id}">Edit</button>
            <button class="text-[var(--crimson-glow)]" data-delete-team="${m.id}">Delete</button>
          </div>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-edit-team]").forEach((btn) => btn.addEventListener("click", () => openItemModal("team", btn.dataset.editTeam)));
  list.querySelectorAll("[data-delete-team]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this team member?")) return;
      try {
        await api(`/team/${btn.dataset.deleteTeam}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

function renderServiceAdmin(services) {
  const list = document.getElementById("serviceAdminList");
  list.innerHTML = services
    .map(
      (s) => `
      <div class="team-card p-5 rounded-sm">
        <h3 class="font-display text-base text-[var(--cream)]">${escapeHtml(s.title)}</h3>
        <p class="text-[var(--muted)] text-xs mt-2">${escapeHtml(s.description)}</p>
        <div class="flex gap-4 mt-3 text-xs">
          <button class="text-[var(--gold)]" data-edit-service="${s.id}">Edit</button>
          <button class="text-[var(--crimson-glow)]" data-delete-service="${s.id}">Delete</button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-edit-service]").forEach((btn) => btn.addEventListener("click", () => openItemModal("service", btn.dataset.editService)));
  list.querySelectorAll("[data-delete-service]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this service?")) return;
      try {
        await api(`/services/${btn.dataset.deleteService}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

function renderTestimonialAdmin(items) {
  const list = document.getElementById("testimonialAdminList");
  list.innerHTML = items
    .map(
      (t) => `
      <div class="film-card p-5 rounded-sm">
        <p class="text-[var(--cream)] text-sm italic">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
        <div class="text-xs text-[var(--muted)] mt-2">${escapeHtml(t.name)} — ${escapeHtml(t.roleOrProject)}</div>
        <div class="flex gap-4 mt-3 text-xs">
          <button class="text-[var(--gold)]" data-edit-testimonial="${t.id}">Edit</button>
          <button class="text-[var(--crimson-glow)]" data-delete-testimonial="${t.id}">Delete</button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-edit-testimonial]").forEach((btn) => btn.addEventListener("click", () => openItemModal("testimonial", btn.dataset.editTestimonial)));
  list.querySelectorAll("[data-delete-testimonial]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this testimonial?")) return;
      try {
        await api(`/testimonials/${btn.dataset.deleteTestimonial}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

function renderGalleryAdmin(images) {
  const list = document.getElementById("galleryAdminList");
  list.innerHTML = images
    .map(
      (img) => `
      <div class="relative rounded-sm overflow-hidden aspect-square group">
        <img src="${img.url}" class="w-full h-full object-cover" alt="${escapeHtml(img.caption || "")}">
        <button data-delete-gallery="${img.id}" class="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-sm bg-black/70 text-[var(--crimson-glow)]">Delete</button>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-delete-gallery]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this image?")) return;
      try {
        await api(`/gallery/${btn.dataset.deleteGallery}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

function renderHeroImageList(images) {
  const list = document.getElementById("heroImageList");
  if (!list) return;
  list.innerHTML = images
    .map(
      (img) => `
      <div class="relative rounded-sm overflow-hidden aspect-video">
        <img src="${img.url}" class="w-full h-full object-cover">
        <button data-remove-hero-image="${encodeURIComponent(img.cloudinaryId)}" class="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded-sm bg-black/70 text-[var(--crimson-glow)]">×</button>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-remove-hero-image]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/hero/images/${btn.dataset.removeHeroImage}`, { method: "DELETE" });
        loadAdminDashboard();
      } catch (err) {
        toast(err.message);
      }
    })
  );
}

// --- Shared add/edit modal for Films, Team, Services, Testimonials --------
function openItemModal(type, editId = null) {
  currentItemType = type;
  currentEditId = editId;

  document.querySelectorAll("#itemForm > div[id^='itemFields']").forEach((el) => el.classList.add("hidden"));
  document.getElementById("itemPhotoField").classList.toggle("hidden", type === "service");

  const form = document.getElementById("itemForm");
  form.reset();
  document.getElementById("itemImagePreview").style.backgroundImage = "";

  const fieldMap = { film: "itemFieldsFilm", team: "itemFieldsTeam", service: "itemFieldsService", testimonial: "itemFieldsTestimonial" };
  document.getElementById(fieldMap[type]).classList.remove("hidden");

  const titleMap = { film: "Film", team: "Team Member", service: "Service", testimonial: "Testimonial" };
  document.getElementById("itemModalTitle").textContent = (editId ? "Edit " : "Add ") + titleMap[type];

  if (editId) {
    const collection = { film: "films", team: "team", service: "services", testimonial: "testimonials" }[type];
    const item = adminState[collection].find((i) => i.id === editId);
    if (item) {
      Object.entries(item).forEach(([key, value]) => {
        const input = form.elements.namedItem(key);
        if (input && typeof value !== "object") input.value = value;
      });
      const imgUrl = item.posterUrl || item.photoUrl;
      if (imgUrl) {
        document.getElementById("itemImagePreview").style.backgroundImage = `url("${imgUrl}")`;
        document.getElementById("itemImagePreview").style.backgroundSize = "cover";
      }
    }
  }

  document.getElementById("itemModal").classList.remove("hidden");
  document.getElementById("itemModal").classList.add("flex");
}

function closeItemModal() {
  document.getElementById("itemModal").classList.add("hidden");
  document.getElementById("itemModal").classList.remove("flex");
  currentItemType = null;
  currentEditId = null;
}

function setupAdminForms() {
  document.getElementById("addFilmBtn").addEventListener("click", () => openItemModal("film"));
  document.getElementById("addTeamBtn").addEventListener("click", () => openItemModal("team"));
  document.getElementById("addServiceBtn").addEventListener("click", () => openItemModal("service"));
  document.getElementById("addTestimonialBtn").addEventListener("click", () => openItemModal("testimonial"));
  document.getElementById("itemCancelBtn").addEventListener("click", closeItemModal);

  document.getElementById("itemImageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById("itemImagePreview").style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
    document.getElementById("itemImagePreview").style.backgroundSize = "cover";
  });

  document.getElementById("itemForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    await withLoading(submitBtn, "Saving...", async () => {
      const endpointMap = { film: "films", team: "team", service: "services", testimonial: "testimonials" };
      const fileFieldMap = { film: "poster", team: "photo", testimonial: "photo" };
      const endpoint = endpointMap[currentItemType];
      const method = currentEditId ? "PUT" : "POST";
      const path = currentEditId ? `/${endpoint}/${currentEditId}` : `/${endpoint}`;

      let body, isForm;
      const fileField = fileFieldMap[currentItemType];
      const file = document.getElementById("itemImageInput").files[0];

      if (fileField) {
        const fd = new FormData(e.target);
        if (file) fd.set(fileField, file); // no new file selected keeps the existing image (backend leaves it untouched)
        body = fd;
        isForm = true;
      } else {
        body = Object.fromEntries(new FormData(e.target).entries());
        isForm = false;
      }

      await api(path, { method, body, isForm });
      closeItemModal();
      toast("Saved.");
      loadAdminDashboard();
    })();
  });

  // About + stats
  document.getElementById("saveAboutBtn").addEventListener(
    "click",
    withLoading(document.getElementById("saveAboutBtn"), "Saving...", async () => {
      await api("/about", {
        method: "PUT",
        body: {
          heading: document.getElementById("aboutHeadingInput").value,
          paragraph1: document.getElementById("aboutP1Input").value,
          paragraph2: document.getElementById("aboutP2Input").value,
        },
      });
      await api("/hero", {
        method: "PUT",
        body: {
          statFilms: document.getElementById("statFilms").value,
          statYears: document.getElementById("statYears").value,
          statAwards: document.getElementById("statAwards").value,
        },
      });
      toast("About page saved.");
    })
  );

  // Footer
  document.getElementById("saveFooterBtn").addEventListener(
    "click",
    withLoading(document.getElementById("saveFooterBtn"), "Saving...", async () => {
      await api("/footer", {
        method: "PUT",
        body: {
          phone: document.getElementById("footerPhoneInput").value,
          email: document.getElementById("footerEmailInput").value,
          address: document.getElementById("footerAddressInput").value,
          copyrightText: document.getElementById("footerCopyrightInput").value,
        },
      });
      toast("Footer saved.");
    })
  );

  // Social links
  document.getElementById("saveSocialBtn").addEventListener(
    "click",
    withLoading(document.getElementById("saveSocialBtn"), "Saving...", async () => {
      await api("/settings", {
        method: "PUT",
        body: {
          whatsapp: document.getElementById("socialWhatsappInput").value,
          facebook: document.getElementById("socialFacebookInput").value,
          instagram: document.getElementById("socialInstagramInput").value,
          youtube: document.getElementById("socialYoutubeInput").value,
        },
      });
      toast("Social links saved.");
    })
  );

  // Hero text
  document.getElementById("saveHeroTextBtn").addEventListener(
    "click",
    withLoading(document.getElementById("saveHeroTextBtn"), "Saving...", async () => {
      await api("/hero", {
        method: "PUT",
        body: {
          headline: document.getElementById("heroHeadlineInput").value,
          subheadline: document.getElementById("heroSubheadlineInput").value,
          ctaPrimaryText: document.getElementById("ctaPrimaryTextInput").value,
          ctaPrimaryLink: document.getElementById("ctaPrimaryLinkInput").value,
          ctaSecondaryText: document.getElementById("ctaSecondaryTextInput").value,
          ctaSecondaryLink: document.getElementById("ctaSecondaryLinkInput").value,
        },
      });
      toast("Hero text saved.");
    })
  );

  // Hero collage image add
  document.getElementById("addHeroImageBtn").addEventListener(
    "click",
    withLoading(document.getElementById("addHeroImageBtn"), "Uploading...", async () => {
      const file = document.getElementById("heroImageInput").files[0];
      if (!file) return toast("Choose an image first.");
      const fd = new FormData();
      fd.set("image", file);
      await api("/hero/images", { method: "POST", body: fd, isForm: true });
      document.getElementById("heroImageInput").value = "";
      toast("Hero image added.");
      loadAdminDashboard();
    })
  );

  // Logo
  document.getElementById("saveLogoBtn").addEventListener(
    "click",
    withLoading(document.getElementById("saveLogoBtn"), "Uploading...", async () => {
      const file = document.getElementById("logoInput").files[0];
      if (!file) return toast("Choose a logo file first.");
      const fd = new FormData();
      fd.set("logo", file);
      await api("/settings/logo", { method: "POST", body: fd, isForm: true });
      toast("Logo updated.");
      loadAdminDashboard();
    })
  );

  // Gallery add
  document.getElementById("addGalleryBtn").addEventListener(
    "click",
    withLoading(document.getElementById("addGalleryBtn"), "Uploading...", async () => {
      const file = document.getElementById("galleryImageInput").files[0];
      if (!file) return toast("Choose an image first.");
      const fd = new FormData();
      fd.set("image", file);
      fd.set("caption", document.getElementById("galleryCaptionInput").value);
      await api("/gallery", { method: "POST", body: fd, isForm: true });
      document.getElementById("galleryImageInput").value = "";
      document.getElementById("galleryCaptionInput").value = "";
      toast("Image added to gallery.");
      loadAdminDashboard();
    })
  );
}
