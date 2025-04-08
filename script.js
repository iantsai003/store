// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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

// HTML Elements
const productContainer = document.getElementById("product-container");
const cartItems = document.getElementById("cart-items");
const totalPriceDisplay = document.getElementById("total-price");
const checkoutButton = document.getElementById("checkout-btn");

// Local State
let cart = [];
let totalPrice = 0;

// Fetch Products from Firebase
async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
}

// Display Products
function displayProducts() {
  fetchProducts().then((products) => {
    productContainer.innerHTML = "";
    products.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add("product");
      productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.name}" width="150">
        <h2>${product.name}</h2>
        <p>NT$${product.price}</p>
        <label for="quantity-${product.id}">數量：</label>
        <input type="number" id="quantity-${product.id}" class="quantity-input" min="1" value="1">
        <button class="buy-btn" data-id="${product.id}">加入購物車</button>
      `;
      productContainer.appendChild(productDiv);
    });

    // Add to Cart
    document.querySelectorAll(".buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const quantity = parseInt(quantityInput.value);

        const selectedProduct = products.find((product) => product.id === productId);

        if (isNaN(quantity) || quantity <= 0) {
          alert("請輸入有效的數量！");
          return;
        }

        addToCart(selectedProduct, quantity);
      });
    });
  });
}

// Add to Cart
function addToCart(product, quantity) {
  const existingProductIndex = cart.findIndex((item) => item.name === product.name);

  if (existingProductIndex > -1) {
    cart[existingProductIndex].quantity += quantity;
    cart[existingProductIndex].subtotal += product.price * quantity;
  } else {
    const cartItem = {
      name: product.name,
      price: product.price,
      quantity: quantity,
      subtotal: product.price * quantity
    };
    cart.push(cartItem);
  }

  totalPrice += product.price * quantity;
  updateCart();
}

// Update Cart Display
function updateCart() {
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - NT$${item.price} x ${item.quantity} = NT$${item.subtotal}
      <button class="remove-btn" data-index="${index}">移除</button>
    `;
    cartItems.appendChild(li);
  });

  // Remove from Cart
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      totalPrice -= cart[index].subtotal;
      cart.splice(index, 1);
      updateCart();
    });
  });

  totalPriceDisplay.textContent = totalPrice;
}

// Checkout and Submit Order
checkoutButton.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("購物車是空的，請添加商品！");
    return;
  }

  const order = {
    items: cart,
    totalPrice: totalPrice,
    time: new Date().toLocaleString()
  };

  try {
    await addDoc(collection(db, "orders"), order);
    alert(`訂單已提交！\n總金額: NT$${order.totalPrice}\n下單時間: ${order.time}`);

    // Clear Cart
    cart = [];
    totalPrice = 0;
    updateCart();
  } catch (error) {
    console.error("提交訂單時出錯:", error);
    alert("提交訂單失敗，請稍後重試！");
  }
});

// Initialize Page
displayProducts();
updateCart();