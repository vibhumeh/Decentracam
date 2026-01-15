# Threat Model


**This section is a security analysis of the application.**
>
> We are assuming the application is running on a **hostile OS**. 
>
> This threat assumption is what sets this app apart from other existing "Image hash stored on blockchain" applications.



## ASSET OF INTEREST (what we are trying to protect)
- Integrity of the hashed image
The image that has been hashed and stored onchain has been proven to be taken by the camera of the user, and isn't sourced externally. This image isn't edited in any way or form, and is provably **not** AI generated. similarly about the image metadata
- Connection betweeen the user and the image

## Adversarial capibilities 
- Full control over mobile OS
- Ability to modify application binaries
- Ability to reorder and replay transactions
- Ability to submit arbitrary data onchain
- Capacity to extract embedded keys
### Possible adversary goals:
- Succesfully Submit hash of edited image 

(any changes after camera capture is considered as edits.)
- Successfully submit hash of a AI generated or self generated image


. 

.

.

.




### - Any verified submission of a hash which is not of a image taken by the phone camera is considered a failure of the protocol.



##
## Trust Assumptions
We trust the following primitives, upon which our protocol is built.
- Blockchain execution

We can assume blockchain execution to be secure due to the consensus mechanism used to enforce consistency.

- Cryptographic primitives

If cryptography primitives fail we have bigger problems than this app to worry about

##
## Threats considered 
### **1.Synthetic Image Injection (Hostile OS)**
### Attack
attacker edits/generates an image outside the camera pipeline. 

Then the hostile OS feeds it to application as if it passed through camera pipeline, allowing hashing and signature over non-authenticated data.
### property violated

origin authenticity

### Status
- Unaddressed in prototype
- Central focus of the design problem



### **2.Post-Capture Image Modification**
### Attack
Image is captured as normal by camera pipeline

The hostile OS allows manipulation and editing of the image before it reaches application layer
allowing hashing and signature over non-authenticated data.
### property violated

origin authenticity

### Status
- Unaddressed under hostile OS
- Requires trusted capture boundary

>
>
>  
>
### **Key Extraction and Signature Forgery**
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


## Threats Out of scope
- Hardware side channel attacks
Sophisticated enough hardware attacks cannot be defended by any sort of software, since the attacker has full access to the device we are attempting to build a trust model around. 
- TEE vendor compromise
The design problem uses the TEE as a trusted enviornment. If it is compromised by the vendor, the model can no longer be trusted.
 
##  Relationship Between Threat Model and Prototype
The current prototype does not address the majority of threats identified above. This gap highlights the limitations of naive hash-on-chain approaches under hostile execution

This motivates us to have a stronger system design which can be trusted even in hostile OS conditions.
