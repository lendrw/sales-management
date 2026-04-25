## File Upload

This document contains a summary of what we will implement for file uploads.

When working with a RESTful API, we usually exchange data between the front end and back end using the `JSON` format.

However, the JSON data format does not work well for file uploads. It is possible to send a file inside JSON, but we would need to convert the file to base64, which is not recommended because the payload becomes very large.

The common practice is to create a separate route to handle requests involving file uploads, using the `multipart/form-data` format.

### Functional Requirements

In our project, we will implement the file upload feature to register users' avatar/profile images.

The file upload service must meet the business rules listed below.

**Functional Requirements:**

- The user must be authenticated to update their own avatar image.
- Do not allow files larger than 3MB to be uploaded.
- Allow only files with one of the following types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.

### Multer

[Multer](https://github.com/expressjs/multer/blob/master/doc/README-pt-br.md)

Multer is a Node.js middleware for handling data in the `multipart/form-data` format, which is mainly used for file uploads. We will install and use Multer in the project.

### Cloudflare R2

[Cloudflare R2](https://dash.cloudflare.com/sign-up/r2/)

There are several systems specifically designed for file uploads, and you have probably heard of `Amazon S3`, which is the most famous one.

Amazon S3 is an Amazon storage service that is very mature and robust.

However, in this project we will not use Amazon S3 for two main reasons:

- The first is that you are required to register a credit card when creating your Amazon account.
- The second reason is cost.

Although Amazon S3 is inexpensive, it is not the cheapest. It charges file egress fees, which means that every time you download a file, you pay that egress fee.

This can become expensive if you have an application that uploads files such as videos or images and allows users to interact with those files. For that reason, we will use `Cloudflare R2`.

`Cloudflare R2` works the same way as Amazon S3 for file storage, but it does not charge egress fees, making it much cheaper than Amazon S3.

Another advantage is that Cloudflare R2 supports the Amazon S3 API, so if you ever want to migrate to Amazon S3, the implementation will be the same.

### Implementing the uploader with Multer and the Amazon S3 Client SDK

[S3 Client SDK](https://docs.aws.amazon.com/pt_br/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html)

Install Multer and the S3 Client SDK to create the implementation for uploading user avatar images.

```shell
npm install multer @aws-sdk/client-s3

npm install @types/multer -D
```
