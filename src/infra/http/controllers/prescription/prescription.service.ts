import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import * as ejs from "ejs";
import * as path from "path";
import * as puppeteer from "puppeteer";
import type { PrescriptionPdfDataType } from "./get-prescription-pdf.controller";

@Injectable()
export class PrescriptionService {
  constructor() {}

  async generatePDF(prescription: PrescriptionPdfDataType): Promise<Buffer> {
    if (!prescription) {
      throw new NotFoundException("Prescription data not found");
    }

    let templateFilePath: string = "";

    console.log(prescription.prescriptionType);

    if (prescription.prescriptionType === "MEDIC") {
      templateFilePath = path.resolve(
        "./src/infra/http/controllers/prescription/templates/prescriptionPatient.ejs",
      );
    } else {
      templateFilePath = path.resolve(
        "./src/infra/http/controllers/prescription/templates/prescriptionPet.ejs",
      );
    }

    try {
      const htmlData = await new Promise<string>((resolve, reject) => {
        ejs.renderFile(templateFilePath, { prescription }, (err, html) => {
          if (err) {
            return reject(
              new InternalServerErrorException(
                "Error during prescription document generation",
              ),
            );
          }
          resolve(html);
        });
      });

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlData);

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          left: "0px",
          top: "0px",
          right: "0px",
          bottom: "0px",
        },
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error: unknown) {
      throw new InternalServerErrorException(error);
    }
  }
}
