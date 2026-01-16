# Prototype Scope
This document defines the functional and security scope of the current proof-of-concept (POC) implementation. The prototype is intentionally minimal and exists to isolate on-chain enforcement logic under hostile off-chain assumptions, rather than to fully implement the cryptographic system described in the whitepaper.

## In Scope
### On-chain Components
- Accepts image hashes only after successful cryptographic verification
- Verifies external ED25519 signatures
- Enforces explicit state transitions contingent on verification success
### Off-chain Components
The off-chain component exists solely to produce inputs for on-chain verification and is explicitly not treated as a trusted execution environment.
- Minimal Camera app
- Submits image hashes and corresponding signatures to the smart contract
- Uses an embedded private key as a **placeholder trust anchor** for development and testing

## Explicitly Out of Scope
- Protection against private key extraction from the client environment
- Enforced resistance to replay attacks (a counter skeleton exists but is not enforced)
- Hardware-backed attestation or trusted execution enforcement

This scope definition is intentionally narrow. Its purpose is to clearly delineate what the prototype demonstrates versus what is addressed by the proposed system design and formalized in the accompanying whitepaper.


