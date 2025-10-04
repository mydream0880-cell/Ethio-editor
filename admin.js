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
  // --- Element Refs ---
  const clientInput = document.getElementById("client-username");
  const titleInput = document.getElementById("job-title");
  const descInput = document.getElementById("job-description");
  const expiryInput = document.getElementById("job-expiry");
  const salaryInput = document.getElementById("job-salary");
  const postBtn = document.getElementById("post-job");
  const deliveredList = document.getElementById("delivered-jobs");

  console.log("admin.js loaded, postBtn:", postBtn);

  // --- Post Job Handler ---
  postBtn.addEventListener("click", async () => {
    console.log("Post button clicked");
    const client = clientInput.value.trim();
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const expiry = expiryInput.value;
    const salary = salaryInput.value.trim();

    if (!client || !title || !desc || !expiry || !salary) {
      return alert("❌ Please fill in all fields before posting.");
    }

    // Validate client username format
    if (!client.startsWith('@')) {
      return alert("❌ Client username must start with @");
    }

    postBtn.disabled = true;
    postBtn.textContent = "Posting...";
    
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
      
      alert("✅ Job posted successfully!");
      // Clear form
      clientInput.value = titleInput.value = descInput.value = expiryInput.value = salaryInput.value = "";
      loadDeliveredProjects();
    } catch (err) {
      console.error("Error posting job:", err);
      alert("❌ Failed to post job. See console for details.");
    } finally {
      postBtn.disabled = false;
      postBtn.textContent = "✅ Post Job";
    }
  });

  // --- Load Delivered Projects ---
  async function loadDeliveredProjects() {
    deliveredList.innerHTML = "";
    try {
      const q = query(
        collection(db, "jobs"),
        where("status", "==", "delivered"),
        orderBy("expiry", "desc")
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        deliveredList.innerHTML = `<p class="empty-state">No deliveries yet. 📭</p>`;
        return;
      }
      snap.forEach(docSnap => {
        deliveredList.appendChild(
          createDeliveredCard(docSnap.id, docSnap.data())
        );
      });
    } catch (err) {
      console.error("Error loading deliveries:", err);
      deliveredList.innerHTML = `<p class="empty-state">❌ Error loading deliveries.</p>`;
    }
  }

  // --- Build a Delivered-Project Card ---
  function createDeliveredCard(id, job) {
    const card = document.createElement("div");
    card.className = "delivered-card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${job.title}</h3>
        <button class="delete-btn" title="Delete Project">🗑️</button>
      </div>
      <p><strong>📝 Description:</strong> ${job.description}</p>
      <p><strong>📅 Expiry:</strong> ${job.expiry}</p>
      <p><strong>💰 Salary:</strong> ${job.salary}</p>
      
      <div class="info-group">
        <strong>👤 Client:</strong> 
        <span class="copyable" data-value="${job.clientUsername}">
          ${job.clientUsername}
        </span>
        <button class="copy-btn" data-copy="${job.clientUsername}">📋</button>
      </div>
      
      <div class="info-group">
        <strong>📱 Editor Telebirr:</strong> 
        <span class="copyable" data-value="${job.editorTelebirr}">
          ${job.editorTelebirr}
        </span>
        <button class="copy-btn" data-copy="${job.editorTelebirr}">📋</button>
      </div>
      
      <div class="info-group">
        <strong>📎 Drive Link:</strong> 
        <span class="copyable" data-value="${job.deliverLink}">
          ${job.deliverLink}
        </span>
        <button class="copy-btn" data-copy="${job.deliverLink}">📋</button>
      </div>
    `;

    // Copy handlers
    card.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          const originalText = btn.textContent;
          btn.textContent = "✅";
          setTimeout(() => btn.textContent = originalText, 1000);
        } catch {
          alert("❌ Copy failed. Please copy manually.");
        }
      });
    });

    // Delete handler
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("🗑️ Delete this project permanently?")) return;
      try {
        await deleteDoc(doc(db, "jobs", id));
        card.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => card.remove(), 300);
      } catch (err) {
        console.error("Error deleting job:", err);
        alert("❌ Delete failed. See console for details.");
      }
    });

    return card;
  }

  // Initial load
  loadDeliveredProjects();
});