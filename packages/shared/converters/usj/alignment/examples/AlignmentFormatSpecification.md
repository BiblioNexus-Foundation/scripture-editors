# Alignment Format Specification

**Author** James Tauber `<jtauber@jtauber.com>`  
**Version 0.1** 2023-06-08  
**Version 0.2** 2023-09-19  
**Version 0.2.1** 2023-09-25  
**Version 0.3** 2023-10-02  
**Version 0.3.1** 2024-02-21

# Introduction

This specification describes a format for aligning parts of text. The primary use case is translation alignment but arbitrary types of alignment are possible (including, but not limited to quotation, text reuse, summarization, versioning, anaphora, and so on). This explicit, but extensible, indication of alignment type also allows the format to distinguish alignments between actual translation source and target from alignments merely mapping translation equivalents. Some alignment types have a notion of directionality or roles and others do not. There is no requirement that alignment be between texts in different languages (that is, you can align one English translation with another) nor that there be more than one text at all (that is, you can align one part of a text to another part of the same text).

An alignment can be viewed as a hypergraph where each hyperedge consists of:

- an alignment type
- references (with additional structure if the type is directional)
- who is responsible for the alignment (possibly a computer program)
- when the alignment was done (timestamp)
- other optional information about the alignment (such as confidence and curation status)

As described below, the format allows hoisting of repeated information to a higher level although ultimately a file in this format can be processed as a flat collection of alignment records.

# Information Model

A **reference** is a combination of a **reference scheme**, a **document identifier**, and a **reference selector**.

It is envisaged that some reference schemes will identify an existing tokenization of the document and others will merely indicate the tokenization scheme to be applied at processing time to the document.

As a whole, a reference must allow one to unambiguously identify a citable object (usually a word token, but optionally a smaller or larger unit). The separation of these three components allows the reference scheme and document identifier to be hoisted and only the reference selection included in each record.

A **reference unit** is a set of one or more references that are participating in an alignment as a single unit, for example a multi-word expression. Elements in a reference unit need not be contiguous but must have the same reference scheme and document identifier. Elements in a reference unit should be serialized in document order.

Note that aligning {ref1, ref2} and {ref3} is not the same as aligning {ref1}, {ref2}, and {ref3}. The former means ref3 is aligned to the combination of ref1 and ref2. The latter means each of ref1, ref2, and ref3 are aligned to one another.

An **alignment record** consists of two or more reference units along with an **alignment type** and **alignment metadata**. If the alignment type requires roles (for example, is directional), each reference unit has a **unit role**. The allowable unit roles are specific to the alignment type.

For example, a `translation` alignment type might have a `source` (the original language being translated from) and a `target` (the language being translated to). An `anaphora` alignment type might have an `antecedent` role and an `anaphor` role.

The serialization format (below) allows for a role template that maps roles to a list/array index thus allowing the reference units in an alignment record to be serialized as a list/array of values rather than a dictionary/object/map.

Alignment metadata is optional and extensible although this specification recommends fields for creator and timestamp.

# JSON Serialization

This specification describes a JSON serialization although other serializations could be developed from the information model above.

An alignment record with roles:

```json
{
    "type": "translation",
    "source": <reference unit 1>,
    "target": <reference unit 2>,
    "meta": {
        "creator": "some-aligner"
    }
}
```

An alignment record without unit roles, or with unit roles hoisted:

```json
{
    "type": "translation",
    "references": [<reference unit 1>, <reference unit 2>],
    "meta": {
        "creator": "some-aligner"
    }
}
```

Without hoisting, a full reference unit might look like:

```json
{ "scheme": "...", "docid": "...", "selectors": ["selector1", "selector2"] }
```

but in practice, the `scheme` and `docid` are hoisted and just the selector or list of selectors included:

`["selector1", "selector2"]`

## Groups and Hoisting

Alignment records are grouped in an **alignment group** and all information in a record except for the reference selectors can be hoisted to the group level.

Here the alignment type and creator have been hoisted:

