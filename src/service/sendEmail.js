 import nodemailer  from "nodemailer";

export const sendEmail = async({to,subject,html,attachments})=>{
   

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    port:465,
    secure:true,
//   host: "smtp.ethereal.email",
//   port: 587,
//   secure: false, // true for 465, false for other ports
  service:"gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Wrap in an async IIFE so we can use await.
  const info = await transporter.sendMail({
    from: `"Amany Ehab" <${process.env.EMAIL}>`,
    to:to||"2100448@eng.asu.edu.eg",
    subject:subject||"Hello world?", // plain‑text body
    html:html||"<b>Hello world?</b>", // HTML body
    attachments:attachments||[]
  });

  if(info.accepted.length>0) return true;
  else return false;
}

