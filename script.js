// script.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Element refs
const jobsContainer = document.getElementById("jobs-container");
const projectsContainer = document.getElementById("projects-container");
const btnHome = document.getElementById("btn-home");
const btnMy = document.getElementById("btn-my");
const deliveryModal = document.getElementById("delivery-modal");
const driveLinkInput = document.getElementById("drive-link");
const telebirrInput = document.getElementById("telebirr-number");
const submitDelivery = document.getElementById("submit-delivery");
const cancelDelivery = document.getElementById("cancel-delivery");
const closeModal = document.querySelector(".close-modal");

let currentJobId = null;
let currentCard = null;

// Navigation system
btnHome.addEventListener("click", () => {
  document.getElementById("job-list").classList.add("section-active");
  document.getElementById("job-list").classList.remove("section-hidden");
  document.getElementById("my-projects").classList.add("section-hidden");
  document.getElementById("my-projects").classList.remove("section-active");
  
  btnHome.classList.add("active");
  btnMy.classList.remove("active");
  loadJobs();
});

btnMy.addEventListener("click", () => {
  document.getElementById("my-projects").classList.add("section-active");
  document.getElementById("my-projects").classList.remove("section-hidden");
  document.getElementById("job-list").classList.add("section-hidden");
  document.getElementById("job-list").classList.remove("section-active");
  
  btnMy.classList.add("active");
  btnHome.classList.remove("active");
  loadMyProjects();
});

// Auto-load on start
window.addEventListener("DOMContentLoaded", () => {
  btnHome.click();
});

// Fetch and display available jobs
async function loadJobs() {
  jobsContainer.innerHTML = "";
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "posted"),
      orderBy("expiry", "asc")
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      jobsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No available jobs</h3>
          <p>Check back later for new projects</p>
        </div>
      `;
      return;
    }
    
    snap.forEach(docSnap => {
      const job = docSnap.data();
      const id = docSnap.id;
      jobsContainer.appendChild(createJobCard(id, job, "available"));
    });
  } catch (err) {
    console.error("Error loading jobs:", err);
    jobsContainer.innerHTML = `
      <div class="empty-state error">
        <div class="empty-icon">❌</div>
        <h3>Failed to load jobs</h3>
        <p>Please check your connection</p>
      </div>
    `;
  }
}

// Load my accepted projects
async function loadMyProjects() {
  projectsContainer.innerHTML = "";
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "accepted"),
      orderBy("expiry", "asc")
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      projectsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>No accepted projects</h3>
          <p>Accept jobs from the Home tab</p>
        </div>
      `;
      return;
    }
    
    snap.forEach(docSnap => {
      const job = docSnap.data();
      const id = docSnap.id;
      projectsContainer.appendChild(createJobCard(id, job, "accepted"));
    });
  } catch (err) {
    console.error("Error loading my projects:", err);
    projectsContainer.innerHTML = `
      <div class="empty-state error">
        <div class="empty-icon">❌</div>
        <h3>Failed to load projects</h3>
        <p>Please check your connection</p>
      </div>
    `;
  }
}

// Create job card
function createJobCard(id, job, type) {
  const card = document.createElement("div");
  card.className = `job-card ${type}-card`;
  card.innerHTML = `
    <div class="card-header">
      <h3>${job.title}</h3>
      <div class="card-badge ${type}">${type === 'available' ? '📋 Available' : '✅ Accepted'}</div>
    </div>
    <div class="card-body">
      <p class="card-description">${job.description}</p>
      <div class="card-details">
        <div class="detail-item">
          <span class="detail-icon">📅</span>
          <span class="detail-text">${job.expiry}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">💰</span>
          <span class="detail-text">${job.salary}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      ${type === 'available' ? 
        '<button class="btn-accept">✅ Accept Job</button>' : 
        '<button class="btn-submit">🚀 Submit Project</button>'
      }
    </div>
    <div class="card-glow"></div>
  `;

  if (type === 'available') {
    card.querySelector('.btn-accept').addEventListener('click', () => acceptJob(id, card));
  } else {
    card.querySelector('.btn-submit').addEventListener('click', () => openDeliveryModal(id, card));
  }

  return card;
}

// Accept a job
async function acceptJob(id, card) {
  const btn = card.querySelector('.btn-accept');
  btn.innerHTML = '<div class="btn-spinner"></div> Accepting...';
  btn.disabled = true;
  
  try {
    await updateDoc(doc(db, "jobs", id), { 
      status: "accepted",
      acceptedAt: new Date().toISOString()
    });
    
    card.style.animation = 'cardSlideOut 0.5s forwards';
    setTimeout(() => {
      card.remove();
      loadMyProjects();
      btnMy.click();
    }, 500);
    
  } catch (err) {
    console.error("Error accepting job:", err);
    btn.innerHTML = '✅ Accept Job';
    btn.disabled = false;
    showNotification('❌ Failed to accept job. Try again.', 'error');
  }
}

// Modal functions
function openDeliveryModal(id, card) {
  currentJobId = id;
  currentCard = card;
  deliveryModal.classList.remove('hidden');
  driveLinkInput.value = '';
  telebirrInput.value = '';
}

function closeDeliveryModal() {
  deliveryModal.classList.add('hidden');
  currentJobId = null;
  currentCard = null;
}

// Submit delivery
submitDelivery.addEventListener('click', async () => {
  const driveLink = driveLinkInput.value.trim();
  const telebirr = telebirrInput.value.trim();

  if (!driveLink) {
    showNotification('🔗 Please enter Google Drive link', 'error');
    return;
  }

  if (!/^09\d{8}$/.test(telebirr)) {
    showNotification('📱 Invalid Telebirr. Must start with 09 and be 10 digits.', 'error');
    return;
  }

  submitDelivery.innerHTML = '<div class="btn-spinner"></div> Submitting...';
  submitDelivery.disabled = true;

  try {
    await updateDoc(doc(db, "jobs", currentJobId), {
      status: "delivered",
      deliverLink: driveLink,
      editorTelebirr: telebirr,
      deliveredAt: new Date().toISOString()
    });

    showNotification('🎉 Project submitted successfully!', 'success');
    closeDeliveryModal();
    
    if (currentCard) {
      currentCard.style.animation = 'cardSlideOut 0.5s forwards';
      setTimeout(() => currentCard.remove(), 500);
    }
    
    loadMyProjects();
    
  } catch (err) {
    console.error("Error delivering job:", err);
    showNotification('❌ Submission failed. Please try again.', 'error');
  } finally {
    submitDelivery.innerHTML = '🚀 Submit Project';
    submitDelivery.disabled = false;
  }
});

// Event listeners for modal
cancelDelivery.addEventListener('click', closeDeliveryModal);
closeModal.addEventListener('click', closeDeliveryModal);
deliveryModal.addEventListener('click', (e) => {
  if (e.target === deliveryModal) closeDeliveryModal();
});

// Notification system
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}