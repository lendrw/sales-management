# JWT overview

## What is JWT?

[JWT](https://jwt.io/) is a secure way to transmit information between two parties, following the standard defined in RFC 7519.

Authentication is stateless, meaning the parties do not store access information, which is kept inside the token itself.

The token is made up of 3 parts:

* `Header` - information about the token itself, such as the type of algorithm used.

* `Payload` - contains the information we want to send between the two parties.

* `Verify Signature` - guarantees that a token has not been changed. The result of this signature is a combination of the other fields, and if anything is modified in any field, the signature will also change, causing the token to be considered invalid.

To validate the token and, consequently, the information, you can use a secret key or work with public and private keys. This same key is also used to sign the token during creation.

[JWT](https://jwt.io/) is widely used as an authentication mechanism in APIs. However, if we do not have the necessary knowledge to implement this functionality with good practices, the authentication system may present flaws that compromise the security of the application as a whole.

## JWT installation

[JWT installation](https://jwt.io/libraries?language=Node.js).

```bash
npm install jsonwebtoken

npm install -D @types/jsonwebtoken
```

Configure the environment variables to work with JWT.

Files `.env`, `.env.test`, and `.env.example`:

```bash
JWT_SECRET=my_secret
JWT_EXPIRES_IN=86400    # 1 day in seconds
```
