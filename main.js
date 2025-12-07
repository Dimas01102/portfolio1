// ==============================================
// KONFIGURASI EMAILJS
// ==============================================
const EMAILJS_CONFIG = {
  serviceID: "service_a2rmuqt", // Ganti dengan Service ID Anda
  templateID: "template_ztwshfq", // Ganti dengan Template ID Anda
  publicKey: "wvtop_nt2tONpxD-8", // Ganti dengan Public Key Anda
};

// URL Google Drive/Dropbox untuk CV (ganti dengan link CV Anda)
const CV_URL =
  "https://drive.google.com/uc?export=download&id=1hqMZ39JxXNOCW5qPcWBWm4LBeo-ujbXE";
const CV_FILENAME = "CV_Dimas Dwi Prasetiyo.pdf";

// ==============================================
// LOADING SCREEN
// ==============================================
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.getElementById('loadingProgress');
  const loadingPercentage = document.getElementById('loadingPercentage');
  const loadingStatus = document.getElementById('loadingStatus');
  const filesLoaded = document.getElementById('filesLoaded');
  const modulesLoaded = document.getElementById('modulesLoaded');
  const cpuUsage = document.getElementById('cpuUsage');
  const terminalCommand = document.getElementById('terminalCommand');
  const terminalOutput = document.getElementById('terminalOutput');
  
  // Loading messages
  const statusMessages = [
    'Initializing systems...',
    'Loading assets...',
    'Compiling modules...',
    'Building components...',
    'Optimizing performance...',
    'Establishing connection...',
    'Ready to launch!'
  ];
  
  const commands = [
    'npm install',
    'npm run build',
    'npm start'
  ];
  
  const terminalMessages = [
    '> Checking dependencies...',
    '> Installing packages...',
    '✓ Dependencies installed successfully',
    '> Building production bundle...',
    '✓ Build completed',
    '> Starting development server...',
    '✓ Server running on port 3000',
    '> Opening browser...'
  ];
  
  let progress = 0;
  let messageIndex = 0;
  let commandIndex = 0;
  let terminalIndex = 0;
  let charIndex = 0;
  
  // Code Rain Effect
  createCodeRain();
  
  // Type command animation
  function typeCommand() {
    if (commandIndex < commands.length && charIndex < commands[commandIndex].length) {
      terminalCommand.textContent += commands[commandIndex][charIndex];
      charIndex++;
      setTimeout(typeCommand, 50);
    } else if (commandIndex < commands.length - 1) {
      setTimeout(() => {
        commandIndex++;
        charIndex = 0;
        terminalCommand.textContent = '';
        typeCommand();
      }, 500);
    }
  }
  
  // Add terminal output
  function addTerminalOutput() {
    if (terminalIndex < terminalMessages.length) {
      const line = document.createElement('div');
      line.textContent = terminalMessages[terminalIndex];
      line.style.animationDelay = `${terminalIndex * 0.1}s`;
      terminalOutput.appendChild(line);
      terminalIndex++;
      
      setTimeout(addTerminalOutput, 400);
    }
  }
  
  // Start animations
  setTimeout(typeCommand, 500);
  setTimeout(addTerminalOutput, 1000);
  
  // Progress animation
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 12;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      
      // Update final state
      loadingProgress.style.width = '100%';
      loadingPercentage.textContent = '100%';
      loadingStatus.textContent = statusMessages[statusMessages.length - 1];
      filesLoaded.textContent = '127';
      modulesLoaded.textContent = '48';
      cpuUsage.textContent = '100';
      
      // Hide loading screen
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.classList.remove('loading');
        
        // Trigger entrance animations
        document.querySelectorAll('section').forEach((section, index) => {
          setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
          }, index * 100);
        });
      }, 800);
    } else {
      // Update progress
      loadingProgress.style.width = progress + '%';
      loadingPercentage.textContent = Math.floor(progress) + '%';
      
      // Update status message
      const msgIndex = Math.min(
        Math.floor((progress / 100) * statusMessages.length),
        statusMessages.length - 1
      );
      loadingStatus.textContent = statusMessages[msgIndex];
      
      // Update stats
      filesLoaded.textContent = Math.floor((progress / 100) * 127);
      modulesLoaded.textContent = Math.floor((progress / 100) * 48);
      cpuUsage.textContent = Math.min(Math.floor(progress + Math.random() * 10), 100);
    }
  }, 150);
});

