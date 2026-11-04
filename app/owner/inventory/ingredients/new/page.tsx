"use client";

import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { IngredientForm } from "@/app/owner/inventory/ingredients/IngredientForm";
import { INGREDIENTS } from "@/app/owner/inventory/stock";
import type { Product } from "@/app/owner/types";

export default function NewIngredientPage() {
  // To warn about a name already in use.
  const products = useOwnerData<Product[]>("/products");
  if (!products.data) return <FormPageState back={INGREDIENTS} backLabel="Ingredients" loading={products.loading} error={products.error} onRetry={products.reload} />;
  return <IngredientForm existing={null} products={products.data} />;
}
