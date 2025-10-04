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
const jobList = document.getElementById("job-list");
const myProjects = document.getElementById("my-projects");
const btnHome = document.getElementById("btn-home");
const btnMy = document.getElementById("btn-my");
const deliveryModal = document.getElementById("delivery-modal");
const fileUpload = document.getElementById("file-upload");
const telebirrInput = document.getElementById("telebirr-number");
const submitDelivery = document.getElementById("submit-delivery");
const cancelDelivery = document.getElementById("cancel-delivery");

let currentJobId = null;
let currentCard = null;

// Nav button handlers
btnHome.addEventListener("click", () => {
  jobList.classList.remove("hidden");
  myProjects.classList.add("hidden");
  btnHome.classList.add("active");
  btnMy.classList.remove("active");
  loadJobs();
});

btnMy.addEventListener("click", () => {
  jobList.classList.add("hidden");
  myProjects.classList.remove("hidden");
  btnMy.classList.add("active");
  btnHome.classList.remove("active");
  loadMyProjects();
});

// Auto-load on start
window.addEventListener("DOMContentLoaded", () => btnHome.click());

// Fetch and display available jobs
async function loadJobs() {
  jobList.innerHTML = "";
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "posted"),
      orderBy("expiry", "asc")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      jobList.innerHTML = `<p class="empty-state">No available jobs right now. 🕐</p>`;
      return;
    }
    snap.forEach(docSnap => {
      const job = docSnap.data();
      const id = docSnap.id;
      const card = document.createElement("div");
      card.className = "job-card";
      card.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p><strong>📅 Expiry:</strong> ${job.expiry}</p>
        <p><strong>💰 Salary:</strong> ${job.salary}</p>
        <button class="nav-btn accept-btn">✅ Accept Job</button>
      `;
      card.querySelector(".accept-btn")
        .addEventListener("click", () => acceptJob(id, card));
      jobList.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading jobs:", err);
    jobList.innerHTML = `<p class="empty-state">❌ Failed to load jobs.</p>`;
  }
}

// Load my accepted projects
async function loadMyProjects() {
  myProjects.innerHTML = "";
  try {
    const q = query(
      collection(db, "jobs"),
      where("status", "==", "accepted"),
      orderBy("expiry", "asc")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      myProjects.innerHTML = `<p class="empty-state">No accepted projects yet. 📭</p>`;
      return;
    }
    snap.forEach(docSnap => {
      const job = docSnap.data();
      const id = docSnap.id;
      const card = document.createElement("div");
      card.className = "job-card my-project-card";
      card.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p><strong>📅 Expiry:</strong> ${job.expiry}</p>
        <p><strong>💰 Salary:</strong> ${job.salary}</p>
        <button class="nav-btn submit-btn">🚀 Submit Project</button>
      `;
      card.querySelector(".submit-btn")
        .addEventListener("click", () => openDeliveryModal(id, card));
      myProjects.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading my projects:", err);
    myProjects.innerHTML = `<p class="empty-state">❌ Failed to load projects.</p>`;
  }
}

// Accept a job and move it to "My Projects"
async function acceptJob(id, card) {
  try {
    await updateDoc(doc(db, "jobs", id), { status: "accepted" });
    card.remove();
    loadMyProjects();
    btnMy.click();
  } catch (err) {
    console.error("Error accepting job:", err);
    alert("❌ Could not accept job. Try again.");
  }
}

// Open delivery modal
function openDeliveryModal(id, card) {
  currentJobId = id;
  currentCard = card;
  deliveryModal.classList.remove("hidden");
  fileUpload.value = "";
  telebirrInput.value = "";
}

// Close delivery modal
function closeDeliveryModal() {
  deliveryModal.classList.add("hidden");
  currentJobId = null;
  currentCard = null;
}

// Submit delivery
submitDelivery.addEventListener("click", async () => {
  const files = fileUpload.files;
  const telebirr = telebirrInput.value.trim();

  if (files.length === 0) {
    alert("📁 Please upload at least one video file.");
    return;
  }

  if (!/^09\d{8}$/.test(telebirr)) {
    alert("📱 Invalid Telebirr. Must start with 09 and be 10 digits.");
    return;
  }

  try {
    // Simulate file upload process (in real app, upload to storage first)
    const fileNames = Array.from(files).map(file => file.name).join(", ");
    
    await updateDoc(doc(db, "jobs", currentJobId), {
      status: "delivered",
      deliverLink: `Uploaded: ${fileNames}`,
      editorTelebirr: telebirr
    });

    alert("🎉 Project submitted successfully! Payment will be processed soon.");
    closeDeliveryModal();
    if (currentCard) currentCard.remove();
    loadMyProjects();
  } catch (err) {
    console.error("Error delivering job:", err);
    alert("❌ Submission failed. Please try again.");
  }
});

cancelDelivery.addEventListener("click", closeDeliveryModal);

// Close modal when clicking outside
deliveryModal.addEventListener("click", (e) => {
  if (e.target === deliveryModal) {
    closeDeliveryModal();
  }
});