/* ============================================
   Netflix-themed Wedding Invitation — Frontend Only
   ============================================ */

(function () {
  "use strict";

  // ========== DOM REFERENCES ==========
  var splash = document.getElementById("splash");
  var splashOpenBtn = document.getElementById("splash-open-btn");
  var bgMusic = document.getElementById("bg-music");
  var musicPlayerBar = document.getElementById("music-player");
  var musicPlayerBtn = document.getElementById("music-toggle");
  var musicIconPlay = document.getElementById("music-icon-play");
  var musicIconPause = document.getElementById("music-icon-pause");
  var heroIconPlay = document.getElementById("hero-icon-play");
  var heroIconPause = document.getElementById("hero-icon-pause");
  var heroPlayLabel = document.getElementById("hero-play-label");
  var musicPlayerProgress = document.getElementById("music-progress-bar");
  var musicDisc = document.getElementById("music-disc");
  var toast = document.getElementById("toast");
  var toastMessage = document.getElementById("toast-message");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var lightboxCounter = document.getElementById("lightbox-counter");
  var heroPlayBtn = document.getElementById("hero-play-btn");
  var heroMylistBtn = document.getElementById("hero-mylist-btn");

  // ========== STATE ==========
  var isMusicPlaying = false;
  var currentLightboxIndex = 0;
  var toastTimeout = null;
  var guestNameValue = "Tamu Undangan";

  // Gallery images — urutan index harus sama dgn data-gallery-index di HTML
  var galleryImages = [
    "assets/images/g13.JPG", // 0: featured
    "assets/images/g1.JPG", // 1: top #1
    "assets/images/g7.JPG", // 2: top #2
    "assets/images/g3.JPG", // 3: top #3
    "assets/images/g8.JPG", // 4: top #4
    "assets/images/g6.JPG", // 5: top #5
    "assets/images/g12.JPG", // 6: top #6
  ];

  // ========== GUEST FROM URL (local JSON) ==========
  function initGuestFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("to");
    var splashName = document.getElementById("splash-guest-name");
    var hint = document.getElementById("splash-guest-hint");

    if (!slug) {
      guestNameValue = "Tamu Undangan";
      if (splashName) splashName.textContent = guestNameValue;
      if (hint) hint.textContent = "Silakan buka link undangan pribadi Anda";
      updateHeroDesc(guestNameValue);
      return;
    }

    fetch("data/guests.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var guests = data && data.guests ? data.guests : [];
        var guest = null;
        for (var i = 0; i < guests.length; i++) {
          if (guests[i].slug === slug) {
            guest = guests[i];
            break;
          }
        }
        if (!guest) {
          guestNameValue = "Tamu Undangan";
          if (splashName) splashName.textContent = guestNameValue;
          if (hint)
            hint.textContent =
              "Nama tidak ditemukan, silakan hubungi pengundang";
          updateHeroDesc(guestNameValue);
          return;
        }
        guestNameValue = guest.name;
        if (splashName) splashName.textContent = guest.name;
        if (hint) hint.textContent = "Link undangan untuk " + guest.name;
        updateHeroDesc(guest.name);
      })
      .catch(function () {
        guestNameValue = "Tamu Undangan";
        if (splashName) splashName.textContent = guestNameValue;
        if (hint) hint.textContent = "Gagal memuat data tamu";
        updateHeroDesc(guestNameValue);
      });
  }

  function updateHeroDesc(name) {
    var heroDesc = document.getElementById("hero-desc-text");
    if (heroDesc) {
      heroDesc.textContent =
        "Kepada Yth. " +
        name +
        ", di antara sekian banyak pertemuan yang ditulis semesta, kami menemukan satu sama lain. Kini, pada 4 Oktober 2026, kami ingin mengabadikan satu babak paling indah dalam perjalanan ini. Hadirlah, dan menjadi bagian dari cerita yang akan kami kenang sepanjang usia.";
    }
  }

  // ========== SPLASH SCREEN ==========
  splashOpenBtn.addEventListener("click", function () {
    splash.classList.add("hidden");
    musicPlayerBar.classList.add("visible");
    bgMusic.play().catch(function () {
      showToast("Audio tidak tersedia", "error");
    });
  });

  // ========== MUSIC PLAYER BAR ==========
  function updateMusicUI() {
    if (isMusicPlaying) {
      musicPlayerBar.classList.add("playing");
      musicIconPlay.style.display = "none";
      musicIconPause.style.display = "block";
    } else {
      musicPlayerBar.classList.remove("playing");
      musicIconPlay.style.display = "block";
      musicIconPause.style.display = "none";
    }
  }

  // ========== HERO BUTTONS ==========
  function updateHeroMusicUI() {
    if (isMusicPlaying) {
      heroIconPlay.style.display = "none";
      heroIconPause.style.display = "block";
      heroPlayLabel.textContent = "Jeda";
    } else {
      heroIconPlay.style.display = "block";
      heroIconPause.style.display = "none";
      heroPlayLabel.textContent = "Putar";
    }
  }

  // Single source of truth: audio events sync ALL UI
  function syncMusicUI() {
    updateMusicUI();
    updateHeroMusicUI();
  }

  bgMusic.addEventListener("play", function () {
    isMusicPlaying = true;
    syncMusicUI();
  });

  bgMusic.addEventListener("pause", function () {
    isMusicPlaying = false;
    syncMusicUI();
  });

  bgMusic.addEventListener("timeupdate", function () {
    if (bgMusic.duration) {
      var pct = (bgMusic.currentTime / bgMusic.duration) * 100;
      musicPlayerProgress.style.width = pct + "%";
    }
  });

  bgMusic.addEventListener("ended", function () {
    musicPlayerProgress.style.width = "0%";
  });

  // Initial sync dengan HTML default (play icon + "Putar")
  syncMusicUI();

  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play().catch(function () {
        showToast("Audio tidak tersedia", "error");
      });
    } else {
      bgMusic.pause();
    }
  }

  musicPlayerBtn.addEventListener("click", toggleMusic);
  heroPlayBtn.addEventListener("click", toggleMusic);

  heroMylistBtn.addEventListener("click", function () {
    document.getElementById("couple").scrollIntoView({ behavior: "smooth" });
  });

  // ========== TOAST ==========
  function showToast(message, type) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.className = "toast toast-" + (type || "success");
    void toast.offsetWidth;
    toast.classList.add("show");
    toastTimeout = setTimeout(function () {
      toast.classList.remove("show");
    }, 3000);
  }

  // ========== COPY TO CLIPBOARD ==========
  var copyBtns = document.querySelectorAll("[data-copy]");
  copyBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var text = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            showToast("Nomor rekening berhasil disalin!", "success");
          })
          .catch(function () {
            fallbackCopy(text);
          });
      } else {
        fallbackCopy(text);
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Nomor rekening berhasil disalin!", "success");
    } catch (err) {
      showToast("Gagal menyalin nomor", "error");
    }
    document.body.removeChild(ta);
  }

  // ========== LIGHTBOX ==========
  var galleryItems = document.querySelectorAll("[data-gallery-index]");

  galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var index = parseInt(item.getAttribute("data-gallery-index"), 10);
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function updateLightboxImage() {
    if (!galleryImages[currentLightboxIndex]) return;
    lightboxImg.src = galleryImages[currentLightboxIndex];
    lightboxCounter.textContent =
      currentLightboxIndex + 1 + " / " + galleryImages.length;
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightboxPrev.addEventListener("click", function (e) {
    e.stopPropagation();
    currentLightboxIndex =
      (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  });

  lightboxNext.addEventListener("click", function (e) {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
    updateLightboxImage();
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") {
      currentLightboxIndex =
        (currentLightboxIndex - 1 + galleryImages.length) %
        galleryImages.length;
      updateLightboxImage();
    }
    if (e.key === "ArrowRight") {
      currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
      updateLightboxImage();
    }
  });

  // ========== GIFT BOTTOM SHEET MODAL (2 langkah: pilih 1, lihat 1) ==========
  var giftOpenBtn = document.getElementById("gift-open-btn");
  var giftSheetOverlay = document.getElementById("gift-sheet-overlay");
  var giftSheetClose = document.getElementById("gift-sheet-close");
  var giftSheetSubtitle = document.getElementById("gift-sheet-subtitle");
  var giftStepIndicator = document.getElementById("gift-step-indicator");
  var giftChoose = document.getElementById("gift-choose");
  var giftDetail = document.getElementById("gift-detail");
  var giftDetailTitle = document.getElementById("gift-detail-title");
  var giftPanelBank = document.getElementById("gift-panel-bank");
  var giftPanelKado = document.getElementById("gift-panel-kado");
  var giftBackBtn = document.getElementById("gift-back-btn");

  function resetGiftSheet() {
    if (giftChoose) {
      giftChoose.hidden = false;
      giftChoose.style.animation = "none";
      void giftChoose.offsetWidth;
      giftChoose.style.animation = "";
    }
    if (giftDetail) giftDetail.hidden = true;
    if (giftSheetSubtitle)
      giftSheetSubtitle.textContent = "Pilih cara mengirim hadiah";
    if (giftStepIndicator) giftStepIndicator.textContent = "1/2";
    if (giftDetailTitle) giftDetailTitle.textContent = "Detail";
  }

  function openGiftSheet() {
    resetGiftSheet();
    giftSheetOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeGiftSheet() {
    giftSheetOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  giftOpenBtn.addEventListener("click", openGiftSheet);
  giftSheetClose.addEventListener("click", closeGiftSheet);

  giftSheetOverlay.addEventListener("click", function (e) {
    if (e.target === giftSheetOverlay) closeGiftSheet();
  });

  document.querySelectorAll(".gift-choice").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-gift-type");
      var isBank = type === "bank";
      if (giftChoose) giftChoose.hidden = true;
      if (giftDetail) {
        giftDetail.hidden = false;
        giftDetail.style.animation = "none";
        void giftDetail.offsetWidth;
        giftDetail.style.animation = "";
      }
      if (giftPanelBank) giftPanelBank.hidden = !isBank;
      if (giftPanelKado) giftPanelKado.hidden = isBank;
      if (giftSheetSubtitle)
        giftSheetSubtitle.textContent = isBank
          ? "Transfer rekening berikut"
          : "Kirim kado ke alamat rumah";
      if (giftStepIndicator) giftStepIndicator.textContent = "2/2";
      if (giftDetailTitle)
        giftDetailTitle.textContent = isBank ? "Transfer Bank" : "Kado Fisik";
    });
  });

  if (giftBackBtn) {
    giftBackBtn.addEventListener("click", function () {
      resetGiftSheet();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && giftSheetOverlay.classList.contains("active")) {
      closeGiftSheet();
    }
  });

  // ========== SCROLL ANIMATIONS ==========
  var animateElements = document.querySelectorAll(".animate-on-scroll");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animateElements.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // ========== RIPPLE EFFECT ==========
  var rippleBtns = document.querySelectorAll(".ripple-effect");
  rippleBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.width = ripple.style.height =
        Math.max(rect.width, rect.height) + "px";
      btn.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  // ========== WEBTOON STORY READER ==========
  const storyData = [
    { id: 1, title: "Episode 1 — The Meeting", file: "1.png" },
    { id: 2, title: "Episode 2 — Growing Together", file: "2.png" },
    { id: 3, title: "Episode 3 — Different Paths", file: "3.png" },
    { id: 4, title: "Episode 4 — Chasing Dreams", file: "4.png" },
    { id: 5, title: "Episode 5 — The Realization", file: "5.png" },
    { id: 6, title: "Episode 6 - The Proposal", file: "6.png" },
    { id: 7, title: "Episode 7 - Forever Begins", file: "7.png" },
    { id: 8, title: "Episode 8 - Our Happily Ever After", file: "8.png" },
  ];

  const storyModal = document.getElementById("storyModal");
  const storyClose = document.getElementById("storyClose");
  const storyPages = document.getElementById("storyPages");
  const storyPageCount = document.getElementById("storyPageCount");
  const storyEpisodeTitle = document.getElementById("storyEpisodeTitle");
  const storyPrev = document.getElementById("storyPrev");
  const storyNext = document.getElementById("storyNext");
  let currentEpIndex = -1;

  document.querySelectorAll(".story-card").forEach((card) => {
    card.addEventListener("click", function () {
      const ep = parseInt(this.dataset.episode);
      const idx = storyData.findIndex((d) => d.id === ep);
      if (idx === -1) return;
      openStoryEpisode(idx);
    });
  });

  function openStoryEpisode(idx) {
    const data = storyData[idx];
    if (!data) return;
    currentEpIndex = idx;
    storyEpisodeTitle.textContent = data.title;
    storyPages.innerHTML = `
  <div class="story-page-wrapper">
    <img src="assets/story/${encodeURIComponent(data.file)}" 
         alt="${data.title.replace(/"/g, "&quot;")}" 
         class="story-page-img" 
         onerror="this.parentElement.innerHTML='<div style=\\\'padding:2rem;text-align:center;color:#888;\\\'>Gambar tidak ditemukan</div>'">
  </div>
`;
    storyPageCount.textContent = " " + (idx + 1) + " / " + storyData.length;
    storyPrev.style.opacity = idx === 0 ? "0.3" : "1";
    storyNext.style.opacity = idx >= storyData.length - 1 ? "0.3" : "1";
    storyModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  storyPrev.addEventListener("click", () => {
    if (currentEpIndex > 0) openStoryEpisode(currentEpIndex - 1);
  });
  storyNext.addEventListener("click", () => {
    if (currentEpIndex < storyData.length - 1)
      openStoryEpisode(currentEpIndex + 1);
  });

  document.addEventListener("keydown", (e) => {
    if (storyModal.style.display !== "flex") return;
    if (e.key === "ArrowLeft") storyPrev.click();
    if (e.key === "ArrowRight") storyNext.click();
    if (e.key === "Escape") closeStoryModal();
  });

  function closeStoryModal() {
    storyModal.style.display = "none";
    document.body.style.overflow = "";
    storyPages.innerHTML = "";
  }
  storyClose.addEventListener("click", closeStoryModal);
  storyModal.addEventListener("click", (e) => {
    if (e.target === storyModal) closeStoryModal();
  });

  let touchStartX = 0;
  storyPages.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );
  storyPages.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) storyNext.click();
        else storyPrev.click();
      }
    },
    { passive: true },
  );

  // ========== COUNTDOWN ==========
  function startCountdown() {
    var params = new URLSearchParams(window.location.search);
    var isNgunduhMantu = params.get("tp") === "nm";
    var weddingDate = (
      isNgunduhMantu
        ? new Date("2026-10-05T13:00:00+07:00") // Senin, 5 Oktober 2026 pukul 13:00
        : new Date("2026-10-04T09:00:00+07:00")
    ).getTime(); // Minggu, 4 Oktober 2026 pukul 09:00

    // Tanggal yang tertera di cover menyesuaikan parameter ?tp=nm
    if (isNgunduhMantu) {
      var splashDateEl = document.querySelector(".splash-date");
      if (splashDateEl) splashDateEl.textContent = "Senin, 5 Oktober 2026";
    }

    var heroEls = {
      d: document.getElementById("cd-days"),
      h: document.getElementById("cd-hours"),
      m: document.getElementById("cd-minutes"),
      s: document.getElementById("cd-seconds"),
    };
    var splashEls = {
      d: document.getElementById("splash-cd-days"),
      h: document.getElementById("splash-cd-hours"),
      m: document.getElementById("splash-cd-minutes"),
      s: document.getElementById("splash-cd-seconds"),
    };
    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }
    function tick() {
      var diff = weddingDate - Date.now();
      var days = 0,
        hours = 0,
        mins = 0,
        secs = 0;
      if (diff > 0) {
        days = Math.floor(diff / 86400000);
        hours = Math.floor((diff % 86400000) / 3600000);
        mins = Math.floor((diff % 3600000) / 60000);
        secs = Math.floor((diff % 60000) / 1000);
      }
      [heroEls, splashEls].forEach(function (els) {
        if (els.d) els.d.textContent = pad(days);
        if (els.h) els.h.textContent = pad(hours);
        if (els.m) els.m.textContent = pad(mins);
        if (els.s) els.s.textContent = pad(secs);
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  // Inisialisasi guest & splash
  startCountdown();
  initGuestFromUrl();

  // ========== NETFLIX-STYLE LOADER ==========
  var netflixLoader = document.getElementById("netflix-loader");
  if (netflixLoader) {
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      netflixLoader.classList.add("hidden");
      document.body.style.overflow = "";
    }, 3000);
  }
})();
