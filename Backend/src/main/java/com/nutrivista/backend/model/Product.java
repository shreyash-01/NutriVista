package com.nutrivista.backend.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@ToString
@Getter
@Setter
@Document(collection = "Ingredients")
public class Product {
    private String productName;
    private List<String> ingredients;
    private String category;
    private List<String> imageUrls;


    public Product(String productName, List<String> ingredients, String category, List<String> imageUrls) {
        this.productName = productName;
        this.ingredients = ingredients;
        this.category = category;
        this.imageUrls = imageUrls;
    }


}
