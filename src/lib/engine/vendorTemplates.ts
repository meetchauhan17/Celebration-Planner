import { EventType } from "../domain";

export interface VendorTemplate {
  category: string;
  label: string;
  whatToAsk: string;
}

export const BASE_VENDORS: Record<EventType, VendorTemplate[]> = {
  wedding: [
    {
      category: "Venue",
      label: "Banquet Hall & Ceremony Grounds",
      whatToAsk: "1. What is the load-in arrival window for decor? 2. Is a backup generator included on-site? 3. Are outside caterers permitted?",
    },
    {
      category: "Catering",
      label: "Wedding Feast Caterer",
      whatToAsk: "1. Do you offer pre-event food tastings? 2. Can you prepare dedicated jain/vegan counters? 3. Are service staff, linen, and dinnerware included?",
    },
    {
      category: "Photography",
      label: "Lead Wedding Photographer & Cinematographer",
      whatToAsk: "1. How many camera operators are on-site? 2. What is the turnaround time for the teaser and full album? 3. Do you retain high-res digital copyright?",
    },
    {
      category: "Decor",
      label: "Floral & Stage Decorator",
      whatToAsk: "1. Do you provide 3D stage mockups? 2. Are fresh flowers sourced on the day? 3. Does the quote include strike-down and cleanup crews?",
    },
    {
      category: "Attire",
      label: "Bridal Wear & Styling Specialist",
      whatToAsk: "1. How many fitting rounds are included? 2. What is the lead time for final alterations? 3. Do you offer emergency day-of on-site steaming?",
    },
    {
      category: "Entertainment",
      label: "DJ & Live Music Ensemble",
      whatToAsk: "1. Do you supply your own sound console and wireless mics? 2. Do you accommodate custom couple playlists? 3. What is the curfew cutoff time?",
    },
    {
      category: "Stationery",
      label: "Invitation Designer & Calligrapher",
      whatToAsk: "1. Can digital QR code RSVP cards be integrated? 2. What is the print proofing timeline? 3. What premium paper weights are available?",
    },
    {
      category: "Catering",
      label: "Artisan Wedding Cake Baker",
      whatToAsk: "1. Do you coordinate refrigerated transport to venue? 2. Can you bake gluten-free/eggless tiers? 3. Is the decorative cake stand rented or included?",
    },
  ],
  birthday: [
    {
      category: "Venue",
      label: "Party Hall & Activity Space",
      whatToAsk: "1. Is outside food/cake permitted? 2. What is the decoration setup time provided? 3. Is background audio equipment available?",
    },
    {
      category: "Catering",
      label: "Party Caterer & Beverage Counter",
      whatToAsk: "1. Do you have finger-food packages suitable for kids? 2. Are live snack/mocktail stations available? 3. Do you provide servers and trash bins?",
    },
    {
      category: "Catering",
      label: "Custom Birthday Cake Specialist",
      whatToAsk: "1. Can you replicate 3D themed fondant designs? 2. What flavors are available for tasting? 3. What is the delivery time window?",
    },
    {
      category: "Entertainment",
      label: "Party Host & DJ Entertainer",
      whatToAsk: "1. Do you organize age-appropriate group games? 2. Are sound system and wireless mics included? 3. Do you supply game prizes?",
    },
    {
      category: "Decor",
      label: "Balloon & Photo Backdrop Decorator",
      whatToAsk: "1. Are organic balloon arches included? 2. Can neon name signs be customized? 3. When does teardown take place?",
    },
    {
      category: "Photography",
      label: "Party Event Photographer",
      whatToAsk: "1. How many edited photos will be delivered? 2. What is the delivery turnaround? 3. Can family portraits be done before party start?",
    },
    {
      category: "Favors",
      label: "Custom Return-Gift Supplier",
      whatToAsk: "1. Can personalized names be printed on favors? 2. What is the packaging presentation? 3. What is the bulk order lead time?",
    },
  ],
  community: [
    {
      category: "Venue",
      label: "Community Park Ground or Civic Hall",
      whatToAsk: "1. What are the permitted hours for amplified sound? 2. Is municipal electricity access provided? 3. What are the parking limits?",
    },
    {
      category: "Catering",
      label: "Bulk Community Buffet Caterer",
      whatToAsk: "1. Can you cater buffet lines for rapid queue clearance? 2. Are eco-friendly compostable plates provided? 3. Is clean drinking water included?",
    },
    {
      category: "Audio",
      label: "Public Address & Lighting Rental",
      whatToAsk: "1. What is the speaker coverage across the field? 2. Are battery-powered backup mics available? 3. Is an AV technician on-site?",
    },
    {
      category: "Infrastructure",
      label: "Marquee Tent, Stage & Seating Rental",
      whatToAsk: "1. What is the wind resistance rating of the marquee? 2. Are stage risers and handrails certified? 3. When does delivery and pickup occur?",
    },
    {
      category: "Sanitation",
      label: "Waste Management & Portable Sanitation",
      whatToAsk: "1. Are segregated recycling and compost bins provided? 2. What is the portable toilet servicing frequency? 3. Do you handle haul-away?",
    },
    {
      category: "Safety",
      label: "Volunteer Security & First-Aid Coordinator",
      whatToAsk: "1. Are certified first-responders present on-site? 2. Do you have an AED unit and basic medical kit? 3. How are emergency exits marked?",
    },
  ],
};
