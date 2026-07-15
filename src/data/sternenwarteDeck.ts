/* Star Map – curated starter deck (100 questions) + question-system logic.
   All questions without free text, simple match logic (same option = match). */

export type QType = "single_choice" | "this_or_that";
export interface QOption { id: string; label: string; }
export interface Question {
  id: string;
  type: QType;
  emoji: string;
  text: string;
  category: string;
  source: "curated" | "community";
  status: "active" | "pending" | "rejected" | "archived";
  options: QOption[];
}

/* compact builder, option ids follow the deck scheme (this_or_that: __a/__b, single_choice: __0..) */
function q(id: string, type: QType, emoji: string, text: string, category: string, labels: string[]): Question {
  const suff = type === "this_or_that" ? ["a", "b"] : labels.map((_, i) => String(i));
  return { id, type, emoji, text, category, source: "curated", status: "active", options: labels.map((label, i) => ({ id: `${id}__${suff[i]}`, label })) };
}

export const DECK: Question[] = [
  q("q_morning_start", "single_choice", "☕", "How do you like to start your day?", "alltag", ["Coffee, black", "Tea & quiet", "Exercise first", "Sleep as long as I can"]),
  q("q_lark_owl", "this_or_that", "🦉", "Early bird or night owl?", "alltag", ["Lark – up early", "Owl – active at night"]),
  q("q_commute", "single_choice", "🚲", "Your favorite commute?", "alltag", ["On foot / bike", "Car", "Public transit", "Home office, no commute"]),
  q("q_break", "single_choice", "😌", "How do you like to take a break?", "alltag", ["Short walk", "Snack & chat", "Eyes closed, breathe", "Quickly get something done"]),
  q("q_planner", "this_or_that", "🗓️", "What describes you better?", "alltag", ["Everything planned out", "Spontaneous, into the unknown"]),
  q("q_weekend", "single_choice", "🌳", "Perfect weekend?", "alltag", ["Out in nature", "Couch & series", "Meeting friends", "Projects & crafting"]),
  q("q_tidy", "this_or_that", "🧹", "Your desk is more…", "alltag", ["Tidy & minimal", "Creative chaos"]),
  q("q_lunch", "single_choice", "🍱", "Lunch break means…", "alltag", ["Something quick at my desk", "Out for a proper meal", "Meal prep from home", "I often skip it"]),
  q("q_call_text", "this_or_that", "📱", "Prefer to call or text?", "alltag", ["Call", "Text"]),
  q("q_evening", "single_choice", "🌙", "How does your evening wind down?", "alltag", ["Sport / movement", "Series / film", "Book / quiet", "Get something else done"]),
  q("q_coffee_kind", "single_choice", "☕", "Your coffee, preferably…", "essen", ["Black", "With milk", "Specialty (latte & co.)", "No coffee, thanks"]),
  q("q_sweet_savory", "this_or_that", "🍫", "Do you snack sweet or savory?", "essen", ["Sweet", "Savory"]),
  q("q_pizza_topping", "single_choice", "🍕", "Pizza favorite?", "essen", ["Plain margherita", "Lots of veggies", "Plenty of meat", "As long as there's lots of cheese"]),
  q("q_breakfast", "single_choice", "🥐", "Breakfast type?", "essen", ["Sweet (cereal, pastries)", "Savory (eggs, bread)", "Just coffee", "Breakfast? Overrated"]),
  q("q_cook_order", "this_or_that", "🍳", "Rather cook yourself or order in?", "essen", ["Cook myself", "Order in"]),
  q("q_drink", "single_choice", "🥤", "Your drink at work?", "essen", ["Plain water", "Coffee non-stop", "Tea", "Soft drink / energy"]),
  q("q_spicy", "this_or_that", "🌶️", "How spicy do you like it?", "essen", ["The spicier the better", "Rather mild"]),
  q("q_cuisine", "single_choice", "🍜", "Favorite cuisine?", "essen", ["Italian", "Asian", "Home cooking", "A bit of everything"]),
  q("q_snack", "single_choice", "🍿", "Which snack always works?", "essen", ["Something salty", "Something sweet", "Fruit", "Nuts / healthy"]),
  q("q_water_sparkling", "this_or_that", "💧", "Water sparkling or still?", "essen", ["Sparkling", "Still"]),
  q("q_beach_mountain", "this_or_that", "🏔️", "Holiday: mountains or sea?", "reisen", ["Mountains", "Sea"]),
  q("q_travel_style", "single_choice", "🧳", "Your travel style?", "reisen", ["All planned out", "Spontaneous, go with the flow", "Package & relaxed", "Adventure & backpacking"]),
  q("q_vacation_type", "single_choice", "🌴", "Dream island or…?", "reisen", ["Beach & doing nothing", "City trip", "Nature & hiking", "Road trip"]),
  q("q_city_country", "this_or_that", "🏙️", "Rather city or countryside?", "reisen", ["City", "Countryside"]),
  q("q_climate", "single_choice", "🌡️", "Your feel-good climate?", "reisen", ["Warm & sunny", "Cool & fresh", "Snow & winter", "Doesn't matter, as long as it's dry"]),
  q("q_plan_spontan_trip", "this_or_that", "✈️", "Travel: tick off the bucket list or drift?", "reisen", ["Tick off the list", "Just drift"]),
  q("q_souvenir", "single_choice", "🎁", "What do you bring back from a holiday?", "reisen", ["Magnets / trinkets", "Local snacks", "Photos, nothing else", "A good story"]),
  q("q_accommodation", "single_choice", "🏨", "Prefer to stay in…", "reisen", ["Hotel with service", "Cozy Airbnb", "Hostel & meet people", "Tent / camping"]),
  q("q_window_aisle", "this_or_that", "🪟", "On the plane: window or aisle?", "reisen", ["Window seat", "Aisle seat"]),
  q("q_hobby_type", "single_choice", "🎨", "What helps you switch off?", "hobby", ["Sport & movement", "Creative (painting, music…)", "Gaming", "Reading / podcasts"]),
  q("q_book_movie", "this_or_that", "📚", "Rather book or film?", "hobby", ["Book", "Film"]),
  q("q_music_work", "single_choice", "🎧", "While working you listen to…", "hobby", ["Music", "Podcasts in the background", "Silence, please", "Lo-fi / ambient"]),
  q("q_gaming", "single_choice", "🎮", "Gaming – your thing?", "hobby", ["Totally, all the time", "Now and then", "Only mobile games", "Not at all"]),
  q("q_team_solo_sport", "this_or_that", "🏃", "Sport rather in a team or solo?", "hobby", ["Team", "Solo"]),
  q("q_creative_outlet", "single_choice", "🖌️", "Your creative outlet?", "hobby", ["Music", "Drawing / design", "Writing", "Cooking / baking"]),
  q("q_weekend_active", "single_choice", "⚡", "On the weekend rather…", "hobby", ["Active & out and about", "Lazy & relaxed", "A mix of both", "Depends entirely"]),
  q("q_indoor_outdoor", "this_or_that", "🌲", "Indoor or outdoor type?", "hobby", ["Outdoor", "Indoor"]),
  q("q_music_genre", "single_choice", "🎵", "What's playing for you?", "hobby", ["Pop / charts", "Rock / indie", "Hip-hop / R&B", "Electro / house"]),
  q("q_show_binge", "single_choice", "📺", "When binge-watching…", "hobby", ["All in one go", "One episode a night", "Just on in the background", "I barely watch series"]),
  q("q_meeting_async", "this_or_that", "💬", "Rather a meeting or sort it async?", "arbeit", ["Quick meeting", "Async by text"]),
  q("q_focus_time", "single_choice", "🎯", "When are you most productive?", "arbeit", ["Early morning", "Late morning", "Afternoon", "Late evening"]),
  q("q_office_remote", "this_or_that", "🏠", "Rather office or remote?", "arbeit", ["Office", "Remote"]),
  q("q_workspace", "single_choice", "🖥️", "Your ideal workspace?", "arbeit", ["Quiet office", "Café background noise", "At home", "Changing, depending on the day"]),
  q("q_notes", "single_choice", "📝", "How do you keep track of things?", "arbeit", ["Digital (app)", "Classic on paper", "In my head", "Voice notes"]),
  q("q_early_deadline", "this_or_that", "⏰", "Deadlines – done early or last minute?", "arbeit", ["Rather done early", "Adrenaline at the end"]),
  q("q_brainstorm", "single_choice", "💡", "Your best ideas come to you…", "arbeit", ["In the shower", "While walking", "Talking with others", "In the middle of the night"]),
  q("q_detail_big", "this_or_that", "🔍", "More a detail person or big picture?", "arbeit", ["Details", "Big picture"]),
  q("q_recharge_work", "single_choice", "🔋", "How do you recharge during the workday?", "arbeit", ["Short break outside", "Chat with colleagues", "Alone & quiet", "Favorite snack"]),
  q("q_email_chat", "this_or_that", "📧", "Quick question – email or chat?", "arbeit", ["Email", "Chat"]),
  q("q_intro_extro", "this_or_that", "🦋", "More introverted or extroverted?", "persoenlichkeit", ["Introverted", "Extroverted"]),
  q("q_recharge", "single_choice", "🔋", "How do you recharge your batteries?", "persoenlichkeit", ["Time for myself", "Around people", "Out in nature", "With a hobby"]),
  q("q_optimist", "this_or_that", "🌈", "Glass half full or half empty?", "persoenlichkeit", ["Half full", "Half empty"]),
  q("q_decision", "single_choice", "🤔", "You make decisions…", "persoenlichkeit", ["Quickly, from the gut", "After careful weighing", "Ask others first", "I like to put them off"]),
  q("q_routine_variety", "this_or_that", "🔄", "Routine or variety?", "persoenlichkeit", ["Routine gives me stability", "I need variety"]),
  q("q_stress_relief", "single_choice", "🧘", "Under stress, what helps you?", "persoenlichkeit", ["Movement", "Music", "Talking to someone", "Quiet & retreat"]),
  q("q_risk", "this_or_that", "🎲", "More security or risk?", "persoenlichkeit", ["Play it safe", "Risk appeals to me"]),
  q("q_motivation", "single_choice", "🚀", "What drives you?", "persoenlichkeit", ["Reaching goals", "Learning new things", "Helping others", "Recognition"]),
  q("q_morning_person", "this_or_that", "😀", "Approachable before the first coffee?", "persoenlichkeit", ["Sure, always cheerful", "Definitely not"]),
  q("q_humor", "single_choice", "😂", "Your humor is more…", "persoenlichkeit", ["Dry / sarcastic", "Silly / playful", "Wordplay", "I laugh at everything"]),
  q("q_movie_genre", "single_choice", "🎬", "Favorite film genre?", "popkultur", ["Action / thriller", "Comedy", "Drama", "Sci-fi / fantasy"]),
  q("q_marvel_dc", "this_or_that", "🦸", "Marvel or DC?", "popkultur", ["Marvel", "DC"]),
  q("q_evening_watch", "single_choice", "🍿", "After-work viewing?", "popkultur", ["Series", "Film", "YouTube / streams", "Rather no screen"]),
  q("q_sweet_movie", "this_or_that", "🎞️", "At the cinema: popcorn or nachos?", "popkultur", ["Popcorn", "Nachos"]),
  q("q_podcast_topic", "single_choice", "🎙️", "What do you listen to podcasts about?", "popkultur", ["True crime", "Comedy / talk", "Knowledge / docs", "I don't listen to podcasts"]),
  q("q_throwback", "this_or_that", "📼", "Rather classics or new releases?", "popkultur", ["Timeless classics", "Fresh & new"]),
  q("q_game_night", "single_choice", "🎲", "Game night – what do you play?", "popkultur", ["Board games", "Card games", "Video games", "Not really a gamer"]),
  q("q_read_genre", "single_choice", "📖", "When you read, it's…", "popkultur", ["Novels / fiction", "Non-fiction", "Crime / thriller", "Comics / graphic novels"]),
  q("q_cat_dog", "this_or_that", "🐾", "Team dog or team cat?", "tiere", ["Dog", "Cat"]),
  q("q_pet", "single_choice", "🐕", "Do you have / would you like…", "tiere", ["Dog", "Cat", "Small pet / other", "Rather no pets"]),
  q("q_nature", "single_choice", "🏞️", "Where do you relax in nature?", "tiere", ["Forest", "Mountains", "By the water", "Own garden / balcony"]),
  q("q_summer_winter", "this_or_that", "❄️", "Rather summer or winter?", "tiere", ["Summer", "Winter"]),
  q("q_plants", "single_choice", "🪴", "Your green thumb?", "tiere", ["A full jungle at home", "One or two plants", "Plants die on me", "No plants"]),
  q("q_rain_sun", "this_or_that", "🌦️", "Which weather makes you happy?", "tiere", ["Pure sunshine", "Cozy rain"]),
  q("q_animal_spirit", "single_choice", "🦊", "Which animal would you most be?", "tiere", ["Dog – loyal & social", "Cat – independent", "Owl – nocturnal", "Dolphin – playful"]),
  q("q_superpower", "single_choice", "🦸", "Which superpower would you want?", "fun", ["Flying", "Teleporting", "Reading minds", "Stopping time"]),
  q("q_lottery", "single_choice", "💰", "Lottery win – what first?", "fun", ["Travel", "House / flat", "Save & invest", "Share generously"]),
  q("q_time_travel", "this_or_that", "⏳", "Time travel: past or future?", "fun", ["Past", "Future"]),
  q("q_desert_island", "single_choice", "🏝️", "One thing to take to the island?", "fun", ["Favorite book", "Music", "Best friend", "Endless snack supply"]),
  q("q_talent", "single_choice", "✨", "Which talent would you want?", "fun", ["Play an instrument", "Several languages", "Drawing / painting", "Being a top chef"]),
  q("q_morning_night_owl_fun", "this_or_that", "🌗", "Do you prefer sunrise or sunset?", "fun", ["Sunrise", "Sunset"]),
  q("q_dream_dinner", "single_choice", "🍽️", "Who would you love to have dinner with?", "fun", ["Celebrity / idol", "Historical figure", "Future me", "My family is enough"]),
  q("q_emoji", "single_choice", "😄", "Your most-used emoji?", "fun", ["😂", "❤️", "👍", "🙏"]),
  q("q_sweet_tooth_fun", "this_or_that", "🍦", "Ice cream or cake?", "fun", ["Ice cream", "Cake"]),
  q("q_collect", "single_choice", "🗃️", "Do you collect anything?", "fun", ["Books", "Sneakers / clothes", "Keepsakes", "I don't collect anything"]),
  q("q_shower_time", "this_or_that", "🚿", "Shower in the morning or evening?", "lifestyle", ["Morning", "Evening"]),
  q("q_phone_first", "single_choice", "📲", "First thing in the morning?", "lifestyle", ["Check my phone", "Drink water", "Stretch / move", "Hit snooze"]),
  q("q_text_emoji", "this_or_that", "💬", "Do you text with lots of emojis?", "lifestyle", ["Sure, always", "Rather sparingly"]),
  q("q_organize", "single_choice", "📋", "How do you organize your life?", "lifestyle", ["Calendar app", "To-do lists", "All in my head", "I improvise"]),
  q("q_save_spend", "this_or_that", "💸", "More a saver or a spender?", "lifestyle", ["Saving", "Enjoy & spend"]),
  q("q_shopping", "single_choice", "🛍️", "How do you like to shop?", "lifestyle", ["Online", "Browsing in store", "Targeted & quick", "I dislike shopping"]),
  q("q_book_ebook", "this_or_that", "📕", "Real book or e-reader?", "lifestyle", ["Paper", "Digital"]),
  q("q_weekend_morning", "single_choice", "🛌", "On weekends you get up…", "lifestyle", ["Same as weekdays", "A bit later", "Sleep in till noon", "Depends"]),
  q("q_minimal_maximal", "this_or_that", "🏠", "Home style: minimalist or cozily full?", "lifestyle", ["Minimalist", "Cozily full"]),
  q("q_celebrate", "single_choice", "🎉", "How do you celebrate wins?", "lifestyle", ["With friends / team", "Treat myself", "Quietly for myself", "Straight on to the next goal"]),
  q("q_season", "single_choice", "🍂", "Your favorite season?", "saison", ["Spring", "Summer", "Autumn", "Winter"]),
  q("q_christmas_summer", "this_or_that", "🎄", "What are you more excited about?", "saison", ["Cozy winter time", "Long summer days"]),
  q("q_holiday_style", "single_choice", "🎁", "You spend the holidays…", "saison", ["Big with family", "Small & cozy", "Active / traveling", "As normal as possible"]),
  q("q_snow_sun_holiday", "this_or_that", "⛄", "Winter holiday: snow or soak up sun?", "saison", ["Snow & mountains", "Sun & warmth"]),
  q("q_new_year", "single_choice", "🎆", "New Year's resolutions?", "saison", ["Set them & follow through", "Set them, break them", "I don't make any", "Rather small habits"]),
  q("q_summer_activity", "single_choice", "☀️", "Perfect summer day?", "saison", ["Swimming / water", "Barbecue with people", "Shade & a book", "Sport outdoors"]),
];

