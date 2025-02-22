import { Request, Response } from "express";
import Query, { IRequest } from "../../models/query.model";
import transporter from "../../config/nodemailer";
import path from "path";
import { loadEmailTemplate } from "../../utils/templet";
import { AnyArray } from "mongoose";
import * as XLSX from "xlsx";
const fs = require("fs");

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const update = await Query.updateOne(
      { _id: req?.params?.id },
      {
        $set: {
          status: req.params.status,
        },
      }
    );
    res.status(200).json({ success: "Request UPdate  Data" });
  } catch (error: any) {
    res.status(500).json({
      e: "Server Error",
      error,
    });
  }
};

export const addRequest = async (req: Request, res: Response) => {
  try {
    let { fullName, workEmail, message, role, organization } = req.body;
    if (!fullName || !workEmail || !message || !organization || !role) {
      throw Error();
    }
    const share = ["lineo3551@gmail.com"];
    const createRequest = await Query.create({
      fullName,
      workEmail,
      message,
      organization,
      role,
      share,
    });

    const emailTemplatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "emailTemplate.html"
    );
    const time = ` Request at ${new Date().toLocaleString()}`;

    // Replace placeholders with actual values
    const emailHTML = loadEmailTemplate(emailTemplatePath, {
      fullName,
      workEmail,
      message,
      organization,
      time,
      role,
    });

    let from = `${organization} <${workEmail}>`;
    const info = await transporter
      .sendMail({
        from: from,
        to: "lineo3551@gmail.com",
        subject: organization,
        html: emailHTML,
      })
      .then((e) => {})
      .catch((e) => res.status(403).json({ ...e }));

    res.status(200).json({ success: "Request Submit Data" });
  } catch (e) {
    res.status(500).json({
      e: "Server Error",
      error: e,
    });
  }
};

export const searchRequests = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      workEmail,
      organization,
      role,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search,
      by,
    } = req.query;

    // Build search query

    const searchQuery: any = {};

    if (by == "fullName") {
      searchQuery.fullName = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    if (by == "workEmail") {
      searchQuery.workEmail = { $regex: search, $options: "i" };
    }
    if (by == "organization") {
      searchQuery.organization = { $regex: search, $options: "i" };
    }
    if (by == "role") {
      searchQuery.role = { $regex: search, $options: "i" };
    }
    if (status) {
      searchQuery.status = { $regex: status, $options: "i" };
    }
    if (by == "all") {
      // Use $or operator to search across multiple fields
      searchQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { workEmail: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate && endDate) {
      searchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Calculate skip and limit for pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNumber = Number(limit);

    // Find the requests with pagination

    const requests = await Query.find(searchQuery)
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalRequests = await Query.countDocuments(searchQuery);

    // Calculate total pages
    const totalPages = Math.ceil(totalRequests / limitNumber);

    // Return the paginated data
    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        totalRequests,
        totalPages,
        currentPage: Number(page),
        perPage: limitNumber,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: "Server Error", message: e?.message });
  }
};

export const shareRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { emails, id } = req.body;
    

    let request: any = await Query.findById(id);

    const { fullName, workEmail, message, organization, role, createdAt } =
      request;

    const emailTemplatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "emailTemplate.html"
    );
    const time = ` Request at ${new Date(createdAt).toLocaleString()}`;
    if (!request.share) {
      request.share = [];
    }
    request.share = [...new Set([...request.share, ...emails])];

    // Save the updated document
    await request.save();
    // Replace placeholders with actual values
    const emailHTML = loadEmailTemplate(emailTemplatePath, {
      fullName,
      workEmail,
      message,
      organization,
      time,
      role,
    });
    let from = `${organization} <${workEmail}>`;
    let emailFailed=false
    const info = await transporter
      .sendMail({
        from: from,
        to: emails,
        subject: organization,
        html: emailHTML,
      })
      .then((e) => {})
      .catch((e) =>{



       emailFailed=true
      } );
if(emailFailed){
  res.status(403).json({ success: "Unable to send emails" });
  return
}
    res.status(200).json({ success: "Request Submit Data" });
  } catch (e: any) {
    res.status(500).json({ error: "Server Error", message: e?.message });
  }
};

export const downloadRequests = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      workEmail,
      organization,
      role,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search,
      by,
    } = req.query;

    // Build search query

    const searchQuery: any = {};

    if (by == "fullName") {
      searchQuery.fullName = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    if (by == "workEmail") {
      searchQuery.workEmail = { $regex: search, $options: "i" };
    }
    if (by == "organization") {
      searchQuery.organization = { $regex: search, $options: "i" };
    }
    if (by == "role") {
      searchQuery.role = { $regex: search, $options: "i" };
    }
    if (status) {
      searchQuery.status = { $regex: status, $options: "i" };
    }
    if (by == "all") {
      // Use $or operator to search across multiple fields
      searchQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { workEmail: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate && endDate) {
      searchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Calculate skip and limit for pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNumber = Number(limit);

    // Find the requests with pagination

    const requests = await Query.find(searchQuery);
    const excelData: any = [
      [
        "Sr No.",
        "Person Name",
        "Role",
        "Organization",
        "Work Email",
        "Date",
        "Status",
        "Share",
      ],
    ];

    requests.forEach((request: IRequest, index: number) => {
      let item = [
        index + 1,
        request.fullName,
        request.role,
        request.organization,
        request.workEmail,
        request?.createdAt?.toDateString(),
        request?.status,
        request.share.join(" ,"),
      ];
      excelData.push(item);
    });

    const filename = `request.xlsx`;
    const wbOpts = { bookType: "xlsx", type: "buffer" } as const;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "sett");
    XLSX.writeFile(workbook, filename, wbOpts);

    // Return the paginated data
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const stream = fs.createReadStream(filename);
    stream.pipe(res);

    res.on("finish", () => {
      fs.unlink(filename, (err: any) => {
        if (err) {
          console.error(err);
        } else {
        }
      });
    });
  } catch (e: any) {
    res.status(500).json({ error: "Server Error", message: e?.message });
  }
};
export const downloadRequestsView = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      workEmail,
      organization,
      role,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search,
      by,
    } = req.query;

    // Build search query

    const searchQuery: any = {};

    if (by == "fullName") {
      searchQuery.fullName = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    if (by == "workEmail") {
      searchQuery.workEmail = { $regex: search, $options: "i" };
    }
    if (by == "organization") {
      searchQuery.organization = { $regex: search, $options: "i" };
    }
    if (by == "role") {
      searchQuery.role = { $regex: search, $options: "i" };
    }
    if (status) {
      searchQuery.status = { $regex: status, $options: "i" };
    }
    if (by == "all") {
      // Use $or operator to search across multiple fields
      searchQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { workEmail: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate && endDate) {
      searchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Find the requests with pagination

    const requests = await Query.find(searchQuery);
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (e: any) {
    res.status(500).json({ error: "Server Error", message: e?.message });
  }
};
