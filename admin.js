// admin.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  // Element Refs
  const clientInput = document.getElementById("client-username");
  const titleInput = document.getElementById("job-title");
  const descInput = document.getElementById("job-description");
  const expiryInput = document.getElementById("job-expiry");
  const salaryInput = document.getElementById("job-salary");
  const postBtn = document.getElementById("post-job");
  const deliveredList = document.getElementById("delivered-jobs");

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  expiryInput.min = today;

  // Post Job Handler
  postBtn.addEventListener("click", async () => {
    const client = clientInput.value.trim();
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const expiry = expiryInput.value;
    const salary = salaryInput.value.trim();

    if (!client || !title || !desc || !expiry || !salary) {
      showNotification('❌ Please fill all fields', 'error');
      return;
    }

    if (!client.startsWith('@')) {
      showNotification('❌ Client username must start with @', 'error');
      return;
    }

    postBtn.innerHTML = '<div class="btn-spinner"></div> Posting...';
    postBtn.disabled = true;

    try {
      await addDoc(collection(db, "jobs"), {
        clientUsername: client,
        title,
        description: desc,
        expiry,
        salary,
        status: "posted",
        deliverLink: "",
        editorTelebirr: "",
        postedAt: new Date().toISOString()
      });

      showNotification('✅ Job posted successfully!', 'success');
      
      // Clear form
      clientInput.value = titleInput.value = descInput.value = salaryInput.value = "";
      expiryInput.value = "";
      
      loadDeliveredProjects();
    } catch (err) {
      console.error("Error posting job:", err);
      showNotification('❌ Failed to post job', 'error');
    } finally {
      postBtn.innerHTML = '✅ Post Job';
      postBtn.disabled = false;
    }
  });

  // Load Delivered Projects
  async function loadDeliveredProjects() {
    deliveredList.innerHTML = "";
    try {
      const q = query(
        collection(db, "jobs"),
        where("status", "==", "delivered"),
        orderBy("deliveredAt", "desc")
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        deliveredList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No deliveries yet</h3>
            <p>Completed projects will appear here</p>
          </div>
        `;
        return;
      }
      
      snap.forEach(docSnap => {
        deliveredList.appendChild(createDeliveredCard(docSnap.id, docSnap.data()));
      });
    } catch (err) {
      console.error("Error loading deliveries:", err);
      deliveredList.innerHTML = `
        <div class="empty-state error">
          <div class="empty-icon">❌</div>
          <h3>Failed to load deliveries</h3>
          <p>Please check your connection</p>
        </div>
      `;
    }
  }

  // Create Delivered Project Card
  function createDeliveredCard(id, job) {
    const card = document.createElement("div");
    card.className = "delivered-card glass-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${job.title}</h3>
        <button class="btn-delete" title="Delete Project">🗑️</button>
      </div>
      
      <div class="card-body">
        <p class="card-description">${job.description}</p>
        
        <div class="project-details">
          <div class="detail-row">
            <span class="detail-label">📅 Expiry:</span>
            <span class="detail-value">${job.expiry}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">💰 Salary:</span>
            <span class="detail-value">${job.salary}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <label>👤 Client</label>
            <div class="copy-field">
              <span class="copy-text">${job.clientUsername}</span>
              <button class="btn-copy" data-text="${job.clientUsername}">📋</button>
            </div>
          </div>
          
          <div class="info-item">
            <label>📱 Editor Telebirr</label>
            <div class="copy-field">
              <span class="copy-text">${job.editorTelebirr}</span>
              <button class="btn-copy" data-text="${job.editorTelebirr}">📋</button>
            </div>
          </div>
          
          <div class="info-item">
            <label>🔗 Drive Link</label>
            <div class="copy-field">
              <a href="${job.deliverLink}" target="_blank" class="drive-link">${job.deliverLink}</a>
              <button class="btn-copy" data-text="${job.deliverLink}">📋</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-glow"></div>
    `;

    // Copy handlers
    card.querySelectorAll(".btn-copy").forEach(btn => {
      btn.addEventListener("click", async () => {
        const text = btn.dataset.text;
        try {
          await navigator.clipboard.writeText(text);
          btn.innerHTML = "✅";
          setTimeout(() => btn.innerHTML = "📋", 2000);
        } catch {
          showNotification('❌ Copy failed', 'error');
        }
      });
    });

    // Delete handler
    card.querySelector(".btn-delete").addEventListener("click", async () => {
      if (!confirm("🗑️ Delete this project permanently?")) return;
      
      try {
        await deleteDoc(doc(db, "jobs", id));
        card.style.animation = "cardSlideOut 0.5s forwards";
        setTimeout(() => card.remove(), 500);
        showNotification('✅ Project deleted', 'success');
      } catch (err) {
        console.error("Error deleting job:", err);
        showNotification('❌ Delete failed', 'error');
      }
    });

    return card;
  }

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

  // Initial load
  loadDeliveredProjects();
});