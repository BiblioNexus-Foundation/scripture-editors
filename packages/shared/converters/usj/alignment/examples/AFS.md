# Text Alignment Format Specification (TAFS)

**Version 1.0.0**

## Status of This Document

This document specifies a standardized format for text alignment data and provides guidelines for its implementation. The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

## Table of Contents

1. Introduction
2. Core Concepts
3. Version Management
4. Information Model
5. JSON Format
6. Security & Performance
7. Implementation Guide
8. Reference Documentation
9. Appendices

## 1. Introduction

### 1.1 Purpose

The Text Alignment Format Specification (TAFS) defines a standardized format for representing alignments between textual units. While primarily designed for translation alignment, it supports various alignment types including quotations, text reuse, summarization, versioning, and linguistic annotations.

### 1.2 Design Goals

- **Flexibility**: Support multiple alignment types and use cases
- **Efficiency**: Enable compact representation through hoisting
- **Extensibility**: Allow for new reference schemes and alignment types
- **Clarity**: Provide unambiguous interpretation of alignment data
- **Interoperability**: Ensure consistent implementation across systems

### 1.3 Use Cases

- Translation alignment
- Parallel text analysis
- Quotation tracking
- Text reuse detection
- Linguistic annotation
- Version comparison
- Cross-reference management

## 2. Core Concepts

### 2.1 Basic Structure

An alignment consists of:

```json
{
  "format": "alignment",
  "version": "1.0.0",
  "minimumCompatibleVersion": "0.3.0",
  "extensions": ["scheme:BCVWP", "type:translation"],
  "meta": {
    "creator": "alignment-tool",
    "timestamp": "2024-03-19T12:00:00Z"
  },
  "groups": []
}
```

### 2.2 Key Components

#### 2.2.1 References

A reference uniquely identifies a segment of text through:

- Reference Scheme (tokenization method)
- Document Identifier
- Reference Selector

```json
{
  "scheme": "BCVWP",
  "docid": "NA27",
  "selectors": ["410040030011"]
}
```

#### 2.2.2 Reference Units

A collection of references that:

- MUST share the same scheme and document
- MUST be ordered according to document position
- MAY represent discontinuous text

#### 2.2.3 Alignment Records

An alignment record connects reference units with:

- Alignment type
- Role assignments
- Metadata
- Optional extensions

## 3. Version Management

### 3.1 Version Numbers

TAFS follows semantic versioning (MAJOR.MINOR.PATCH):

```json
{
  "version": "1.0.0",
  "minimumCompatibleVersion": "0.3.0"
}
```

### 3.2 Compatibility Rules

- Major version changes indicate breaking changes
- Minor versions MUST be backward compatible
- Implementations MUST check version compatibility
- Extensions MUST be explicitly declared

### 3.3 Extension Declaration

```json
{
  "extensions": ["scheme:BCVWP", "type:translation", "meta:confidence"]
}
```

## 4. Information Model

### 4.1 Reference Model

```json
{
  "documents": [
    {
      "scheme": "BCVWP",
      "docid": "NA27",
      "validation": {
        "pattern": "^[0-9]{12}$",
        "ordering": "required",
        "resolution": {
          "maxCacheAge": "1h",
          "timeout": "5s"
        }
      }
    }
  ]
}
```

### 4.2 Role Definitions

```json
{
  "roles": {
    "order": ["source", "target"],
    "required": ["source"],
    "optional": ["target"],
    "constraints": {
      "source": {
        "minOccurs": 1,
        "maxOccurs": 1
      },
      "target": {
        "minOccurs": 0,
        "maxOccurs": "unbounded"
      }
    }
  }
}
```

### 4.3 Metadata Model

Required fields:

- `creator`: String identifying the creator
- `timestamp`: ISO 8601 UTC timestamp
- `version`: Specification version

Optional fields:

- `confidence`: Float [0,1]
- `status`: Enumerated status
- `notes`: String
- `tags`: String[]

### 4.4 Metadata Merging Strategies

```json
{
  "meta": {
    "mergeStrategy": "deep|shallow|override",
    "creator": "default-creator",
    "timestamp": "2024-03-19T12:00:00Z"
  }
}
```

## 5. JSON Format

### 5.1 Document Structure

Every TAFS document MUST be a valid JSON document conforming to this structure:

