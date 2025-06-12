import { contentfulClient } from "@/lib/contentfulClient";
import { contentfulManagementClient } from "@/lib/contentfulManagementClient";

const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;

export interface IrregularHour {
  id: string;
  date: string; // YYYY-MM-DD
  openTime?: string; // HH:MM
  closeTime?: string; // HH:MM
  isClosed: boolean;
  notes?: string;
}

interface OpeningHoursEntry {
  fields: {
    openingTime?: string | Date;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
    notes?: string;
  };
  sys: {
    id: string;
  };
}

export const fetchIrregularHours = async (): Promise<IrregularHour[]> => {
  try {
    const response = await contentfulClient.getEntries({
      content_type: "openingHours",
      order: ["fields.openingTime"],
    });
    const today = new Date().toISOString().split("T")[0];
    const irregularHours = response.items
      .map((item: OpeningHoursEntry) => {
        const fields = item.fields;
        let dateStr = "";
        if (fields.openingTime) {
          if (typeof fields.openingTime === "string") {
            dateStr = fields.openingTime.split("T")[0];
          } else if (fields.openingTime instanceof Date) {
            dateStr = fields.openingTime.toISOString().split("T")[0];
          } else {
            dateStr = String(fields.openingTime).split("T")[0];
          }
        }
        return {
          id: item.sys.id,
          date: dateStr,
          openTime: typeof fields.openTime === "string" ? fields.openTime : "",
          closeTime:
            typeof fields.closeTime === "string" ? fields.closeTime : "",
          isClosed:
            typeof fields.isClosed === "boolean" ? fields.isClosed : false,
          notes: typeof fields.notes === "string" ? fields.notes : "",
        };
      })
      .filter((hour: IrregularHour) => hour.date >= today);
    return irregularHours;
  } catch (error) {
    console.error("Contentful fetch error:", error);
    return [];
  }
};

export const createIrregularHour = async (
  data: Omit<IrregularHour, "id">
): Promise<IrregularHour> => {
  try {
    const space = await contentfulManagementClient.getSpace(spaceId);
    const environment = await space.getEnvironment("master");
    const entry = await environment.createEntry("openingHours", {
      fields: {
        openingTime: {
          "en-US": data.date ? new Date(data.date).toISOString() : null,
        },
        openTime: { "en-US": data.openTime },
        closeTime: { "en-US": data.closeTime },
        isClosed: { "en-US": data.isClosed },
        notes: { "en-US": data.notes || "" },
      },
    });
    await entry.publish();
    return {
      id: entry.sys.id,
      date: data.date,
      openTime: data.openTime,
      closeTime: data.closeTime,
      isClosed: data.isClosed,
      notes: data.notes,
    };
  } catch (error) {
    console.error("Contentful create error:", error);
    throw error;
  }
};

export const updateIrregularHour = async (
  id: string,
  data: Partial<Omit<IrregularHour, "id">>
): Promise<IrregularHour | null> => {
  try {
    const space = await contentfulManagementClient.getSpace(spaceId);
    const environment = await space.getEnvironment("master");
    const entry = await environment.getEntry(id);
    if (!entry) return null;
    if (data.date !== undefined) {
      entry.fields.openingTime = { "en-US": new Date(data.date).toISOString() };
    }
    if (data.openTime !== undefined) {
      entry.fields.openTime = { "en-US": data.openTime };
    }
    if (data.closeTime !== undefined) {
      entry.fields.closeTime = { "en-US": data.closeTime };
    }
    if (data.isClosed !== undefined) {
      entry.fields.isClosed = { "en-US": data.isClosed };
    }
    if (data.notes !== undefined) {
      entry.fields.notes = { "en-US": data.notes };
    }
    const updatedEntry = await entry.update();
    await updatedEntry.publish();
    return {
      id: updatedEntry.sys.id,
      date:
        data.date ||
        (entry.fields.openingTime
          ? new Date(entry.fields.openingTime["en-US"])
              .toISOString()
              .split("T")[0]
          : ""),
      openTime: data.openTime || entry.fields.openTime?.["en-US"] || "",
      closeTime: data.closeTime || entry.fields.closeTime?.["en-US"] || "",
      isClosed:
        data.isClosed !== undefined
          ? data.isClosed
          : entry.fields.isClosed?.["en-US"] || false,
      notes: data.notes || entry.fields.notes?.["en-US"] || "",
    };
  } catch (error) {
    console.error("Contentful update error:", error);
    return null;
  }
};

export const deleteIrregularHour = async (id: string): Promise<void> => {
  try {
    const space = await contentfulManagementClient.getSpace(spaceId);
    const environment = await space.getEnvironment("master");
    const entry = await environment.getEntry(id);
    if (!entry) return;
    await entry.unpublish();
    await entry.delete();
  } catch (error) {
    console.error("Contentful delete error:", error);
    throw error;
  }
};
