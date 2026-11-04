"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";

// The product named in the address, fresh from the server.
export function useProduct() {
  const { id } = useParams<{ id: string }>();
  const one = useOwnerData<Product>(id ? `/products/${id}` : null);
  return { ...one, product: one.data, id };
}
