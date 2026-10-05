import { useEffect, useState } from "react";
import { demoAuth, demoPayments, demoStorage } from "./demoServices";
import {
  Search,
  Plus,
  MapPin,
  Clock3,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  BookOpen,
  Package,
  Menu,
  X,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Bell,
  Camera,
  Shirt,
  Sparkles,
  Wrench,
  Palette,
  LayoutGrid,
} from "lucide-react";
import Extras from "./Extras";
import { Photo, Portrait } from "./photos";
import {
  ConditionEvidence,
  ListingPhotoPicker,
  type ConditionPhoto,
} from "./imageUpload";

type Audience = "all" | "women";
type Mode = "free" | "paid";
type Status =
  | "requested"
  | "awaiting"
  | "confirmed"
  | "picked"
  | "returning"
  | "completed"
  | "cancelled";
type User = {
  id: string;
  name: string;
  initials: string;
  color: string;
  year: string;
  zone: string;
  member: boolean;
  loans: number;
  review: string;
  bio: string;
};
type Listing = {
  id: string;
  owner: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
  condition: string;
  accessories: string;
  mode: Mode;
  rate: number;
  zone: string;
  point: string;
  meetupType?: string;
  photos?: string[];
  windows: string;
  maxDays: number;
  start: string;
  end: string;
  audience: Audience;
  lateFree: boolean;
  created?: boolean;
};
type Request = {
  id: string;
  borrower: string;
  title: string;
  category: string;
  needed: string;
  hours: number;
  budget: number;
  freeOnly: boolean;
  zone: string;
  audience: Audience;
  offers: { listingId: string; lender: string }[];
  fulfilled?: boolean;
};
type Agreement = {
  item: string;
  accessories: string;
  condition: string;
  pickup: string;
  returnAt: string;
  location: string;
  total: number;
  rate: number;
  mode: Mode;
  lateFree: boolean;
};
type Booking = {
  id: string;
  listingId: string;
  requestId?: string;
  borrower: string;
  lender: string;
  status: Status;
  agreement: Agreement;
  createdAt: string;
  expiresAt: string;
  lenderPickup: boolean;
  borrowerPickup: boolean;
  returnAttempt?: string;
  conditionPhotos?: ConditionPhoto[];
  overdueDispute?: boolean;
  issue?: { reason: string; description: string };
  extension?: { until: string; status: "pending" | "declined" };
  paid: boolean;
};
type Data = {
  listings: Listing[];
  requests: Request[];
  bookings: Booking[];
  clock: string;
};
const users: User[] = [
  {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    color: "#ead4c2",
    year: "Junior · Industrial Design",
    zone: "South Quad",
    member: true,
    loans: 12,
    bio: "Usually making something in the studio. Happy to share the things I only use once in a while.",
    review: "“Easy pickup and everything was exactly as described.”",
  },
  {
    id: "amina",
    name: "Amina Patel",
    initials: "AP",
    color: "#d4e2da",
    year: "Senior · Media Studies",
    zone: "Main Quad",
    member: true,
    loans: 9,
    bio: "Baking between classes and sharing my closet before the next formal. Union pickup works best for me.",
    review: "“Communicative and flexible with timing.”",
  },
  {
    id: "jordan",
    name: "Jordan Rivera",
    initials: "JR",
    color: "#ddd8f0",
    year: "Sophomore · Engineering",
    zone: "North Quad",
    member: false,
    loans: 5,
    bio: "Photos, weekend tennis, and the occasional club event. Ask me about portrait sessions around the Quad.",
    review: "“Fast response, smooth return.”",
  },
  {
    id: "leo",
    name: "Leo Brooks",
    initials: "LB",
    color: "#d8e3ed",
    year: "Graduate · Architecture",
    zone: "Campustown",
    member: true,
    loans: 17,
    bio: "Architecture grad student. I keep a camera kit and a few apartment essentials around; happy to walk you through setup.",
    review: "“Very helpful setup tips.”",
  },
];
const zones = [
  "Main Quad",
  "South Quad",
  "North Quad",
  "Campustown",
  "Library",
];
const categories = [
  "Calculator",
  "Camera & tripod",
  "Chargers",
  "Cleaning",
  "Art supplies",
  "Event gear",
  "Fashion",
  "Tools",
  "Sports",
  "Tech",
  "Photography",
  "Apartment",
  "Other",
];
const featuredListingIds = ["l3", "l14", "l8", "l16", "l6", "l4", "l1", "l15"];
const featuredRank = (id: string) => {
  const rank = featuredListingIds.indexOf(id);
  return rank < 0 ? featuredListingIds.length : rank;
};

const add = (base: Date, days: number, hours = 0) =>
  new Date(base.getTime() + days * 86400000 + hours * 3600000);
const isoLocal = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const day = (d: Date) => isoLocal(d).slice(0, 10);
const money = (n: number) => `$${n.toFixed(2)}`;
const fmt = (s: string) =>
  new Date(s).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const id = () => Math.random().toString(36).slice(2, 10);
const who = (u: string) => users.find((x) => x.id === u)!;
function initial(): Data {
  const now = new Date();
  const start = day(add(now, -1)),
    end = day(add(now, 90));
  const base = [
    [
      "maya",
      "TI-84 Plus CE calculator",
      "Calculator",
      "🧮",
      "Exam-ready calculator with fresh batteries.",
      "Great",
      "Protective case, charging cable",
      "free",
      0,
      "South Quad",
      "Illini Union main entrance",
      7,
      "all",
      false,
    ],
    [
      "amina",
      "Manfrotto compact tripod",
      "Camera & tripod",
      "📷",
      "Lightweight tripod for video shoots and portraits.",
      "Excellent",
      "Quick-release plate, carrying bag",
      "free",
      0,
      "Main Quad",
      "Main Library front steps",
      4,
      "women",
      false,
    ],
    [
      "leo",
      "Sony mirrorless camera kit",
      "Camera & tripod",
      "📸",
      "Creator-friendly camera for class projects.",
      "Great",
      "18–55mm lens, battery, SD card",
      "paid",
      12,
      "Campustown",
      "Illini Union main entrance",
      3,
      "all",
      false,
    ],
    [
      "leo",
      "Canon PowerShot compact digicam",
      "Camera & tripod",
      "📷",
      "Pocket digital camera for parties, birthdays, and nights out.",
      "Great",
      "Battery, charger, SD card",
      "paid",
      8,
      "Campustown",
      "Illini Union main entrance",
      2,
      "all",
      false,
    ],
    [
      "jordan",
      "USB-C laptop charger 65W",
      "Chargers",
      "🔌",
      "Universal 65W charger for most USB-C laptops.",
      "Good",
      "USB-C cable",
      "free",
      0,
      "North Quad",
      "Grainger Library entrance",
      2,
      "all",
      false,
    ],
    [
      "maya",
      "Bissell compact vacuum",
      "Cleaning",
      "🧹",
      "Quick cleanups for dorms and apartments.",
      "Good",
      "Crevice tool, brush attachment",
      "paid",
      5,
      "South Quad",
      "Ikenberry Commons lobby",
      2,
      "all",
      false,
    ],
    [
      "amina",
      "Watercolor starter set",
      "Art supplies",
      "🎨",
      "Everything needed for a weekend painting session.",
      "Great",
      "12 paints, 4 brushes, palette",
      "free",
      0,
      "Main Quad",
      "Illini Union main entrance",
      5,
      "women",
      false,
    ],
    [
      "leo",
      "Portable projector",
      "Event gear",
      "📽️",
      "Bright projector for presentations and movie nights.",
      "Excellent",
      "HDMI cable, power cord, remote",
      "paid",
      10,
      "Campustown",
      "Illini Union main entrance",
      3,
      "all",
      false,
    ],
    [
      "jordan",
      "Scientific calculator",
      "Calculator",
      "🧮",
      "Reliable scientific calculator for homework and exams.",
      "Good",
      "Hard cover",
      "free",
      0,
      "North Quad",
      "Grainger Library entrance",
      7,
      "all",
      false,
    ],
    [
      "maya",
      "Ring light with stand",
      "Event gear",
      "💡",
      "Adjustable light for photos or club videos.",
      "Great",
      "Phone clip, stand, power adapter",
      "paid",
      4,
      "South Quad",
      "Ikenberry Commons lobby",
      3,
      "all",
      false,
    ],
    [
      "amina",
      "USB-C power bank",
      "Chargers",
      "🔋",
      "20,000 mAh power bank for long campus days.",
      "Great",
      "USB-C cable",
      "free",
      0,
      "Main Quad",
      "Main Library front steps",
      2,
      "women",
      true,
    ],
    [
      "leo",
      "Drafting tool kit",
      "Art supplies",
      "📐",
      "For studio projects and architecture sketches.",
      "Good",
      "Rulers, compass, cutting mat",
      "free",
      0,
      "Campustown",
      "Illini Union main entrance",
      5,
      "all",
      false,
    ],
    [
      "jordan",
      "Folding event table",
      "Event gear",
      "🪑",
      "Compact folding table for club events.",
      "Good",
      "Carrying handle",
      "paid",
      6,
      "North Quad",
      "Grainger Library entrance",
      2,
      "all",
      false,
    ],
    [
      "amina",
      "Black formal dress",
      "Fashion",
      "👗",
      "Classic black dress for formals, interviews, and events. Size M.",
      "Excellent",
      "Garment bag",
      "free",
      0,
      "Main Quad",
      "Illini Union main entrance",
      3,
      "all",
      false,
    ],
    [
      "maya",
      "Sewing machine",
      "Fashion",
      "🧵",
      "Compact machine for quick alterations and costume projects.",
      "Great",
      "Pedal, power cord, starter thread",
      "paid",
      5,
      "South Quad",
      "Ikenberry Commons lobby",
      4,
      "all",
      false,
    ],
    [
      "leo",
      "Cordless power drill",
      "Tools",
      "🛠️",
      "Handy for apartment setup and small builds.",
      "Good",
      "Two batteries, charger, bit set",
      "free",
      0,
      "Campustown",
      "Illini Union main entrance",
      2,
      "all",
      false,
    ],
    [
      "jordan",
      "Tennis racket pair",
      "Sports",
      "🎾",
      "Two rackets for a casual game on campus.",
      "Good",
      "Two cases",
      "free",
      0,
      "North Quad",
      "Grainger Library entrance",
      2,
      "all",
      false,
    ],
  ] as const;
  const listings: Listing[] = base.map((b, i) => ({
    id: `l${i + 1}`,
    owner: b[0],
    title: b[1],
    category: b[2],
    emoji: b[3],
    description: b[4],
    condition: b[5],
    accessories: b[6],
    mode: b[7] as Mode,
    rate: b[8],
    zone: b[9],
    point: b[10],
    maxDays: b[11],
    audience: b[12] as Audience,
    lateFree: b[13],
    windows: "10:00 AM–7:00 PM",
    start,
    end,
  }));
  return {
    listings,
    requests: [
      {
        id: "rseed",
        borrower: "maya",
        title: "A handheld fabric steamer",
        category: "Cleaning",
        needed: isoLocal(add(now, 5)),
        hours: 48,
        budget: 8,
        freeOnly: false,
        zone: "South Quad",
        audience: "all",
        offers: [],
      },
    ],
    bookings: [],
    clock: isoLocal(now),
  };
}
const suggested = (clock: Date, days = 1) => {
  const d = add(clock, days);
  d.setHours(11, 0, 0, 0);
  return isoLocal(d);
};
const key = "boro-demo-v3";
function load(): Data {
  return demoStorage.read<Data>(key, initial);
}
const audienceName = (a: Audience) =>
  a === "all" ? "All UIUC" : "UIUC Women Borrowing";
