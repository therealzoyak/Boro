import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { demoStorage } from "./demoServices";
import MarketplaceCard, { useSavedListings } from "./MarketplaceCard";
import { Photo, Portrait, groupPhotos } from "./photos";
import {
  ConditionEvidence,
  ListingPhotoPicker,
  type ConditionPhoto,
} from "./imageUpload";

type Mode = "sale" | "service" | "lease";
type Group = {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: "public" | "private" | "invite";
  owner: string;
  members: string[];
  count: number;
  cover: string;
  rules: string;
  posts: { id: string; author: string; text: string; at: string }[];
};
type Item = {
  id: string;
  owner: string;
  title: string;
  mode: Mode;
  category: string;
  description: string;
  emoji: string;
  condition: string;
  price: number;
  rate: number;
  buyout: number;
  deposit: number;
  zone: string;
  meetupType?: string;
  meetupPoint?: string;
  photos?: string[];
  groupId: string;
  start: string;
  end: string;
  limit: number;
  leadDays?: number;
};
type Bid = {
  id: string;
  author: string;
  amount: number;
  message: string;
  itemId: string;
  at: string;
};
type Urgent = {
  id: string;
  author: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  groupId: string;
  budget: number;
  status: "open" | "fulfilled";
  bids: Bid[];
  votes?: string[];
  comments?: { id: string; author: string; text: string; at: string }[];
};
type Deal = {
  id: string;
  itemId: string;
  buyer: string;
  seller: string;
  mode: Mode;
  status:
    | "requested"
    | "accepted"
    | "active"
    | "returning"
    | "completed"
    | "cancelled";
  created: string;
  start: string;
  end: string;
  amount: number;
  deposit: number;
  buyout: number;
  bought: boolean;
  conditionPhotos?: ConditionPhoto[];
  quantity?: number;
  notes?: string;
};
type Chat = {
  id: string;
  itemId: string;
  from: string;
  to: string;
  text: string;
  at: string;
  proposal?: number;
  accepted?: boolean;
};
type Notice = {
  id: string;
  user: string;
  text: string;
  read: boolean;
  at: string;
};
type Store = {
  groups: Group[];
  items: Item[];
  urgent: Urgent[];
  deals: Deal[];
  chats: Chat[];
  notices: Notice[];
  saved: string[];
};
type Existing = {
  id: string;
  owner: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
  zone: string;
  audience: string;
  photos?: string[];
};
type Props = {
  page: string;
  account: string;
  now: string;
  marketView: "rent" | "buy" | "both";
  savedOnly: boolean;
  search: string;
  category: string;
  modeFilter: string;
  sortBy: string;
  zone: string;
  community: string;
  existingListings: Existing[];
  existingBookings: unknown[];
  openExisting: (id: string) => void;
  openProfile: (id: string) => void;
  extraCreate: "" | Mode;
  setExtraCreate: (v: "" | Mode) => void;
  setPage: (v: string) => void;
};
const people: Record<
  string,
  { name: string; initials: string; color: string }
> = {
  maya: { name: "Maya Chen", initials: "MC", color: "#ead4c2" },
  amina: { name: "Amina Patel", initials: "AP", color: "#d4e2da" },
  jordan: { name: "Jordan Rivera", initials: "JR", color: "#ddd8f0" },
  leo: { name: "Leo Brooks", initials: "LB", color: "#d8e3ed" },
};
const cats = [
  "Fashion",
  "Tech",
  "Art supplies",
  "Tools",
  "Apartment",
  "Photography",
  "Sports",
  "Events",
  "Other",
];
const zones = [
  "Main Quad",
  "South Quad",
  "North Quad",
  "Campustown",
  "Library",
];
const id = () => Math.random().toString(36).slice(2, 10);
const money = (n: number) => `$${n.toFixed(2)}`;
const fmt = (s: string) =>
  new Date(s).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const day = (s: string) => s.slice(0, 10);
const iso = (d: Date) => {
  const z = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
};
const plus = (s: string, days: number) => {
  const d = new Date(s);
  d.setDate(d.getDate() + days);
  return iso(d);
};
const modeName = (m: Mode) =>
  m === "sale" ? "For sale" : m === "service" ? "Service" : "Lease to buy";
const groupName = (g: Group) => g.name;
const avatar = (u: string) => (
  <span
    className="exAvatar"
    style={{ background: people[u]?.color || "#e8e3d8" }}
  >
    <Portrait id={u} name={people[u]?.name || "Student"} />
  </span>
);
function seed(): Store {
  const now = iso(new Date());
  const groups: Group[] = [
    {
      id: "fashion",
      name: "UIUC Fashion Exchange",
      description:
        "Borrow outfits, accessories, and formal wear instead of buying something new for every event.",
      category: "Fashion",
      privacy: "public",
      owner: "amina",
      members: ["maya", "amina"],
      count: 1240,
      cover: "fashion",
      rules: "Meet in public spaces. Describe fit and condition honestly.",
      posts: [
        {
          id: "p1",
          author: "amina",
          text: "Formal season is here! I added a black dress and a few accessories.",
          at: now,
        },
      ],
    },
    {
      id: "engineering",
      name: "Engineering Toolbox",
      description: "Share tools, soldering kits, calculators, and equipment.",
      category: "Tools",
      privacy: "public",
      owner: "jordan",
      members: ["jordan", "leo"],
      count: 640,
      cover: "engineering",
      rules: "Return tools clean and on time.",
      posts: [
        {
          id: "p2",
          author: "jordan",
          text: "Anyone building this weekend? The tool shelf is open.",
          at: now,
        },
      ],
    },
    {
      id: "photo",
      name: "Photography Collective",
      description: "Cameras, lenses, tripods, lights, and creative tips.",
      category: "Photography",
      privacy: "public",
      owner: "leo",
      members: ["leo", "amina"],
      count: 382,
      cover: "photo",
      rules: "Handle gear with care and check accessories at handoff.",
      posts: [
        {
          id: "p3",
          author: "leo",
          text: "Looking forward to seeing everyone’s campus portraits.",
          at: now,
        },
      ],
    },
    {
      id: "apartment",
      name: "Apartment Essentials",
      description: "Vacuums, moving carts, kitchen tools, steamers, and more.",
      category: "Apartment",
      privacy: "public",
      owner: "maya",
      members: ["maya", "jordan"],
      count: 2100,
      cover: "apartment",
      rules: "Coordinate pickup and return clearly.",
      posts: [],
    },
    {
      id: "art",
      name: "Art Supply Swap",
      description:
        "Share painting supplies, drawing tablets, clay tools, and crafting materials.",
      category: "Art supplies",
      privacy: "public",
      owner: "maya",
      members: ["maya", "amina"],
      count: 470,
      cover: "art",
      rules: "Tell each other when a supply is consumable.",
      posts: [],
    },
    {
      id: "women",
      name: "UIUC Women Borrowing",
      description:
        "A private, moderator-approved borrowing circle based on self-identification.",
      category: "Community",
      privacy: "private",
      owner: "amina",
      members: ["maya", "amina", "leo"],
      count: 3,
      cover: "women",
      rules:
        "Membership requires self-identification and moderator approval. Group membership is not a safety guarantee.",
      posts: [],
    },
  ];
  const end = day(plus(now, 90));
  const start = day(plus(now, -1));
  const items: Item[] = [
    {
      id: "x1",
      owner: "amina",
      title: "Vintage cream blazer",
      mode: "sale",
      category: "Fashion",
      description:
        "Gently worn size M blazer, perfect for interviews and formals.",
      emoji: "🧥",
      condition: "Great",
      price: 28,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "Main Quad",
      groupId: "fashion",
      start,
      end,
      limit: 1,
    },
    {
      id: "x2",
      owner: "leo",
      title: "Fujifilm X-T30 camera",
      mode: "lease",
      category: "Photography",
      description:
        "Try this camera for a project, then decide if you want to keep it. Rental paid is credited toward the buyout.",
      emoji: "📷",
      condition: "Excellent",
      price: 0,
      rate: 9,
      buyout: 280,
      deposit: 45,
      zone: "Campustown",
      groupId: "photo",
      start,
      end,
      limit: 7,
    },
    {
      id: "x3",
      owner: "jordan",
      title: "Portrait photo session",
      mode: "service",
      category: "Photography",
      description:
        "30-minute outdoor portrait session on campus. Edited photos delivered digitally.",
      emoji: "📸",
      condition: "Service",
      price: 20,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "Main Quad",
      groupId: "photo",
      start,
      end,
      limit: 1,
    },
    {
      id: "x4",
      owner: "maya",
      title: "Moving help — one hour",
      mode: "service",
      category: "Apartment",
      description:
        "A second pair of hands for dorm or apartment moves near campus.",
      emoji: "📦",
      condition: "Service",
      price: 15,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "South Quad",
      groupId: "apartment",
      start,
      end,
      limit: 1,
    },
    {
      id: "x5",
      owner: "jordan",
      title: "Cordless drill kit",
      mode: "sale",
      category: "Tools",
      description:
        "DeWalt drill with charger, two batteries, and a starter bit set.",
      emoji: "🛠️",
      condition: "Good",
      price: 48,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "North Quad",
      groupId: "engineering",
      start,
      end,
      limit: 1,
    },
    {
      id: "x7",
      owner: "amina",
      title: "Cookie catering for events",
      mode: "service",
      category: "Events",
      description:
        "Thirty fresh cookies for a club meeting or celebration. Select flavors and pickup details in your order note. Book at least one week ahead.",
      emoji: "🍪",
      condition: "Made to order",
      price: 45,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "Main Quad",
      groupId: "",
      start,
      end,
      limit: 1,
      leadDays: 7,
    },
    {
      id: "x8",
      owner: "amina",
      title: "Quick cookie box",
      mode: "service",
      category: "Events",
      description:
        "A small box of six cookies for a same-day study break, subject to the baker accepting your request.",
      emoji: "🍪",
      condition: "Made to order",
      price: 12,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "Main Quad",
      groupId: "",
      start,
      end,
      limit: 1,
      leadDays: 0,
    },
    {
      id: "x9",
      owner: "leo",
      title: "Student barber cut",
      mode: "service",
      category: "Other",
      description:
        "A simple haircut near Campustown. Send your preferred time and style notes at least a day ahead.",
      emoji: "✂️",
      condition: "Service",
      price: 20,
      rate: 0,
      buyout: 0,
      deposit: 0,
      zone: "Campustown",
      groupId: "",
      start,
      end,
      limit: 1,
      leadDays: 1,
    },
    {
      id: "x6",
      owner: "amina",
      title: "Sewing machine",
      mode: "lease",
      category: "Fashion",
      description:
        "Try this compact machine before buying. Rental payments reduce the buyout.",
      emoji: "🧵",
      condition: "Great",
      price: 0,
      rate: 5,
      buyout: 95,
      deposit: 20,
      zone: "Main Quad",
      groupId: "fashion",
      start,
      end,
      limit: 5,
    },
  ];
  return {
    groups,
    items,
    urgent: [
      {
        id: "u1",
        author: "jordan",
        title: "Need a projector for club movie night",
        description:
          "Looking for a projector by tomorrow evening. Can pick up around the Union.",
        category: "Events",
        deadline: plus(now, 2),
        groupId: "",
        budget: 15,
        status: "open",
        bids: [],
      },
    ],
    deals: [],
    chats: [],
    notices: [],
    saved: [],
  };
}
const storageKey = "boro-extras-v2";
const businessInfo: Record<string, { name: string; bio: string; tag: string }> =
  {
    amina: {
      name: "Amina’s Campus Bakes",
      bio: "Fresh cookies and small-event catering, made by a student baker. Choose quick pickup or book a club order ahead.",
      tag: "Baking · Catering",
    },
    leo: {
      name: "Leo’s Campus Cuts",
      bio: "Student barber offering clean cuts and quick appointment requests near Campustown.",
      tag: "Grooming · Barber",
    },
    jordan: {
      name: "Jordan Rivera Creative",
      bio: "Campus portraits, graduation photos, and short event sessions.",
      tag: "Photography",
    },
    maya: {
      name: "Maya Helps",
      bio: "Practical moving help and neighborhood errands from another student.",
      tag: "Moving · Help",
    },
  };
