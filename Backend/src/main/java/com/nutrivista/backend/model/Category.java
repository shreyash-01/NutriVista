package com.nutrivista.backend.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@ToString
@Getter
@Setter
@Document(collection = "categories")
public class Category {
    String category;

    public Category(String category) {
        this.category = category;
    }
}
