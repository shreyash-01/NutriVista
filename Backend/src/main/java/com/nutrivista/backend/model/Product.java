package com.nutrivista.backend.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@ToString
@Getter
@Setter
@Document(collection = "intermediate_data")
public class Product {
    @Id
    private String id;
    private String productName;
    private List<String> ingredients;
    private List<String> nutritionalData;
    private String category;
    private List<String> imageUrls;


    public Product(String productName, List<String> ingredients, List<String> nutritionalData, String category, List<String> imageUrls) {
        this.productName = productName;
        this.ingredients = ingredients;
        this.nutritionalData = nutritionalData;
        this.category = category;
        this.imageUrls = imageUrls;
    }
}
