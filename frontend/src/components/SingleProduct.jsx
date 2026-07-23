import { useLoaderData, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { AuthContext } from "../contexts/AuthContext";

const SingleProduct = () => {
  const product = useLoaderData();
  const { t } = useContext(LanguageContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNowClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowForm(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!customerPhone || !customerAddress) {
      setError("Please enter your phone number and delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: user.displayName || user.email,
          customerEmail: user.email,
          customerPhone,
          customerAddress,
          branch: product.branch,
          products: [
            {
              productId: product._id,
              productName: product.productName,
              price: product.price,
              quantity,
            },
          ],
          totalAmount: product.price * quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order.");
        setSubmitting(false);
        return;
      }

      navigate("/orders");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 lg:px-24 py-24">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div>
            <img src={product?.imageURL} alt={product?.productName} className="w-full rounded-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-blue-700 mb-4">{product?.productName}</h1>
            <p className="text-gray-600 mb-4">{t("category")}: {product?.category}</p>
            <p className="text-2xl font-semibold text-green-600 mb-4">{product?.price} BIF</p>
            <p className="text-gray-700 mb-6">{product?.description}</p>

            {!showForm ? (
              <button
                onClick={handleBuyNowClick}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
              >
                {t("buyNow")}
              </button>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+257 ..."
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Bujumbura, Rohero, Av. de la Plage 12"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <p className="text-lg font-semibold">
                  Total: {product.price * quantity} BIF
                </p>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {submitting ? "Placing order..." : "Confirm Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