```json
{
    "type": "translation",
    "meta": {
        "creator": "some-aligner"
    },
    "records": [
        {
            "source": <reference unit 1>,
            "target": <reference unit 2>
        }
    ]
}
```

The unit roles can be hoisted by listing the roles at the group level and then giving reference units positionally in a `references` property.

```json
{
    "type": "translation",
    "meta": {
        "creator": "some-aligner"
    },
    "roles": ["source", "target"],
    "records": [
        {
            "references": [<reference unit 1>, <reference unit 2>]
        }
    ]
}
```

Here the reference scheme and document identifiers have also been hoisted:

```json
{
  "type": "translation",
  "meta": {
    "creator": "some-aligner"
  },
  "documents": [
    { "scheme": "...", "docid": "..." },
    { "scheme": "...", "docid": "..." }
  ],
  "roles": ["source", "target"],
  "records": [
    {
      "references": [["selector1", "selector2"], ["selector3"]],
      "meta": {
        "confidence": 0.9
      }
    }
  ]
}
```

This is equivalent to:

```json
{
  "records": [
    {
      "type": "translation",
      "source": {
        "scheme": "...",
        "docid": "...",
        "selectors": ["selector1", "selector2"]
      },
      "target": {
        "scheme": "...",
        "docid": "...",
        "selectors": ["selector3"]
      },
      "meta": {
        "creator": "some-aligner",
        "confidence": 0.9
      }
    }
  ]
}
```

Note that `meta` properties that have been hoisted are merged with those remaining on individual records. A `meta` property on an individual alignment record can override the value hoisted to the group.

## Top-Level Format

The top-level format consists of a format declaration, version number, and then either a list of alignment groups or, if no hoisting has been performed, a list of alignment records.

With groups:

```json
{
    "format": "alignment",
    "version": "0.3",
    "groups": [
        <group1>,
        <group2>,
        <group3>
    ]
}
```

Without groups:

```json
{
    "format": "alignment",
    "version": "0.3",
    "records": [
        <record1>,
        <record2>,
        …
    ]
}
```

# Appendices

There are three points of extensibility in this alignment format:

- reference schemes
- alignment types
- alignment metadata

It has not yet been decided what reference schemes, alignment types, or alignment metadata are required to be supported by an implementation to be compliant with this specification. Interoperation will likely require compliance with this specification and with the particular reference scheme(s), alignment type(s), and alignment metadata field(s) used.

The following are examples.

## Appendix 1\. Reference Scheme Examples

The (tentatively named) `BCVWP` scheme uses a bible version as `docid` and an 11-character `BBCCCVVVWWWP` string according to the GrapeCity / Clear-Bible data, e.g.

`{ "scheme": "BCVWP", "docid": "NA27", "selectors": ["410040030011"] }`

refers to the first word, Ἀκούετε, in Mark 4.3 in the NA27.

Another tentative scheme could be one that takes a filename as the `docid` and a token offset assuming whitespace tokenization:

`{ "scheme": "ws-token", "docid": "mydoc.txt", "selectors": ["37"] }`

Yet another tentative scheme could be one that takes a filename as the `docid` and character offset start and end assuming Unicode NFC normalization:

`{ "scheme": "nfc-char", "docid": "mydoc.txt", "selectors": ["513-520"] }`

## Appendix 2\. Alignment Type Examples

Different applications of this form will require different alignment types. Here are some examples of type and their roles that we might consider.

alignment type: `related`  
roles: _none_  
description: the most generic way of relating units

alignment type: `directed`  
roles: `from`, `to`  
description: the most generic way of relating units in a directed way

alignment type: `translation`  
roles: `source`, `target`  
description: `target` is a translation of `source`

And an example from a broader use case of linguistic annotation:

alignment type: `anaphora`  
roles: `antecedent`, `anaphor`  
description: the `anaphor` unit refers to the `antecedent` unit

Other use cases may include quotation, citation, echo, allusion, text reuse, summarization, versioning.

## Appendix 3\. Alignment Metadata Examples

I think at a bare minimum we want a timestamp and who is responsible for the record. But there are other use cases to discuss including confident level, curation, etc.
