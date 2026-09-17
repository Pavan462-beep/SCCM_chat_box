import json
import os

import faiss
from sentence_transformers import SentenceTransformer


# ============================================================
# Configuration
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

INDEX_FILE = os.path.join(
    BASE_DIR,
    "embeddings",
    "sccm.index"
)

METADATA_FILE = os.path.join(
    BASE_DIR,
    "embeddings",
    "metadata.json"
)

EMBEDDING_MODEL = "all-MiniLM-L6-v2"


# ============================================================
# Load Embedding Model
# ============================================================

print("Loading embedding model...")

model = SentenceTransformer(
    EMBEDDING_MODEL
)

print("Embedding model loaded.")


# ============================================================
# Load FAISS Index
# ============================================================

print("Loading FAISS index...")

if not os.path.exists(INDEX_FILE):

    raise FileNotFoundError(
        f"FAISS index not found: {INDEX_FILE}"
    )

index = faiss.read_index(
    INDEX_FILE
)

print("FAISS index loaded.")


# ============================================================
# Load Metadata
# ============================================================

print("Loading metadata...")

if not os.path.exists(METADATA_FILE):

    raise FileNotFoundError(
        f"Metadata file not found: {METADATA_FILE}"
    )

with open(
    METADATA_FILE,
    "r",
    encoding="utf-8"
) as file:

    metadata = json.load(file)


print(
    f"Metadata records loaded: {len(metadata)}"
)


# ============================================================
# Semantic Search
# ============================================================

def search_sccm(
    user_query,
    top_k=5,
    threshold=0.25
):

    """
    Search SCCM software catalog using
    semantic similarity.
    """

    # --------------------------------------------------------
    # Create embedding for user query
    # --------------------------------------------------------

    query_embedding = model.encode(
        [user_query],
        normalize_embeddings=True
    )

    # --------------------------------------------------------
    # Search FAISS
    # --------------------------------------------------------

    scores, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    # --------------------------------------------------------
    # Process results
    # --------------------------------------------------------

    for score, index_id in zip(
        scores[0],
        indices[0]
    ):

        if index_id == -1:
            continue

        similarity = float(score)

        if similarity < threshold:
            continue

        if index_id >= len(metadata):
            continue

        record = metadata[index_id]

        software_name = str(
            record.get(
                "software_name",
                record.get(
                    "Software_Name",
                    ""
                )
            )
        ).strip()

        description = str(
            record.get(
                "description",
                record.get(
                    "Software_Description",
                    ""
                )
            )
        ).strip()

        if not software_name:
            continue

        results.append(
            {
                "software_name": software_name,
                "description": description,
                "similarity_score": round(
                    similarity,
                    4
                )
            }
        )

    # --------------------------------------------------------
    # Remove duplicate software
    # --------------------------------------------------------

    unique_results = []

    seen = set()

    for result in results:

        key = result["software_name"].lower()

        if key in seen:
            continue

        seen.add(key)

        unique_results.append(result)

    return unique_results