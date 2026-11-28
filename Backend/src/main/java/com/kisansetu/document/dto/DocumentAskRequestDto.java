package com.kisansetu.document.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAskRequestDto {
    private String question;
    private String language;
}