const duration = (a: string, b: string) =>
  Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
const overlap = (a: string, b: string, c: string, d: string) =>
  new Date(a) < new Date(d) && new Date(c) < new Date(b);
function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        background: user.color,
        width: size,
        height: size,
        fontSize: size * 0.31,
      }}
    >
      <Portrait id={user.id} name={user.name} />
    </span>
  );
}
function App() {
  const [data, setData] = useState<Data>(load);
  const [account, setAccount] = useState("maya");
  const [community, setCommunity] = useState<Audience>("all");
  const [page, setPage] = useState("browse");
  const [marketView, setMarketView] = useState<"rent" | "buy" | "both">("both");
  const [campusLevel, setCampusLevel] = useState<"directory" | "uiuc">("uiuc");
  const [modal, setModal] = useState<
    | "listing"
    | "request"
    | "createListing"
    | "createRequest"
    | "book"
    | "profile"
    | "issue"
    | null
  >(null);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [mode, setMode] = useState("Any price");
  const [zone, setZone] = useState("Any zone");
  const [timing, setTiming] = useState(false);
  const [sortBy, setSortBy] = useState<
    "recommended" | "price-low" | "price-high"
  >("recommended");
  const [loanTab, setLoanTab] = useState<"borrowing" | "lending">("borrowing");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [listMenu, setListMenu] = useState(false);
  const [extraCreate, setExtraCreate] = useState<
    "" | "sale" | "service" | "lease"
  >("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [clockOpen, setClockOpen] = useState(false);
  const [clockDraft, setClockDraft] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const me = who(account);
  const now = new Date(data.clock);
  useEffect(() => {
    demoStorage.write(key, data);
  }, [data]);
  useEffect(() => {
    const warn = () =>
      notify(
        "Browser storage is full. Remove some uploaded photos before refreshing.",
      );
    window.addEventListener("boro:storage-full", warn);
    return () => window.removeEventListener("boro:storage-full", warn);
  }, []);
  useEffect(() => {
    if (!me.member && community === "women") setCommunity("all");
  }, [account, community, me.member]);
  useEffect(() => {
    const expired = data.bookings.some(
      (b) =>
        ["requested", "awaiting"].includes(b.status) &&
        new Date(b.expiresAt) <= now,
    );
    if (expired)
      setData((d) => ({
        ...d,
        bookings: d.bookings.map((b) =>
          ["requested", "awaiting"].includes(b.status) &&
          new Date(b.expiresAt) <= new Date(d.clock)
            ? { ...b, status: "cancelled" as Status }
            : b,
        ),
      }));
  }, [data.clock, data.bookings]);
  const resetDemo = () => {
    setData(initial());
    window.dispatchEvent(new Event("boro:reset"));
    setAccount("maya");
    setCommunity("all");
    setPage("browse");
    setCampusLevel("uiuc");
    setSearch("");
    setCategory("All categories");
    setMode("Any price");
    setZone("Any zone");
    setTiming(false);
    setSortBy("recommended");
    setMarketView("both");
    setLoanTab("borrowing");
    setExtraCreate("");
    setClockOpen(false);
    close();
    notify("Demo reset");
  };
  const update = (fn: (d: Data) => Data) => setData((d) => fn(d));
  const notify = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 4000);
  };
  const open = (m: typeof modal, idValue = "") => {
    setModal(m);
    setSelected(idValue);
    setError("");
    setForm({});
    setDraftPhotos([]);
    setSelectedPhoto(0);
  };
  const close = () => {
    setModal(null);
    setError("");
  };
  const visible = (a: Audience) => a === "all" || me.member;
  const blockers = (listingId: string, except?: string) =>
    data.bookings.filter(
      (b) =>
        b.listingId === listingId &&
        b.id !== except &&
        ["requested", "awaiting", "confirmed", "picked", "returning"].includes(
          b.status,
        ),
    );
  const availableToday = (l: Listing) => {
    if (day(now) < l.start || day(now) > l.end) return false;
    const [wEnd] = ["19:00"];
    if (Number(isoLocal(now).slice(11, 13)) >= Number(wEnd.slice(0, 2)))
      return false;
    return !blockers(l.id).some((b) =>
      overlap(
        data.clock,
        isoLocal(add(now, 0, 4)),
        b.agreement.pickup,
        b.agreement.returnAt,
      ),
    );
  };
  const listing = data.listings.find((l) => l.id === selected);
  const request = data.requests.find((r) => r.id === selected);
  const selectedUser = users.find((u) => u.id === selected);
  const list = data.listings
    .filter(
      (l) =>
        visible(l.audience) &&
        (community === "all" ? l.audience === "all" : l.audience === "women") &&
        (!search ||
          `${l.title} ${l.description} ${l.category}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (category === "All categories" || l.category === category) &&
        (mode === "Any price" ||
          (mode === "Free loans"
            ? l.mode === "free"
            : mode === "Paid rentals"
              ? l.mode === "paid"
              : false)) &&
        (zone === "Any zone" || l.zone === zone) &&
        (!timing || availableToday(l)),
    )
    .sort((a, b) =>
      sortBy === "price-low"
        ? a.rate - b.rate
        : sortBy === "price-high"
          ? b.rate - a.rate
          : featuredRank(a.id) - featuredRank(b.id),
    );
  const activeRequests = data.requests.filter(
    (r) =>
      visible(r.audience) &&
      (community === "all" ? r.audience === "all" : r.audience === "women") &&
      !r.fulfilled &&
      new Date(r.needed) > now,
  );
  const mine = data.bookings
    .filter((b) =>
      loanTab === "borrowing" ? b.borrower === account : b.lender === account,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const late = (b: Booking) => {
    const end = new Date(b.agreement.returnAt).getTime(),
      stop = new Date(b.returnAttempt || data.clock).getTime();
    const excess = stop - end - 2 * 3600000;
    if (excess <= 0) return { periods: 0, fee: 0 };
    const periods = Math.ceil(excess / 86400000);
    return {
      periods,
      fee:
        b.agreement.mode === "paid"
          ? Math.min(periods, 3) * b.agreement.rate
          : b.agreement.lateFree
            ? Math.min(periods, 3) * 2
            : 0,
    };
  };
  const createListing = () => {
    const title = form.title?.trim(),
      description = form.description?.trim();
    if (
      !title ||
      !description ||
      !form.category ||
      !form.zone ||
      !form.point ||
      !form.start ||
      !form.end
    ) {
      setError(
        "Complete the item, description, category, pickup, and availability fields.",
      );
      return;
    }
    if (form.end < form.start) {
      setError("Availability end must be after start.");
      return;
    }
    if ((form.audience || community) === "women" && !me.member) {
      setError("This account is not a group member.");
      return;
    }
    const rate = Number(form.rate || 0);
    if (form.mode === "paid" && rate <= 0) {
      setError("Enter a daily rental rate.");
      return;
    }
    const l: Listing = {
      id: id(),
      owner: account,
      title,
      category: form.category,
      emoji:
        (
          {
            Calculator: "🧮",
            "Camera & tripod": "📷",
            Chargers: "🔌",
            Cleaning: "🧹",
            "Art supplies": "🎨",
            "Event gear": "📽️",
          } as Record<string, string>
        )[form.category] || "📦",
      description,
      condition: form.condition || "Good",
      accessories: form.accessories || "None",
      mode: form.mode === "paid" ? "paid" : "free",
      rate: form.mode === "paid" ? rate : 0,
      zone: form.zone,
      point: form.point,
      photos: draftPhotos,
      meetupType: form.meetupType || "campus",
      windows: form.windows || "10:00 AM–7:00 PM",
      maxDays: Math.max(1, Number(form.maxDays || 3)),
      start: form.start,
      end: form.end,
      audience: (form.audience || community) === "women" ? "women" : "all",
      lateFree: form.lateFree === "yes",
      created: true,
    };
    update((d) => ({ ...d, listings: [l, ...d.listings] }));
    close();
    notify("Listing published");
    setPage("browse");
    setCommunity(l.audience);
  };
  const createRequest = () => {
    if (
      !form.title?.trim() ||
      !form.category ||
      !form.needed ||
      !form.hours ||
      !form.zone
    ) {
      setError("Complete the item, category, deadline, duration, and zone.");
      return;
    }
    if (new Date(form.needed) <= now) {
      setError("Needed-by time must be in the future.");
      return;
    }
    if (Number(form.hours) <= 0 || Number(form.budget || 0) < 0) {
      setError("Enter a positive duration and a nonnegative budget.");
      return;
    }
    if ((form.audience || community) === "women" && !me.member) {
      setError("This account is not a group member.");
      return;
    }
    const r: Request = {
      id: id(),
      borrower: account,
      title: form.title.trim(),
      category: form.category,
      needed: form.needed,
      hours: Number(form.hours),
      budget: Number(form.budget || 0),
      freeOnly: form.freeOnly === "yes",
      zone: form.zone,
      audience: (form.audience || community) === "women" ? "women" : "all",
      offers: [],
    };
    update((d) => ({ ...d, requests: [r, ...d.requests] }));
    close();
    notify("Request posted");
    setPage("requests");
    setCommunity(r.audience);
  };
  const offer = (requestId: string, listingId: string) => {
    const r = data.requests.find((x) => x.id === requestId),
      l = data.listings.find((x) => x.id === listingId);
    if (!r || !l || l.owner !== account || l.audience !== r.audience) return;
    if (r.freeOnly && l.mode !== "free") {
      setError("This borrower requested free loans only.");
      return;
    }
    if (
      !r.freeOnly &&
      l.mode === "paid" &&
      l.rate * Math.ceil(r.hours / 24) > r.budget
    ) {
      setError("This listing exceeds the borrower’s maximum budget.");
      return;
    }
    if (r.offers.some((o) => o.listingId === listingId)) {
      setError("You already offered this listing.");
      return;
    }
    update((d) => ({
      ...d,
      requests: d.requests.map((x) =>
        x.id === requestId
          ? { ...x, offers: [...x.offers, { listingId, lender: account }] }
          : x,
      ),
    }));
    notify("Offer sent");
    close();
  };
  const validateTimes = (
    l: Listing,
    pickup: string,
    returnAt: string,
    except?: string,
    allowPastPickup = false,
  ) => {
    if (!pickup || !returnAt) return "Choose pickup and return times.";
    if (!allowPastPickup && new Date(pickup) <= now)
      return "Pickup must be in the future.";
    if (new Date(returnAt) <= new Date(pickup))
      return "Return must be after pickup.";
    if (
      new Date(returnAt).getTime() - new Date(pickup).getTime() >
      l.maxDays * 86400000
    )
      return `This item has a ${l.maxDays}-day maximum loan.`;
    if (day(new Date(pickup)) < l.start || day(new Date(returnAt)) > l.end)
      return "Dates fall outside the listing availability.";
    const h = Number(pickup.slice(11, 13));
    if (h < 10 || h >= 19)
      return "Pickup must be between 10:00 AM and 7:00 PM.";
    if (
      blockers(l.id, except).some((b) =>
        overlap(pickup, returnAt, b.agreement.pickup, b.agreement.returnAt),
      )
    )
      return "These dates overlap another reservation or loan.";
    return "";
  };
  const book = (l: Listing, requestId?: string) => {
    const pickup = form.pickup,
      returnAt = form.returnAt;
    const issue = validateTimes(l, pickup, returnAt);
    if (issue) {
      setError(issue);
      return;
    }
    const total = l.mode === "paid" ? l.rate * duration(pickup, returnAt) : 0;
    const b: Booking = {
      id: id(),
      listingId: l.id,
      requestId,
      borrower: account,
      lender: l.owner,
      status: "requested",
      agreement: {
        item: l.title,
        accessories: l.accessories,
        condition: l.condition,
        pickup,
        returnAt,
        location: l.point,
        total,
        rate: l.rate,
        mode: l.mode,
        lateFree: l.lateFree,
      },
      createdAt: data.clock,
      expiresAt: isoLocal(add(now, 0, 0.5)),
      lenderPickup: false,
      borrowerPickup: false,
      paid: false,
    };
    update((d) => ({ ...d, bookings: [b, ...d.bookings] }));
    close();
    setPage("loans");
    setLoanTab("borrowing");
    notify("Booking request sent. Lender has 30 demo minutes to accept.");
  };
  const changeBooking = (bid: string, fn: (b: Booking) => Booking) =>
    update((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === bid ? fn(b) : b)),
    }));
  const actions = (b: Booking) => {
    const borrower = b.borrower === account,
      lender = b.lender === account,
      buttons: React.ReactNode[] = [];
    const addBtn = (label: string, fn: () => void, primary = false) =>
      buttons.push(
        <button
          key={label}
          className={primary ? "btn primary" : "btn subtle"}
          onClick={fn}
        >
          {label}
        </button>,
      );
    if (b.status === "requested" && lender)
      addBtn(
        "Accept request",
        () => {
          changeBooking(b.id, (x) => ({
            ...x,
            status: "awaiting",
            expiresAt: isoLocal(add(now, 0, 0.5)),
          }));
          notify("Waiting for borrower confirmation");
        },
        true,
      );
    if (b.status === "awaiting" && borrower)
      addBtn(
        b.agreement.mode === "paid"
          ? "Confirm & simulate payment"
          : "Confirm free loan",
        () => {
          update((d) => ({
            ...d,
            bookings: d.bookings.map((x) =>
              x.id === b.id
                ? {
                    ...x,
                    status: "confirmed" as Status,
                    paid:
                      x.agreement.mode === "paid"
                        ? demoPayments.completeCheckout(x.agreement.total)
                        : false,
                  }
                : x,
            ),
            requests: d.requests.map((r) =>
              r.id === b.requestId ? { ...r, fulfilled: true } : r,
            ),
          }));
          notify(
            b.agreement.mode === "paid"
              ? "Simulated payment complete"
              : "Free loan confirmed",
          );
        },
        true,
      );
    if (["requested", "awaiting", "confirmed"].includes(b.status))
      addBtn("Cancel booking", () => {
        changeBooking(b.id, (x) => ({ ...x, status: "cancelled" }));
        notify("Booking cancelled");
      });
    if (b.status === "confirmed" && borrower && !b.borrowerPickup)
      addBtn(
        "Confirm pickup",
        () =>
          changeBooking(b.id, (x) => ({
            ...x,
            borrowerPickup: true,
            status: x.lenderPickup ? "picked" : "confirmed",
          })),
        true,
      );
    if (b.status === "confirmed" && lender && !b.lenderPickup)
      addBtn(
        "Confirm handoff",
        () =>
          changeBooking(b.id, (x) => ({
            ...x,
            lenderPickup: true,
            status: x.borrowerPickup ? "picked" : "confirmed",
          })),
        true,
      );
    if (b.status === "picked" && borrower) {
      addBtn(
        "Record return",
        () => {
          changeBooking(b.id, (x) => ({
            ...x,
            status: "returning",
            returnAttempt: data.clock,
          }));
          notify("Return recorded; late estimate paused");
        },
        true,
      );
      addBtn("Request extension", () => {
        setForm({ until: isoLocal(add(new Date(b.agreement.returnAt), 1)) });
        open("issue", b.id);
        setForm({
          kind: "extension",
          until: isoLocal(add(new Date(b.agreement.returnAt), 1)),
        });
      });
    }
    if (b.status === "picked" && lender && b.extension?.status === "pending") {
      addBtn("Approve extension", () => approveExtension(b), true);
      addBtn("Decline extension", () =>
        changeBooking(b.id, (x) => ({
          ...x,
          extension: x.extension
            ? { ...x.extension, status: "declined" }
            : undefined,
        })),
      );
    }
    if (b.status === "returning" && lender)
      addBtn(
        "Confirm receipt",
        () => {
          changeBooking(b.id, (x) => ({ ...x, status: "completed" }));
          notify("Loan completed; item available again");
        },
        true,
      );
    if (!["completed", "cancelled"].includes(b.status))
      addBtn("Report issue", () => {
        open("issue", b.id);
        setForm({ kind: "issue" });
      });
    return buttons;
  };
  const approveExtension = (b: Booking) => {
    const l = data.listings.find((x) => x.id === b.listingId);
    const until = b.extension?.until;
    if (!l || !until) return;
    const problem = validateTimes(l, b.agreement.pickup, until, b.id, true);
    if (problem) {
      notify(problem);
      return;
    }
    changeBooking(b.id, (x) => ({
      ...x,
      agreement: {
        ...x.agreement,
        returnAt: until,
        total:
          x.agreement.mode === "paid"
            ? x.agreement.rate * duration(x.agreement.pickup, until)
            : 0,
      },
      extension: undefined,
    }));
    notify("Extension approved and agreement updated");
  };
  const saveIssue = () => {
    const b = data.bookings.find((x) => x.id === selected);
    if (!b) return;
    if (form.kind === "extension") {
      const l = data.listings.find((x) => x.id === b.listingId)!;
      const issue = validateTimes(l, b.agreement.pickup, form.until, b.id);
      if (issue) {
        setError(issue);
        return;
      }
      if (new Date(form.until) <= new Date(b.agreement.returnAt)) {
        setError("Extension must be later than the current return time.");
        return;
      }
      changeBooking(b.id, (x) => ({
        ...x,
        extension: { until: form.until, status: "pending" },
      }));
      notify("Extension sent for lender approval");
    } else {
      if (!form.reason || !form.description?.trim()) {
        setError("Choose a reason and describe the issue.");
        return;
      }
      changeBooking(b.id, (x) => ({
        ...x,
        issue: { reason: form.reason, description: form.description },
        overdueDispute: form.reason === "Late fee",
      }));
      notify("Issue saved for review");
    }
    close();
  };
  const nav = [
    ["browse", "Explore", Search],
    ["services", "Services", Package],
    ["groups", "Groups & clubs", Users],
    ["requests", "Help board", Clock3],
    ["loans", "My Boros", Package],
    ["messages", "Messages", MessageCircle],
    ["notifications", "Alerts", Bell],
    ["resources", "Resources", BookOpen],
  ] as const;
  return (
    <div
      className={
        campusLevel === "directory"
          ? "app directory"
          : `app campusUiuc page-${page}`
      }
    >
      <header className="topbar">
        <div className="topinner">
          <button
            className="brand"
            onClick={() => {
              setCampusLevel("uiuc");
              setPage("browse");
            }}
            aria-label="Boro home"
          >
            <img
              className="brandLogo"
              src={`${import.meta.env.BASE_URL}boro-wordmark.svg`}
              alt=""
            />
          </button>
          <button
            className="headerCampus"
            onClick={() => setCampusLevel("directory")}
          >
            <MapPin size={16} />
            <span>University of Illinois</span>
            <small>Urbana-Champaign</small>
          </button>
          <div className="topright">
            <button
              className="btn primary topList"
              onClick={() => setListMenu(true)}
            >
              <Plus size={16} /> List an Item
            </button>
            <label className="accountLabel">
              Try as{" "}
              <select
                value={account}
                onChange={(e) => {
                  setAccount(demoAuth.selectAccount(e.target.value));
                  close();
                }}
              >
                {users.map((u) => (
                  <option value={u.id} key={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="avatarButton"
              onClick={() => open("profile", account)}
              aria-label="View my profile"
            >
              <Avatar user={me} size={40} />
            </button>
          </div>
        </div>
      </header>
      <div className="demoNotice">
        <span>
          <span className="demoTag">Interactive demo</span> Explore as a
          student. Listings, profiles, verification, and payments are simulated.
        </span>
        <button onClick={resetDemo}>
          <RotateCcw size={14} /> Reset demo
        </button>
      </div>
      <div className="shell">
        <main className="main">
          {campusLevel === "directory" ? (
            <section className="campusDirectory">
              <div className="directoryIntro">
                <img
                  className="directoryLogo"
                  src={`${import.meta.env.BASE_URL}boro-wordmark.svg`}
                  alt="Boro"
                />
                <span>BORO / CAMPUSES</span>
                <h1>Find your campus circle.</h1>
                <p>
                  Each campus has its own marketplace, groups, requests, and
                  local character.
                </p>
              </div>
              <button
                className="campusDirectoryCard"
                onClick={() => {
                  setCampusLevel("uiuc");
                  setPage("browse");
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}images/campus.jpg`}
                  alt="Main Quad at Illinois"
                />
                <span>
                  <small>ILLINOIS</small>
                  <b>UIUC campus</b>
                  <em>
                    Urbana-Champaign · Open campus <ChevronRight size={16} />
                  </em>
                </span>
              </button>
            </section>
          ) : (
            <>
              <section
                className={`campusBanner ${page === "browse" ? "marketHero" : "compactHero"}`}
                aria-label="Current Boro campus"
              >
                <div className="heroCopy">
                  <span className="campusKicker">BORROW MORE. OWN LESS.</span>
                  <strong>
                    Big plans.
                    <br />
                    <span>Small student budget.</span>
                  </strong>
                  <small>
                    Borrow the camera. Book the baker.
                    <br />
                    Find your people, right here at Illinois.
                  </small>
                  <span className="heroLocation">
                    <MapPin size={14} /> Made for the UIUC community
                  </span>
                </div>
                <div
                  className="heroCollage"
                  aria-label="Explore a few campus favorites"
                >
                  <span className="heroOrbit" aria-hidden="true" />
                  <span className="heroNote" aria-hidden="true">
                    good stuff.
                    <br />
                    good neighbors.
                  </span>
                  <button
                    className="heroPick heroCamera"
                    onClick={() => open("listing", "l3")}
                    aria-label="Explore the camera kit"
                  >
                    <Photo
                      title="Sony mirrorless camera kit"
                      category="Camera & tripod"
                      eager
                    />
                    <span>
                      <b>A weekend behind the lens</b>
                      <small>Camera kit · $12/day</small>
                    </span>
                  </button>
                  <button
                    className="heroPick heroCookies"
                    onClick={() => setPage("services")}
                    aria-label="Explore student bakers"
                  >
                    <Photo title="Quick cookie box" category="Events" eager />
                    <span>
                      <b>Baked by your neighbor</b>
                      <small>Student-made · $12/box</small>
                    </span>
                  </button>
                  <button
                    className="heroPick heroDress"
                    onClick={() => open("listing", "l14")}
                    aria-label="Explore the free formal dress loan"
                  >
                    <Photo
                      title="Black formal dress"
                      category="Fashion"
                      eager
                    />
                    <span>
                      <b>One night. Zero dollars.</b>
                      <small>Formal dress · free loan</small>
                    </span>
                  </button>
                  <span className="heroSticker" aria-hidden="true">
                    <Sparkles size={18} /> Less buying.
                    <br />
                    More living.
                  </span>
                </div>
              </section>
              <nav className="campusNav" aria-label="UIUC campus navigation">
                {nav
                  .filter(
                    ([key]) => key !== "notifications" && key !== "resources",
                  )
                  .map(([key, label, Icon]) => (
                    <button
                      key={key}
                      className={page === key ? "active" : ""}
                      onClick={() => {
                        if (key === "browse") setCommunity("all");
                        setPage(key);
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
              </nav>
              {page === "browse" && (
                <>
                  <div className="pageHead">
                    <div>
                      <div className="eyebrow">THE CAMPUS MARKETPLACE</div>
                      <h1>What do you need today?</h1>
                      <p>
                        Borrow for a day, buy secondhand, or find a student with
                        the right skills.
                      </p>
                    </div>
                    <button
                      className="btn primary"
                      onClick={() => setListMenu(true)}
                    >
                      <Plus size={17} /> List an item
                    </button>
                  </div>
                  <div className="searchbar">
                    <Search size={19} />
                    <input
                      aria-label="Search listings"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Try “camera”, “formal dress”, or “projector”"
                    />
                  </div>
                  <div
                    className="quickCategories"
                    aria-label="Popular categories"
                  >
                    {(
                      [
                        ["All categories", "Everything", LayoutGrid],
                        ["Camera & tripod", "Cameras", Camera],
                        ["Fashion", "Clothing", Shirt],
                        ["Event gear", "Event essentials", Sparkles],
                        ["Tools", "Tools", Wrench],
                        ["Art supplies", "Art & studio", Palette],
                      ] as const
                    ).map(([value, label, Icon]) => (
                      <button
                        key={value}
                        className={category === value ? "active" : ""}
                        aria-pressed={category === value}
                        onClick={() => setCategory(value)}
                      >
                        <Icon size={17} aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div
                    className="marketSwitch"
                    role="group"
                    aria-label="Listing type"
                  >
                    {(["both", "rent", "buy"] as const).map((v) => (
                      <button
                        key={v}
                        className={marketView === v ? "active" : ""}
                        aria-pressed={marketView === v}
                        onClick={() => setMarketView(v)}
                      >
                        {v === "both"
                          ? "All listings"
                          : v === "rent"
                            ? "Borrow & rent"
                            : "Buy"}
                      </button>
                    ))}
                  </div>
                  <details className="filterDetails">
                    <summary>
                      More filters{" "}
                      <span>Price, pickup area & availability</span>
                    </summary>
                    <div className="filters">
                      <label>
                        Category
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option>All categories</option>
                          {categories.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Price
                        <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value)}
                        >
                          <option>Any price</option>
                          <option>Free loans</option>
                          <option>Paid rentals</option>
                        </select>
                      </label>
                      <label>
                        Pickup zone
                        <select
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                        >
                          <option>Any zone</option>
                          {zones.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Sort by
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(e.target.value as typeof sortBy)
                          }
                        >
                          <option value="recommended">Recommended</option>
                          <option value="price-low">Price: low to high</option>
                          <option value="price-high">Price: high to low</option>
                        </select>
                      </label>
                      <label className="today">
                        <input
                          type="checkbox"
                          checked={timing}
                          onChange={(e) => setTiming(e.target.checked)}
                        />{" "}
                        Available today
                      </label>
                    </div>
                  </details>
                  {marketView !== "buy" && (
                    <>
                      <div className="sectionHeading">
                        <h2>
                          {marketView === "rent"
                            ? "Borrow & rent nearby"
                            : "From students around you"}
                        </h2>
                        <span>{list.length} items</span>
                      </div>
                      <div className="grid">
                        {list.map((l) => (
                          <article
                            className={`listingCard ${l.mode === "free" ? "freeListing" : ""}`}
                            key={l.id}
                          >
                            <button
                              className="itemImage"
                              onClick={() => open("listing", l.id)}
                              aria-label={`View ${l.title}`}
                            >
                              <Photo
                                title={l.title}
                                category={l.category}
                                fallback={l.emoji}
                                src={l.photos?.[0]}
                              />
                              <em>
                                {l.mode === "free"
                                  ? "Free to borrow"
                                  : l.category}
                              </em>
                            </button>
                            <div className="cardBody">
                              <span className="listingCondition">
                                {l.condition} condition
                              </span>
                              <div className="cardTitle">
                                <button onClick={() => open("listing", l.id)}>
                                  {l.title}
                                </button>
                                <strong>
                                  {l.mode === "free"
                                    ? "Free loan"
                                    : `${money(l.rate)}/day`}
                                </strong>
                              </div>
                              <div className="meta">
                                <MapPin size={14} />
                                {l.zone}
                                <span>·</span>
                                <CalendarDays size={14} />
                                {availableToday(l) ? "Today" : "Upcoming"}
                              </div>
                              <div className="cardFooter">
                                <button
                                  className="lender"
                                  onClick={() => open("profile", l.owner)}
                                >
                                  <Avatar user={who(l.owner)} size={32} />
                                  {who(l.owner).name}
                                </button>
                                <span className="memberBadge">
                                  <ShieldCheck size={14} /> UIUC
                                </span>
                                <button
                                  className="arrow"
                                  aria-label={`View ${l.title}`}
                                  onClick={() => open("listing", l.id)}
                                >
                                  <ChevronRight size={19} />
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                      {list.length === 0 && (
                        <div className="empty">
                          No rentals match these filters. Try another search or
                          category.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {page === "loans" && (
                <>
                  <div className="pageHead">
                    <div>
                      <div className="eyebrow">YOUR ACTIVITY</div>
                      <h1>My Boros</h1>
                      <p>Follow every item from agreement to return.</p>
                    </div>
                    <button
                      className="btn outline"
                      onClick={() => {
                        setClockDraft(data.clock);
                        setClockOpen(!clockOpen);
                      }}
                    >
                      <Clock3 size={16} /> Demo clock: {fmt(data.clock)}
                    </button>
                    <button className="btn subtle" onClick={resetDemo}>
                      <RotateCcw size={15} /> Reset demo
                    </button>
                  </div>
                  {clockOpen && (
                    <div className="clockPanel">
                      <label>
                        Set demo date and time
                        <input
                          type="datetime-local"
                          value={clockDraft}
                          onChange={(e) => setClockDraft(e.target.value)}
                        />
                      </label>
                      <button
                        className="btn primary"
                        onClick={() => {
                          if (
                            clockDraft &&
                            new Date(clockDraft).toString() !== "Invalid Date"
                          ) {
                            update((d) => ({ ...d, clock: clockDraft }));
                            setClockOpen(false);
                            notify("Demo clock updated");
                          }
                        }}
                      >
                        Set clock
                      </button>
                      <button
                        className="btn subtle"
                        onClick={() => setClockOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="tabs">
                    <button
                      className={loanTab === "borrowing" ? "active" : ""}
                      onClick={() => setLoanTab("borrowing")}
                    >
                      Borrowing
                    </button>
                    <button
                      className={loanTab === "lending" ? "active" : ""}
                      onClick={() => setLoanTab("lending")}
                    >
                      Lending
                    </button>
                  </div>
                  <div className="loanList">
                    {mine.map((b) => {
                      const l = data.listings.find((x) => x.id === b.listingId),
                        fee = late(b),
                        overdue =
                          fee.periods > 0 &&
                          !["completed", "cancelled"].includes(b.status);
                      return (
                        <article className="loanCard" key={b.id}>
                          <div className="loanTop">
                            <div className="loanImage">
                              {l ? (
                                <Photo
                                  title={l.title}
                                  category={l.category}
                                  fallback={l.emoji}
                                  src={l.photos?.[0]}
                                />
                              ) : null}
                            </div>
                            <div>
                              <h3>{b.agreement.item}</h3>
                              <p>
                                {loanTab === "borrowing"
                                  ? `From ${who(b.lender).name}`
                                  : `To ${who(b.borrower).name}`}{" "}
                                · {b.agreement.location}
                              </p>
                            </div>
                            <span className={`status ${b.status}`}>
                              {
                                (
                                  {
                                    requested: "Requested",
                                    awaiting: "Awaiting borrower confirmation",
                                    confirmed: "Confirmed",
                                    picked: "Picked up",
                                    returning: "Return awaiting confirmation",
                                    completed: "Completed",
                                    cancelled: "Cancelled",
                                  } as Record<Status, string>
                                )[b.status]
                              }
                            </span>
                          </div>
                          <div className="loanDates">
                            <span>
                              <b>Pickup</b>
                              {fmt(b.agreement.pickup)}
                            </span>
                            <span>
                              <b>Return</b>
                              {fmt(b.agreement.returnAt)}
                            </span>
                            <span>
                              <b>Rental total</b>
                              {b.agreement.mode === "free"
                                ? "Free"
                                : money(b.agreement.total)}
                            </span>
                          </div>
                          <details className="agreement">
                            <summary>View saved agreement</summary>
                            <div>
                              <p>
                                <b>Item:</b> {b.agreement.item} ·{" "}
                                {b.agreement.condition}
                              </p>
                              <p>
                                <b>Accessories:</b> {b.agreement.accessories}
                              </p>
                              <p>
                                <b>Pickup:</b> {fmt(b.agreement.pickup)} at{" "}
                                {b.agreement.location}
                              </p>
                              <p>
                                <b>Return:</b> {fmt(b.agreement.returnAt)} at{" "}
                                {b.agreement.location}
                              </p>
                              <p>
                                <b>Rental total:</b> {money(b.agreement.total)}{" "}
                                {b.paid ? "· simulated payment complete" : ""}
                              </p>
                              <p>
                                <b>Cancellation:</b> Either party may cancel
                                before pickup. <b>Late:</b> 2-hour grace;{" "}
                                {b.agreement.mode === "paid"
                                  ? `${money(b.agreement.rate)} per started 24 hours after grace, capped at ${money(b.agreement.rate * 3)}`
                                  : b.agreement.lateFree
                                    ? "$2 per started 24 hours after grace, capped at $6"
                                    : "$0 late charge"}
                                . Estimates only; no automatic collection.
                              </p>
                            </div>
                          </details>
                          {["requested", "awaiting"].includes(b.status) && (
                            <div className="notice">
                              Reservation expires at {fmt(b.expiresAt)} on the
                              demo clock.
                            </div>
                          )}
                          {b.status === "confirmed" &&
                            (b.borrowerPickup || b.lenderPickup) && (
                              <div className="notice">
                                Pickup confirmations: borrower{" "}
                                {b.borrowerPickup ? "✓" : "pending"} · lender{" "}
                                {b.lenderPickup ? "✓" : "pending"}
                              </div>
                            )}
                          {fee.periods > 0 && b.status !== "cancelled" && (
                            <div className="lateBox">
                              <AlertCircle size={18} />
                              <div>
                                <b>
                                  Overdue · estimated late fee {money(fee.fee)}
                                </b>
                                <p>
                                  {fee.periods} started 24-hour{" "}
                                  {fee.periods === 1 ? "period" : "periods"}{" "}
                                  after the 2-hour grace.{" "}
                                  {b.returnAttempt
                                    ? "Accrual paused when return was recorded."
                                    : "Estimate advances with the demo clock."}{" "}
                                  {b.overdueDispute
                                    ? "Fee pending review."
                                    : ""}
                                </p>
                              </div>
                            </div>
                          )}
                          {b.extension && (
                            <div className="notice">
                              Extension to {fmt(b.extension.until)}:{" "}
                              {b.extension.status}
                            </div>
                          )}
                          {b.issue && (
                            <div className="notice">
                              Issue reported: {b.issue.reason} ·{" "}
                              {b.issue.description}{" "}
                              {b.overdueDispute ? "· fee pending review" : ""}
                            </div>
                          )}
                          <ConditionEvidence
                            photos={b.conditionPhotos}
                            account={account}
                            name={(userId) => who(userId).name}
                            canBefore={["confirmed", "picked"].includes(
                              b.status,
                            )}
                            canAfter={["picked", "returning"].includes(
                              b.status,
                            )}
                            onUpload={(stage, image) => {
                              changeBooking(b.id, (x) => ({
                                ...x,
                                conditionPhotos: [
                                  ...(x.conditionPhotos || []).filter(
                                    (p) =>
                                      !(p.stage === stage && p.by === account),
                                  ),
                                  {
                                    id: id(),
                                    stage,
                                    by: account,
                                    at: data.clock,
                                    image,
                                  },
                                ],
                              }));
                              notify(
                                `${stage === "before" ? "Pickup" : "Return"} condition photo saved`,
                              );
                            }}
                          />
                          <div className="loanActions">{actions(b)}</div>
                        </article>
                      );
                    })}
                  </div>
                  {mine.length === 0 && (
                    <div className="empty">
                      No {loanTab} item loans yet. Other deals appear below.
                    </div>
                  )}
                </>
              )}
              {page === "resources" && (
                <>
                  <div className="pageHead">
                    <div>
                      <div className="eyebrow">BEYOND THE COMMUNITY</div>
                      <h1>Campus Resources</h1>
                      <p>
                        Official equipment loans are handled by the university,
                        under its own policies.
                      </p>
                    </div>
                  </div>
                  <div className="resourceIntro">
                    <BookOpen size={20} /> Check each official page for current
                    eligibility, availability, hours, and checkout details. Boro
                    does not reserve these items.
                  </div>
                  <div className="resourceGrid">
                    <article>
                      <div className="resourceIcon">📚</div>
                      <h3>Media Commons</h3>
                      <p>
                        Calculators, tripods, cameras, and other technology.
                        Loans up to 10 days depending on availability. Bring an
                        i-card or Illinois App to Room 306, Main Library.
                        Official overdue fees are $15/day/item.
                      </p>
                      <a
                        href="https://www.library.illinois.edu/sc/loanable-technology/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check official availability <ChevronRight size={16} />
                      </a>
                    </article>
                    <article>
                      <div className="resourceIcon">💡</div>
                      <h3>Grainger IDEA Lab</h3>
                      <p>
                        Free equipment checkout generally for one week, with
                        exceptions and eligibility restrictions. Review the
                        official page before visiting.
                      </p>
                      <a
                        href="https://www.library.illinois.edu/enx/idea-lab-homepage/idea-tech/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check official availability <ChevronRight size={16} />
                      </a>
                    </article>
                    <article>
                      <div className="resourceIcon">🔌</div>
                      <h3>Orange Room</h3>
                      <p>
                        Short-term chargers, headphones, and adapters for
                        in-library use. Details are linked through Media
                        Commons.
                      </p>
                      <a
                        href="https://www.library.illinois.edu/sc/loanable-technology/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check official availability <ChevronRight size={16} />
                      </a>
                    </article>
                  </div>
                </>
              )}
              <Extras
                page={page}
                account={account}
                now={data.clock}
                marketView={marketView}
                search={search}
                category={category}
                modeFilter={mode}
                sortBy={sortBy}
                zone={zone}
                community={community}
                existingListings={data.listings}
                existingBookings={data.bookings}
                openExisting={(listingId) => open("listing", listingId)}
                openProfile={(userId) => open("profile", userId)}
                extraCreate={extraCreate}
                setExtraCreate={setExtraCreate}
                setPage={setPage}
              />
            </>
          )}
          <footer className="marketFooter">
            <span>Boro · Made for the Illinois campus community</span>
            <div>
              <button onClick={() => setPage("resources")}>
                Campus resources
              </button>
              <button onClick={() => setPage("notifications")}>Alerts</button>
              <a
                href="https://github.com/therealzoyak/Boro"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </footer>
        </main>
      </div>
      <nav className="bottomNav">
        {nav
          .filter(([key]) => key !== "groups")
          .map(([key, label, Icon]) => (
            <button
              key={key}
              className={page === key ? "active" : ""}
              onClick={() => {
                setCampusLevel("uiuc");
                if (key === "browse") setCommunity("all");
                setPage(key);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
      </nav>
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
      {listMenu && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setListMenu(false);
          }}
        >
          <div
            className="modal listChoice"
            role="dialog"
            aria-modal="true"
            aria-label="Choose listing type"
          >
            <button
              className="close"
              onClick={() => setListMenu(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="modalContent">
              <div className="eyebrow">SHARE, SELL, OR HELP</div>
              <h2>What would you like to list?</h2>
              <div className="listOptions">
                <button
                  onClick={() => {
                    setListMenu(false);
                    open("createListing");
                  }}
                >
                  <span>🤝</span>
                  <b>Rent an item</b>
                  <small>Free loan or daily rental</small>
                </button>
                <button
                  onClick={() => {
                    setListMenu(false);
                    setExtraCreate("sale");
                  }}
                >
                  <span>🏷️</span>
                  <b>Sell an item</b>
                  <small>One-time public meetup</small>
                </button>
                <button
                  onClick={() => {
                    setListMenu(false);
                    setExtraCreate("service");
                  }}
                >
                  <span>🧰</span>
                  <b>Offer a service</b>
                  <small>Help with a project or task</small>
                </button>
                <button
                  onClick={() => {
                    setListMenu(false);
                    setExtraCreate("lease");
                  }}
                >
                  <span>🔁</span>
                  <b>Rent + buy</b>
                  <small>Daily rental with a buyout option</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal}
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            {modal === "listing" && listing && (
              <>
                <div className="detailHero">
                  <Photo
                    title={listing.title}
                    category={listing.category}
                    fallback={listing.emoji}
                    src={listing.photos?.[selectedPhoto] || listing.photos?.[0]}
                    eager
                  />
                  <small>{listing.category}</small>
                </div>
                {listing.photos && listing.photos.length > 1 && (
                  <div className="photoGallery">
                    {listing.photos.map((src, i) => (
                      <button
                        key={i}
                        className={selectedPhoto === i ? "active" : ""}
                        aria-label={`View photo ${i + 1}`}
                        onClick={() => setSelectedPhoto(i)}
                      >
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="modalContent">
                  <div className="eyebrow">
                    {audienceName(listing.audience)}
                  </div>
                  <h2>{listing.title}</h2>
                  <div className="detailPrice">
                    {listing.mode === "free"
                      ? "Free loan"
                      : `${money(listing.rate)} per 24 hours`}
                  </div>
                  <button
                    className="profileLine"
                    onClick={() => open("profile", listing.owner)}
                  >
                    <Avatar user={who(listing.owner)} />
                    <span>
                      Listed by <b>{who(listing.owner).name}</b>
                      <small>View profile & sample reviews</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                  <p>{listing.description}</p>
                  <div className="detailGrid">
                    <div>
                      <b>Condition</b>
                      <span>{listing.condition}</span>
                    </div>
                    <div>
                      <b>Included</b>
                      <span>{listing.accessories}</span>
                    </div>
                    <div>
                      <b>Pickup zone</b>
                      <span>{listing.zone}</span>
                    </div>
                    <div>
                      <b>Meetup</b>
                      <span>
                        {listing.meetupType === "apartment"
                          ? "Apartment lobby or entrance"
                          : listing.meetupType === "business"
                            ? "Cafe or business"
                            : "Public campus spot"}{" "}
                        · {listing.point}
                      </span>
                    </div>
                    <div>
                      <b>Availability</b>
                      <span>
                        {listing.start} – {listing.end}
                        <br />
                        {listing.windows}
                      </span>
                    </div>
                    <div>
                      <b>Maximum duration</b>
                      <span>{listing.maxDays} days</span>
                    </div>
                  </div>
                  <div className="ruleBox">
                    <b>Late return policy</b>
                    <p>
                      2-hour grace period.{" "}
                      {listing.mode === "paid"
                        ? `${money(listing.rate)} per started 24 hours after grace, capped at ${money(listing.rate * 3)}.`
                        : listing.lateFree
                          ? "$2 per started 24 hours after grace, capped at $6."
                          : "No late charge."}{" "}
                      Demo estimates only.
                    </p>
                  </div>
                  {listing.owner !== account ? (
                    <button
                      className="btn primary full"
                      onClick={() => {
                        open("book", listing.id);
                        setForm({
                          pickup: suggested(now),
                          returnAt: suggested(
                            now,
                            Math.min(2, listing.maxDays),
                          ),
                        });
                      }}
                    >
                      Request to borrow <ChevronRight size={17} />
                    </button>
                  ) : (
                    <div className="notice">
                      This is your listing. Switch demo accounts to borrow it.
                    </div>
                  )}
                </div>
              </>
            )}
            {modal === "profile" && selectedUser && (
              <div className="modalContent profileModal">
                <Avatar user={selectedUser} size={64} />
                <h2>{selectedUser.name}</h2>
                <p>
                  {selectedUser.year} · {selectedUser.zone}
                </p>
                <div className="verified">
                  <ShieldCheck size={15} /> Illinois email verified · demo
                </div>
                <div className="profileStats">
                  <b>{selectedUser.loans}</b>
                  <span>completed Boros · sample activity</span>
                </div>
                <p className="profileBio">{selectedUser.bio}</p>
                <div className="trustMini">
                  <div>
                    <b>★ 4.9</b>
                    <small>sample rating</small>
                  </div>
                  <div>
                    <b>{selectedUser.zone}</b>
                    <small>Usual pickup area</small>
                  </div>
                  <div>
                    <b>{selectedUser.year.split(" · ")[0]}</b>
                    <small>At Illinois</small>
                  </div>
                </div>
                <blockquote>{selectedUser.review}</blockquote>
                <small>
                  Sample profile, stock portrait, and fictional review.
                  Verification is simulated in this demo.
                </small>
              </div>
            )}
            {modal === "request" && request && (
              <div className="modalContent">
                <div className="eyebrow">OFFER AN ITEM</div>
                <h2>{request.title}</h2>
                <p>
                  Choose one of your listings in{" "}
                  {audienceName(request.audience)}. The borrower can inspect it
                  and request dates.
                </p>
                <div className="offerChoices">
                  {data.listings
                    .filter(
                      (l) =>
                        l.owner === account && l.audience === request.audience,
                    )
                    .map((l) => (
                      <button
                        key={l.id}
                        onClick={() => offer(request.id, l.id)}
                      >
                        <span>{l.emoji}</span>
                        <span>
                          <b>{l.title}</b>
                          <small>
                            {l.mode === "free"
                              ? "Free loan"
                              : `${money(l.rate)}/day`}{" "}
                            · {l.zone}
                          </small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    ))}
                </div>
                {!data.listings.some(
                  (l) => l.owner === account && l.audience === request.audience,
                ) && (
                  <div className="empty">
                    You need a listing in this community before offering one.
                  </div>
                )}
                {error && <div className="formError">{error}</div>}
                <button
                  className="btn outline full"
                  onClick={() => open("createListing")}
                >
                  Create a listing
                </button>
              </div>
            )}
            {modal === "book" && listing && (
              <div className="modalContent">
                <div className="eyebrow">BORROWING AGREEMENT</div>
                <h2>{listing.title}</h2>
                <p>
                  Choose dates, then send a reservation to{" "}
                  {who(listing.owner).name}.
                </p>
                <div className="formGrid">
                  <label>
                    Pickup date & time
                    <input
                      type="datetime-local"
                      value={form.pickup || ""}
                      onChange={(e) =>
                        setForm({ ...form, pickup: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Return date & time
                    <input
                      type="datetime-local"
                      value={form.returnAt || ""}
                      onChange={(e) =>
                        setForm({ ...form, returnAt: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="agreementPreview">
                  <h3>Your agreement</h3>
                  <p>
                    <b>Item:</b> {listing.title} · {listing.condition}
                  </p>
                  <p>
                    <b>Accessories:</b> {listing.accessories}
                  </p>
                  <p>
                    <b>Pickup:</b>{" "}
                    {form.pickup ? fmt(form.pickup) : "Choose a time"} at{" "}
                    {listing.point}
                  </p>
                  <p>
                    <b>Return:</b>{" "}
                    {form.returnAt ? fmt(form.returnAt) : "Choose a time"} at{" "}
                    {listing.point}
                  </p>
                  <p>
                    <b>Rental total:</b>{" "}
                    {listing.mode === "free"
                      ? "$0.00 · free loan"
                      : form.pickup &&
                          form.returnAt &&
                          new Date(form.returnAt) > new Date(form.pickup)
                        ? `${money(listing.rate * duration(form.pickup, form.returnAt))} (${duration(form.pickup, form.returnAt)} rounded-up 24-hour periods)`
                        : "Choose valid dates"}
                  </p>
                  <p>
                    <b>Cancellation:</b> Either party may cancel before pickup.
                  </p>
                  <p>
                    <b>Late return:</b> 2-hour grace;{" "}
                    {listing.mode === "paid"
                      ? `${money(listing.rate)} per started 24 hours, capped at ${money(listing.rate * 3)}`
                      : listing.lateFree
                        ? "$2 per started 24 hours, capped at $6"
                        : "$0 late charge"}
                    . Demo estimate, not collected automatically.
                  </p>
                </div>
                <div className="notice">
                  Reservations expire after 30 demo minutes if the lender has
                  not accepted. Paid checkout is simulated after acceptance.
                </div>
                {error && <div className="formError">{error}</div>}
                <button
                  className="btn primary full"
                  onClick={() => book(listing, form.requestId)}
                >
                  Send booking request
                </button>
              </div>
            )}
            {modal === "createListing" && (
              <div className="modalContent">
                <div className="eyebrow">SHARE WITH CAMPUS</div>
                <h2>List an item</h2>
                <div className="formGrid">
                  <label className="wide">
                    Item name
                    <input
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Compact tripod"
                    />
                  </label>
                  <label className="wide">
                    Description
                    <textarea
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="What is it useful for?"
                    />
                  </label>
                  <ListingPhotoPicker
                    images={draftPhotos}
                    onChange={setDraftPhotos}
                  />
                  <label>
                    Category
                    <select
                      value={form.category || ""}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option value="">Choose category</option>
                      {categories.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Community
                    <select
                      value={form.audience || community}
                      onChange={(e) =>
                        setForm({ ...form, audience: e.target.value })
                      }
                    >
                      <option value="all">All UIUC</option>
                      {me.member && (
                        <option value="women">UIUC Women Borrowing</option>
                      )}
                    </select>
                  </label>
                  <label>
                    Loan type
                    <select
                      value={form.mode || "free"}
                      onChange={(e) =>
                        setForm({ ...form, mode: e.target.value })
                      }
                    >
                      <option value="free">Free loan</option>
                      <option value="paid">Paid rental</option>
                    </select>
                  </label>
                  {form.mode === "paid" && (
                    <label>
                      Rate per 24 hours ($)
                      <input
                        type="number"
                        min="1"
                        value={form.rate || ""}
                        onChange={(e) =>
                          setForm({ ...form, rate: e.target.value })
                        }
                      />
                    </label>
                  )}
                  <label>
                    Condition
                    <input
                      value={form.condition || ""}
                      onChange={(e) =>
                        setForm({ ...form, condition: e.target.value })
                      }
                      placeholder="e.g. Great"
                    />
                  </label>
                  <label>
                    Included accessories
                    <input
                      value={form.accessories || ""}
                      onChange={(e) =>
                        setForm({ ...form, accessories: e.target.value })
                      }
                      placeholder="e.g. Case, cable"
                    />
                  </label>
                  <label>
                    Available from
                    <input
                      type="date"
                      value={form.start || ""}
                      onChange={(e) =>
                        setForm({ ...form, start: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Available until
                    <input
                      type="date"
                      value={form.end || ""}
                      onChange={(e) =>
                        setForm({ ...form, end: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Pickup zone
                    <select
                      value={form.zone || ""}
                      onChange={(e) =>
                        setForm({ ...form, zone: e.target.value })
                      }
                    >
                      <option value="">Choose zone</option>
                      {zones.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Meetup type
                    <select
                      value={form.meetupType || "campus"}
                      onChange={(e) =>
                        setForm({ ...form, meetupType: e.target.value })
                      }
                    >
                      <option value="campus">Public campus spot</option>
                      <option value="apartment">
                        Apartment lobby or entrance
                      </option>
                      <option value="business">Cafe or business</option>
                    </select>
                  </label>
                  <label>
                    Meetup location
                    <input
                      value={form.point || ""}
                      onChange={(e) =>
                        setForm({ ...form, point: e.target.value })
                      }
                      placeholder={
                        form.meetupType === "apartment"
                          ? "Building name + lobby/entrance"
                          : "e.g. Illini Union main entrance"
                      }
                    />
                  </label>
                  <div className="formNote wide">
                    Use a public entrance or lobby. Confirm the time in chat
                    before meeting.
                  </div>
                  <label>
                    Max duration (days)
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.maxDays || "3"}
                      onChange={(e) =>
                        setForm({ ...form, maxDays: e.target.value })
                      }
                    />
                  </label>
                  <div className="formNote">
                    Pickup window: 10:00 AM–7:00 PM
                  </div>
                  {form.mode !== "paid" && (
                    <label className="wide checkboxLabel">
                      <input
                        type="checkbox"
                        checked={form.lateFree === "yes"}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            lateFree: e.target.checked ? "yes" : "no",
                          })
                        }
                      />{" "}
                      Disclose optional $2 late period fee (cap $6)
                    </label>
                  )}
                </div>
                {error && <div className="formError">{error}</div>}
                <button className="btn primary full" onClick={createListing}>
                  Publish listing
                </button>
              </div>
            )}
            {modal === "createRequest" && (
              <div className="modalContent">
                <div className="eyebrow">ASK YOUR COMMUNITY</div>
                <h2>Post a request</h2>
                <div className="formGrid">
                  <label className="wide">
                    Item needed
                    <input
                      value={form.title || ""}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g. Tripod for a video shoot"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={form.category || ""}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option value="">Choose category</option>
                      {categories.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Community
                    <select
                      value={form.audience || community}
                      onChange={(e) =>
                        setForm({ ...form, audience: e.target.value })
                      }
                    >
                      <option value="all">All UIUC</option>
                      {me.member && (
                        <option value="women">UIUC Women Borrowing</option>
                      )}
                    </select>
                  </label>
                  <label>
                    Needed by
                    <input
                      type="datetime-local"
                      value={form.needed || ""}
                      onChange={(e) =>
                        setForm({ ...form, needed: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Borrowing duration (hours)
                    <input
                      type="number"
                      min="1"
                      value={form.hours || ""}
                      onChange={(e) =>
                        setForm({ ...form, hours: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Maximum rental budget ($)
                    <input
                      type="number"
                      min="0"
                      value={form.budget || ""}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Pickup zone
                    <select
                      value={form.zone || ""}
                      onChange={(e) =>
                        setForm({ ...form, zone: e.target.value })
                      }
                    >
                      <option value="">Choose zone</option>
                      {zones.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="wide checkboxLabel">
                    <input
                      type="checkbox"
                      checked={form.freeOnly === "yes"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          freeOnly: e.target.checked ? "yes" : "no",
                        })
                      }
                    />{" "}
                    Free loans only
                  </label>
                </div>
                {error && <div className="formError">{error}</div>}
                <button className="btn primary full" onClick={createRequest}>
                  Post request
                </button>
              </div>
            )}
            {modal === "issue" && (
              <div className="modalContent">
                <div className="eyebrow">MY LOANS</div>
                <h2>
                  {form.kind === "extension"
                    ? "Request an extension"
                    : "Report an issue"}
                </h2>
                {form.kind === "extension" ? (
                  <>
                    <p>
                      The lender must approve the new return time. Conflicting
                      bookings cannot be extended.
                    </p>
                    <label>
                      New return time
                      <input
                        type="datetime-local"
                        value={form.until || ""}
                        onChange={(e) =>
                          setForm({ ...form, until: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <p>
                      Keep a record for both parties. Disputed late fees are
                      pending review and never collected automatically.
                    </p>
                    <label>
                      Reason
                      <select
                        value={form.reason || ""}
                        onChange={(e) =>
                          setForm({ ...form, reason: e.target.value })
                        }
                      >
                        <option value="">Choose reason</option>
                        <option>Item condition</option>
                        <option>Pickup or return</option>
                        <option>Late fee</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label>
                      Description
                      <textarea
                        value={form.description || ""}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </label>
                  </>
                )}
                {error && <div className="formError">{error}</div>}
                <button className="btn primary full" onClick={saveIssue}>
                  {form.kind === "extension"
                    ? "Send extension request"
                    : "Save issue report"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
