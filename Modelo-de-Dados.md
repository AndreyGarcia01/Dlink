# Modelo de Dados

O modelo está definido em `prisma/schema.prisma`, e as tabelas são criadas pelas migrations em `prisma/migrations/`.

```mermaid
erDiagram
    users ||--o| candidate_profiles : "tem"
    users ||--o{ jobs : "publica (empresa)"
    users ||--o{ applications : "faz (candidato)"
    users ||--o{ notifications : "recebe"
    jobs ||--o{ applications : "recebe"
    jobs ||--o{ job_accessibility : "oferece"

    users {
        uuid id PK
        string name
        string email UK
        string password_hash
        enum role "candidate | company"
        string hearing_loss_level
        string communication_preference
        string cnpj
        text company_description
        string sector
        datetime created_at
    }
    candidate_profiles {
        uuid id PK
        uuid user_id FK,UK
        text bio
        text experience
        text education
        text skills
        string video_url
        datetime updated_at
    }
    jobs {
        uuid id PK
        uuid company_id FK
        string title
        text description
        text requirements
        string location
        string work_region
        string category
        string status "active | closed"
        datetime created_at
    }
    job_accessibility {
        uuid id PK
        uuid job_id FK
        string resource
        string status "available | in_progress"
    }
    applications {
        uuid id PK
        uuid candidate_id FK
        uuid job_id FK
        string status "pending | approved | rejected"
        boolean requires_interpreter
        datetime created_at
    }
    notifications {
        uuid id PK
        uuid user_id FK
        string reference_id
        text message
        boolean read
        datetime created_at
    }
    content_articles {
        uuid id PK
        string title
        text body
        string video_url
        text transcript
    }
```

## Decisões do modelo

- **Uma tabela `users` para candidatos e empresas**, separados pelo campo `role`. Os campos de candidato (perda auditiva, comunicação) e de empresa (CNPJ, setor, descrição) são opcionais. Simplifica login e autenticação, que são iguais para os dois perfis.
- **`applications` tem `@@unique([candidateId, jobId])`**: o próprio banco impede candidatura duplicada (RN04), além da checagem na API.
- **Vagas não são apagadas, só encerradas** (`status = closed`), para manter o histórico das candidaturas (RN08).
- **`onDelete: Cascade`**: se um usuário for removido, os dados ligados a ele também saem (apoio à LGPD).
- `job_accessibility`, `notifications` e `content_articles` já estão no banco para RF12, RF18 e RF22/RF23 (ver [[Requisitos]]).
