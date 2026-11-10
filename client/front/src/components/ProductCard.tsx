import { Product } from "../interfaces/product";
import React from "react";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
};