export default function Extras({
  page,
  account,
  now,
  marketView,
  savedOnly,
  search,
  category,
  modeFilter,
  sortBy,
  zone,
  community,
  existingListings,
  openExisting,
  openProfile,
  extraCreate,
  setExtraCreate,
  setPage,
}: Props) {
  const { saved, toggle: toggleSaved } = useSavedListings(account);
  const [data, setData] = useState<Store>(() =>
    demoStorage.read(storageKey, seed),
  );
  useEffect(() => demoStorage.write(storageKey, data), [data]);
  useEffect(() => {
    const reset = () => {
      setData(seed());
      setGroupId("");
      setModal(null);
      setToast("");
      setStorefrontOwner("");
      setThread("");
      setForm({});
    };
    window.addEventListener("boro:reset", reset);
    return () => window.removeEventListener("boro:reset", reset);
  }, []);
  const [modal, setModal] = useState<
    "detail" | "createGroup" | "urgent" | "bid" | "message" | "report" | null
  >(null);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupTab, setGroupTab] = useState<
    "feed" | "items" | "members" | "about"
  >("feed");
  const [thread, setThread] = useState("");
  const [forumSort, setForumSort] = useState<"new" | "active">("new");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [storefrontOwner, setStorefrontOwner] = useState("");
  const item = data.items.find((x) => x.id === selected);
  const group = data.groups.find((x) => x.id === groupId);
  const urgentPost = data.urgent.find((x) => x.id === selected);
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 3500);
  };
  const update = (fn: (s: Store) => Store) => setData((d) => fn(d));
  const open = (m: typeof modal, selectedId = "") => {
    setModal(m);
    setSelected(selectedId);
    setForm({});
    setError("");
    setSelectedPhoto(0);
  };
  const close = () => {
    setModal(null);
    setError("");
    setForm({});
    setDraftPhotos([]);
    setExtraCreate("");
  };
  const canSeeGroup = (gid: string) => {
    if (!gid) return true;
    const g = data.groups.find((x) => x.id === gid);
    return !g || g.privacy === "public" || g.members.includes(account);
  };
  const visibleItems = data.items
    .filter((x) => !savedOnly || saved.includes(x.id))
    .filter(
      (x) =>
        (marketView === "both" ||
          (marketView === "rent" && x.mode === "lease") ||
          (marketView === "buy" && x.mode !== "service")) &&
        canSeeGroup(x.groupId) &&
        (community === "women"
          ? x.groupId === "women"
          : x.groupId !== "women") &&
        (!search ||
          `${x.title} ${x.description} ${x.category}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (category === "All categories" || x.category === category) &&
        (modeFilter === "Any price" ||
          (modeFilter === "Paid rentals" && x.mode === "lease")) &&
        (zone === "Any zone" || x.zone === zone),
    )
    .sort((a, b) =>
      sortBy === "price-low"
        ? (a.mode === "lease" ? a.rate : a.price) -
          (b.mode === "lease" ? b.rate : b.price)
        : sortBy === "price-high"
          ? (b.mode === "lease" ? b.rate : b.price) -
            (a.mode === "lease" ? a.rate : a.price)
          : 0,
    );
  const visibleGroups = data.groups.filter(
    (g) => g.privacy === "public" || g.members.includes(account),
  );
  const activeUrgent = data.urgent
    .filter(
      (u) =>
        u.status === "open" &&
        new Date(u.deadline) > new Date(now) &&
        canSeeGroup(u.groupId) &&
        (community === "women" ? u.groupId === "women" : u.groupId !== "women"),
    )
    .sort((a, b) =>
      forumSort === "active"
        ? b.bids.length +
          (b.comments?.length || 0) -
          (a.bids.length + (a.comments?.length || 0))
        : new Date(b.deadline).getTime() - new Date(a.deadline).getTime(),
    );
  const listingChoices = [
    ...data.items
      .filter((x) => x.owner === account)
      .map((x) => ({ id: x.id, title: x.title })),
    ...existingListings
      .filter((x) => x.owner === account)
      .map((x) => ({ id: x.id, title: x.title })),
  ];
  function createItem() {
    const title = form.title?.trim(),
      description = form.description?.trim(),
      mode = extraCreate;
    if (!mode) return;
    if (
      !title ||
      !description ||
      !form.category ||
      !form.zone ||
      !form.start ||
      !form.end
    ) {
      setError(
        "Complete the title, description, category, zone, and availability.",
      );
      return;
    }
    if (!form.meetupPoint?.trim()) {
      setError("Add a public meetup location.");
      return;
    }
    if (form.end < form.start) {
      setError("Availability end must follow start.");
      return;
    }
    const price = Number(form.price || 0),
      rate = Number(form.rate || 0),
      buyout = Number(form.buyout || 0),
      deposit = Number(form.deposit || 0);
    if (
      (mode === "lease" && (rate <= 0 || buyout <= 0)) ||
      (mode !== "lease" && price <= 0) ||
      deposit < 0
    ) {
      setError("Enter a valid price, lease rate, buyout, and deposit.");
      return;
    }
    if (
      form.groupId &&
      !data.groups.find((g) => g.id === form.groupId)?.members.includes(account)
    ) {
      setError("Join this group before listing there.");
      return;
    }
    const x: Item = {
      id: id(),
      owner: account,
      title,
      description,
      mode,
      category: form.category,
      condition: form.condition || "Good",
      emoji:
        (
          {
            Fashion: "👗",
            Tech: "💻",
            "Art supplies": "🎨",
            Tools: "🛠️",
            Apartment: "📦",
            Photography: "📷",
            Sports: "🎾",
            Events: "🎤",
          } as Record<string, string>
        )[form.category] || "📦",
      price: mode === "lease" ? 0 : price,
      rate: mode === "lease" ? rate : 0,
      buyout: mode === "lease" ? buyout : 0,
      deposit,
      zone: form.zone,
      photos: draftPhotos,
      meetupType: form.meetupType || "campus",
      meetupPoint: form.meetupPoint?.trim() || "",
      groupId: form.groupId || "",
      start: form.start,
      end: form.end,
      limit: Math.max(1, Number(form.limit || 7)),
      leadDays:
        mode === "service"
          ? Math.max(0, Number(form.leadDays || 0))
          : undefined,
    };
    update((d) => ({ ...d, items: [x, ...d.items] }));
    close();
    if (mode === "service") {
      setStorefrontOwner(account);
      setPage("services");
    } else setPage("browse");
    notify(
      mode === "service"
        ? "Service added to your storefront"
        : "Listing published",
    );
  }
  function requestDeal() {
    if (!item) return;
    if (item.owner === account) {
      setError("Switch demo accounts to request your own listing.");
      return;
    }
    let start = form.start || "",
      end = form.end || "";
    if (item.mode === "lease") {
      if (
        !start ||
        !end ||
        new Date(start) <= new Date(now) ||
        new Date(end) <= new Date(start)
      ) {
        setError("Choose a future pickup and later return time.");
        return;
      }
      if (
        new Date(end).getTime() - new Date(start).getTime() >
        item.limit * 86400000
      ) {
        setError(`Maximum lease is ${item.limit} days.`);
        return;
      }
      if (day(start) < item.start || day(end) > item.end) {
        setError("Dates fall outside availability.");
        return;
      }
      if (
        data.deals.some(
          (d) =>
            d.itemId === item.id &&
            ["requested", "accepted", "active", "returning"].includes(
              d.status,
            ) &&
            new Date(start) < new Date(d.end) &&
            new Date(d.start) < new Date(end),
        )
      ) {
        setError("These dates overlap another lease.");
        return;
      }
    } else {
      if (item.mode === "service") {
        if (
          !form.delivery ||
          new Date(form.delivery).getTime() <
            new Date(now).getTime() + (item.leadDays || 0) * 86400000
        ) {
          setError(
            `Choose a service time at least ${item.leadDays || 0} day(s) from now.`,
          );
          return;
        }
        if (day(form.delivery) < item.start || day(form.delivery) > item.end) {
          setError("Service time falls outside availability.");
          return;
        }
        start = form.delivery;
        end = form.delivery;
      } else {
        start = now;
        end = now;
      }
      if (
        data.deals.some(
          (d) =>
            d.itemId === item.id &&
            ["requested", "accepted", "active"].includes(d.status),
        ) &&
        item.mode === "sale"
      ) {
        setError("This item already has a pending buyer.");
        return;
      }
    }
    if (form.agree !== "yes") {
      setError("Read and accept the demo terms first.");
      return;
    }
    const qty =
      item.mode === "service"
        ? Math.max(1, Math.floor(Number(form.quantity || 1)))
        : 1;
    if (item.mode === "service" && (!Number.isFinite(qty) || qty > 20)) {
      setError("Choose 1 to 20 service units.");
      return;
    }
    const amount =
      item.mode === "lease"
        ? item.rate *
          Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
          )
        : item.price * qty;
    const deal: Deal = {
      id: id(),
      itemId: item.id,
      buyer: account,
      seller: item.owner,
      mode: item.mode,
      status: "requested",
      created: now,
      start,
      end,
      amount,
      deposit: item.deposit,
      buyout: item.buyout,
      bought: false,
      quantity: qty,
      notes: form.notes?.trim() || "",
    };
    update((d) => ({
      ...d,
      deals: [deal, ...d.deals],
      notices: [
        {
          id: id(),
          user: item.owner,
          text: `${people[account]?.name} requested ${item.title}.`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
    }));
    close();
    setPage("loans");
    notify("Request sent");
  }
  function updateDeal(
    dealId: string,
    fn: (x: Deal) => Deal,
    notice?: { user: string; text: string },
  ) {
    update((d) => ({
      ...d,
      deals: d.deals.map((x) => (x.id === dealId ? fn(x) : x)),
      notices: notice
        ? [
            {
              id: id(),
              user: notice.user,
              text: notice.text,
              read: false,
              at: now,
            },
            ...d.notices,
          ]
        : d.notices,
    }));
  }
  function openScenario(kind: "cookies" | "camera" | "lighter") {
    open("urgent");
    const d = new Date(now);
    if (kind === "cookies") {
      d.setDate(d.getDate() + 7);
      d.setHours(17, 0, 0, 0);
      setForm({
        title: "Cookie catering for our club event",
        description:
          "Need a student baker for about 30 cookies next week. Please share flavors, price, and pickup options.",
        category: "Events",
        budget: "45",
        deadline: iso(d),
      });
    } else if (kind === "camera") {
      d.setDate(d.getDate() + 1);
      d.setHours(16, 0, 0, 0);
      setForm({
        title: "Digital camera needed tomorrow",
        description:
          "I checked with friends and nobody has a digicam available. Need one for a student event tomorrow; a compact camera is ideal.",
        category: "Photography",
        budget: "15",
        deadline: iso(d),
      });
    } else {
      d.setHours(Math.min(23, d.getHours() + 3), 0, 0, 0);
      setForm({
        title: "Need a lighter today",
        description:
          "Looking to borrow a lighter briefly near the Union today. Can meet in a public spot.",
        category: "Other",
        budget: "0",
        deadline: iso(d),
      });
    }
  }
  function postUrgent() {
    if (
      !form.title?.trim() ||
      !form.description?.trim() ||
      !form.deadline ||
      !form.category
    ) {
      setError("Add an item, details, category, and deadline.");
      return;
    }
    if (new Date(form.deadline) <= new Date(now)) {
      setError("Deadline must be in the future.");
      return;
    }
    const groupId = form.groupId || "";
    if (
      groupId &&
      !data.groups.find((g) => g.id === groupId)?.members.includes(account)
    ) {
      setError("Join the group first.");
      return;
    }
    const u: Urgent = {
      id: id(),
      author: account,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      deadline: form.deadline,
      groupId,
      budget: Math.max(0, Number(form.budget || 0)),
      status: "open",
      bids: [],
      votes: [],
      comments: [],
    };
    update((d) => ({ ...d, urgent: [u, ...d.urgent] }));
    close();
    setPage("requests");
    notify("Urgent request posted");
  }
  function placeBid() {
    if (!urgentPost) return;
    const amount = Number(form.amount);
    if (!form.message?.trim() || !Number.isFinite(amount) || amount < 0) {
      setError("Add a helpful message and a valid offer amount.");
      return;
    }
    const b: Bid = {
      id: id(),
      author: account,
      amount,
      message: form.message.trim(),
      itemId: form.itemId || "",
      at: now,
    };
    update((d) => ({
      ...d,
      urgent: d.urgent.map((u) =>
        u.id === urgentPost.id ? { ...u, bids: [...u.bids, b] } : u,
      ),
      notices: [
        {
          id: id(),
          user: urgentPost.author,
          text: `${people[account]?.name} offered to help with “${urgentPost.title}.”`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
    }));
    close();
    notify("Offer posted to the thread");
  }
  function acceptBid(u: Urgent, b: Bid) {
    update((d) => ({
      ...d,
      urgent: d.urgent.map((x) =>
        x.id === u.id ? { ...x, status: "fulfilled" } : x,
      ),
      notices: [
        {
          id: id(),
          user: b.author,
          text: `Your offer for “${u.title}” was chosen. Open Messages to coordinate.`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
      chats: [
        {
          id: id(),
          itemId: u.id,
          from: u.author,
          to: b.author,
          text: `Offer chosen for ${u.title}. Let's coordinate a public meetup.`,
          at: now,
          proposal: b.amount,
          accepted: true,
        },
        ...d.chats,
      ],
    }));
    setThread(u.id);
    setPage("messages");
    notify("Offer chosen; chat started");
  }
  function createGroup() {
    if (!form.name?.trim() || !form.description?.trim() || !form.category) {
      setError("Complete the group name, description, and category.");
      return;
    }
    const g: Group = {
      id: id(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      privacy: (form.privacy as Group["privacy"]) || "public",
      owner: account,
      members: [account],
      count: 1,
      cover: "custom",
      rules:
        form.rules?.trim() ||
        "Be respectful. Meet in public places and return items on time.",
      posts: [],
    };
    update((d) => ({ ...d, groups: [g, ...d.groups] }));
    setGroupId(g.id);
    setGroupTab("feed");
    close();
    setPage("groups");
    notify("Group created");
  }
  function sendChat() {
    if (!form.message?.trim() || !currentThread) return;
    const chat: Chat = {
      id: id(),
      itemId: currentThread.id,
      from: account,
      to: currentThread.other,
      text: form.message.trim(),
      at: now,
    };
    update((d) => ({
      ...d,
      chats: [...d.chats, chat],
      notices: [
        {
          id: id(),
          user: currentThread.other,
          text: `New message from ${people[account]?.name}.`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
    }));
    setForm({ ...form, message: "" });
    notify("Message sent");
  }
  function sendProposal() {
    if (!currentThread) return;
    const amount = Number(form.proposal);
    if (!Number.isFinite(amount) || amount < 0 || form.proposal === "") {
      notify("Enter a valid amount.");
      return;
    }
    const chat: Chat = {
      id: id(),
      itemId: currentThread.id,
      from: account,
      to: currentThread.other,
      text: `I propose ${money(amount)} for this Boro.`,
      at: now,
      proposal: amount,
      accepted: false,
    };
    update((d) => ({
      ...d,
      chats: [...d.chats, chat],
      notices: [
        {
          id: id(),
          user: currentThread.other,
          text: `${people[account]?.name} sent a price proposal.`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
    }));
    setForm({ ...form, proposal: "" });
    setProposalOpen(false);
    notify("Proposal sent");
  }
  function acceptProposal(chat: Chat) {
    update((d) => ({
      ...d,
      chats: d.chats.map((c) =>
        c.id === chat.id ? { ...c, accepted: true } : c,
      ),
      deals: d.deals.map((v) =>
        v.itemId === chat.itemId &&
        ["requested", "accepted"].includes(v.status) &&
        ((v.buyer === chat.from && v.seller === chat.to) ||
          (v.seller === chat.from && v.buyer === chat.to))
          ? { ...v, amount: chat.proposal || v.amount }
          : v,
      ),
      notices: [
        {
          id: id(),
          user: chat.from,
          text: `${people[account]?.name} accepted your ${money(chat.proposal || 0)} proposal.`,
          read: false,
          at: now,
        },
        ...d.notices,
      ],
    }));
    notify("Proposal accepted and saved to the pending deal");
  }
  const threads = useMemo(() => {
    const map = new Map<string, { id: string; other: string; last: Chat }>();
    for (const c of data.chats.filter(
      (c) => c.from === account || c.to === account,
    )) {
      const other = c.from === account ? c.to : c.from;
      const key = `${c.itemId}|${other}`;
      map.set(key, { id: c.itemId, other, last: c });
    }
    return [...map.values()].reverse();
  }, [data.chats, account]);
  const currentThread =
    threads.find((t) => `${t.id}|${t.other}` === thread) ||
    threads.find((t) => t.id === thread) ||
    threads[0];
  return (
    <>
      {page === "browse" && (
        <section className="extraSection">
          <div className="sectionHeading">
            <h2>
              {marketView === "rent"
                ? "Try before you buy"
                : marketView === "buy"
                  ? "Shop student listings"
                  : "Secondhand finds & student services"}
            </h2>
            <span>{visibleItems.length} offers</span>
          </div>
          <p className="extraLead">
            More ways to find what you need, from people on your campus.
          </p>
          <div className="grid">
            {visibleItems.map((x) => (
              <MarketplaceCard
                key={x.id}
                id={x.id}
                account={account}
                title={x.title}
                category={x.category}
                description={x.description}
                condition={x.mode === "service" ? undefined : x.condition}
                photo={x.photos?.[0]}
                owner={x.owner}
                ownerName={people[x.owner]?.name || "Student"}
                ownerDetail={
                  x.mode === "service"
                    ? businessInfo[x.owner]?.name || "Student maker"
                    : "Illinois student"
                }
                zone={x.zone}
                kind={x.mode}
                amount={x.mode === "lease" ? x.rate : x.price}
                onOpen={() => open("detail", x.id)}
                onProfile={() => openProfile(x.owner)}
              />
            ))}
          </div>
          {visibleItems.length === 0 && (
            <div className="empty">
              No shop or service offers match these filters.
            </div>
          )}
        </section>
      )}
      {page === "browse" &&
        !search &&
        category === "All categories" &&
        !savedOnly && (
          <section className="campusConversations">
            <div className="sectionHeading">
              <div>
                <span className="eyebrow">BEYOND THE LISTINGS</span>
                <h2>Around campus</h2>
              </div>
              <button onClick={() => setPage("groups")}>
                Find your circles <ChevronRight size={15} />
              </button>
            </div>
            <div className="campusPostGrid">
              {visibleGroups
                .filter((g) => g.posts.length)
                .slice(0, 2)
                .map((g) => {
                  const post = g.posts[g.posts.length - 1];
                  return (
                    <button
                      className="campusPost"
                      key={g.id}
                      onClick={() => {
                        setGroupId(g.id);
                        setPage("groups");
                      }}
                    >
                      <span className="postAuthor">
                        {avatar(post.author)}
                        <span>
                          <b>{people[post.author]?.name}</b>
                          <small>{g.name}</small>
                        </span>
                        <MessageCircle size={17} />
                      </span>
                      <p>{post.text}</p>
                      <span className="postLink">
                        Join the conversation <ChevronRight size={14} />
                      </span>
                    </button>
                  );
                })}
              {activeUrgent.slice(0, 1).map((post) => (
                <button
                  className="campusPost requestPost"
                  key={post.id}
                  onClick={() => {
                    setPage("requests");
                    open("urgent", post.id);
                  }}
                >
                  <span className="postAuthor">
                    {avatar(post.author)}
                    <span>
                      <b>{people[post.author]?.name}</b>
                      <small>Campus help board</small>
                    </span>
                    <Clock3 size={17} />
                  </span>
                  <p>{post.title}</p>
                  <span className="postLink">
                    See request · budget {money(post.budget)}{" "}
                    <ChevronRight size={14} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      {page === "services" && (
        <section className="extraPage servicePage">
          <div className="pageHead">
            <div>
              <div className="eyebrow">STUDENT BUSINESSES</div>
              <h1>
                {storefrontOwner
                  ? businessInfo[storefrontOwner]?.name
                  : "Good people. Useful skills."}
              </h1>
              <p>
                {storefrontOwner
                  ? businessInfo[storefrontOwner]?.bio
                  : "Book a baker, barber, photographer, or campus helper directly from a student storefront."}
              </p>
            </div>
            <button
              className="btn primary"
              onClick={() => setExtraCreate("service")}
            >
              <Plus size={16} /> Post a service
            </button>
          </div>
          {storefrontOwner ? (
            <>
              <button
                className="backLink"
                onClick={() => setStorefrontOwner("")}
              >
                ← All student businesses
              </button>
              <button
                className="storefrontProfile"
                onClick={() => openProfile(storefrontOwner)}
              >
                {avatar(storefrontOwner)}
                <span>
                  <b>{people[storefrontOwner]?.name}</b>
                  <small>Meet the student behind the business</small>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="serviceGrid">
                {data.items
                  .filter(
                    (x) =>
                      x.mode === "service" &&
                      x.owner === storefrontOwner &&
                      canSeeGroup(x.groupId),
                  )
                  .map((x) => (
                    <article className="serviceCard" key={x.id}>
                      <button
                        className="servicePhoto"
                        onClick={() => open("detail", x.id)}
                      >
                        <Photo
                          title={x.title}
                          category={x.category}
                          fallback={x.emoji}
                          src={x.photos?.[0]}
                        />
                      </button>
                      <div>
                        <span className="eyebrow">
                          {x.leadDays
                            ? `${x.leadDays} DAY NOTICE`
                            : "SAME-DAY REQUESTS"}
                        </span>
                        <h3>{x.title}</h3>
                        <p>{x.description}</p>
                        <div className="serviceFoot">
                          <b>{money(x.price)}</b>
                          <button
                            className="btn primary"
                            onClick={() => open("detail", x.id)}
                          >
                            Start order
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="serviceIntro">
                <b>Order from a student, right on campus.</b>
                <span>
                  Choose a service, share a time and a few details, and let the
                  student confirm your request.
                </span>
              </div>
              <div className="storefrontGrid">
                {Object.entries(businessInfo).map(([owner, biz]) => (
                  <button
                    className="storefrontCard"
                    key={owner}
                    onClick={() => setStorefrontOwner(owner)}
                  >
                    <div className="storefrontCover">
                      <Photo
                        title={
                          owner === "amina"
                            ? "Quick cookie box"
                            : owner === "leo"
                              ? "Student barber cut"
                              : owner === "jordan"
                                ? "Portrait photo session"
                                : "Moving help — one hour"
                        }
                        category={
                          owner === "amina"
                            ? "Events"
                            : owner === "leo"
                              ? "Other"
                              : owner === "jordan"
                                ? "Photography"
                                : "Apartment"
                        }
                      />
                    </div>
                    <div className="storefrontBody">
                      {avatar(owner)}
                      <small>{biz.tag}</small>
                      <b>{biz.name}</b>
                      <p>{biz.bio}</p>
                      <span>
                        {
                          data.items.filter(
                            (x) => x.mode === "service" && x.owner === owner,
                          ).length
                        }{" "}
                        {data.items.filter(
                          (x) => x.mode === "service" && x.owner === owner,
                        ).length === 1
                          ? "service"
                          : "services"}{" "}
                        · View storefront <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="sectionHeading">
                <h2>Quick to order</h2>
                <span>Student offers</span>
              </div>
              <div className="serviceGrid">
                {data.items
                  .filter((x) => x.mode === "service" && canSeeGroup(x.groupId))
                  .map((x) => (
                    <article className="serviceCard" key={x.id}>
                      <button
                        className="servicePhoto"
                        onClick={() => open("detail", x.id)}
                      >
                        <Photo
                          title={x.title}
                          category={x.category}
                          fallback={x.emoji}
                          src={x.photos?.[0]}
                        />
                      </button>
                      <div>
                        <span className="eyebrow">
                          {x.leadDays
                            ? `${x.leadDays} DAY NOTICE`
                            : "SAME-DAY REQUESTS"}
                        </span>
                        <h3>{x.title}</h3>
                        <p>
                          {businessInfo[x.owner]?.name || people[x.owner]?.name}
                        </p>
                        <div className="serviceFoot">
                          <b>{money(x.price)}</b>
                          <button
                            className="btn primary"
                            onClick={() => open("detail", x.id)}
                          >
                            Start order
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </>
          )}
        </section>
      )}
      {page === "requests" && (
        <section className="extraSection">
          <div className="sectionHeading">
            <h1>Ask your campus</h1>
            <button className="btn primary" onClick={() => open("urgent")}>
              <Plus size={16} /> Post urgent request
            </button>
          </div>
          <p className="extraLead">
            Post a time-sensitive ask, discuss details, and compare offers from
            students nearby.
          </p>
          <div className="scenarioStrip">
            <span>Try a scenario</span>
            <button onClick={() => openScenario("cookies")}>
              <b>Next week</b> 🍪 Cookie catering
            </button>
            <button onClick={() => openScenario("camera")}>
              <b>Tomorrow</b> 📷 Digicam
            </button>
            <button onClick={() => openScenario("lighter")}>
              <b>Today</b> 🔥 Lighter
            </button>
          </div>
          <div className="forumSort">
            <button
              className={forumSort === "new" ? "active" : ""}
              onClick={() => setForumSort("new")}
            >
              ✦ Newest
            </button>
            <button
              className={forumSort === "active" ? "active" : ""}
              onClick={() => setForumSort("active")}
            >
              ▤ Most active
            </button>
            <span>
              Community discussion · offers are proposals, not charges
            </span>
          </div>
          <div className="forumList">
            {activeUrgent.map((u) => (
              <article className="forumCard redditCard" key={u.id}>
                <div className="voteRail">
                  <button
                    aria-label={
                      u.votes?.includes(account)
                        ? "Remove upvote"
                        : "Upvote request"
                    }
                    className={u.votes?.includes(account) ? "voted" : ""}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        urgent: d.urgent.map((x) =>
                          x.id === u.id
                            ? {
                                ...x,
                                votes: x.votes?.includes(account)
                                  ? x.votes.filter((v) => v !== account)
                                  : [...(x.votes || []), account],
                              }
                            : x,
                        ),
                      }))
                    }
                  >
                    ▲
                  </button>
                  <b>{u.votes?.length || 0}</b>
                  <small>votes</small>
                </div>
                <div className="forumContent">
                  <div className="forumHead">
                    <span className="pill orange">
                      <Clock3 size={12} /> URGENT
                    </span>
                    <span>
                      {u.groupId
                        ? data.groups.find((g) => g.id === u.groupId)?.name
                        : "All UIUC"}
                    </span>
                    <span>Needed {fmt(u.deadline)}</span>
                  </div>
                  <h3>{u.title}</h3>
                  <p>{u.description}</p>
                  <div className="forumAuthor">
                    <button
                      className="profileTap"
                      onClick={() => openProfile(u.author)}
                    >
                      {avatar(u.author)}
                      <b>{people[u.author]?.name}</b>
                    </button>
                    <span>
                      · Budget{" "}
                      {u.budget ? `up to ${money(u.budget)}` : "open to offers"}
                    </span>
                  </div>
                  <div className="forumMeta">
                    <MessageCircle size={14} />
                    {u.comments?.length || 0} comments <span>·</span>
                    {u.bids.length} offers
                  </div>
                  <div className="forumComments">
                    {u.comments?.map((c) => (
                      <div className="forumComment" key={c.id}>
                        {avatar(c.author)}
                        <div>
                          <b>{people[c.author]?.name}</b>
                          <p>{c.text}</p>
                        </div>
                        <small>{fmt(c.at)}</small>
                      </div>
                    ))}
                    <div className="commentComposer">
                      <input
                        aria-label={`Comment on ${u.title}`}
                        placeholder="Ask a question or share a tip..."
                        value={form[`comment-${u.id}`] || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [`comment-${u.id}`]: e.target.value,
                          })
                        }
                      />
                      <button
                        className="btn subtle"
                        onClick={() => {
                          const text = form[`comment-${u.id}`]?.trim();
                          if (!text) return;
                          update((d) => ({
                            ...d,
                            urgent: d.urgent.map((x) =>
                              x.id === u.id
                                ? {
                                    ...x,
                                    comments: [
                                      ...(x.comments || []),
                                      {
                                        id: id(),
                                        author: account,
                                        text,
                                        at: now,
                                      },
                                    ],
                                  }
                                : x,
                            ),
                            notices:
                              u.author !== account
                                ? [
                                    {
                                      id: id(),
                                      user: u.author,
                                      text: `${people[account]?.name} commented on your urgent request.`,
                                      read: false,
                                      at: now,
                                    },
                                    ...d.notices,
                                  ]
                                : d.notices,
                          }));
                          setForm({ ...form, [`comment-${u.id}`]: "" });
                        }}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                  <div className="bidThread">
                    <b>
                      {u.bids.length} {u.bids.length === 1 ? "offer" : "offers"}{" "}
                      from your community
                    </b>
                    {u.bids.map((b) => (
                      <div className="bid" key={b.id}>
                        <div>
                          <button
                            className="profileTap"
                            onClick={() => openProfile(b.author)}
                          >
                            {avatar(b.author)}
                            <b>{people[b.author]?.name}</b>
                          </button>
                          <strong>{money(b.amount)}</strong>
                        </div>
                        <p>{b.message}</p>
                        {b.itemId && (
                          <small>
                            Attached:{" "}
                            {[...data.items, ...existingListings].find(
                              (x) => x.id === b.itemId,
                            )?.title || "Listing"}
                          </small>
                        )}
                        {u.author === account && (
                          <button
                            className="btn outline"
                            onClick={() => acceptBid(u, b)}
                          >
                            Choose offer & chat
                          </button>
                        )}
                      </div>
                    ))}
                    {u.author !== account && (
                      <button
                        className="btn outline"
                        onClick={() => open("bid", u.id)}
                      >
                        I can help · make an offer
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {activeUrgent.length === 0 && (
            <div className="empty">
              No open urgent requests in this community.
            </div>
          )}
        </section>
      )}
      {page === "groups" && (
        <section className="extraPage">
          {!group ? (
            <>
              <div className="pageHead">
                <div>
                  <div className="eyebrow">UIUC CAMPUS GROUPS</div>
                  <h1>Groups at Illinois.</h1>
                  <p>
                    Join a UIUC circle, share what you have, and borrow what you
                    need.
                  </p>
                </div>
                <button
                  className="btn primary"
                  onClick={() => open("createGroup")}
                >
                  <Plus size={17} /> Create group
                </button>
              </div>
              <div className="groupGrid">
                {visibleGroups.map((g) => (
                  <article className="groupCard" key={g.id}>
                    <div className={`groupCover ${g.cover}`}>
                      <img src={groupPhotos[g.cover]} alt="" loading="lazy" />
                    </div>
                    <div className="groupBody">
                      <span className="eyebrow">
                        {g.privacy === "public"
                          ? "OPEN COMMUNITY"
                          : "PRIVATE GROUP"}
                      </span>
                      <h3>{g.name}</h3>
                      <p>{g.description}</p>
                      <div className="groupFoot">
                        <span>
                          <Users size={14} />
                          {g.count.toLocaleString()} members
                        </span>
                        <button
                          className="btn outline"
                          onClick={() => {
                            setGroupId(g.id);
                            setGroupTab("feed");
                          }}
                        >
                          View group <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <button className="backLink" onClick={() => setGroupId("")}>
                ← All groups
              </button>
              <div className={`groupDetailCover ${group.cover}`}>
                <img src={groupPhotos[group.cover]} alt="" />
              </div>
              <div className="groupDetailHead">
                <div>
                  <span className="eyebrow">
                    {group.privacy.toUpperCase()} COMMUNITY
                  </span>
                  <h1>{groupName(group)}</h1>
                  <p>{group.description}</p>
                  <small>
                    {group.count.toLocaleString()} members · University of
                    Illinois Urbana-Champaign
                  </small>
                </div>
                {group.members.includes(account) ? (
                  <button
                    className="btn subtle"
                    onClick={() => {
                      if (group.owner === account) {
                        notify(
                          "Group creators stay members. Invite others below.",
                        );
                        return;
                      }
                      update((d) => ({
                        ...d,
                        groups: d.groups.map((g) =>
                          g.id === group.id
                            ? {
                                ...g,
                                members: g.members.filter((m) => m !== account),
                                count: g.count - 1,
                              }
                            : g,
                        ),
                      }));
                      notify("Left group");
                    }}
                  >
                    Leave group
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => {
                      if (group.privacy !== "public") {
                        notify(
                          "Private groups require a moderator invitation.",
                        );
                        return;
                      }
                      update((d) => ({
                        ...d,
                        groups: d.groups.map((g) =>
                          g.id === group.id
                            ? {
                                ...g,
                                members: [...g.members, account],
                                count: g.count + 1,
                              }
                            : g,
                        ),
                      }));
                      notify("Joined group");
                    }}
                  >
                    Join group
                  </button>
                )}
              </div>
              <div className="groupTabs">
                {(["feed", "items", "members", "about"] as const).map((t) => (
                  <button
                    key={t}
                    className={groupTab === t ? "active" : ""}
                    onClick={() => setGroupTab(t)}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {groupTab === "feed" && (
                <div className="groupFeed">
                  {group.members.includes(account) && (
                    <div className="postComposer">
                      <textarea
                        value={form.post || ""}
                        onChange={(e) =>
                          setForm({ ...form, post: e.target.value })
                        }
                        placeholder="Share an item, ask a question, or thank a neighbor..."
                      />
                      <button
                        className="btn primary"
                        onClick={() => {
                          if (!form.post?.trim()) return;
                          update((d) => ({
                            ...d,
                            groups: d.groups.map((g) =>
                              g.id === group.id
                                ? {
                                    ...g,
                                    posts: [
                                      {
                                        id: id(),
                                        author: account,
                                        text: form.post.trim(),
                                        at: now,
                                      },
                                      ...g.posts,
                                    ],
                                  }
                                : g,
                            ),
                          }));
                          setForm({ ...form, post: "" });
                          notify("Posted to group");
                        }}
                      >
                        Post to group
                      </button>
                    </div>
                  )}
                  {group.posts.map((p) => (
                    <article className="groupPost" key={p.id}>
                      <div>
                        {avatar(p.author)}
                        <b>{people[p.author]?.name}</b>
                        <small>{fmt(p.at)}</small>
                      </div>
                      <p>{p.text}</p>
                    </article>
                  ))}
                  {group.posts.length === 0 && (
                    <div className="empty">
                      Start the conversation in this community.
                    </div>
                  )}
                </div>
              )}
              {groupTab === "items" && (
                <div className="groupItems">
                  <div className="sectionHeading">
                    <h2>Group inventory</h2>
                    {group.members.includes(account) && (
                      <button
                        className="btn outline"
                        onClick={() => {
                          setForm({ ...form, groupId: group.id });
                          setExtraCreate("sale");
                        }}
                      >
                        List in group
                      </button>
                    )}
                  </div>
                  <div className="grid">
                    {data.items
                      .filter((x) => x.groupId === group.id)
                      .map((x) => (
                        <article className="listingCard" key={x.id}>
                          <button
                            className="itemImage"
                            onClick={() => open("detail", x.id)}
                          >
                            <Photo
                              title={x.title}
                              category={x.category}
                              fallback={x.emoji}
                              src={x.photos?.[0]}
                            />
                            <em>{modeName(x.mode)}</em>
                          </button>
                          <div className="cardBody">
                            <div className="cardTitle">
                              <button onClick={() => open("detail", x.id)}>
                                {x.title}
                              </button>
                              <strong>
                                {x.mode === "lease"
                                  ? `${money(x.rate)}/day`
                                  : money(x.price)}
                              </strong>
                            </div>
                            <div className="meta">
                              {people[x.owner]?.name} · {x.zone}
                            </div>
                          </div>
                        </article>
                      ))}
                    {(group.id === "fashion" ||
                      group.id === "engineering" ||
                      group.id === "women") &&
                      existingListings
                        .filter((x) =>
                          group.id === "women"
                            ? x.audience === "women"
                            : group.id === "fashion"
                              ? x.title.toLowerCase().includes("dress") ||
                                x.title.toLowerCase().includes("sewing")
                              : x.category === "Tools" ||
                                x.category === "Calculator",
                        )
                        .map((x) => (
                          <article className="listingCard" key={x.id}>
                            <button
                              className="itemImage"
                              onClick={() => openExisting(x.id)}
                            >
                              <Photo
                                title={x.title}
                                category={x.category}
                                fallback={x.emoji}
                                src={x.photos?.[0]}
                              />
                              <em>Borrow</em>
                            </button>
                            <div className="cardBody">
                              <div className="cardTitle">
                                <button onClick={() => openExisting(x.id)}>
                                  {x.title}
                                </button>
                                <strong>Borrow</strong>
                              </div>
                              <div className="meta">
                                {people[x.owner]?.name} · {x.zone}
                              </div>
                            </div>
                          </article>
                        ))}
                  </div>
                </div>
              )}
              {groupTab === "members" && (
                <div className="memberGrid">
                  {group.members.map((u) => (
                    <div className="memberCard" key={u}>
                      <button
                        className="profileTap"
                        onClick={() => openProfile(u)}
                      >
                        {avatar(u)}
                        <div>
                          <b>{people[u]?.name}</b>
                          <small>
                            ✓ Demo campus member ·{" "}
                            {u === group.owner ? "Group creator" : "Member"}
                          </small>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {groupTab === "about" && (
                <div className="aboutGroup">
                  <h3>About this community</h3>
                  <p>{group.description}</p>
                  <b>Group rules</b>
                  <p>{group.rules}</p>
                  <b>Membership</b>
                  <p>
                    {group.privacy === "public"
                      ? "Open to demo campus accounts."
                      : "Invite and moderator approval in this prototype."}
                  </p>
                  {group.owner === account && (
                    <div className="inviteBox">
                      <label>
                        Invite a demo member
                        <select
                          value={form.invitee || ""}
                          onChange={(e) =>
                            setForm({ ...form, invitee: e.target.value })
                          }
                        >
                          <option value="">Choose account</option>
                          {Object.keys(people)
                            .filter((u) => !group.members.includes(u))
                            .map((u) => (
                              <option key={u} value={u}>
                                {people[u].name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        className="btn outline"
                        onClick={() => {
                          if (!form.invitee) return;
                          update((d) => ({
                            ...d,
                            groups: d.groups.map((g) =>
                              g.id === group.id
                                ? {
                                    ...g,
                                    members: [...g.members, form.invitee],
                                    count: g.count + 1,
                                  }
                                : g,
                            ),
                            notices: [
                              {
                                id: id(),
                                user: form.invitee,
                                text: `You were invited to ${group.name}.`,
                                read: false,
                                at: now,
                              },
                              ...d.notices,
                            ],
                          }));
                          setForm({ ...form, invitee: "" });
                          notify("Demo invitation accepted");
                        }}
                      >
                        Invite
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}
      {page === "loans" && (
        <section className="extraSection">
          <div className="sectionHeading">
            <h2>Purchases, services & leases</h2>
          </div>
          <div className="loanList">
            {data.deals
              .filter((d) => d.buyer === account || d.seller === account)
              .map((d) => {
                const x = data.items.find((i) => i.id === d.itemId);
                if (!x) return null;
                const buyer = d.buyer === account;
                return (
                  <article className="loanCard" key={d.id}>
                    <div className="loanTop">
                      <div className="loanImage">
                        <Photo
                          title={x.title}
                          category={x.category}
                          fallback={x.emoji}
                          src={x.photos?.[0]}
                        />
                      </div>
                      <div>
                        <h3>{x.title}</h3>
                        <p>
                          {modeName(d.mode)} · {buyer ? "From" : "To"}{" "}
                          {people[buyer ? d.seller : d.buyer]?.name}
                        </p>
                      </div>
                      <span className={`status ${d.status}`}>{d.status}</span>
                    </div>
                    <div className="loanDates">
                      <span>
                        <b>Agreed amount</b>
                        {money(d.amount)}
                      </span>
                      {d.mode === "service" && (
                        <>
                          <span>
                            <b>Requested for</b>
                            {fmt(d.start)}
                          </span>
                          <span>
                            <b>Quantity</b>
                            {d.quantity || 1}
                          </span>
                        </>
                      )}
                      {d.mode === "lease" && (
                        <>
                          <span>
                            <b>Lease dates</b>
                            {fmt(d.start)} → {fmt(d.end)}
                          </span>
                          <span>
                            <b>Refundable demo hold</b>
                            {money(d.deposit)}
                          </span>
                        </>
                      )}
                    </div>
                    {d.mode === "service" && d.notes && (
                      <div className="notice">
                        <b>Order details:</b> {d.notes}
                      </div>
                    )}
                    <div className="notice">
                      {d.mode === "lease"
                        ? `Buyout ${money(d.buyout)}. Rental payments credit toward buyout; deposit is released on return or purchase. All amounts are simulated.`
                        : "Meet in a public campus space. Payment is simulated in this prototype."}
                    </div>
                    {d.mode === "lease" && (
                      <ConditionEvidence
                        photos={d.conditionPhotos}
                        account={account}
                        name={(userId) => people[userId]?.name || userId}
                        canBefore={d.status === "active"}
                        canAfter={
                          d.status === "active" || d.status === "returning"
                        }
                        onUpload={(stage, image) => {
                          updateDeal(d.id, (v) => ({
                            ...v,
                            conditionPhotos: [
                              ...(v.conditionPhotos || []).filter(
                                (p) => !(p.stage === stage && p.by === account),
                              ),
                              { id: id(), stage, by: account, at: now, image },
                            ],
                          }));
                          notify(
                            `${stage === "before" ? "Pickup" : "Return"} condition photo saved`,
                          );
                        }}
                      />
                    )}
                    <div className="loanActions">
                      {d.status === "requested" && !buyer && (
                        <>
                          <button
                            className="btn primary"
                            onClick={() =>
                              updateDeal(
                                d.id,
                                (v) => ({ ...v, status: "accepted" }),
                                {
                                  user: d.buyer,
                                  text: `Your request for ${x.title} was accepted.`,
                                },
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="btn subtle"
                            onClick={() =>
                              updateDeal(
                                d.id,
                                (v) => ({ ...v, status: "cancelled" }),
                                {
                                  user: d.buyer,
                                  text: `Your request for ${x.title} was declined.`,
                                },
                              )
                            }
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {d.status === "accepted" && buyer && (
                        <button
                          className="btn primary"
                          onClick={() => {
                            updateDeal(
                              d.id,
                              (v) => ({ ...v, status: "active" }),
                              {
                                user: d.seller,
                                text: `${people[account]?.name} confirmed ${x.title}.`,
                              },
                            );
                            notify("Simulated checkout complete");
                          }}
                        >
                          Confirm · simulated checkout
                        </button>
                      )}
                      {d.status === "active" && d.mode === "lease" && buyer && (
                        <>
                          <button
                            className="btn primary"
                            onClick={() => {
                              updateDeal(
                                d.id,
                                (v) => ({
                                  ...v,
                                  status: "completed",
                                  bought: true,
                                }),
                                {
                                  user: d.seller,
                                  text: `${people[account]?.name} chose to buy ${x.title}.`,
                                },
                              );
                              notify(
                                `Purchase simulated. Buyout balance ${money(Math.max(0, d.buyout - d.amount))}; deposit released.`,
                              );
                            }}
                          >
                            Buy for {money(Math.max(0, d.buyout - d.amount))}
                          </button>
                          <button
                            className="btn subtle"
                            onClick={() =>
                              updateDeal(
                                d.id,
                                (v) => ({ ...v, status: "returning" }),
                                {
                                  user: d.seller,
                                  text: `Return recorded for ${x.title}.`,
                                },
                              )
                            }
                          >
                            Record return
                          </button>
                        </>
                      )}
                      {d.status === "returning" && !buyer && (
                        <button
                          className="btn primary"
                          onClick={() => {
                            updateDeal(
                              d.id,
                              (v) => ({ ...v, status: "completed" }),
                              {
                                user: d.buyer,
                                text: `Return of ${x.title} confirmed; demo deposit released.`,
                              },
                            );
                            notify("Return confirmed; demo deposit released");
                          }}
                        >
                          Confirm return
                        </button>
                      )}
                      {d.status === "active" &&
                        d.mode !== "lease" &&
                        !buyer && (
                          <button
                            className="btn primary"
                            onClick={() => {
                              updateDeal(
                                d.id,
                                (v) => ({ ...v, status: "completed" }),
                                {
                                  user: d.buyer,
                                  text: `${x.title} marked complete.`,
                                },
                              );
                              notify("Transaction completed");
                            }}
                          >
                            Mark complete
                          </button>
                        )}
                      {!["completed", "cancelled"].includes(d.status) && (
                        <button
                          className="btn outline"
                          onClick={() => {
                            setThread(d.itemId);
                            setPage("messages");
                          }}
                        >
                          Message {buyer ? "seller" : "requester"}
                        </button>
                      )}
                    </div>
                    {d.status === "completed" && (
                      <div className="notice">
                        Completed ·{" "}
                        {d.bought
                          ? "item purchased, demo deposit released"
                          : d.mode === "lease"
                            ? "item returned, demo deposit released"
                            : "handoff confirmed"}
                      </div>
                    )}
                  </article>
                );
              })}
          </div>
        </section>
      )}
      {page === "messages" && (
        <section className="extraPage">
          <div className="pageHead">
            <div>
              <div className="eyebrow">CAMPUS CONVERSATIONS</div>
              <h1>Messages & negotiation</h1>
              <p>
                Coordinate a public meetup and make clear, nonbinding price
                proposals.
              </p>
            </div>
          </div>
          <div className="messageLayout">
            <div className="threadList">
              {threads.map((t) => (
                <button
                  key={`${t.id}|${t.other}`}
                  className={
                    currentThread?.id === t.id &&
                    currentThread.other === t.other
                      ? "active"
                      : ""
                  }
                  onClick={() => setThread(`${t.id}|${t.other}`)}
                >
                  {avatar(t.other)}
                  <span>
                    <b>{people[t.other]?.name}</b>
                    <small>{t.last.text}</small>
                  </span>
                </button>
              ))}
              {threads.length === 0 && (
                <div className="empty">
                  No conversations yet. Message someone from a listing or choose
                  a forum offer.
                </div>
              )}
            </div>
            {currentThread && (
              <div className="chatPane">
                <div className="chatTitle">
                  <b>
                    {data.items.find((x) => x.id === currentThread.id)?.title ||
                      data.urgent.find((x) => x.id === currentThread.id)
                        ?.title ||
                      "Boro conversation"}
                  </b>
                  <button
                    className="profileTap"
                    onClick={() => openProfile(currentThread.other)}
                  >
                    {avatar(currentThread.other)} With{" "}
                    {people[currentThread.other]?.name} · View profile
                  </button>
                </div>
                <div className="chatMessages">
                  {data.chats
                    .filter(
                      (c) =>
                        c.itemId === currentThread.id &&
                        ((c.from === account && c.to === currentThread.other) ||
                          (c.to === account && c.from === currentThread.other)),
                    )
                    .map((c) => (
                      <div
                        className={
                          c.from === account ? "bubble mine" : "bubble"
                        }
                        key={c.id}
                      >
                        <b>{people[c.from]?.name}</b>
                        <p>{c.text}</p>
                        {c.proposal !== undefined && (
                          <div className="proposalCard">
                            <strong>{money(c.proposal)} proposal</strong>
                            <span>
                              {c.accepted
                                ? "Agreed in chat"
                                : "Awaiting response"}
                            </span>
                            {!c.accepted && c.to === account && (
                              <div>
                                <button onClick={() => acceptProposal(c)}>
                                  Accept proposal
                                </button>
                                <button
                                  onClick={() => {
                                    setProposalOpen(true);
                                    setForm({
                                      ...form,
                                      proposal: String(c.proposal),
                                    });
                                  }}
                                >
                                  Counter
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <small>{fmt(c.at)}</small>
                      </div>
                    ))}
                </div>
                <div className="suggested">
                  {[
                    "Where should we meet?",
                    "Can we adjust the time?",
                    "I returned the item.",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, message: t })}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    className="negotiateBtn"
                    onClick={() => setProposalOpen(!proposalOpen)}
                  >
                    ↔ Propose price
                  </button>
                </div>
                {proposalOpen && (
                  <div className="proposalComposer">
                    <label>
                      Proposed total ($)
                      <input
                        type="number"
                        min="0"
                        value={form.proposal || ""}
                        onChange={(e) =>
                          setForm({ ...form, proposal: e.target.value })
                        }
                      />
                    </label>
                    <button className="btn outline" onClick={sendProposal}>
                      Send proposal
                    </button>
                    <small>
                      No charge is made. Accepting updates a pending demo deal.
                    </small>
                  </div>
                )}
                <div className="chatComposer">
                  <input
                    aria-label="Write a message"
                    value={form.message || ""}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                    placeholder="Write a message..."
                  />
                  <button className="btn primary" onClick={sendChat}>
                    <Send size={16} /> Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      {page === "notifications" && (
        <section className="extraPage">
          <div className="pageHead">
            <div>
              <div className="eyebrow">WHAT'S NEW</div>
              <h1>Notifications</h1>
              <p>Requests, offers, and messages from your campus circle.</p>
            </div>
            <button
              className="btn outline"
              onClick={() =>
                update((d) => ({
                  ...d,
                  notices: d.notices.map((n) =>
                    n.user === account ? { ...n, read: true } : n,
                  ),
                }))
              }
            >
              Mark all read
            </button>
          </div>
          <div className="noticeList">
            {data.notices
              .filter((n) => n.user === account)
              .map((n) => (
                <button
                  key={n.id}
                  className={n.read ? "read" : ""}
                  onClick={() => {
                    update((d) => ({
                      ...d,
                      notices: d.notices.map((x) =>
                        x.id === n.id ? { ...x, read: true } : x,
                      ),
                    }));
                    setPage(n.text.includes("message") ? "messages" : "loans");
                  }}
                >
                  <Bell size={18} />
                  <span>
                    {n.text}
                    <small>{fmt(n.at)}</small>
                  </span>
                  {!n.read && <i />}
                </button>
              ))}
            {!data.notices.some((n) => n.user === account) && (
              <div className="empty">
                You're all caught up. New requests and messages will show here.
              </div>
            )}
          </div>
        </section>
      )}
      {extraCreate && (
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
            aria-label="Create marketplace listing"
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="modalContent">
              <div className="eyebrow">
                {modeName(extraCreate).toUpperCase()}
              </div>
              <h2>
                {extraCreate === "service"
                  ? "Offer a service"
                  : extraCreate === "sale"
                    ? "Sell an item"
                    : "List a lease-to-buy item"}
              </h2>
              <p>
                {extraCreate === "lease"
                  ? "Set a daily rate and buyout price. In this demo, rental payments credit toward the buyout."
                  : "Students can request your offer and coordinate a public meetup."}
              </p>
              <div className="formGrid">
                <label className="wide">
                  Title
                  <input
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder={
                      extraCreate === "service"
                        ? "e.g. Portrait photo session"
                        : "e.g. Vintage blazer"
                    }
                  />
                </label>
                <label className="wide">
                  Description
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
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
                    {cats.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                {extraCreate === "service" && (
                  <label>
                    Advance notice (days)
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={form.leadDays || "0"}
                      onChange={(e) =>
                        setForm({ ...form, leadDays: e.target.value })
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
                {extraCreate === "lease" ? (
                  <>
                    <label>
                      Daily lease rate ($)
                      <input
                        type="number"
                        min="1"
                        value={form.rate || ""}
                        onChange={(e) =>
                          setForm({ ...form, rate: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Buyout price ($)
                      <input
                        type="number"
                        min="1"
                        value={form.buyout || ""}
                        onChange={(e) =>
                          setForm({ ...form, buyout: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Refundable demo deposit ($)
                      <input
                        type="number"
                        min="0"
                        value={form.deposit || "0"}
                        onChange={(e) =>
                          setForm({ ...form, deposit: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Maximum lease (days)
                      <input
                        type="number"
                        min="1"
                        value={form.limit || "7"}
                        onChange={(e) =>
                          setForm({ ...form, limit: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <label>
                    Price ($)
                    <input
                      type="number"
                      min="1"
                      value={form.price || ""}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </label>
                )}
                <label>
                  Campus zone
                  <select
                    value={form.zone || ""}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  >
                    <option value="">Choose zone</option>
                    {zones.map((z) => (
                      <option key={z}>{z}</option>
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
                    value={form.meetupPoint || ""}
                    onChange={(e) =>
                      setForm({ ...form, meetupPoint: e.target.value })
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
                  Community
                  <select
                    value={form.groupId || ""}
                    onChange={(e) =>
                      setForm({ ...form, groupId: e.target.value })
                    }
                  >
                    <option value="">Public marketplace</option>
                    {data.groups
                      .filter((g) => g.members.includes(account))
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
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
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                  />
                </label>
              </div>
              {error && <div className="formError">{error}</div>}
              <button className="btn primary full" onClick={createItem}>
                Publish listing
              </button>
            </div>
          </div>
        </div>
      )}
      {modal === "detail" && item && canSeeGroup(item.groupId) && (
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
            aria-label="Listing details"
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="detailHero">
              <Photo
                title={item.title}
                category={item.category}
                fallback={item.emoji}
                src={item.photos?.[selectedPhoto] || item.photos?.[0]}
                eager
              />
              <small>{modeName(item.mode)}</small>
            </div>
            {item.photos && item.photos.length > 1 && (
              <div className="photoGallery">
                {item.photos.map((src, i) => (
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
                {item.groupId
                  ? data.groups.find((g) => g.id === item.groupId)?.name
                  : "ALL UIUC"}
              </div>
              <h2>{item.title}</h2>
              <div className="detailPrice">
                {item.mode === "lease"
                  ? `${money(item.rate)} per 24 hours · ${money(item.buyout)} buyout`
                  : money(item.price)}
              </div>
              <button
                className="profileLine"
                onClick={() => {
                  close();
                  openProfile(item.owner);
                }}
              >
                {avatar(item.owner)}
                <span>
                  Offered by <b>{people[item.owner]?.name}</b>
                  <small>Campus member · demo profile</small>
                </span>
                <ShieldCheck size={16} />
              </button>
              <p>{item.description}</p>
              {item.mode === "service" && (
                <button
                  className="storeLink"
                  onClick={() => {
                    close();
                    setStorefrontOwner(item.owner);
                    setPage("services");
                  }}
                >
                  Visit{" "}
                  {businessInfo[item.owner]?.name ||
                    people[item.owner]?.name + "’s"}{" "}
                  storefront <ChevronRight size={15} />
                </button>
              )}
              <div className="detailGrid">
                <div>
                  <b>Condition</b>
                  <span>{item.condition}</span>
                </div>
                <div>
                  <b>Campus zone</b>
                  <span>{item.zone}</span>
                </div>
                <div>
                  <b>Meetup</b>
                  <span>
                    {item.meetupPoint
                      ? `${item.meetupType === "apartment" ? "Apartment lobby or entrance" : item.meetupType === "business" ? "Cafe or business" : "Public campus spot"} · ${item.meetupPoint}`
                      : "Confirm a public meetup in chat"}
                  </span>
                </div>
                <div>
                  <b>Availability</b>
                  <span>
                    {item.start} – {item.end}
                  </span>
                </div>
                <div>
                  <b>Community</b>
                  <span>
                    {item.groupId
                      ? data.groups.find((g) => g.id === item.groupId)?.name
                      : "All UIUC"}
                  </span>
                </div>
              </div>
              {item.mode === "lease" && (
                <div className="ruleBox">
                  <b>How lease to buy works</b>
                  <p>
                    Lease for up to {item.limit} days. Each started 24-hour
                    period costs {money(item.rate)}. Rental paid credits toward
                    the {money(item.buyout)} buyout. A {money(item.deposit)}{" "}
                    refundable demo deposit is held and released after return or
                    purchase. All payments are simulated.
                  </p>
                </div>
              )}
              {item.owner !== account && (
                <>
                  <div className="formGrid">
                    {item.mode === "service" && (
                      <>
                        <label>
                          Preferred service or pickup time
                          <input
                            type="datetime-local"
                            value={form.delivery || ""}
                            onChange={(e) =>
                              setForm({ ...form, delivery: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Quantity
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={form.quantity || "1"}
                            onChange={(e) =>
                              setForm({ ...form, quantity: e.target.value })
                            }
                          />
                        </label>
                        <label className="wide">
                          Order details
                          <textarea
                            value={form.notes || ""}
                            onChange={(e) =>
                              setForm({ ...form, notes: e.target.value })
                            }
                            placeholder="Flavors, haircut style, meetup details, or other notes"
                          />
                        </label>
                      </>
                    )}
                    {item.mode === "lease" && (
                      <>
                        <label>
                          Pickup
                          <input
                            type="datetime-local"
                            value={form.start || ""}
                            onChange={(e) =>
                              setForm({ ...form, start: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Return
                          <input
                            type="datetime-local"
                            value={form.end || ""}
                            onChange={(e) =>
                              setForm({ ...form, end: e.target.value })
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>
                  {item.mode === "lease" &&
                    form.start &&
                    form.end &&
                    new Date(form.end) > new Date(form.start) && (
                      <div className="notice">
                        Rental{" "}
                        {money(
                          item.rate *
                            Math.ceil(
                              (new Date(form.end).getTime() -
                                new Date(form.start).getTime()) /
                                86400000,
                            ),
                        )}{" "}
                        + refundable demo hold {money(item.deposit)}. Buyout
                        balance if purchased later:{" "}
                        {money(
                          Math.max(
                            0,
                            item.buyout -
                              item.rate *
                                Math.ceil(
                                  (new Date(form.end).getTime() -
                                    new Date(form.start).getTime()) /
                                    86400000,
                                ),
                          ),
                        )}
                        .
                      </div>
                    )}
                  {item.mode === "service" && (
                    <div className="notice">
                      {item.leadDays
                        ? `Book at least ${item.leadDays} day(s) ahead.`
                        : "Same-day requests welcome."}{" "}
                      Order estimate:{" "}
                      {money(
                        item.price * Math.max(1, Number(form.quantity || 1)),
                      )}
                      . The student must accept before simulated checkout.
                    </div>
                  )}
                  <label className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={form.agree === "yes"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          agree: e.target.checked ? "yes" : "no",
                        })
                      }
                    />{" "}
                    I agree to the stated dates, public meetup, item condition,
                    and simulated payment terms.
                  </label>
                  {error && <div className="formError">{error}</div>}
                  <div className="detailActions">
                    <button className="btn primary" onClick={requestDeal}>
                      {item.mode === "service"
                        ? "Send order request"
                        : item.mode === "sale"
                          ? "Request to buy"
                          : "Request lease"}
                    </button>
                    <button
                      className="btn outline"
                      onClick={() => {
                        update((d) => ({
                          ...d,
                          chats: [
                            ...d.chats,
                            {
                              id: id(),
                              itemId: item.id,
                              from: account,
                              to: item.owner,
                              text: `Hi! I have a question about ${item.title}.`,
                              at: now,
                            },
                          ],
                        }));
                        setThread(item.id);
                        setPage("messages");
                        close();
                      }}
                    >
                      <MessageCircle size={15} /> Message
                    </button>
                    <button
                      className="btn subtle"
                      onClick={() => {
                        toggleSaved(item.id);
                        notify(
                          saved.includes(item.id)
                            ? "Removed from saved"
                            : "Item saved",
                        );
                      }}
                    >
                      <Bookmark size={15} />
                      {saved.includes(item.id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </>
              )}
              {item.owner === account && (
                <div className="notice">
                  This is your listing. Switch demo accounts to make a request.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {modal === "urgent" && (
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
            aria-label="Post urgent request"
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="modalContent">
              <div className="eyebrow">CAMPUS HELP BOARD</div>
              <h2>What do you need urgently?</h2>
              <p>
                Other students can reply with an offer, price, and optional
                attached listing.
              </p>
              <div className="formGrid">
                <label className="wide">
                  Item or help needed
                  <input
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>
                <label className="wide">
                  Details
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
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
                    {cats.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Needed by
                  <input
                    type="datetime-local"
                    value={form.deadline || ""}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                  />
                </label>
                <label>
                  Maximum budget ($)
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
                    value={form.meetupPoint || ""}
                    onChange={(e) =>
                      setForm({ ...form, meetupPoint: e.target.value })
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
                  Community
                  <select
                    value={form.groupId || ""}
                    onChange={(e) =>
                      setForm({ ...form, groupId: e.target.value })
                    }
                  >
                    <option value="">All UIUC</option>
                    {data.groups
                      .filter((g) => g.members.includes(account))
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              {error && <div className="formError">{error}</div>}
              <button className="btn primary full" onClick={postUrgent}>
                Post to help board
              </button>
            </div>
          </div>
        </div>
      )}
      {modal === "bid" && urgentPost && (
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
            aria-label="Make an offer"
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="modalContent">
              <div className="eyebrow">MAKE AN OFFER</div>
              <h2>{urgentPost.title}</h2>
              <p>
                Tell {people[urgentPost.author]?.name} how you can help. Your
                amount is a proposal, not a charge.
              </p>
              <label>
                Offer amount ($; use 0 for free)
                <input
                  type="number"
                  min="0"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </label>
              <label>
                Message
                <textarea
                  value={form.message || ""}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="I have one available and can meet by the Union..."
                />
              </label>
              <label>
                Attach your listing (optional)
                <select
                  value={form.itemId || ""}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                >
                  <option value="">No attachment</option>
                  {listingChoices.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.title}
                    </option>
                  ))}
                </select>
              </label>
              {error && <div className="formError">{error}</div>}
              <button className="btn primary full" onClick={placeBid}>
                Post offer
              </button>
            </div>
          </div>
        </div>
      )}
      {modal === "createGroup" && (
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
            aria-label="Create group"
          >
            <button className="close" onClick={close} aria-label="Close">
              <X size={20} />
            </button>
            <div className="modalContent">
              <div className="eyebrow">BUILD A CAMPUS CIRCLE</div>
              <h2>Create a group</h2>
              <div className="formGrid">
                <label className="wide">
                  Group name
                  <input
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. UIUC Fashion Exchange"
                  />
                </label>
                <label className="wide">
                  Description
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
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
                    {cats.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Privacy
                  <select
                    value={form.privacy || "public"}
                    onChange={(e) =>
                      setForm({ ...form, privacy: e.target.value })
                    }
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="invite">Invite only</option>
                  </select>
                </label>
                <label className="wide">
                  Group rules
                  <textarea
                    value={form.rules || ""}
                    onChange={(e) =>
                      setForm({ ...form, rules: e.target.value })
                    }
                    placeholder="How should members treat shared items?"
                  />
                </label>
              </div>
              <div className="notice">
                Private and invite-only groups are visible only to members in
                this browser demo. Real membership must be enforced on a server.
              </div>
              {error && <div className="formError">{error}</div>}
              <button className="btn primary full" onClick={createGroup}>
                Create group
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
