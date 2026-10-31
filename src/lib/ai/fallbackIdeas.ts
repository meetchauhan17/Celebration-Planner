import type { EventType } from "../domain/types";

export type IdeaFocus = "theme" | "menu" | "activities" | "decor" | "surprises";

export interface IdeaItem {
  title: string;
  description: string;
  tag: string;
  estimatedCost: "low" | "medium" | "high";
}

export const FALLBACK_IDEAS: Record<EventType, Record<IdeaFocus, IdeaItem[]>> = {
  wedding: {
    theme: [
      { title: "Heritage Courtyard Elegance", description: "Brass accents, marigold garlands, and earthen terracotta tones celebrating traditional craftsmanship.", tag: "theme", estimatedCost: "medium" },
      { title: "Minimalist Botanical Haven", description: "Neutral linen textiles, lush eucalyptus greens, and subtle warm-white candle lighting.", tag: "theme", estimatedCost: "low" },
      { title: "Royal Velvet & Gilt", description: "Deep jewel tones, ornate zardozi-inspired table runners, and antique metallic candelabras.", tag: "theme", estimatedCost: "high" },
      { title: "Sunset Garden Romance", description: "Pastel peach and sage florals illuminated by fairy-lit pergolas and wicker seating.", tag: "theme", estimatedCost: "medium" },
      { title: "Vintage Chronicle Aesthetic", description: "Custom newspaper-printed guest programs, typewriter guestbooks, and sepia photo displays.", tag: "theme", estimatedCost: "low" },
    ],
    menu: [
      { title: "Regional Live Street Food Bazaar", description: "Artisanal chaat counter, mini dosas, and live woodfired kulchas crafted to order.", tag: "catering", estimatedCost: "medium" },
      { title: "Curated Thali Experience", description: "Multi-course regional thalis highlighting seasonal ingredients with dedicated Jain options.", tag: "catering", estimatedCost: "medium" },
      { title: "Artisanal Mithai & Fusion Dessert Bar", description: "Modern takes on classic sweets such as baked rasgulla tarts and pistachio mousse.", tag: "catering", estimatedCost: "low" },
      { title: "Farm-to-Table Organic Feast", description: "Locally sourced seasonal vegetables, heirloom grains, and bespoke cold-pressed beverage stations.", tag: "catering", estimatedCost: "high" },
      { title: "Midnight Snack Truck Station", description: "Late-night gourmet sliders, spiced masala fries, and cutting chai for dancing guests.", tag: "catering", estimatedCost: "low" },
    ],
    activities: [
      { title: "Interactive Polaroids & Audio Guestbook", description: "Guests record heartfelt spoken wishes on a vintage telephone and pin instant snapshots.", tag: "activity", estimatedCost: "low" },
      { title: "Sangeet Dance-Off Showcase", description: "Choreographed friendly group performances with a printed scorecard for crowd voting.", tag: "activity", estimatedCost: "low" },
      { title: "Bespoke Perfume Blending Bar", description: "Guests craft signature botanical attar fragrances to take home as keepsake favors.", tag: "activity", estimatedCost: "medium" },
      { title: "Live Speed-Painting Portraitist", description: "An artist paints a live canvas of the couple during the vows or reception.", tag: "activity", estimatedCost: "medium" },
      { title: "Couple Trivia Game", description: "Lighthearted audience-participation quiz with questions about the couple's quirky milestones.", tag: "activity", estimatedCost: "low" },
    ],
    decor: [
      { title: "Cascading Fabric Mandap / Arch", description: "Sheer unbleached cotton drapes structured with local foliage and warm spot illumination.", tag: "decor", estimatedCost: "medium" },
      { title: "Brass Diya & Marigold Pathways", description: "Handcrafted brass urli bowls with floating blossoms and glowing tealights lining walkways.", tag: "decor", estimatedCost: "low" },
      { title: "Hanging Floral Chandelier Canopy", description: "Suspended inverted wisteria and tuberose clusters over central dining tables.", tag: "decor", estimatedCost: "high" },
      { title: "Monochrome Typographic Welcome Arch", description: "Crisp black-on-linen typography welcoming guests with custom quotes and event schedule.", tag: "decor", estimatedCost: "low" },
      { title: "Illuminated Photo Heritage Wall", description: "Framed black-and-white family photographs tracing generations, back-lit by warm LEDs.", tag: "decor", estimatedCost: "low" },
    ],
    surprises: [
      { title: "Flash-Mob Acoustic Chorus", description: "Close friends surprise the couple with an acoustic acoustic harmony as dinner begins.", tag: "surprise", estimatedCost: "low" },
      { title: "Personalized Letter at Each Place Setting", description: "Handwritten notes tucked inside napkins thanking each guest for their unique journey.", tag: "surprise", estimatedCost: "low" },
      { title: "Cold Pyrotechnic Grand Entry", description: "Smokeless indoor cold-spark fountains timing perfectly with the couple's celebration entrance.", tag: "surprise", estimatedCost: "medium" },
      { title: "Secret Midnight Dessert Drop", description: "Surprise reveal of artisanal ice creams or warm churros delivered straight to the dancefloor.", tag: "surprise", estimatedCost: "low" },
      { title: "Custom Printed Evening Edition Paper", description: "Same-day printed mini-newspaper featuring photos from the morning ceremonies.", tag: "surprise", estimatedCost: "medium" },
    ],
  },
  birthday: {
    theme: [
      { title: "Retro Arcade & Neon Revival", description: "Vibrant neon lighting, pixel graphics, and tabletop vintage arcade games.", tag: "theme", estimatedCost: "medium" },
      { title: "Boho Picnic Lounges", description: "Low timber tables, macrame cushions, woven rugs, and floral table runners in a grassy meadow.", tag: "theme", estimatedCost: "low" },
      { title: "Cinema Under the Stars", description: "Outdoor projector screen, reclining beanbags, and classic theater concessions.", tag: "theme", estimatedCost: "medium" },
      { title: "Black Tie Masquerade", description: "Dramatic masks, velvet drapes, ambient candlelight, and jazz chamber acoustics.", tag: "theme", estimatedCost: "high" },
      { title: "Colorblock Pop Extravaganza", description: "Bold geometric shapes, contrasting primary colors, and photo-ready pop art installations.", tag: "theme", estimatedCost: "low" },
    ],
    menu: [
      { title: "Build-Your-Own Taco & Bao Station", description: "Interactive food stations where guests customize fillings, sauces, and toppings.", tag: "catering", estimatedCost: "medium" },
      { title: "Dessert Flight Tasting", description: "Miniature dessert trios featuring molten chocolate cake, fruit tarts, and panna cotta.", tag: "catering", estimatedCost: "low" },
      { title: "Mocktail & Soda Lab", description: "Custom botanical syrups, fresh garnishes, and craft fizzy mixers with custom name tags.", tag: "catering", estimatedCost: "low" },
      { title: "Wood-Fired Pizza Truck", description: "On-site wood oven producing thin-crust artisan pizzas with gluten-free and vegan options.", tag: "catering", estimatedCost: "medium" },
      { title: "Grand Celebration Centerpiece Cake", description: "Custom multi-tier cake reflecting the honoree's passions with matching cupcakes.", tag: "catering", estimatedCost: "medium" },
    ],
    activities: [
      { title: "Themed Murder Mystery Hunt", description: "Interactive storyline where guests receive character envelopes and unravel clues.", tag: "activity", estimatedCost: "low" },
      { title: "Silent Disco Battle", description: "Multi-channel glowing wireless headsets allowing guests to switch between DJ channels.", tag: "activity", estimatedCost: "medium" },
      { title: "DIY Cocktail / Mocktail Workshop", description: "A mixologist teaches guests 3 signature drink recipes in an engaging session.", tag: "activity", estimatedCost: "medium" },
      { title: "Custom Roast & Toast Open Mic", description: "Structured 20-minute tribute session for friends to share cherished memories.", tag: "activity", estimatedCost: "low" },
      { title: "Custom Pinata Smash", description: "Bespoke handcrafted pinata stuffed with luxury treats, vouchers, and confetti.", tag: "activity", estimatedCost: "low" },
    ],
    decor: [
      { title: "Organic Balloon & Floral Garland", description: "Matte-finish biodegradable balloons woven with fresh greenery framing the photo area.", tag: "decor", estimatedCost: "low" },
      { title: "Illuminated Monogram Marquee", description: "Large vintage lightbulb marquee letters celebrating the honoree's initials or age.", tag: "decor", estimatedCost: "medium" },
      { title: "Festoon Canopy & Draped Ceilings", description: "Warm globe bulbs suspended in criss-cross grid creating an intimate party atmosphere.", tag: "decor", estimatedCost: "low" },
      { title: "Memory Timeline Gallery", description: "Hanging photo wires showcasing childhood through present milestones with handwritten captions.", tag: "decor", estimatedCost: "low" },
      { title: "Reflective Disco Mirror Balls", description: "Clustered mirror spheres reflecting spinning ambient light across the room.", tag: "decor", estimatedCost: "low" },
    ],
    surprises: [
      { title: "Video Montage from Faraway Friends", description: "Curated video compilation of loved ones around the world projected before cake cutting.", tag: "surprise", estimatedCost: "low" },
      { title: "Secret Musical Guest Performance", description: "Surprise acoustic set by a favorite local singer or musician.", tag: "surprise", estimatedCost: "medium" },
      { title: "Confetti Cannon Grand Finale", description: "Safe biodegradable indoor confetti burst timed with the celebratory chorus.", tag: "surprise", estimatedCost: "low" },
      { title: "Personalized Keepsake Comic / Book", description: "A custom illustrated story booklet celebrating the honoree's life adventures.", tag: "surprise", estimatedCost: "medium" },
      { title: "Flashback Dance Medley", description: "Friends surprise the birthday star with a medley dance spanning their favorite eras.", tag: "surprise", estimatedCost: "low" },
    ],
  },
  community: {
    theme: [
      { title: "Neighborhood Harmony Festival", description: "Celebrating local community cultures, artisan makers, and shared civic heritage.", tag: "theme", estimatedCost: "low" },
      { title: "Eco-Conscious Green Fair", description: "Zero-waste principles, upcycled decor, and environmental workshops.", tag: "theme", estimatedCost: "low" },
      { title: "Street Carnival & Makers Mart", description: "Vibrant marketplace stalls, festive bunting flags, and open-air performance buskers.", tag: "theme", estimatedCost: "medium" },
      { title: "Harvest & Community Table", description: "Long communal wooden tables fostering connection across neighbors of all generations.", tag: "theme", estimatedCost: "low" },
      { title: "Open Air Culture & Cinema", description: "Community stage for local talent followed by a family-friendly film screening.", tag: "theme", estimatedCost: "medium" },
    ],
    menu: [
      { title: "Community Potluck & Bake Off", description: "Organized communal feast with designated dietary sections and friendly bake contest.", tag: "catering", estimatedCost: "low" },
      { title: "Local Food Truck Collective", description: "Invited local vendors offering budget-friendly diverse street food options.", tag: "catering", estimatedCost: "low" },
      { title: "Hydration & Fresh Lemonade Stations", description: "Self-serve water refill barrels and chilled mint-infused refreshments.", tag: "catering", estimatedCost: "low" },
      { title: "Live BBQ & Skewer Grills", description: "High-volume outdoor grilling featuring grilled paneer, vegetables, and spiced corn on cob.", tag: "catering", estimatedCost: "medium" },
      { title: "Ice Gola & Kulfi Cart", description: "Traditional shaved ice and milk kulfi stand providing nostalgic treats for all ages.", tag: "catering", estimatedCost: "low" },
    ],
    activities: [
      { title: "All-Ages Relay & Tug-of-War", description: "Fun, friendly team games encouraging multi-generational teamwork and laughter.", tag: "activity", estimatedCost: "low" },
      { title: "Collaborative Community Mural", description: "Large primed canvas where attendees of all ages paint their mark on a lasting artwork.", tag: "activity", estimatedCost: "low" },
      { title: "Local Talent Open Stage", description: "Showcase for neighborhood bands, poetry readings, stand-up comedy, and school choirs.", tag: "activity", estimatedCost: "low" },
      { title: "Book & Plant Swap Table", description: "Residents bring pre-loved books and garden plant cuttings to exchange freely.", tag: "activity", estimatedCost: "low" },
      { title: "Kids Craft & Upcycling Workshop", description: "Guided crafting turning cardboard and fabric scraps into festive paper lanterns.", tag: "activity", estimatedCost: "low" },
    ],
    decor: [
      { title: "Colorful Fabric Pennant Bunting", description: "Sturdy reusable cloth pennants strung across trees, lamp posts, and stalls.", tag: "decor", estimatedCost: "low" },
      { title: "Chalkboard Schedule & Direction Signs", description: "Hand-lettered blackboard easels guiding visitors to stages, restrooms, and food.", tag: "decor", estimatedCost: "low" },
      { title: "Hay Bale & Pallet Seating Clusters", description: "Eco-friendly seating nooks made of stacked wooden pallets and cushioned burlap bales.", tag: "decor", estimatedCost: "low" },
      { title: "Solar-Powered Pathway Lanterns", description: "Sustainable solar lanterns highlighting walkways and gathering plazas after dusk.", tag: "decor", estimatedCost: "low" },
      { title: "Community Photo Mosaic Board", description: "A cork display wall where neighbors pin their favorite neighborhood memory photos.", tag: "decor", estimatedCost: "low" },
    ],
    surprises: [
      { title: "Surprise Brass Band Fanfare", description: "Local marching or brass band steps into the crowd unannounced to open the festival.", tag: "surprise", estimatedCost: "medium" },
      { title: "Community Hero Recognition Award", description: "Unannounced honorary citation and gift presented to a dedicated local volunteer.", tag: "surprise", estimatedCost: "low" },
      { title: "Community Drone Aerial Group Photo", description: "All attendees gather in the field to form a shape for an aerial commemorative photo.", tag: "surprise", estimatedCost: "medium" },
      { title: "Spontaneous Mass Singalong", description: "Band leads the entire crowd in a beloved neighborhood anthem as evening arrives.", tag: "surprise", estimatedCost: "low" },
      { title: "Lantern Lighting Dusk Ceremony", description: "Distributing warm LED paper lanterns for a collective twilight illuminated walk.", tag: "surprise", estimatedCost: "low" },
    ],
  },
};

