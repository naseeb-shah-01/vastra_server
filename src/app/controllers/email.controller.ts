import { Request, Response } from "express";
import transporter from "../../config/nodemailer";

export const sendEmail = async (req: Request, res: Response) => {
  let { to, subject, text,from } = req.body;

  try {

    if(!to||!subject||!text){
      res.status(400).json({ message: "Failed to send email",...req.body ,email:process.env.EMAIL_USER});
    }
   from = ` New request${"Sai"} <${from}>`
const info=    await transporter.sendMail({
      from:from,
      to,
      subject,
      text,
    }).then(e=>console.log(e)).catch((e)=>res.status(403).json({...e}))

    res.status(200).json({ message: "Email sent successfully",info });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
};
