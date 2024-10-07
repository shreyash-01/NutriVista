package com.nutrivista.backend.repository;

import com.nutrivista.backend.model.CacheData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CacheDataRepository extends MongoRepository<CacheData, String> {
}
