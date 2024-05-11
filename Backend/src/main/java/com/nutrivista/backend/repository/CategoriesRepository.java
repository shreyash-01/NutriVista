package com.nutrivista.backend.repository;

import com.nutrivista.backend.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CategoriesRepository extends MongoRepository<Category,String> {
    @Query("{'category': {$regex : '^?0', $options: 'i'}}")
    List<Category> findByNameStartingWith(String prefix);
}