// Code Rain Effect
function createCodeRain() {
  const codeRain = document.getElementById('codeRain');
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]();=+-*/%$#@!';
  const columns = Math.floor(window.innerWidth / 20);
  
  for (let i = 0; i < columns; i++) {
    const column = document.createElement('div');
    column.style.position = 'absolute';
    column.style.left = i * 20 + 'px';
    column.style.top = -Math.random() * 500 + 'px';
    column.style.color = '#3b82f6';
    column.style.fontSize = '14px';
    column.style.fontFamily = 'JetBrains Mono, monospace';
    column.style.animation = `fall ${5 + Math.random() * 5}s linear infinite`;
    column.style.animationDelay = Math.random() * 5 + 's';
    column.style.opacity = '0.3';
    
    let text = '';
    for (let j = 0; j < 30; j++) {
      text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
    }
    column.innerHTML = text;
    
    codeRain.appendChild(column);
  }
  
  // Add keyframe for falling
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fall {
      0% {
        transform: translateY(-100%);
        opacity: 0;
      }
      10% {
        opacity: 0.3;
      }
      90% {
        opacity: 0.3;
      }
      100% {
        transform: translateY(100vh);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Add loading class to body initially
document.body.classList.add('loading');

// ==============================================
// THEME TOGGLE
// ==============================================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const html = document.documentElement;

const currentTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener("click", () => {
  const theme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeIcon(theme);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === "light" ? "bi bi-moon-stars" : "bi bi-sun";
}

// ==============================================
// HAMBURGER MENU
// ==============================================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// ==============================================
// TYPING ANIMATION
// ==============================================
const roles = [
  "Full Stack Web Developer",
  "Web Developer",
  "Backend Developer",
  "Tech Enthusiast",
  "IT Enthusiast",
  "Problem Solver",
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingRole = document.getElementById("typingRole");

function typeRole() {
  const currentRole = roles[roleIndex];

  if (isDeleting) {
    typingRole.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingRole.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentRole.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    typeSpeed = 500;
  }

  setTimeout(typeRole, typeSpeed);
}

typeRole();

// ==============================================
// NAVBAR SCROLL & BACK TO TOP
// ==============================================
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  if (window.scrollY > 300) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ==============================================
// SMOOTH SCROLL
// ==============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ==============================================
// MODAL FUNCTIONS
// ==============================================
function openModal(imageSrc) {
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modalImage");
  modalImage.src = imageSrc;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});

// ==============================================
// CONTACT FORM - EMAILJS INTEGRATION
// ==============================================
const contactForm = document.getElementById("contactForm");

// Load EmailJS SDK
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (typeof emailjs !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.onload = () => {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Initialize EmailJS on page load
loadEmailJS().catch((err) => {
  console.error("Failed to load EmailJS:", err);
});

// Handle form submission
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Mengirim...';

  try {
    // Ensure EmailJS is loaded
    await loadEmailJS();

    // Get form data
    const formData = {
      from_name: document.getElementById("name").value,
      from_email: document.getElementById("email").value,
      message: document.getElementById("message").value,
      to_name: "Dimas Dwi Prasetiyo",
      reply_to: document.getElementById("email").value,
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceID,
      EMAILJS_CONFIG.templateID,
      formData
    );

    if (response.status === 200) {
      // Success notification
      showNotification(
        "✅ Pesan berhasil dikirim! Terima kasih telah menghubungi saya.",
        "success"
      );
      contactForm.reset();

      // Optional: Send confirmation email to sender
      await sendConfirmationEmail(formData);
    }
  } catch (error) {
    console.error("EmailJS Error:", error);

    // Fallback: Show mailto link
    const mailtoLink = `mailto:ddimasddpprasetiyo@gmail.com?subject=Pesan dari ${
      document.getElementById("name").value
    }&body=${encodeURIComponent(
      document.getElementById("message").value
    )}%0D%0A%0D%0AFrom: ${document.getElementById("email").value}`;

    showNotification(
      "⚠️ Gagal mengirim email.",
      "warning",
      () => (window.location.href = mailtoLink)
    );
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
});

// Send confirmation email to sender (optional)
async function sendConfirmationEmail(formData) {
  try {
    await emailjs.send(
      EMAILJS_CONFIG.serviceID,
      "template_confirmation", // Buat template terpisah untuk konfirmasi
      {
        to_name: formData.from_name,
        to_email: formData.from_email,
        message:
          "Terima kasih telah menghubungi saya. Saya akan segera membalas pesan Anda.",
      }
    );
  } catch (error) {
    console.log("Confirmation email not sent:", error);
  }
}

// Custom notification system
function showNotification(message, type = "info", callback = null) {
  // Remove existing notifications
  const existingNotif = document.querySelector(".custom-notification");
  if (existingNotif) {
    existingNotif.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `custom-notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "warning"
            ? "#f59e0b"
            : "#3b82f6"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 5000);

  // Execute callback if provided
  if (callback) {
    notification.addEventListener("click", callback);
  }
}

// Add notification animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .custom-notification {
        cursor: pointer;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        border-radius: 4px;
        padding: 0 8px;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// ==============================================
// DOWNLOAD CV FUNCTION
// ==============================================
function downloadCV(e) {
  e.preventDefault();

  const btn = e.currentTarget;
  const originalContent = btn.innerHTML;

  // Show loading state
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Downloading...';
  btn.disabled = true;

  // Method 1: Direct download (for Google Drive public files)
  fetch(CV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.blob();
    })
    .then((blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = CV_FILENAME;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification("✅ CV berhasil didownload!", "success");
    })
    .catch((error) => {
      console.error("Download error:", error);

      // Fallback: Open in new tab
      window.open(CV_URL, "_blank");
      showNotification(
        "📄 CV dibuka di tab baru. Silakan download dari sana.",
        "info"
      );
    })
    .finally(() => {
      // Restore button
      btn.innerHTML = originalContent;
      btn.disabled = false;
    });
}

// Alternative: Using base64 embedded CV (if file is small)
function downloadCVBase64() {
  // Untuk CV
  const cvData = "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5..."; // Your base64 CV data

  const byteCharacters = atob(cvData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = CV_FILENAME;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ==============================================
// FORM VALIDATION
// ==============================================
const formInputs = document.querySelectorAll(
  ".form-group input, .form-group textarea"
);
formInputs.forEach((input) => {
  input.addEventListener("blur", function () {
    if (this.value.trim() === "" && this.hasAttribute("required")) {
      this.style.borderColor = "#ef4444";
    } else {
      this.style.borderColor = "var(--border)";
    }
  });

  input.addEventListener("focus", function () {
    this.style.borderColor = "var(--accent-blue)";
  });
});

// Email validation
const emailInput = document.getElementById("email");
if (emailInput) {
  emailInput.addEventListener("input", function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
      this.setCustomValidity("Please enter a valid email address");
      this.style.borderColor = "#ef4444";
    } else {
      this.setCustomValidity("");
      this.style.borderColor = "var(--border)";
    }
  });
}

// ==============================================
// INTERSECTION OBSERVERS & ANIMATIONS
// ==============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document.querySelectorAll("section").forEach((section) => {
  section.style.opacity = "0";
  section.style.transform = "translateY(30px)";
  section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(section);
});

// Skill cards animation
const skillCardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 50);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".skill-card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = "all 0.5s ease";
  skillCardObserver.observe(card);
});

// Project cards animation
const projectCardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 150);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".project-card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(50px)";
  card.style.transition = "all 0.6s ease";
  projectCardObserver.observe(card);
});

// ==============================================
// CERTIFICATES DATA & PAGINATION
// ==============================================
const certificatesData = [
  {
    img: 'assets/img/cer1.jpg',
    title: 'Belajar Dasar Pemrograman JavaScript',
    issuer: 'Dicoding - 2024'
  },
  {
    img: 'assets/img/cer2.jpg',
    title: 'Memulai Pemrograman Dengan Python',
    issuer: 'Dicoding - 2024'
  },
  {
    img: 'assets/img/cer3.jpg',
    title: 'Memulai Pemrograman C',
    issuer: 'Dicoding - 2025'
  },
  {
    img: 'assets/img/cer4.jpg',
    title: 'Belajar Prinsip Pemrograman Solid',
    issuer: 'Dicoding - 2025'
  },
  {
    img: 'assets/img/cer5.jpg',
    title: 'Cloud Practitioner Essentials (Belajar Dasar AWS Cloud)',
    issuer: 'Dicoding - 2024'
  },
  {
    img: 'assets/img/cer6.jpg',
    title: 'Belajar Back-End Pemula dengan JavaScript',
    issuer: 'Dicoding - 2022'
  },
  {
    img: 'assets/img/cer7.jpg',
    title: 'Belajar Dasar Manajemen Projek',
    issuer: 'Dicoding - 2025'
  },
  {
    img: 'assets/img/cer8.jpg',
    title: 'Belajar Dasar AI',
    issuer: 'Dicoding - 2025'
  },
  {
    img: 'assets/img/cer9.png',
    title: 'Full Stack Web Development',
    issuer: 'Purwadhika - 2025'
  },
  {
    img: 'assets/img/cer10.png',
    title: 'UI/UX Design',
    issuer: 'Purwadhika - 2025'
  }
];

let currentPage = 1;
const itemsPerPage = 6;
const totalPages = Math.ceil(certificatesData.length / itemsPerPage);

// Initialize certificates
function initCertificates() {
  renderCertificates();
  renderPageIndicators();
  updatePaginationButtons();
}

// Render certificates for current page
function renderCertificates() {
  const grid = document.getElementById('certificatesGrid');
  grid.innerHTML = '';
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCerts = certificatesData.slice(startIndex, endIndex);
  
  currentCerts.forEach((cert, index) => {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.style.transition = 'all 0.5s ease';
    card.style.transitionDelay = `${index * 0.1}s`;
    card.onclick = () => openModal(cert.img);
    
    card.innerHTML = `
      <div class="certificate-shine"></div>
      <div class="certificate-image">
        <img src="${cert.img}" alt="Certificate" />
      </div>
      <div class="certificate-info">
        <h3>${cert.title}</h3>
        <p class="certificate-issuer">${cert.issuer}</p>
        <div class="certificate-actions">
          <button onclick="event.stopPropagation(); openModal('${cert.img}')" class="cert-btn view-btn">
            <i class="bi bi-eye"></i> View
          </button>
          <button onclick="event.stopPropagation()" class="cert-btn verify-btn">
            <i class="bi bi-patch-check"></i> Verify
          </button>
        </div>
      </div>
    `;
    
    grid.appendChild(card);
    
    // Trigger animation
    setTimeout(() => {
      card.classList.add('aos-animate');
    }, 50);
  });
  
  // Update page number
  document.getElementById('currentPage').textContent = currentPage;
  document.getElementById('totalPages').textContent = totalPages;
}

// Change page
function changePage(direction) {
  const newPage = currentPage + direction;
  
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    
    // Fade out current certificates
    const cards = document.querySelectorAll('.certificate-card');
    cards.forEach(card => {
      card.classList.remove('aos-animate');
    });
    
    // Render new certificates after animation
    setTimeout(() => {
      renderCertificates();
      updatePaginationButtons();
      updatePageIndicators();
      
      // Scroll to certificates section
      document.getElementById('certificates').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 300);
  }
}

// Specific page
function goToPage(page) {
  if (page !== currentPage && page >= 1 && page <= totalPages) {
    currentPage = page;
    
    const cards = document.querySelectorAll('.certificate-card');
    cards.forEach(card => {
      card.classList.remove('aos-animate');
    });
    
    setTimeout(() => {
      renderCertificates();
      updatePaginationButtons();
      updatePageIndicators();
      
      document.getElementById('certificates').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 300);
  }
}

// pagination buttons state
function updatePaginationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Render page indicators
function renderPageIndicators() {
  const container = document.getElementById('pageIndicators');
  container.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    if (i === currentPage) {
      indicator.classList.add('active');
    }
    indicator.onclick = () => goToPage(i);
    container.appendChild(indicator);
  }
}

// page indicators
function updatePageIndicators() {
  const indicators = document.querySelectorAll('.page-indicator');
  indicators.forEach((indicator, index) => {
    if (index + 1 === currentPage) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initCertificates();
});

// ==============================================
// KEYBOARD NAVIGATION
// ==============================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("modal");
    if (modal.classList.contains("active")) {
      closeModal();
    }
    if (navMenu.classList.contains("active")) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  }
});

// ==============================================
// ACTIVE NAVIGATION HIGHLIGHT
// ==============================================
const sections = document.querySelectorAll("section[id]");

function highlightNavigation() {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute("id");
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      if (navLink) {
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.style.color = "var(--text-primary)";
        });
        navLink.style.color = "var(--accent-blue)";
      }
    }
  });
}

window.addEventListener("scroll", highlightNavigation);

// ==============================================
// PARALLAX EFFECT
// ==============================================
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector(".hero-content");
  const heroImage = document.querySelector(".hero-image");

  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
  }
});

// ==============================================
// SOCIAL LINKS HOVER
// ==============================================
document.querySelectorAll(".social-link").forEach((link) => {
  link.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-5px) scale(1.1)";
  });
  link.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// ==============================================
// MOBILE DETECTION
// ==============================================
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  document.body.classList.add("mobile-device");
}

// ==============================================
// CLOSE MENU ON OUTSIDE CLICK
// ==============================================
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }
});

// ==============================================
// PREVENT HORIZONTAL SCROLL
// ==============================================
document.body.style.overflowX = "hidden";

// ==============================================
// PAGE LOAD ANIMATION
// ==============================================
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  console.log("✅ Portfolio initialized successfully!");
  console.log(
    "📧 EmailJS Status:",
    typeof emailjs !== "undefined" ? "Loaded" : "Not Loaded"
  );
});

// ==============================================
// CONSOLE EASTER EGG
// ==============================================
console.log(
  "%c👋 Hello Developer!",
  "color: #3b82f6; font-size: 20px; font-weight: bold;"
);
console.log(
  "%cLooking for something? Check out my GitHub!",
  "color: #10b981; font-size: 14px;"
);
console.log(
  "%c🚀 Built with HTML, CSS, and vanilla JavaScript",
  "color: #06b6d4; font-size: 12px;"
);
