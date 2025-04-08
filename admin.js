// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVQnGwJVye0-jtEko_87ACP8ita4MpJoA",
  authDomain: "my-store-project-b30ef.firebaseapp.com",
  projectId: "my-store-project-b30ef",
  storageBucket: "my-store-project-b30ef.appspot.com",
  messagingSenderId: "152253766630",
  appId: "1:152253766630:web:df5ebe6be564a2ea595427",
  measurementId: "G-V46GZWK3KV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const productForm = document.getElementById("product-form");
const productList = document.getElementById("product-list");
const orderList = document.getElementById("order-list");

// 新增商品到 Firebase
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productName = document.getElementById("product-name").value.trim();
  const productPrice = parseInt(document.getElementById("product-price").value);
  const productImage = document.getElementById("product-image").files[0];

  if (!productName || isNaN(productPrice) || !productImage) {
    alert("請完整填寫所有欄位！");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(productImage);
  reader.onload = async () => {
    const newProduct = {
      name: productName,
      price: productPrice,
      image: reader.result
    };

    try {
      await addDoc(collection(db, "products"), newProduct);
      alert("商品新增成功！");
      displayProducts(); // 刷新商品列表
      productForm.reset(); // 清空表單
    } catch (error) {
      console.error("新增商品時出錯:", error);
      alert("新增商品失敗！");
    }
  };
});

// 顯示 Firebase 中的商品
async function displayProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  productList.innerHTML = ""; // 清空商品列表

  querySnapshot.forEach((doc) => {
    const product = { id: doc.id, ...doc.data() };

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${product.image}" width="50"> ${product.name} - NT$${product.price}
      <button class="delete-btn" data-id="${product.id}">刪除</button>
    `;
    productList.appendChild(li);
  });

  // 綁定刪除商品按鈕
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const productId = event.target.getAttribute("data-id");

      try {
        await deleteDoc(doc(db, "products", productId));
        alert("商品已刪除！");
        displayProducts(); // 刷新商品列表
      } catch (error) {
        console.error("刪除商品時出錯:", error);
        alert("刪除商品失敗！");
      }
    });
  });
}

// 顯示 Firebase 中的訂單
async function displayOrders() {
  const querySnapshot = await getDocs(collection(db, "orders"));
  orderList.innerHTML = ""; // 清空訂單列表

  querySnapshot.forEach((doc, index) => {
    const order = { id: doc.id, ...doc.data() };

    let summary = `訂單 ${index + 1} - 總金額: NT$${order.totalPrice}\n時間: ${order.time}\n商品:\n`;
    order.items.forEach((item, i) => {
      summary += `  ${i + 1}. ${item.name} - NT$${item.price}\n`;
    });

    const li = document.createElement("li");
    li.textContent = summary;
    orderList.appendChild(li);
  });
}

// 初始化
displayProducts();
displayOrders();