```json
{
  "format": "alignment",
  "version": "1.0.0",
  "minimumCompatibleVersion": "0.3.0",
  "meta": {
    "creator": "alignment-tool",
    "timestamp": "2024-03-19T12:00:00Z"
  },
  "documents": [
    {
      "scheme": "greek-word",
      "docid": "UGNT",
      "validation": {
        "pattern": "^[\\u0370-\\u03FF\\u1F00-\\u1FFF]+$"
      }
    }
  ],
  "groupData": {
    "type": "translation",
    "roles": ["source", "target"]
  },
  "groupedBy": "bcv",
  "groups": {
    "REV.1.1": {
      "meta": {
        "verse_text": {
          "source": "...",
          "target": "..."
        }
      },
      "records": []
    }
  }
}
```

### 5.2 Core Components

#### 5.2.1 Document Level

- `format`: MUST be "alignment"
- `version`: Semantic version of the document
- `minimumCompatibleVersion`: Minimum compatible specification version
- `meta`: Document-level metadata
- `documents`: Array of document definitions
- `groupData`: Common data shared across all groups
- `groupedBy`: Grouping strategy identifier
- `groups`: Object containing grouped alignment records

#### 5.2.2 Group Structure

Groups are organized as key-value pairs where:

- Key: Identifier based on grouping strategy (e.g., BCV reference)
- Value: Object containing:
  - `meta`: Group-specific metadata
  - `records`: Array of alignment records

```json
{
  "REV.1.1": {
    "meta": {
      "verse_text": {
        "source": "ἀποκάλυψις Ἰησοῦ Χριστοῦ",
        "target": "This is the revelation of Jesus Christ"
      }
    },
    "records": [
      {
        "references": [["ἀποκάλυψις"], ["This", "is", "the", "revelation"]],
        "meta": {
          "source": {
            "strong": "G0602",
            "morph": "Gr,N,,,,,NFS,",
            "lemma": "ἀποκάλυψις",
            "occurrence": "1",
            "occurrences": "1"
          },
          "target": [
            { "occurrence": "1", "occurrences": "1" },
            { "occurrence": "1", "occurrences": "1" },
            { "occurrence": "1", "occurrences": "1" },
            { "occurrence": "1", "occurrences": "1" }
          ]
        }
      }
    ]
  }
}
```

### 5.3 Grouping Strategies

#### 5.3.1 BCV Grouping

When `groupedBy` is "bcv":

- Keys MUST follow the format "BOOK.CHAPTER.VERSE"
- BOOK MUST be a valid book identifier
- CHAPTER and VERSE MUST be positive integers
- Groups SHOULD be ordered lexicographically

```json
{
  "groupedBy": "bcv",
  "groups": {
    "GEN.1.1": {
      /* alignments */
    },
    "GEN.1.2": {
      /* alignments */
    },
    "GEN.1.3": {
      /* alignments */
    }
  }
}
```

#### 5.3.2 Custom Grouping

Custom grouping strategies MUST:

- Be declared in `extensions`
- Provide a validation pattern
- Document key format and constraints

### 5.4 Document Definitions

Document definitions are hoisted to root level and shared across groups:

```json
{
  "documents": [
    {
      "scheme": "greek-word",
      "docid": "UGNT",
      "validation": {
        "pattern": "^[\\u0370-\\u03FF\\u1F00-\\u1FFF]+$"
      }
    },
    {
      "scheme": "english-word",
      "docid": "BSB",
      "validation": {
        "pattern": "^[a-zA-Z\\s-]+$"
      }
    }
  ]
}
```

### 5.5 Group Data

Common group properties are hoisted to root level:

```json
{
  "groupData": {
    "type": "translation",
    "roles": ["source", "target"],
    "extensions": ["scheme:BCVWP", "type:translation"]
  }
}
```

### 5.6 Querying and Manipulation

#### 5.6.1 Verse Access

```typescript
interface AlignmentQueries {
  // Get single verse
  getVerse(bcv: string): AlignmentGroup | undefined;

  // Get verse range
  getVerseRange(start: string, end: string): { [bcv: string]: AlignmentGroup };

  // Get chapter
  getChapter(book: string, chapter: number): { [bcv: string]: AlignmentGroup };

  // Get book
  getBook(book: string): { [bcv: string]: AlignmentGroup };
}

// Implementation example
class AlignmentAccess implements AlignmentQueries {
  constructor(private alignment: AlignmentDocument) {}

  getVerse(bcv: string): AlignmentGroup | undefined {
    return this.alignment.groups[bcv];
  }

  getVerseRange(start: string, end: string): { [bcv: string]: AlignmentGroup } {
    return Object.entries(this.alignment.groups)
      .filter(([bcv]) => bcv >= start && bcv <= end)
      .reduce((acc, [bcv, group]) => {
        acc[bcv] = group;
        return acc;
      }, {});
  }
}
```

