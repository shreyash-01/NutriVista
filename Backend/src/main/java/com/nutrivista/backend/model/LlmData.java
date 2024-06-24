package com.nutrivista.backend.model;


import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@EqualsAndHashCode
public class LlmData {
    private String data;

    public LlmData(String data) {
        this.data = data;
    }
}
