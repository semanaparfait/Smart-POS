"use client";

import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { PRODUCTS, ProductForm } from "@/app/owner/products/ProductForm";
import type { Category, Product } from "@/app/owner/types";

export default function NewProductPage() {
  const categories = useOwnerData<Category[]>("/categories");
  // Ingredients, for the recipe.
  const products = useOwnerData<Product[]>("/products");

  if (!categories.data || !products.data)
    return (
      <FormPageState
        back={PRODUCTS}
        backLabel="Products"
        loading={categories.loading || products.loading}
        error={categories.error ?? products.error}
        onRetry={() => {
          categories.reload();
          products.reload();
        }}
      />
    );
  return <ProductForm product={null} categories={categories.data} products={products.data} />;
}
