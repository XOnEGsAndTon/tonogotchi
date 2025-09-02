Contracts (Tact) for TONоготчи MVP.

- NftItem with mortality: fields birth_time, lifespan_days, dna_hash, base_stats, is_dead, death_time, content_uri, editor.
- declareDeath() callable only by editor; flips to grave CID and clears editor.
- BreedingService: startBreed(parentA, parentB, commitHash) and revealBreed(sessionId, seed).

These are stubs compatible with TIP-4 patterns. Integrate with your collection implementation.

