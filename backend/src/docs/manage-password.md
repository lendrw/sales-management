## Password Management

In this module, we will implement password management features, giving users the option to recover their password through the registered email address and then set a new password.

### Requirements

1. Basically, the user enters their email address and receives an email with a link to proceed with setting a new password.

2. This link must be valid for up to 2 hours and contain the user's identification to prevent anyone from resetting a password on behalf of someone else. After the defined period, the token will be invalidated and the user will need to submit a new request.

3. We will need to store this token information so we can control its validity and identify the user. To do that, we will create a new entity in the application called `UserToken`.

4. We will use `Ethereal Email` to test email sending in the development environment.

### Ethereal.email

[Ethereal Email](https://ethereal.email/) is a free fake email service designed mainly for testing purposes. It is especially popular among `Nodemailer` users. Emails sent through Ethereal are never delivered, which makes it safe for testing.

How it works:

`Configuration`: You configure Ethereal as your outgoing SMTP server in your email application or development environment.
`Sending emails`: When you send emails through Ethereal, they are not actually delivered to recipients. Instead, Ethereal captures and stores the emails, allowing you to view them through a web interface or by using an IMAP client.
`IMAP/POP3 access`: You can access captured emails using your favorite email client.
`Web interface`: Ethereal provides a web interface to view and manage emails.

Main uses of Ethereal.email:

`Testing email functionality`: Ethereal is great for testing your applications' email sending functionality without sending real emails.
`Debugging email issues`: If you are having email delivery issues, Ethereal can help you diagnose the problem.
`Previewing emails`: You can use Ethereal to preview how your emails will look before sending them to real recipients.

### Nodemailer

[Nodemailer](https://nodemailer.com/) is a popular and widely used library in the Node.js ecosystem for handling email sending in several types of applications.
