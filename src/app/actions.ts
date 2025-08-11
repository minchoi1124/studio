
"use server";

import { z } from "zod";
import { format } from "date-fns";
import { Document, Packer, Paragraph, HeadingLevel, HtmlImporter, ISectionOptions } from "docx";

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

// Helper to clean up HTML and provide a fallback
const cleanHtml = (html: string): string => {
  const cleaned = html.replace(/<p><br><\/p>/g, '').replace(/<p><\/p>/g, '');
  return cleaned.trim() === '' ? '<p></p>' : cleaned;
};

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
    
    const importer = new HtmlImporter();

    const thanksgivingParas = await importer.import(cleanHtml(thanksgiving));
    const whatYouHeardParas = await importer.import(cleanHtml(whatYouHeard));
    const reflectionParas = await importer.import(cleanHtml(reflection));
    const prayerParas = await importer.import(cleanHtml(prayer));
    const challengesParas = await importer.import(cleanHtml(challenges));

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
            ...thanksgivingParas,
            
            new Paragraph({ text: "MBS | What did you hear? (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...whatYouHeardParas,

            new Paragraph({ text: "MBS | Reflection (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...reflectionParas,

            new Paragraph({ text: "Prayer (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...prayerParas,

            new Paragraph({ text: "Current Challenges or Prayer Requests (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            ...challengesParas,
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