#### 5.6.2 Group Manipulation

```typescript
interface AlignmentMutations {
  // Add or update verse
  setVerse(bcv: string, group: AlignmentGroup): void;

  // Remove verse
  removeVerse(bcv: string): void;

  // Merge verses
  mergeVerses(bcvs: string[]): AlignmentGroup;

  // Split verse
  splitVerse(bcv: string, splitPoints: number[]): { [bcv: string]: AlignmentGroup };
}
```

### 5.7 Validation Rules

#### 5.7.1 Group Key Validation

```json
{
  "validation": {
    "bcv": {
      "pattern": "^[A-Z0-9]{3}\\.[0-9]+\\.[0-9]+$",
      "examples": ["GEN.1.1", "REV.22.21"],
      "constraints": {
        "book": {
          "pattern": "^[A-Z0-9]{3}$",
          "enum": ["GEN", "EXO", "...", "REV"]
        },
        "chapter": {
          "type": "integer",
          "minimum": 1
        },
        "verse": {
          "type": "integer",
          "minimum": 1
        }
      }
    }
  }
}
```

#### 5.7.2 Group Structure Validation

```json
{
  "validation": {
    "group": {
      "required": ["records"],
      "properties": {
        "meta": {
          "type": "object",
          "properties": {
            "verse_text": {
              "type": "object",
              "required": ["source", "target"]
            }
          }
        },
        "records": {
          "type": "array",
          "minItems": 1
        }
      }
    }
  }
}
```

### 5.8 Migration Guidelines

#### 5.8.1 Array to Object Migration

```typescript
interface LegacyAlignment {
  groups: Array<{
    meta: { bcv: string };
    records: AlignmentRecord[];
  }>;
}

function migrateToObjectGroups(legacy: LegacyAlignment): AlignmentDocument {
  const groups = legacy.groups.reduce((acc, group) => {
    const bcv = group.meta.bcv;
    if (bcv) {
      acc[bcv] = {
        meta: group.meta,
        records: group.records,
      };
    }
    return acc;
  }, {});

  return {
    format: "alignment",
    version: "1.0.0",
    minimumCompatibleVersion: "0.3.0",
    groupedBy: "bcv",
    groups,
  };
}
```

#### 5.8.2 Data Validation During Migration

```typescript
function validateMigration(doc: AlignmentDocument): void {
  // Validate group keys
  Object.keys(doc.groups).forEach((key) => {
    if (!/^[A-Z0-9]{3}\.[0-9]+\.[0-9]+$/.test(key)) {
      throw new Error(`Invalid BCV key: ${key}`);
    }
  });

  // Validate group content
  Object.entries(doc.groups).forEach(([bcv, group]) => {
    if (!group.records || !Array.isArray(group.records)) {
      throw new Error(`Invalid records in group: ${bcv}`);
    }
  });
}
```

### 5.9 Alternative Grouping Strategies

#### 5.9.1 Paragraph Grouping

```json
{
  "groupedBy": "paragraph",
  "groups": {
    "p1": {
      "meta": {
        "verses": ["GEN.1.1", "GEN.1.2"],
        "type": "narrative"
      },
      "records": []
    }
  }
}
```

#### 5.9.2 Section Grouping

```json
{
  "groupedBy": "section",
  "groups": {
    "introduction": {
      "meta": {
        "title": "Creation Account",
        "verses": ["GEN.1.1", "GEN.1.2"]
      },
      "records": []
    }
  }
}
```

## 6. Security & Performance

### 6.1 Security Requirements

#### 6.1.1 Input Validation

Implementations MUST:

- Validate all JSON input against the provided schema
- Sanitize metadata values before display
- Validate reference selectors against scheme-specific patterns
- Implement length limits for text fields

#### 6.1.2 Resource Protection

Implementations MUST:

- Implement timeouts for reference resolution
- Limit recursive depth in metadata merging
- Verify document access permissions
- Implement rate limiting for external document resolution

#### 6.1.3 Error Handling

```json
{
  "error": {
    "code": "E403",
    "message": "Access denied to document",
    "location": {
      "group": 0,
      "record": 12,
      "document": "restricted.txt"
    },
    "severity": "fatal"
  }
}
```

### 6.2 Performance Guidelines

#### 6.2.1 Caching Strategy

