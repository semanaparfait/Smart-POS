"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { IngredientForm } from "@/app/owner/inventory/ingredients/IngredientForm";
import { INGREDIENTS } from "@/app/owner/inventory/stock";
import type { Product } from "@/app/owner/types";

export default function EditIngredientPage() {
  const { id } = useParams<{ id: string }>();
  const products = useOwnerData<Product[]>("/products");
  const existing = products.data?.find((p) => p.id === id);
  if (!existing) return <FormPageState back={INGREDIENTS} backLabel="Ingredients" loading={products.loading} error={products.error} onRetry={products.reload} />;
  return <IngredientForm key={existing.id} existing={existing} products={products.data!} />;
}
