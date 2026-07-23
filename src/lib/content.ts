// ---------------------------------------------------------------------------
// Single source of truth for every string on the site, in both languages.
//
// Structure lives in STATION_META / NAV (order, alignment, scroll targets) so
// it can never drift between locales; only the words are duplicated per
// language. The 3D world, the DOM overlay and the SEO fallback all read here.
//
// FIGURES MARKED [confirm] ARE THE BRIEF'S BRACKETED PLACEHOLDERS — replace
// with AVP's latest official numbers before launch.
// ---------------------------------------------------------------------------

export type Locale = "en" | "vi";
export const LOCALES: readonly Locale[] = ["en", "vi"] as const;
export const DEFAULT_LOCALE: Locale = "en";

export type Align = "left" | "right" | "center";

/** Which extra module a station carries under its body copy. */
export type StationModule = "specs" | "stats" | "markets";

export type StationMeta = {
  id: string;
  align: Align;
  module?: StationModule;
};

/**
 * The 15 stations, in scroll order. Index here === index in STATIONS
 * (src/lib/timeline.ts) — the two arrays are read in lockstep.
 */
export const STATION_META: StationMeta[] = [
  { id: "hero", align: "center" },
  { id: "forest", align: "left" },
  { id: "collection", align: "right" },
  { id: "screening", align: "left" },
  { id: "grinding", align: "right" },
  { id: "drying", align: "left" },
  { id: "conditioning", align: "right" },
  { id: "pelletizing", align: "left" },
  { id: "cooling", align: "right" },
  { id: "qc", align: "left", module: "specs" }, // Ø / moisture / ash / NCV / durability
  { id: "packaging", align: "right" },
  { id: "warehouse", align: "left", module: "stats" }, // count-up scale figures
  { id: "logistics", align: "right", module: "markets" }, // JP / KR / EU
  { id: "energy", align: "left" },
  { id: "circular", align: "center" },
];

/** Station index each nav item scrolls to; "contact" jumps to the footer. */
export const NAV: { id: string; target: number | "contact" }[] = [
  { id: "product", target: 0 },
  { id: "process", target: 3 },
  { id: "quality", target: 9 },
  { id: "markets", target: 12 },
  { id: "sustainability", target: 14 },
  { id: "contact", target: "contact" },
];

export type StationStrings = {
  eyebrow: string;
  headline: string[]; // one entry per masked line
  body?: string;
  data?: string;
};