```json
{
  "caching": {
    "documents": {
      "maxAge": "1h",
      "maxSize": "100MB",
      "strategy": "LRU"
    },
    "references": {
      "maxItems": 10000,
      "preload": ["frequently-used-doc"]
    },
    "validation": {
      "patternCache": true,
      "maxPatterns": 100
    }
  }
}
```

#### 6.2.2 Processing Optimization

Implementations SHOULD:

- Use streaming parsers for large files
- Implement lazy reference resolution
- Batch similar operations
- Index alignment records for efficient querying

#### 6.2.3 Resource Limits

```json
{
  "limits": {
    "maxFileSize": "50MB",
    "maxGroups": 1000,
    "maxRecordsPerGroup": 10000,
    "maxReferencesPerUnit": 100,
    "maxMetadataSize": "1MB",
    "maxRecursionDepth": 5
  }
}
```

### 6.3 Optimization Recommendations

#### 6.3.1 Document Loading

```python
async def load_document(docid, options):
    # Check cache first
    if cached := cache.get(docid):
        return cached

    # Implement exponential backoff
    for attempt in range(options.maxRetries):
        try:
            content = await fetch_with_timeout(docid, options.timeout)
            cache.set(docid, content, ttl=options.maxAge)
            return content
        except TimeoutError:
            await exponential_delay(attempt)

    raise DocumentLoadError(docid)
```

#### 6.3.2 Batch Processing

```json
{
  "processing": {
    "batchSize": 1000,
    "parallelism": 4,
    "maxMemory": "1GB",
    "sortBy": ["docid", "scheme"],
    "groupBy": "type"
  }
}
```

## 7. Implementation Guide

### 7.1 Reference Resolution

#### 7.1.1 Resolution Process

```python
async def resolve_reference(reference, options):
    """
    Resolves a reference to its actual text content.

    Args:
        reference: Reference object containing scheme, docid, and selectors
        options: Resolution options including timeout and caching settings

    Returns:
        ResolvedText object containing the text and its metadata
    """
    # Validate reference format
    validate_reference_format(reference)

    # Check cache
    cache_key = f"{reference.scheme}:{reference.docid}:{reference.selector}"
    if cached := await cache.get(cache_key):
        return cached

    # Load document
    doc = await load_document(reference.docid, options)

    # Apply scheme-specific resolution
    resolver = get_scheme_resolver(reference.scheme)
    text = await resolver.resolve(doc, reference.selector)

    # Cache result
    await cache.set(cache_key, text, ttl=options.maxAge)

    return text
```

#### 7.1.2 Error Recovery

```python
class ResolutionError(Exception):
    def __init__(self, code, message, location, severity):
        self.error = {
            "code": code,
            "message": message,
            "location": location,
            "severity": severity
        }
```

### 7.2 Validation Framework

#### 7.2.1 Schema Validation

```json
{
  "validation": {
    "schemas": {
      "reference": {
        "type": "object",
        "required": ["scheme", "docid", "selectors"],
        "properties": {
          "scheme": { "type": "string" },
          "docid": { "type": "string" },
          "selectors": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "customValidators": {
      "schemePattern": "validateSchemePattern",
      "roleConstraints": "validateRoleConstraints"
    }
  }
}
```

#### 7.2.2 Custom Validators

```python
def validate_scheme_pattern(reference, scheme_config):
    """Validates reference selectors against scheme-specific patterns."""
    pattern = re.compile(scheme_config.pattern)
    for selector in reference.selectors:
        if not pattern.match(selector):
            raise ValidationError(
                code="E101",
                message=f"Invalid selector format: {selector}",
                location={"reference": reference},
                severity="error"
            )
```

### 7.3 Extension System

#### 7.3.1 Extension Registration

```python
class AlignmentExtension:
    """Base class for TAFS extensions."""

    def __init__(self, name, version):
        self.name = name
        self.version = version

    async def initialize(self, config):
        """Initialize extension with config."""
        pass

    async def validate(self, context):
        """Validate extension-specific data."""
        pass

    async def process(self, data):
        """Process extension-specific data."""
        pass
```

#### 7.3.2 Extension Configuration

```json
{
  "extensions": {
    "scheme:BCVWP": {
      "version": "1.0.0",
      "config": {
        "validationRules": "path/to/rules.json",
        "tokenizer": "default"
      }
    },
    "type:translation": {
      "version": "1.0.0",
      "config": {
        "allowedLanguages": ["grc", "heb", "eng"],
        "qualityMetrics": ["bleu", "ter"]
      }
    }
  }
}
```

