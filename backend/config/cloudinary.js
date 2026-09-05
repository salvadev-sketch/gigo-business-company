const crypto = require('crypto');

// ── Cloudinary (signed direct uploads for product images) ────────────────────
// No `cloudinary` npm SDK — a thin wrapper around Cloudinary's plain HTTP API,
// signed with the same SHA-1 scheme the SDK uses under the hood.
// Flow: 1) client asks us for a signature (POST /media/sign), 2) client
// uploads the file straight to Cloudinary with that signature (we never touch
// the bytes), 3) client saves the returned secure_url as the product's imageURL.
function cloudinarySignParams(params) {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join("&");
    return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

function createCloudinaryUploadSignature(folder = "gigo-products") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinarySignParams({ folder, timestamp });
    return { timestamp, signature, apiKey, cloudName, folder, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload` };
}

module.exports = { cloudinarySignParams, createCloudinaryUploadSignature };
