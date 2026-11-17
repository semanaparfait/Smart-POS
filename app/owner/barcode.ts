import useAuthStore from "@/stores/auth/authstore";

// Barcode scanning is an extra: on for supermarkets, otherwise the super admin
// turns it on. Off, barcodes are hidden everywhere on the owner pages.
// A server from before this extra sends no value: barcodes stay on there.
export const useBarcodeOn = () => useAuthStore((s) => s.user?.company?.features?.barcode !== false);