## 8. Reference Documentation

### 8.1 Standard Reference Schemes

#### 8.1.1 BCVWP Scheme

```json
{
  "scheme": "BCVWP",
  "version": "1.0.0",
  "format": {
    "pattern": "^[0-9]{12}$",
    "structure": {
      "book": { "start": 0, "length": 2 },
      "chapter": { "start": 2, "length": 3 },
      "verse": { "start": 5, "length": 3 },
      "word": { "start": 8, "length": 3 },
      "part": { "start": 11, "length": 1 }
    },
    "constraints": {
      "book": { "min": 1, "max": 66 },
      "chapter": { "min": 1, "max": 150 },
      "verse": { "min": 1, "max": 176 },
      "word": { "min": 1 },
      "part": { "enum": ["1", "2", "3", "4"] }
    }
  }
}
```

#### 8.1.2 Character Offset Scheme

```json
{
  "scheme": "char-offset",
  "version": "1.0.0",
  "format": {
    "pattern": "^[0-9]+-[0-9]+$",
    "structure": {
      "start": { "type": "integer" },
      "length": { "type": "integer" }
    },
    "constraints": {
      "start": { "min": 0 },
      "length": { "max": 1000 }
    },
    "normalization": "NFC"
  }
}
```

### 8.2 Standard Alignment Types

#### 8.2.1 Translation Type

```json
{
  "type": "translation",
  "roles": {
    "source": {
      "required": true,
      "maxOccurs": 1,
      "constraints": {
        "languages": ["grc", "heb"]
      }
    },
    "target": {
      "required": true,
      "maxOccurs": "unbounded",
      "constraints": {
        "languages": ["eng", "deu", "fra"]
      }
    }
  },
  "metadata": {
    "required": ["confidence"],
    "optional": ["method", "quality-metrics"]
  }
}
```

#### 8.2.2 Quotation Type

```json
{
  "type": "quotation",
  "roles": {
    "source": {
      "required": true,
      "maxOccurs": 1
    },
    "quote": {
      "required": true,
      "maxOccurs": "unbounded"
    }
  },
  "metadata": {
    "optional": ["certainty", "adaptation-type"]
  }
}
```

### 8.3 Standard Metadata Fields

#### 8.3.1 Core Fields

```json
{
  "metadata": {
    "core": {
      "creator": {
        "type": "string",
        "required": true,
        "description": "Entity responsible for the alignment"
      },
      "timestamp": {
        "type": "string",
        "format": "date-time",
        "required": true,
        "description": "Creation time in ISO 8601 format"
      },
      "confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Alignment confidence score"
      }
    }
  }
}
```

#### 8.3.2 Extension Fields

```json
{
  "metadata": {
    "extensions": {
      "translation-quality": {
        "bleu": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "ter": {
          "type": "number",
          "minimum": 0
        }
      },
      "quotation-certainty": {
        "type": "string",
        "enum": ["certain", "probable", "possible"]
      }
    }
  }
}
```

## 9. Appendices

### Appendix A: Examples

#### A.1 Simple Translation Alignment

```json
{
  "format": "alignment",
  "version": "1.0.0",
  "minimumCompatibleVersion": "0.3.0",
  "meta": {
    "creator": "example-aligner",
    "timestamp": "2024-03-19T12:00:00Z"
  },
  "groups": [
    {
      "type": "translation",
      "documents": [
        {
          "scheme": "BCVWP",
          "docid": "NA27",
          "validation": { "pattern": "^[0-9]{12}$" }
        },
        {
          "scheme": "ws-token",
          "docid": "ESV",
          "validation": { "pattern": "^[a-z0-9-]+$" }
        }
      ],
      "roles": ["source", "target"],
      "records": [
        {
          "references": [["410040030011"], ["mark-4-3-1"]],
          "meta": { "confidence": 1.0 }
        },
        {
          "references": [
            ["410040030021", "410040030031"],
            ["mark-4-3-2", "mark-4-3-3"]
          ],
          "meta": { "confidence": 0.95 }
        }
      ]
    }
  ]
}
```

#### A.2 Multi-Language Quotation Example

```json
{
  "format": "alignment",
  "version": "1.0.0",
  "groups": [
    {
      "type": "quotation",
      "documents": [
        {
          "scheme": "BCVWP",
          "docid": "LXX",
          "validation": { "pattern": "^[0-9]{12}$" }
        },
        {
          "scheme": "BCVWP",
          "docid": "NA27",
          "validation": { "pattern": "^[0-9]{12}$" }
        }
      ],
      "roles": ["source", "quote"],
      "records": [
        {
          "references": [
            ["230890010011", "230890010021"],
            ["400040060011", "400040060021"]
          ],
          "meta": {
            "certainty": "probable",
            "adaptation-type": "translation"
          }
        }
      ]
    }
  ]
}
```

