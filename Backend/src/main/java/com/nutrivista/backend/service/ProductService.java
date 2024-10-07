package com.nutrivista.backend.service;

import com.nutrivista.backend.model.CacheData;
import com.nutrivista.backend.model.Category;
import com.nutrivista.backend.model.LlmData;
import com.nutrivista.backend.model.Product;
import com.nutrivista.backend.repository.CacheDataRepository;
import com.nutrivista.backend.repository.CategoriesRepository;
import com.nutrivista.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;


@Service
public class ProductService {

    private ProductRepository productRepository;
    private CategoriesRepository categoriesRepository;
    private RestTemplate restTemplate;
    private CacheDataRepository cacheDataRepository;


    @Autowired
    public ProductService(ProductRepository productRepository, CategoriesRepository categoriesRepository, CacheDataRepository cacheDataRepository) {
        this.productRepository = productRepository;
        this.categoriesRepository = categoriesRepository;
        this.cacheDataRepository = cacheDataRepository;
        restTemplate = new RestTemplate();
    }

    public Optional<Product> findProductById(String id) {
        return productRepository.findById(id);
    }



    public List<Product> getCategories(String category) {
        List<Product> products = productRepository.findAll();
        for (Iterator<Product> iterator = products.iterator(); iterator.hasNext(); ) {
            Product p = iterator.next();
            if (!(p.getCategory().toLowerCase().contains(category.toLowerCase()))) {
                iterator.remove();
            }
        }
        return products;
    }


    public List<Category> getAllCategories(String prefix){
        return categoriesRepository.findByNameStartingWith(prefix);
    }

    public String getLLMOutput(String productID){
        Optional<CacheData> cacheData = cacheDataRepository.findById(productID);
        if(cacheData.isPresent()){
            return cacheData.get().getLlm_data();
        }

        Product product =   productRepository.findById(productID).get();
        List<String> nutritionalData = product.getNutritionalData();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<LlmData> request = new HttpEntity<>(new LlmData(nutritionalData.get(0)), headers);
        String response = restTemplate.postForObject("http://localhost:5000/api/llm", request, String.class);
        cacheDataRepository.save(new CacheData(productID, response));
        return response;

    }


    public Product addProduct(Product product) {
        // slow for larger data
        // should be updated afterwards
        // use atlas indexing in future
        List<Product> products = productRepository.findAll();
        for(Product p: products){
            if((p.getCategory().toLowerCase()).equals(product.getCategory().toLowerCase())) {
                return productRepository.save(product);
            }
        }
        return null;
    }


    public List<String> getProducts() {
        return productRepository.findByNameStartingWith("B");
    }
}
