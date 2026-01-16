# Threat Model


**This section is a security analysis of the application.**
>
> We are assuming the application is running on a **hostile OS**. 
>
> This threat assumption is what sets this app apart from other existing "Image hash stored on blockchain" applications.



## Assets of Interest
- Integrity and provenance of the hashed image
  The image hash recorded on-chain is intended to correspond to a genuine camera capture event performed on the user’s device, and not to externally sourced or post-processed data. This includes the integrity of associated capture metadata.
- Binding between the image and the claimed user identity

## Adversarial Capabilities 
- Full control over mobile OS
- Ability to modify application binaries
- Ability to reorder and replay transactions
- Ability to submit arbitrary data onchain
- Capacity to extract embedded keys
### Possible adversary goals:
- Successfully submit a hash corresponding to a post-capture modified image

(any changes after camera capture is considered as edits.)
- Successfully submit a hash corresponding to a non-capture (synthetic or externally generated) image




###  Any verified submission of a hash that does not correspond to a genuine camera capture event on the device is considered a failure of the protocol.



##
## Trust Assumptions
We trust the following primitives, upon which our protocol is built.
- Blockchain execution

We can assume blockchain execution to be secure due to the consensus mechanism used to enforce consistency.

- Cryptographic primitives

Standard cryptographic primitives are assumed to be secure and correctly implemented.

##
## Threats considered 
### **1.Synthetic Image Injection (Hostile OS)**
### Attack
attacker edits/generates an image outside the camera pipeline. 

Then the hostile OS feeds it to application as if it passed through camera pipeline, allowing hashing and signature over non-authenticated data.
### property violated

Origin authenticity

### Status
- Unaddressed in prototype
- Central focus of the design problem



### **2.Post-Capture Image Modification**
### Attack
Image is captured as normal by camera pipeline

The hostile OS allows manipulation and editing of the image before it reaches application layer
allowing hashing and signature over non-authenticated data.
### property violated

Origin authenticity

### Status
- Unaddressed under hostile OS
- Requires trusted capture boundary

>
>
>  
>
### **3. Key Extraction and Signature Forgery**
### Attack
Embedded key is extracted from application binary
arbitrary hashes can now be signed by attacker
### property violated

Authenticity of source claims


### Status
- Explicitly unaddressed in prototype
- Placeholder trust anchor

### **4. Replay of Previously Valid Hashes**



### Attack:
Attacker replays a previously valid (hash, signature) pair

Claims a new capture event without a new image

### Property violated:
Freshness / temporal binding

### Status:
- Partially considered
- Prototype includes counter skeleton but does not enforce replay resistance



### **5. Misattribution of Image Origin**


### Attack:
Valid image hash is submitted by a different user or context
On-chain record falsely attributes origin

### Property violated:
Binding between image and claimed origin

### Status:
- Out of scope for prototype
- Requires stronger identity or attestation assumptions

### **6. Malicious On-Chain Submission**


### Attack:
Attacker submits arbitrary data directly on-chain
Attempts to bypass off-chain expectations

### Property violated:
None (if on-chain verification is correct)

### Status:
- Addressed by on-chain verification logic


## Threats Out of Scope
- Hardware side channel attacks
Sophisticated enough hardware attacks cannot be defended by any sort of software, since the attacker has full access to the device we are attempting to build a trust model around. 
- TEE vendor compromise
The design problem uses the TEE as a trusted environment. If it is compromised by the vendor, the model can no longer be trusted.
 
## Relationship Between Threat Model and Prototype
The current prototype does not address the majority of threats identified above. This gap highlights the limitations of naive hash-on-chain approaches under hostile execution

This motivates us to have a stronger system design which can be trusted even in hostile OS conditions.