export const BY_ID: Record<string, Question> = Object.fromEntries(DECK.map((qq) => [qq.id, qq]));

/* ───────── Colleagues (mock, later stands in for real, shared answers) ───────── */
export interface Mate { id: string; name: string; initials: string; color: string; }
export const MATES: Mate[] = [
  { id: "lena", name: "Lena", initials: "LB", color: "var(--disc-s)" },
  { id: "theo", name: "Theo", initials: "TV", color: "var(--disc-d)" },
  { id: "mara", name: "Mara", initials: "MI", color: "var(--disc-i)" },
  { id: "cem", name: "Cem", initials: "CK", color: "var(--disc-c)" },
  { id: "ada", name: "Ada", initials: "AR", color: "var(--disc-i)" },
  { id: "jon", name: "Jon", initials: "JP", color: "var(--disc-d)" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* deterministic answer "twin" per colleague & question (instead of 600 hand-maintained answers) */
export function colleagueAnswer(mateId: string, qq: Question): string {
  return qq.options[hash(mateId + "|" + qq.id) % qq.options.length].id;
}

/* which colleagues chose the same answer as you */
export function matchesFor(qq: Question, optionId: string): Mate[] {
  return MATES.filter((m) => colleagueAnswer(m.id, qq) === optionId);
}

/* rare match: only 1 of 6 shares your answer */
export function isRare(qq: Question, optionId: string): boolean {
  return matchesFor(qq, optionId).length === 1;
}

/* Daily: deterministic from the curated pool, rotates per date */
export function getDaily(dateStr: string): Question {
  return DECK[hash(dateStr) % DECK.length];
}
