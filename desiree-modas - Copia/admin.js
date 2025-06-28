import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5SnZhG3JXZ8A61s_GfrsWAtUocluLtLg",
  authDomain: "desiree-modas.firebaseapp.com",
  projectId: "desiree-modas",
  storageBucket: "desiree-modas.appspot.com",
  messagingSenderId: "164736118797",
  appId: "1:164736118797:web:b69edc160678bfb42d6544",
  measurementId: "G-ESWPVKPB9K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const cloudName = "dflsc28xo";
const unsignedUploadPreset = "unsigned_preset";

let editingProductId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email.toLowerCase() === "deysianz@gmail.com") {
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      loadProducts();
    } else {
      alert("Usuário não autorizado");
      auth.signOut();
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('admin-panel').style.display = 'none';
    }
  } else {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
  }
});

document.getElementById('login-btn').onclick = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
};

async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", unsignedUploadPreset);
  const response = await fetch(url, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Erro no upload da imagem");
  const data = await response.json();
  return data.secure_url;
}

async function loadProducts() {
  const productsList = document.getElementById('products-list');
  productsList.innerHTML = 'Carregando...';

  const querySnapshot = await getDocs(collection(db, "products"));
  productsList.innerHTML = '';

  querySnapshot.forEach(docSnap => {
    const p = docSnap.data();
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div style="flex-grow:1; padding-left: 12px;">
        <strong>${p.name}</strong><br/>
        <em>R$ ${Number(p.price).toFixed(2).replace('.', ',')}</em><br/>
        <p>${p.description || ''}</p>
      </div>
      <button class="edit-btn" data-id="${docSnap.id}">Editar</button>
      <button class="delete-btn" data-id="${docSnap.id}">Excluir</button>
    `;
    productDiv.style.display = "flex";
    productDiv.style.alignItems = "center";
    productDiv.style.gap = "15px";
    productDiv.style.padding = "10px";
    productDiv.style.border = "1px solid #eee";
    productDiv.style.borderRadius = "8px";
    productDiv.style.marginBottom = "12px";
    productsList.appendChild(productDiv);
  });

  // Eventos de excluir
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Excluir produto?')) {
        await deleteDoc(doc(db, "products", btn.dataset.id));
        loadProducts();
      }
    };
  });

  // Eventos de editar
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      editingProductId = btn.dataset.id;
      const docRef = doc(db, "products", editingProductId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const p = docSnap.data();
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-category').value = p.category || '';
        document.getElementById('prod-description').value = p.description || '';
        document.getElementById('prod-img').value = '';
        document.getElementById('prod-add-btn').textContent = 'Salvar Alterações';
      }
    };
  });
}

document.getElementById('prod-add-btn').onclick = async () => {
  const name = document.getElementById('prod-name').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const category = document.getElementById('prod-category').value.trim();
  const description = document.getElementById('prod-description').value.trim();
  const fileInput = document.getElementById('prod-img');
  let imageUrl = null;

  if (!name || isNaN(price) || !category || !description) {
    alert('Preencha todos os campos');
    return;
  }

  if (fileInput.files.length > 0) {
    try {
      imageUrl = await uploadImageToCloudinary(fileInput.files[0]);
    } catch (e) {
      alert('Erro no upload da imagem: ' + e.message);
      return;
    }
  }

  if (editingProductId) {
    const docRef = doc(db, "products", editingProductId);
    const updateData = { name, price, category, description };
    if (imageUrl) updateData.image = imageUrl;
    await updateDoc(docRef, updateData);
    editingProductId = null;
    document.getElementById('prod-add-btn').textContent = 'Adicionar Produto';
  } else {
    if (!imageUrl) {
      alert('Por favor, envie uma imagem para o produto.');
      return;
    }
    await addDoc(collection(db, "products"), {
      name, price, category, description, image: imageUrl
    });
  }

  // Limpar formulário e recarregar
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-category').value = '';
  document.getElementById('prod-description').value = '';
  document.getElementById('prod-img').value = '';
  loadProducts();
};