export type SiteStrings = {
  /** Label shown on the language toggle for this locale. */
  label: string;
  htmlLang: string;
  meta: { title: string; description: string };
  brand: { name: string; legal: string; tagline: string };
  nav: Record<string, string>;
  ui: {
    cta: string;
    scrollCue: string;
    progress: string;
    skipToContact: string;
    langLabel: string;
    menu: string;
  };
  stations: Record<string, StationStrings>;
  specs: {
    title: string;
    standard: string;
    rows: { label: string; value: string }[];
  };
  stats: {
    title: string;
    items: { to: number; prefix?: string; suffix?: string; label: string }[];
  };
  markets: {
    title: string;
    items: { code: string; name: string; scheme: string; note: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    addressLabel: string;
    address: string[];
    phoneLabel: string;
    phone: string;
    emailLabel: string;
    email: string;
    cta: string;
    rights: string;
  };
};

const en: SiteStrings = {
  label: "EN",
  htmlLang: "en",
  meta: {
    title: "An Việt Phát — Wood Pellets. Renewable Energy from Forestry Residue.",
    description:
      "AVP Group is a top-5 global and #1 Asia wood pellet manufacturer. Follow a single pellet from certified forestry residue through grinding, drying and pelletizing to ENplus A1 quality, global logistics and carbon-neutral industrial energy.",
  },
  brand: {
    name: "An Việt Phát",
    legal: "An Việt Phát Group (AVP)",
    tagline: "Wood pellets · Renewable energy",
  },
  nav: {
    product: "Product",
    process: "Process",
    quality: "Quality",
    markets: "Markets",
    sustainability: "Sustainability",
    contact: "Contact",
  },
  ui: {
    cta: "Request specification",
    scrollCue: "Scroll",
    progress: "Progress",
    skipToContact: "Skip to contact details",
    langLabel: "Language",
    menu: "Sections",
  },
  stations: {
    hero: {
      eyebrow: "An Việt Phát · Since 2014",
      headline: ["Viên gỗ nén.", "Renewable energy from", "forestry residue."],
      body: "Follow a single wood pellet from the forest floor to industrial fire — and back into the carbon cycle.",
      data: "Top 5 worldwide · #1 in Asia",
    },
    forest: {
      eyebrow: "Origin",
      headline: ["The forest gives", "what it grows back."],
      body: "Our fiber comes from planted forests, sawmill residues and certified thinnings. No tree is felled for fuel.",
      data: "100% residue & certified fiber",
    },
    collection: {
      eyebrow: "Raw material",
      headline: ["Nothing felled for fuel.", "Everything used."],
      body: "Sawdust, shavings, offcuts and chips are gathered at the forest edge and staged for the mill.",
      data: "Mùn cưa · dăm bào · phụ phẩm gỗ",
    },
    screening: {
      eyebrow: "Screening",
      headline: ["Only clean fiber", "moves forward."],
      body: "Stones, metal and bark fines drop out on the first screen. The furnace never sees them.",
      data: "Contaminant removal ≥ 99%",
    },
    grinding: {
      eyebrow: "Grinding",
      headline: ["Force, measured", "to the millimeter."],
      body: "Hammer mills reduce chips to a uniform fiber — the exact geometry the die will demand later.",
      data: "Hammer mill · < 4 mm output",
    },
    drying: {
      eyebrow: "Drying",
      headline: ["Fire needs dry wood.", "We make it."],
      body: "A rotary drum takes green fiber from over half water down to exactly what combustion wants.",
      data: "Moisture 55% → 10%",
    },
    conditioning: {
      eyebrow: "Conditioning",
      headline: ["Steam awakens", "the wood's own glue."],
      body: "Heat and moisture soften lignin — nature's binder. Nothing synthetic is ever added.",
      data: "Lignin activation · zero additives",
    },
    pelletizing: {
      eyebrow: "Pelletizing",
      headline: ["Pressure", "becomes product."],
      body: "Rollers force the fiber through a rotating ring die. It exits as dense, gleaming pellets.",
      data: "≈ 300 bar through the die",
    },
    cooling: {
      eyebrow: "Cooling",
      headline: ["Heat leaves.", "Hardness stays."],
      body: "Counterflow air settles the pellets from die-hot to ambient, locking in durability.",
      data: "90 °C → ambient",
    },
    qc: {
      eyebrow: "Quality standards",
      headline: ["Every batch", "interrogated."],
      body: "Density, moisture, ash and durability are certified against ISO 17225-2 before anything ships.",
    },
    packaging: {
      eyebrow: "Packaging",
      headline: ["Sealed", "at the source."],
      body: "Jumbo bags fill in a controlled stream — clean, dry, and traceable back to the batch.",
      data: "1,000 kg jumbo bags · bulk",
    },
    warehouse: {
      eyebrow: "Scale",
      headline: ["Energy,", "resting."],
      body: "Covered storage keeps moisture out and quality constant until the vessel arrives.",
    },
    logistics: {
      eyebrow: "Global markets",
      headline: ["From our quay", "to your boiler."],
      body: "Truck, quay and bulk carrier — scheduled lanes into the world's three largest biomass markets.",
    },
    energy: {
      eyebrow: "Energy",
      headline: ["Coal's replacement,", "already burning."],
      body: "Power stations co-fire and convert to pellets with minimal retrofit — same heat, cleaner cycle.",
      data: "−90% net CO₂ vs. coal",
    },
    circular: {
      eyebrow: "Sustainability",
      headline: ["The ash returns.", "The forest continues."],
      body: "Combustion releases only the carbon the forest just absorbed. The loop closes where we began.",
      data: "Carbon-neutral combustion loop",
    },
  },
  specs: {
    title: "Technical specification",
    standard: "ISO 17225-2 · ENplus A1",
    rows: [
      { label: "Diameter", value: "Ø 6–8 mm" },
      { label: "Moisture", value: "≤ 10%" },
      { label: "Ash content", value: "≤ 0.7%" },
      { label: "Net calorific value", value: "16.5–19 MJ/kg" },
      { label: "Mechanical durability", value: "≥ 97.5%" },
    ],
  },
  stats: {
    title: "At scale",
    items: [
      { to: 2_000_000, label: "Tonnes total output" }, // [confirm]
      { to: 600, suffix: "+", label: "Staff & partners" }, // [confirm]
      { to: 24, suffix: "/7", label: "Supply & offtake" },
      { to: 5, prefix: "Top ", label: "Worldwide · #1 in Asia" },
    ],
  },
  markets: {
    title: "Where it ships",
    items: [
      {
        code: "JP",
        name: "Japan",
        scheme: "FIT",
        note: "Feed-in Tariff biomass power generation.",
      },
      {
        code: "KR",
        name: "South Korea",
        scheme: "RPS",
        note: "Renewable Portfolio Standard obligations.",
      },
      {
        code: "EU",
        name: "Europe",
        scheme: "RED III",
        note: "Renewable heat and industrial process energy.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's talk offtake.",
    body: "Specifications, sample analysis, FOB and CIF pricing — our commercial team answers within one business day.",
    addressLabel: "Head office",
    address: [
      "62-70 B4, Sala Urban Area",
      "An Khánh Ward, Ho Chi Minh City",
      "Vietnam",
    ],
    phoneLabel: "Phone",
    phone: "+84 28 3636 4427",
    emailLabel: "Email",
    email: "info@anvietenergy.com",
    cta: "Request specification",
    rights: "All rights reserved.",
  },
};

const vi: SiteStrings = {
  label: "VI",
  htmlLang: "vi",
  meta: {
    title: "An Việt Phát — Viên gỗ nén. Năng lượng tái tạo từ phụ phẩm lâm nghiệp.",
    description:
      "AVP Group nằm trong top 5 thế giới và số 1 châu Á về sản xuất viên gỗ nén. Theo chân một viên nén từ phụ phẩm lâm nghiệp có chứng nhận qua nghiền, sấy và ép viên đến chuẩn ENplus A1, logistics toàn cầu và năng lượng công nghiệp trung hòa carbon.",
  },
  brand: {
    name: "An Việt Phát",
    legal: "Tập đoàn An Việt Phát (AVP)",
    tagline: "Viên gỗ nén · Năng lượng tái tạo",
  },
  nav: {
    product: "Sản phẩm",
    process: "Quy trình",
    quality: "Chất lượng",
    markets: "Thị trường",
    sustainability: "Bền vững",
    contact: "Liên hệ",
  },
  ui: {
    cta: "Nhận thông số kỹ thuật",
    scrollCue: "Cuộn",
    progress: "Tiến trình",
    skipToContact: "Chuyển đến thông tin liên hệ",
    langLabel: "Ngôn ngữ",
    menu: "Các phần",
  },
  stations: {
    hero: {
      eyebrow: "An Việt Phát · Từ 2014",
      headline: ["Viên gỗ nén.", "Năng lượng tái tạo từ", "phụ phẩm lâm nghiệp."],
      body: "Theo chân một viên gỗ nén từ nền rừng đến ngọn lửa công nghiệp — rồi trở lại vòng tuần hoàn carbon.",
      data: "Top 5 thế giới · Số 1 châu Á",
    },
    forest: {
      eyebrow: "Nguồn gốc",
      headline: ["Rừng cho đi", "những gì rừng tái sinh."],
      body: "Nguyên liệu đến từ rừng trồng, phụ phẩm xưởng cưa và gỗ tỉa thưa có chứng nhận. Không cây nào bị đốn để làm nhiên liệu.",
      data: "100% phụ phẩm & gỗ có chứng nhận",
    },
    collection: {
      eyebrow: "Nguyên liệu",
      headline: ["Không đốn để đốt.", "Tận dụng trọn vẹn."],
      body: "Mùn cưa, dăm bào, đầu mẩu và dăm gỗ được thu gom tại bìa rừng và tập kết về nhà máy.",
      data: "Mùn cưa · dăm bào · phụ phẩm gỗ",
    },
    screening: {
      eyebrow: "Sàng lọc",
      headline: ["Chỉ sợi gỗ sạch", "được đi tiếp."],
      body: "Đá, kim loại và mạt vỏ cây được loại bỏ ngay ở sàng đầu tiên. Lò hơi không bao giờ phải tiếp nhận chúng.",
      data: "Loại bỏ tạp chất ≥ 99%",
    },
    grinding: {
      eyebrow: "Nghiền",
      headline: ["Lực nghiền, chuẩn", "đến từng milimét."],
      body: "Máy nghiền búa đưa dăm gỗ về kích thước sợi đồng nhất — đúng hình dạng mà khuôn ép sẽ đòi hỏi.",
      data: "Máy nghiền búa · đầu ra < 4 mm",
    },
    drying: {
      eyebrow: "Sấy",
      headline: ["Lửa cần gỗ khô.", "Chúng tôi tạo ra nó."],
      body: "Thùng sấy quay đưa sợi gỗ tươi từ hơn một nửa là nước xuống đúng mức mà quá trình cháy cần.",
      data: "Độ ẩm 55% → 10%",
    },
    conditioning: {
      eyebrow: "Điều hòa hơi",
      headline: ["Hơi nước đánh thức", "chất keo của chính gỗ."],
      body: "Nhiệt và ẩm làm mềm lignin — chất kết dính tự nhiên. Không hề bổ sung phụ gia tổng hợp.",
      data: "Kích hoạt lignin · không phụ gia",
    },
    pelletizing: {
      eyebrow: "Ép viên",
      headline: ["Áp lực", "hóa thành sản phẩm."],
      body: "Con lăn ép sợi gỗ qua khuôn vòng đang quay. Sản phẩm ra khỏi khuôn là những viên nén đặc, bóng.",
      data: "≈ 300 bar qua khuôn ép",
    },
    cooling: {
      eyebrow: "Làm nguội",
      headline: ["Nhiệt rời đi.", "Độ cứng ở lại."],
      body: "Luồng khí ngược chiều đưa viên nén từ nhiệt độ khuôn về nhiệt độ môi trường, khóa chặt độ bền.",
      data: "90 °C → nhiệt độ môi trường",
    },
    qc: {
      eyebrow: "Tiêu chuẩn chất lượng",
      headline: ["Từng lô hàng", "đều được kiểm định."],
      body: "Tỷ trọng, độ ẩm, hàm lượng tro và độ bền được chứng nhận theo ISO 17225-2 trước khi xuất hàng.",
    },
    packaging: {
      eyebrow: "Đóng gói",
      headline: ["Niêm phong", "ngay tại nguồn."],
      body: "Bao jumbo được nạp theo dòng khép kín — sạch, khô và truy xuất được về từng lô sản xuất.",
      data: "Bao jumbo 1.000 kg · hàng rời",
    },
    warehouse: {
      eyebrow: "Quy mô",
      headline: ["Năng lượng,", "đang nghỉ."],
      body: "Kho có mái che ngăn ẩm và giữ chất lượng ổn định cho đến khi tàu cập cảng.",
    },
    logistics: {
      eyebrow: "Thị trường toàn cầu",
      headline: ["Từ cầu cảng của chúng tôi", "đến lò hơi của bạn."],
      body: "Xe tải, cầu cảng và tàu hàng rời — những tuyến vận chuyển định kỳ đến ba thị trường sinh khối lớn nhất thế giới.",
    },
    energy: {
      eyebrow: "Năng lượng",
      headline: ["Thứ thay thế than,", "đã và đang cháy."],
      body: "Nhà máy điện đốt kèm và chuyển đổi sang viên nén với cải tạo tối thiểu — cùng nhiệt lượng, vòng tuần hoàn sạch hơn.",
      data: "−90% CO₂ ròng so với than",
    },
    circular: {
      eyebrow: "Phát triển bền vững",
      headline: ["Tro quay về đất.", "Rừng tiếp tục lớn."],
      body: "Quá trình cháy chỉ trả lại lượng carbon mà rừng vừa hấp thụ. Vòng lặp khép lại đúng nơi nó bắt đầu.",
      data: "Vòng đốt trung hòa carbon",
    },
  },
  specs: {
    title: "Thông số kỹ thuật",
    standard: "ISO 17225-2 · ENplus A1",
    rows: [
      { label: "Đường kính", value: "Ø 6–8 mm" },
      { label: "Độ ẩm", value: "≤ 10%" },
      { label: "Hàm lượng tro", value: "≤ 0,7%" },
      { label: "Nhiệt trị thuần", value: "16,5–19 MJ/kg" },
      { label: "Độ bền cơ học", value: "≥ 97,5%" },
    ],
  },
  stats: {
    title: "Quy mô",
    items: [
      { to: 2_000_000, label: "Tấn tổng sản lượng" }, // [confirm]
      { to: 600, suffix: "+", label: "Nhân sự & đối tác" }, // [confirm]
      { to: 24, suffix: "/7", label: "Cung ứng & bao tiêu" },
      { to: 5, prefix: "Top ", label: "Thế giới · Số 1 châu Á" },
    ],
  },
  markets: {
    title: "Điểm đến xuất khẩu",
    items: [
      {
        code: "JP",
        name: "Nhật Bản",
        scheme: "FIT",
        note: "Điện sinh khối theo cơ chế giá FIT.",
      },
      {
        code: "KR",
        name: "Hàn Quốc",
        scheme: "RPS",
        note: "Nghĩa vụ theo Tiêu chuẩn Danh mục Tái tạo.",
      },
      {
        code: "EU",
        name: "Châu Âu",
        scheme: "RED III",
        note: "Nhiệt tái tạo và năng lượng cho sản xuất công nghiệp.",
      },
    ],
  },
  contact: {
    eyebrow: "Liên hệ",
    title: "Cùng bàn về hợp đồng bao tiêu.",
    body: "Thông số kỹ thuật, phân tích mẫu, giá FOB và CIF — đội ngũ kinh doanh phản hồi trong vòng một ngày làm việc.",
    addressLabel: "Trụ sở chính",
    address: [
      "62-70 B4, Khu đô thị Sala",
      "Phường An Khánh, TP. Hồ Chí Minh",
      "Việt Nam",
    ],
    phoneLabel: "Điện thoại",
    phone: "+84 28 3636 4427",
    emailLabel: "Email",
    email: "info@anvietenergy.com",
    cta: "Nhận thông số kỹ thuật",
    rights: "Bảo lưu mọi quyền.",
  },
};

export const CONTENT: Record<Locale, SiteStrings> = { en, vi };

/** Station strings in scroll order for a locale — pairs 1:1 with STATION_META. */
export function stationsFor(locale: Locale): (StationMeta & StationStrings)[] {
  const strings = CONTENT[locale].stations;
  return STATION_META.map((meta) => ({ ...meta, ...strings[meta.id] }));
}
