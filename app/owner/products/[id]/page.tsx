"use client";

import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { PRODUCTS, ProductForm } from "@/app/owner/products/ProductForm";
import { useProduct } from "@/app/owner/products/useProduct";
import type { Category, Product } from "@/app/owner/types";

export default function EditProductPage() {
  const { product, loading, error, reload } = useProduct();
  const categories = useOwnerData<Category[]>("/categories");
  const products = useOwnerData<Product[]>("/products");

  if (!product || !categories.data || !products.data)
    return (
      <FormPageState
        back={PRODUCTS}
        backLabel="Products"
        loading={loading || categories.loading || products.loading}
        error={error ?? categories.error ?? products.error}
        onRetry={() => {
          reload();
          categories.reload();
          products.reload();
        }}
      />
    );
  return <ProductForm key={product.id} product={product} categories={categories.data} products={products.data} />;
}
