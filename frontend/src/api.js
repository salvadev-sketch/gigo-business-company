const BASE_URL = import.meta.env.VITE_API_URL;

// Get all products
export const getAllProducts = async () => {
  const res = await fetch(`${BASE_URL}/all-products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

// Get single product
export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

// Upload new product
export const createProduct = async (productData) => {
  const res = await fetch(`${BASE_URL}/upload-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

// Update product
export const updateProduct = async (id, updatedData) => {
  const res = await fetch(`${BASE_URL}/product/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};

// Delete product
export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/product/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
};
