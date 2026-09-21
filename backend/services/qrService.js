// QR code con l'URL pubblico di verifica del capo (strategia duale NFC + QR).
import QRCode from "qrcode";

const base = () => (process.env.PUBLIC_BASE_URL ?? "http://localhost:5173").replace(/\/+$/, "");

export const urlVerifica = (tagId) => `${base()}/v/${encodeURIComponent(tagId)}`;

export const qrSvg = (url) => QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 2 });

export const qrPng = (url) => QRCode.toBuffer(url, { type: "png", errorCorrectionLevel: "M", margin: 2, width: 512 });
