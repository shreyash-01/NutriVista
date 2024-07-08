package com.nutrivista.backend.controller;


import com.nutrivista.backend.model.Category;
import com.nutrivista.backend.model.Product;
import com.nutrivista.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;


import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1")
public class ProductController {


    private ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<String> getProducts(){
        // http://localhost:8081/api/v1/products
        return productService.getProducts();
    }

    @GetMapping("/category")
    public List<Product> getProductOfCategory(@RequestParam String category){
        // http://localhost:8081/api/v1/categories?category=Bread
        return productService.getCategories(category);
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product){
        // http://localhost:8081/api/v1/products
        return productService.addProduct(product);

    }

    @GetMapping("/product")
    public String getProduct(@RequestParam String productID){
        return productService.getLLMOutput(productID);
    }


    @GetMapping("/categories")
    public List<Category> getAllCategories(@RequestParam String prefix){
        return productService.getAllCategories(prefix);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productService.findProductById(id);
        if (product.isPresent()) {
            Product productFinal = product.get();
            return ResponseEntity.ok(productFinal);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}


