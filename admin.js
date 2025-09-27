import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const titleInput = document.getElementById("job-title");
const deadlineInput = document.getElementById("job-deadline");
const telebirrInput = document.getElementById("editor-telebirr");
const postBtn = document.getElementById("post-job");
const lastDelivery = document.getElementById("last-delivery");

postBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const deadline = deadlineInput.value.trim();
  const telebirr = telebirrInput.value.trim();

  if (!title || !deadline || !telebirr) {
    alert("❌ Fill all fields");
    return;
  }

  await addDoc(collection(db, "jobs"), {
    title,
    deadline,
    editorTelebirr: telebirr,
    status: "posted",
    deliverLink: ""
  });

  alert("✅ Job posted");
  titleInput.value = "";
  deadlineInput.value = "";
  telebirrInput.value = "";
  loadLastDelivery();
});

async function loadLastDelivery() {
  const q = query(
    collection(db, "jobs"),
    where("status", "==", "delivered"),
    orderBy("deadline", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    lastDelivery.innerText = "No deliveries yet.";
    return;
  }

  const job = snapshot.docs[0].data();
  lastDelivery.innerHTML = `
    <p><strong>Title:</strong> ${job.title}</p>
    <p><strong>Deadline:</strong> ${job.deadline}</p>
    <p><strong>Editor Telebirr:</strong> ${job.editorTelebirr}</p>
    <p><strong>Delivery:</strong>
      <a href="${job.deliverLink}" target="_blank">${job.deliverLink}</a>
    </p>
  `;
}

loadLastDelivery();
