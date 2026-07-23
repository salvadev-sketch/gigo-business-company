import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { API, C, S, fmt, fmtM, timeAgo, stockStatus, BRANCHES, CATEGORIES, ROLES, MONTH_NAMES } from "./dashboardUtils";
import Spinner from "./Spinner";

function useT() {
  const { language, translations } = useContext(LanguageContext);
  const dashLang = language === "rn" ? "fr" : language;
  return (key) => translations[dashLang]?.[key] ?? translations["en"]?.[key] ?? key;
}

function Products({ token, t }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ productName: "", brandName: "", imageURL: "", category: "", description: "", price: "", branch: "", stock: "0", minStockLevel: "10" });

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const signRes = await fetch(`${API}/media/sign`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const sig = await signRes.json();
      if (!signRes.ok) throw new Error(sig?.error || "Could not get an upload signature");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.apiKey);
      body.append("timestamp", String(sig.timestamp));
      body.append("signature", sig.signature);
      body.append("folder", sig.folder);

      const uploadRes = await fetch(sig.uploadUrl, { method: "POST", body });
      const asset = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(asset?.error?.message || "Cloudinary upload failed");

      setForm(f => ({ ...f, imageURL: asset.secure_url }));
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Image upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${API}/all-products?limit=100&search=${search}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ productName: "", brandName: "", imageURL: "", category: "", description: "", price: "", branch: "", stock: "0", minStockLevel: "10" });
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ productName: p.productName, brandName: p.brandName, imageURL: p.imageURL, category: p.category, description: p.description, price: p.price, branch: p.branch, stock: p.stock || 0, minStockLevel: p.minStockLevel || 10 });
    setShowModal(true);
  };

  const save = async () => {
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `${API}/product/${editing._id}` : `${API}/upload-product`;
    const body = { ...form, price: Number(form.price), stock: Number(form.stock), minStockLevel: Number(form.minStockLevel) };
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.success || d.product) { setMsg({ type: "success", text: editing ? t("productUpdated") || "Product updated!" : t("productAdded") || "Product added!" }); setShowModal(false); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  const del = async (id) => {
    if (!window.confirm(t("deleteConfirm") || "Delete this product?")) return;
    const r = await fetch(`${API}/product/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) { setMsg({ type: "success", text: t("deleted") || "Deleted!" }); load(); }
    else setMsg({ type: "error", text: d.error || "Failed" });
  };

  return (
    <div>
      <div className="gigo-section-header" style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>{t("productManagement") || "Product Management"}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{products.length} {t("products")}</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input style={{ ...S.input, width: "200px" }} placeholder={t("searchPlaceholder") || "Search..."} value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.btn("primary")} onClick={openAdd}>+ {t("addProduct") || "Add Product"}</button>
        </div>
      </div>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
      {loading ? <Spinner /> : (
        <div style={S.card}>
          <table className="gigo-table" style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{t("product") || "Product"}</th>
                <th style={S.th}>{t("category") || "Category"}</th>
                <th style={S.th}>{t("stock") || "Stock"}</th>
                <th style={S.th}>{t("price") || "Price"}</th>
                <th style={S.th}>{t("status")}</th>
                <th style={S.th}>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: C.textMuted }}>{t("noProducts")}</td></tr>
              )}
              {products.map((p, i) => {
                const st = stockStatus(p);
                return (
                  <tr key={i}>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {p.imageURL && (
                          <img src={p.imageURL} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", background: C.bg }} onError={e => e.target.style.display = "none"} />
                        )}
                        <div>
                          <div style={{ fontWeight: "600" }}>{p.productName}</div>
                          <div style={{ fontSize: "11px", color: C.textMuted }}>{p.brandName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}><span style={S.pill(p.category)}>{p.category}</span></td>
                    <td style={{ ...S.td, fontWeight: "700", color: p.stock <= (p.minStockLevel || 10) ? C.red : C.text }}>{fmt(p.stock)}</td>
                    <td style={{ ...S.td, color: C.accent, fontWeight: "600" }}>FRw {fmt(p.price)}</td>
                    <td style={S.td}><span style={S.badge2(st)}>{st}</span></td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: "11px" }} onClick={() => openEdit(p)}>{t("edit") || "Edit"}</button>
                        <button style={{ ...S.btn("danger"), padding: "5px 10px", fontSize: "11px", background: C.redDim }} onClick={() => del(p._id)}>{t("delete") || "Delete"}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>{editing ? t("editProduct") || "Edit Product" : t("addNewProduct") || "Add New Product"}</div>
            {[
              { label: t("productName") || "Product Name", key: "productName", type: "text" },
              { label: t("brandName") || "Brand Name", key: "brandName", type: "text" },
              { label: t("description") || "Description", key: "description", type: "text" },
              { label: t("price") || "Price (FRw)", key: "price", type: "number" },
              { label: t("stockQty") || "Stock Quantity", key: "stock", type: "number" },
              { label: t("minStockLevel") || "Min Stock Level", key: "minStockLevel", type: "number" },
            ].map(f => (
              <div key={f.key} style={S.formRow}>
                <label style={S.formLabel}>{f.label}</label>
                <input style={S.input} type={f.type} placeholder={f.placeholder || ""} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("category") || "Category"}</label>
              <select style={S.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">{t("selectCategory") || "Select category"}</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("branch") || "Branch"}</label>
              <select style={S.select} value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
                <option value="">{t("selectBranch") || "Select branch"}</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={S.formRow}>
              <label style={S.formLabel}>{t("imageURL") || "Product Image"}</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                {form.imageURL && (
                  <img src={form.imageURL} alt="" style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", background: C.bg }} onError={e => e.target.style.display = "none"} />
                )}
                <button type="button" style={S.btn("ghost")} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? (t("uploading") || "Uploading…") : form.imageURL ? (t("replaceImage") || "Replace image") : (t("uploadImage") || "Upload image")}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => uploadImage(e.target.files?.[0])} />
              </div>
              <input style={S.input} type="text" placeholder="or paste an image URL..." value={form.imageURL} onChange={e => setForm({ ...form, imageURL: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button style={S.btn("ghost")} onClick={() => setShowModal(false)}>{t("cancel") || "Cancel"}</button>
              <button style={S.btn("primary")} onClick={save}>{editing ? t("saveChanges") || "Save Changes" : t("addProduct") || "Add Product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── INVENTORY PAGE ────────────────────────────────────────────────────────────

export default Products;
