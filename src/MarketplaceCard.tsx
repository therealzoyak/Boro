import { useSyncExternalStore } from "react";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { Photo, Portrait } from "./photos";
import { demoStorage } from "./demoServices";

const savedKey = "boro-saved-v1";
const savedEvent = "boro:saved";
function snapshot() {
  try {
    return localStorage.getItem(savedKey) || "{}";
  } catch {
    return "{}";
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(savedEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(savedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
function readSaved(raw: string): Record<string, string[]> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value) && value.every((id) => typeof id === "string"))
        result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}
export function useSavedListings(account: string) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  const saved = readSaved(raw)[account] || [];
  const toggle = (id: string) => {
    const current = readSaved(snapshot());
    const entries = current[account] || [];
    demoStorage.write(savedKey, {
      ...current,
      [account]: entries.includes(id)
        ? entries.filter((x) => x !== id)
        : [...entries, id],
    });
    window.dispatchEvent(new Event(savedEvent));
  };
  return { saved, toggle };
}
export function resetSavedListings() {
  demoStorage.write(savedKey, {});
  window.dispatchEvent(new Event(savedEvent));
}

type Props = {
  id: string;
  account: string;
  title: string;
  category: string;
  description: string;
  condition?: string;
  photo?: string;
  owner: string;
  ownerName: string;
  ownerDetail: string;
  zone: string;
  kind: "free" | "rent" | "sale" | "service" | "lease";
  amount: number;
  availability?: string;
  onOpen: () => void;
  onProfile: () => void;
};
const label = {
  free: "Free to borrow",
  rent: "Borrow & rent",
  sale: "For sale",
  service: "Student service",
  lease: "Try before buying",
};
const number = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
export default function MarketplaceCard(props: Props) {
  const { saved, toggle } = useSavedListings(props.account);
  const isSaved = saved.includes(props.id);
  const daily = props.kind === "rent" || props.kind === "lease";
  return (
    <article className={`listingCard marketCard kind-${props.kind}`}>
      <div className="cardPhoto">
        <button
          className="itemImage"
          onClick={props.onOpen}
          aria-label={`View ${props.title}`}
        >
          <Photo
            title={props.title}
            category={props.category}
            src={props.photo}
          />
        </button>
        <span className="listingKind">{label[props.kind]}</span>
        <button
          className={`saveListing ${isSaved ? "isSaved" : ""}`}
          aria-label={`${isSaved ? "Unsave" : "Save"} ${props.title}`}
          aria-pressed={isSaved}
          onClick={() => toggle(props.id)}
        >
          <Heart size={19} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="cardBody">
        <div className="cardContext">
          <span>
            {props.category === "Fashion" ? "Clothing" : props.category}
          </span>
          {props.condition && <span>{props.condition} condition</span>}
        </div>
        <div className="cardTitle">
          <button onClick={props.onOpen}>{props.title}</button>
          <strong>
            {props.kind === "free" ? "Free" : number(props.amount)}
            <small>
              {props.kind === "free"
                ? "to borrow"
                : daily
                  ? "/ day"
                  : props.kind === "service"
                    ? "/ service"
                    : ""}
            </small>
          </strong>
        </div>
        <p className="cardDescription">{props.description}</p>
        <div className="meta">
          <MapPin size={13} />
          {props.zone}
          {props.availability && (
            <span className="cardAvailability">{props.availability}</span>
          )}
        </div>
      </div>
      <div className="cardFooter">
        <button className="lender" onClick={props.onProfile}>
          <span className="avatar">
            <Portrait id={props.owner} name={props.ownerName} decorative />
          </span>
          <span>
            <b>{props.ownerName}</b>
            <small>{props.ownerDetail}</small>
          </span>
        </button>
        <ShieldCheck
          className="studentShield"
          size={17}
          aria-label="Demo campus member"
        />
      </div>
    </article>
  );
}
