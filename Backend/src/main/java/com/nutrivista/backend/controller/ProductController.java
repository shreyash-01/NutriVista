package com.nutrivista.backend.controller;


import com.nutrivista.backend.model.Product;
import com.nutrivista.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ProductController {


    private ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<Product> getProducts(){
        // http://localhost:8081/api/v1/products
        return productService.getProducts();
    }

    @GetMapping("/categories")
    public List<Product> getCategories(@RequestParam String category){
        // http://localhost:8081/api/v1/categories?category=Bread
        return productService.getCategories(category);
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product){
        // http://localhost:8081/api/v1/products
        return productService.addProduct(product);

    }
}
