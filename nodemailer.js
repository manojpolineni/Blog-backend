import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    user: "manuquess06@gmail.com",
    pass: "qcjq mdkh huyq jvjt",
  },
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
});

const recipients = ["manojpolineni68@gmail.com", 'jeevankmr10@gmail.com', 'manojpolineni@quesscorp.com'];

const mailOptions = {
  from: "manuquess06@gmail.com",
  to: recipients,
  subject: "Email With Attachments Testing",
  text: "Welcome to Nodejs",
  html: `<h2 style="color:#0095da">Welcome to MERN stack Developement </h2>
  <img src="https://media.dev.to/cdn-cgi/image/width=1600,height=900,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Ffyfwuqjyecmrps8la2xb.jpeg" />`,
  attachments: [
    {
      filename: "Document.doc",
      path: "Polineni_Manoj_Resume.doc",
    },
    {
      filename: "htmlPDF.pdf",
      path: "Polineni-Manoj-Resume.pdf",
    },
  ],
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Email Sent Successfully", info.mailOptions);
  }
});