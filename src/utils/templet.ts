
import fs from 'fs';


// Define types for the email placeholders
interface EmailReplacements {
  fullName: string;
  workEmail: string;
  message: string;
  organization:string;time:string;role:string;
}


/**
 * Load and replace placeholders in the email template
 * @param filePath - Path to the email template file
 * @param replacements - Object containing placeholder values
 * @returns - Processed HTML string
 */
 export const  loadEmailTemplate = (filePath: string, replacements:any): string => {
  let template = fs.readFileSync(filePath, 'utf-8');
  
  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, (replacements as any)[key]);
  });

  return template;
};



