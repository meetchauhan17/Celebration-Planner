import { EventType } from "../domain";

export interface TaskTemplate {
  title: string;
  category: string;
  leadTimeDays: number;
  isCritical: boolean;
  minimumLeadDays: number;
}

export const TIMELINE_TEMPLATES: Record<EventType, TaskTemplate[]> = {
  wedding: [
    { title: "Book wedding venue & ceremony hall", category: "Venue", leadTimeDays: 270, isCritical: true, minimumLeadDays: 60 },
    { title: "Book primary photographer & videographer", category: "Photography", leadTimeDays: 240, isCritical: true, minimumLeadDays: 45 },
    { title: "Send save-the-date notifications", category: "Stationery", leadTimeDays: 180, isCritical: false, minimumLeadDays: 30 },
    { title: "Finalize catering menu tasting", category: "Catering", leadTimeDays: 150, isCritical: true, minimumLeadDays: 30 },
    { title: "Order bridal wear & formal attire", category: "Attire", leadTimeDays: 120, isCritical: true, minimumLeadDays: 30 },
    { title: "Contract DJ, live musicians, and sound system", category: "Entertainment", leadTimeDays: 90, isCritical: true, minimumLeadDays: 21 },
    { title: "Design stage decor & floral arrangements", category: "Decor", leadTimeDays: 75, isCritical: false, minimumLeadDays: 21 },
    { title: "Mail formal invitations with RSVP deadline", category: "Stationery", leadTimeDays: 60, isCritical: true, minimumLeadDays: 21 },
    { title: "Confirm guest transport and parking logistics", category: "Operations", leadTimeDays: 30, isCritical: false, minimumLeadDays: 14 },
    { title: "Finalize seating chart & headcount with caterer", category: "Guests", leadTimeDays: 14, isCritical: true, minimumLeadDays: 7 },
    { title: "Distribute arrival schedule to vendors", category: "Operations", leadTimeDays: 7, isCritical: true, minimumLeadDays: 3 },
    { title: "Final venue walk-through & coordinator sync", category: "Operations", leadTimeDays: 3, isCritical: true, minimumLeadDays: 2 },
  ],
  birthday: [
    { title: "Confirm celebration theme & pick venue", category: "Venue", leadTimeDays: 30, isCritical: true, minimumLeadDays: 14 },
    { title: "Send digital invitations & collect RSVPs", category: "Invitations", leadTimeDays: 21, isCritical: true, minimumLeadDays: 10 },
    { title: "Book party entertainment & music/DJ", category: "Entertainment", leadTimeDays: 18, isCritical: true, minimumLeadDays: 7 },
    { title: "Order custom birthday cake and cupcakes", category: "Catering", leadTimeDays: 10, isCritical: true, minimumLeadDays: 4 },
    { title: "Finalize food & beverage catering package", category: "Catering", leadTimeDays: 10, isCritical: true, minimumLeadDays: 5 },
    { title: "Purchase balloon decor, banners & photo backdrop", category: "Decor", leadTimeDays: 7, isCritical: false, minimumLeadDays: 3 },
    { title: "Hire photographer for celebration moments", category: "Photography", leadTimeDays: 7, isCritical: false, minimumLeadDays: 3 },
    { title: "Prepare return-gifts and party favor bags", category: "Favors", leadTimeDays: 5, isCritical: false, minimumLeadDays: 2 },
    { title: "Confirm final headcount and dietary requests", category: "Guests", leadTimeDays: 3, isCritical: true, minimumLeadDays: 2 },
    { title: "Confirm cake delivery timing & venue setup window", category: "Operations", leadTimeDays: 1, isCritical: true, minimumLeadDays: 1 },
  ],
  community: [
    { title: "Secure municipal permits, hall license & police clearance", category: "Permits", leadTimeDays: 45, isCritical: true, minimumLeadDays: 21 },
    { title: "Reserve community ground, park or facility", category: "Venue", leadTimeDays: 40, isCritical: true, minimumLeadDays: 20 },
    { title: "Launch promotion, flyers, and volunteer recruitment", category: "Promotion", leadTimeDays: 28, isCritical: false, minimumLeadDays: 14 },
    { title: "Contract sound, lighting, and stage rental", category: "Audio", leadTimeDays: 25, isCritical: true, minimumLeadDays: 14 },
    { title: "Finalize food stalls, catering & drinking water", category: "Catering", leadTimeDays: 21, isCritical: true, minimumLeadDays: 10 },
    { title: "Draft volunteer roster & schedule role briefing", category: "Volunteers", leadTimeDays: 21, isCritical: false, minimumLeadDays: 7 },
    { title: "Prepare safety plan, emergency exits & sanitization", category: "Safety", leadTimeDays: 14, isCritical: true, minimumLeadDays: 7 },
    { title: "Broadcast reminder & distribute schedule banners", category: "Promotion", leadTimeDays: 10, isCritical: false, minimumLeadDays: 4 },
    { title: "Procure first-aid kits, crowd tape & registration badges", category: "Safety", leadTimeDays: 7, isCritical: true, minimumLeadDays: 3 },
    { title: "Confirm electrical generator & AV load-in window", category: "Operations", leadTimeDays: 4, isCritical: true, minimumLeadDays: 2 },
    { title: "Volunteer walkthrough and safety orientation", category: "Volunteers", leadTimeDays: 2, isCritical: true, minimumLeadDays: 1 },
    { title: "Final ground inspection, setup check & sound-check", category: "Execution", leadTimeDays: 1, isCritical: true, minimumLeadDays: 1 },
  ],
};
