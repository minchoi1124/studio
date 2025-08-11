
"use server";

import { z } from "zod";
import { format } from "date-fns";
import { Document, Packer, Paragraph, HeadingLevel, Header, TextRun } from "docx";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  serviceDate: z.date({
    required_error: "A date is required.",
  }),
  thanksgiving: z.string().min(1, "This field is required."),
  whatYouHeard: z.string().min(1, "This field is required."),
  reflection: z.string().min(1, "This field is required."),
  prayer: z.string().min(1, "This field is required."),
  challenges: z.string().min(1, "This field is required."),
});

type FormValues = z.infer<typeof formSchema>;

const createParagraphs = (text: string) => {
    // Basic cleanup to handle common rich text editor artifacts
    const cleanedText = text
        .replace(/<p><br><\/p>/g, '\n') // Replace empty paragraphs with a newline
        .replace(/<\/p><p>/g, '\n') // Replace paragraph breaks with a newline
        .replace(/<br>/g, '\n') // Replace <br> with a newline
        .replace(/<[^>]*>/g, ''); // Strip all other HTML tags

    // Split into lines and create a paragraph for each non-empty line
    const lines = cleanedText.split('\n').filter(line => line.trim() !== '');
    
    // If there are no lines after cleaning, return an array with one empty paragraph to avoid errors
    if (lines.length === 0) {
        return [new Paragraph("")];
    }
    
    return lines.map(line => new Paragraph(line.trim()));
}


export async function generateDocx(values: FormValues) {
    const {
        firstName,
        lastName,
        serviceDate,
        thanksgiving,
        whatYouHeard,
        reflection,
        prayer,
        challenges,
    } = values;

    const formattedDate = format(serviceDate, "yyyyMMdd");
    const filename = `${formattedDate}_${firstName.replace(/\s/g, "")}${lastName.replace(/\s/g, "")}_CPIWR.docx`;

    const doc = new Document({
      creator: "Weekly Reflection App",
      title: `Reflection for ${format(serviceDate, "yyyy-MM-dd")}`,
      description: "Weekly Reflection Document",
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Date: ", bold: true }),
                    new TextRun(format(serviceDate, "MMMM d, yyyy")),
                  ],
                }),
                new Paragraph({
                    children: [
                      new TextRun({ text: "Name: ", bold: true }),
                      new TextRun(`${firstName} ${lastName}`),
                    ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({ text: `Weekly Reflection`, heading: HeadingLevel.TITLE, spacing: { after: 200 } }),

            new Paragraph({ text: "Thanksgiving (10 Min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...createParagraphs(thanksgiving),
            
            new Paragraph({ text: "MBS | What did you hear? (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...createParagraphs(whatYouHeard),

            new Paragraph({ text: "MBS | Reflection (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...createParagraphs(reflection),

            new Paragraph({ text: "Prayer (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...createParagraphs(prayer),

            new Paragraph({ text: "Current Challenges or Prayer Requests (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...createParagraphs(challenges),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    
    return {
        filename,
        buffer: buffer.toString('base64'),
    };
}
