
"use server";

import { z } from "zod";
import { format } from "date-fns";
import { Document, Packer, Paragraph, HeadingLevel, ISectionOptions } from "docx";

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

// Helper to extract plain text from Quill's HTML
const extractText = (html: string): string[] => {
  if (!html) return [''];
  // Remove all HTML tags to get plain text
  const plainText = html.replace(/<[^>]+>/g, ' ');
  // Split into paragraphs based on what Quill uses for new lines. This might need adjustment.
  // A simple split on <p> or <br> isn't enough as we stripped them.
  // We'll treat the whole block as one paragraph for simplicity and robustness.
  // Splitting by lines could be done if newlines are preserved.
  const lines = plainText.split('\n').filter(line => line.trim() !== '');
  return lines.length > 0 ? lines : [''];
};

const createParagraphs = (text: string) => {
    const lines = text.replace(/<p><br><\/p>/g, '\n').replace(/<\/p><p>/g, '\n').replace(/<[^>]*>/g, '').split('\n');
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
          children: [
            new Paragraph({ text: `Weekly Reflection`, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: `${firstName} ${lastName} - ${format(serviceDate, "MMMM d, yyyy")}`, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),

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
