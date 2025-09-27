import { db } from "./firebase.js";
import {
  collection, addDoc,
  query, where, getDocs,
  orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const titleInput    = document.getElementById("job-title");
const deadlineInput = document.getElementById("job-deadline");
const telebirrInput = document.getElementById("editor-telebirr");
const postBtn       = document.getElementById("post-job");
const lastDiv       = document.getElementById("last-delivery");

postBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const dl    = deadlineInput.value.trim();
  const tb    = telebirrInput.value.trim();
  if (!title||!dl||!tb) return alert("Fill all fields");

  await addDoc(collection(db,"jobs"), {
    title, deadline:dl, editorTelebirr:tb,
    status:"posted", deliverLink:""
  });

  titleInput.value = deadlineInput.value = telebirrInput.value = "";
  loadLast();
});

async function loadLast() {
  const q        = query(
    collection(db,"jobs"),
    where("status","==","delivered"),
    orderBy("deadline","desc"),
    limit(1)
  );
  const snap     = await getDocs(q);
  if (snap.empty) {
    lastDiv.innerText = "No deliveries yet.";
    return;
  }
  const job = snap.docs[0].data();
  lastDiv.innerHTML = `
    <p>${job.title} (Deadline: ${job.deadline})</p>
    <p>Telebirr: ${job.editorTelebirr}</p>
    <p><a href="${job.deliverLink}" target="_blank">View File</a></p>
  `;
}

loadLast();