### Appendix B: Best Practices

#### B.1 File Organization

- Group related alignments together
- Use meaningful document identifiers
- Keep file sizes manageable (< 50MB)
- Include version control metadata

#### B.2 Reference Management

```json
{
  "referenceManagement": {
    "naming": {
      "docid": {
        "pattern": "^[a-zA-Z0-9-_]+$",
        "examples": ["NA27", "LXX", "ESV-2016"]
      },
      "scheme": {
        "pattern": "^[a-z-]+$",
        "examples": ["bcvwp", "ws-token", "char-offset"]
      }
    },
    "versioning": {
      "documentVersion": "required",
      "schemeVersion": "required",
      "versionFormat": "semver"
    }
  }
}
```

#### B.3 Performance Optimization

```json
{
  "optimization": {
    "fileSize": {
      "recommended": "10MB",
      "maximum": "50MB",
      "splitStrategy": "by-group"
    },
    "caching": {
      "preload": ["frequently-accessed-docs"],
      "lazy": ["rarely-accessed-docs"],
      "memory": {
        "minimum": "100MB",
        "recommended": "1GB"
      }
    },
    "indexing": {
      "fields": ["docid", "type", "timestamp"],
      "strategy": "b-tree"
    }
  }
}
```

### Appendix C: Migration Guide

#### C.1 Version Migration Matrix

| From Version | To Version | Breaking Changes | Migration Steps         |
| ------------ | ---------- | ---------------- | ----------------------- |
| 0.2.x        | 0.3.0      | Role format      | Update role definitions |
| 0.3.x        | 1.0.0      | Metadata schema  | Add required fields     |

#### C.2 Migration Scripts

```python
def migrate_0_2_to_0_3(data):
    """
    Migrates alignment data from version 0.2.x to 0.3.0

    Changes:
    - Updates role format
    - Adds validation rules
    - Normalizes metadata
    """
    result = copy.deepcopy(data)
    result["version"] = "0.3.0"

    # Update role format
    if "roles" in result:
        result["roles"] = {
            "order": result["roles"],
            "required": result["roles"][0:1],
            "optional": result["roles"][1:]
        }

    # Add validation
    if "documents" in result:
        for doc in result["documents"]:
            if "validation" not in doc:
                doc["validation"] = {
                    "pattern": get_default_pattern(doc["scheme"])
                }

    return result
```

### Appendix D: Common Error Patterns

#### D.1 Validation Errors

```json
{
  "errorPatterns": {
    "E101": {
      "description": "Invalid selector format",
      "common_causes": ["Incorrect reference scheme", "Malformed selector string"],
      "resolution": "Verify selector format against scheme pattern"
    },
    "E102": {
      "description": "Role constraint violation",
      "common_causes": ["Missing required role", "Too many references for role"],
      "resolution": "Check role constraints in type definition"
    }
  }
}
```

#### D.2 Runtime Errors

```json
{
  "runtimeErrors": {
    "R201": {
      "description": "Document resolution failure",
      "common_causes": ["Network timeout", "Invalid document ID", "Permission denied"],
      "recovery": {
        "strategy": "retry",
        "maxAttempts": 3,
        "backoffMs": [100, 500, 2000]
      }
    }
  }
}
```

### Appendix E: Testing Guidelines

#### E.1 Validation Test Suite

```python
def test_alignment_record(record):
    """
    Standard test suite for alignment records.

    Tests:
    1. Schema compliance
    2. Role constraints
    3. Reference validity
    4. Metadata completeness
    """
    validate_schema(record)
    validate_roles(record)
    validate_references(record)
    validate_metadata(record)
```

#### E.2 Performance Benchmarks

```json
{
  "benchmarks": {
    "parsing": {
      "1MB": { "max_ms": 100 },
      "10MB": { "max_ms": 500 },
      "50MB": { "max_ms": 2000 }
    },
    "resolution": {
      "single": { "max_ms": 50 },
      "batch_100": { "max_ms": 1000 }
    },
    "validation": {
      "record": { "max_ms": 1 },
      "group": { "max_ms": 10 },
      "file": { "max_ms": 100 }
    }
  }
}
```
