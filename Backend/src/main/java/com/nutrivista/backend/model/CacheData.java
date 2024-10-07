package com.nutrivista.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cache")
public class CacheData {
    @Id
    private String id;
    private String llm_data;

    public CacheData(String id, String llm_data) {
        this.id = id;
        this.llm_data = llm_data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLlm_data() {
        return llm_data;
    }

    public void setLlm_data(String llm_data) {
        this.llm_data = llm_data;
    }
}
