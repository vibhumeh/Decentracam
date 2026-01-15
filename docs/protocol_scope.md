# Prototype Scope
This document outlines the functional and security scope of the current POC implementation.
The prototype is intentionally minimal and exists to isolate on-chain enforcement logic under hostile off-chain assumptions, rather than to fully realize the cryptographic system analyzed in the whitepaper.

##
### On-chain
- Accepts hash only after cryptographic verification
- verifies external ED25519 signatures
-Enforces state transitions dependent on verificaiton success 
### Off-chain
The off-chain component exists solely to produce verifiable inputs to the on-chain logic and is not treated as a trusted environment.
- minimal Camera app
- Submits hash and signature to smart contract
- Use embedded private key as a **placeholder trust anchor** 

## Out of scope:
- Protection from key extraction
- Resistance to replay attacks (a counter skeleton exists but is not enforced)
- Hardware backed attestation


