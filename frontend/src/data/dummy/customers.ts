// src/data/dummy/customers.ts

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  joinedAt: string;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  notes?: string;
}

export const dummyCustomers: Customer[] = [
  {
    id: "cus_001",
    firstName: "Md.",
    lastName: "Ariful Islam",
    name: "Md. Ariful Islam",
    email: "ariful@email.com",
    phone: "01712345678",
    address: {
      street: "123, Mirpur Road",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1216",
      country: "Bangladesh",
    },
    totalOrders: 12,
    totalSpent: 254000,
    lastOrderDate: "2026-07-01T10:30:00",
    joinedAt: "2025-01-15T08:00:00",
    status: "active",
    notes: "VIP customer, prefers bKash payment",
  },
  {
    id: "cus_002",
    firstName: "Shakila",
    lastName: "Akhter",
    name: "Shakila Akhter",
    email: "shakila@email.com",
    phone: "01898765432",
    address: {
      street: "45, Banani",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1213",
      country: "Bangladesh",
    },
    totalOrders: 8,
    totalSpent: 125000,
    lastOrderDate: "2026-07-01T14:15:00",
    joinedAt: "2025-03-20T10:30:00",
    status: "active",
  },
  {
    id: "cus_003",
    firstName: "Rafiqul",
    lastName: "Hasan",
    name: "Rafiqul Hasan",
    email: "rafiq@email.com",
    phone: "01987654321",
    address: {
      street: "78, Chittagong Road",
      city: "Chittagong",
      state: "Chittagong",
      zip: "4000",
      country: "Bangladesh",
    },
    totalOrders: 5,
    totalSpent: 89500,
    lastOrderDate: "2026-06-30T09:00:00",
    joinedAt: "2025-06-10T14:20:00",
    status: "active",
  },
  {
    id: "cus_004",
    firstName: "Tasnim",
    lastName: "Jahan",
    name: "Tasnim Jahan",
    email: "tasnim@email.com",
    phone: "01776543210",
    address: {
      street: "12, Gulshan Avenue",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1212",
      country: "Bangladesh",
    },
    totalOrders: 3,
    totalSpent: 42000,
    lastOrderDate: "2026-06-30T16:45:00",
    joinedAt: "2025-08-05T09:15:00",
    status: "active",
  },
  {
    id: "cus_005",
    firstName: "Kamal",
    lastName: "Hossain",
    name: "Kamal Hossain",
    email: "kamal@email.com",
    phone: "01887654321",
    address: {
      street: "56, Uttara",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1230",
      country: "Bangladesh",
    },
    totalOrders: 2,
    totalSpent: 6700,
    lastOrderDate: "2026-06-29T11:20:00",
    joinedAt: "2025-09-12T16:40:00",
    status: "inactive",
  },
  {
    id: "cus_006",
    firstName: "Nadia",
    lastName: "Sultana",
    name: "Nadia Sultana",
    email: "nadia@email.com",
    phone: "01912345678",
    address: {
      street: "34, Dhanmondi",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1205",
      country: "Bangladesh",
    },
    totalOrders: 6,
    totalSpent: 156000,
    lastOrderDate: "2026-06-28T08:00:00",
    joinedAt: "2025-02-28T11:00:00",
    status: "active",
    notes: "Corporate client, works at a software company",
  },
  {
    id: "cus_007",
    firstName: "Faisal",
    lastName: "Ahmed",
    name: "Faisal Ahmed",
    email: "faisal@email.com",
    phone: "01799887766",
    address: {
      street: "89, Mirpur",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1216",
      country: "Bangladesh",
    },
    totalOrders: 4,
    totalSpent: 45000,
    lastOrderDate: "2026-06-27T12:30:00",
    joinedAt: "2025-07-01T08:45:00",
    status: "active",
  },
  {
    id: "cus_008",
    firstName: "Sonia",
    lastName: "Akhter",
    name: "Sonia Akhter",
    email: "sonia@email.com",
    phone: "01811223344",
    address: {
      street: "22, Motijheel",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1000",
      country: "Bangladesh",
    },
    totalOrders: 1,
    totalSpent: 3200,
    lastOrderDate: "2026-06-26T15:00:00",
    joinedAt: "2026-05-15T13:30:00",
    status: "active",
  },
  {
    id: "cus_009",
    firstName: "Sohel",
    lastName: "Rana",
    name: "Sohel Rana",
    email: "sohel@email.com",
    phone: "01755443322",
    address: {
      street: "67, Khulna Road",
      city: "Khulna",
      state: "Khulna",
      zip: "9100",
      country: "Bangladesh",
    },
    totalOrders: 7,
    totalSpent: 185000,
    lastOrderDate: "2026-06-25T11:00:00",
    joinedAt: "2025-04-10T09:00:00",
    status: "active",
    notes: "Business owner, buys in bulk",
  },
  {
    id: "cus_010",
    firstName: "Rina",
    lastName: "Akhter",
    name: "Rina Akhter",
    email: "rina@email.com",
    phone: "01988776655",
    address: {
      street: "45, Sylhet Road",
      city: "Sylhet",
      state: "Sylhet",
      zip: "3100",
      country: "Bangladesh",
    },
    totalOrders: 3,
    totalSpent: 9200,
    lastOrderDate: "2026-06-24T16:20:00",
    joinedAt: "2025-11-20T10:15:00",
    status: "active",
  },
  {
    id: "cus_011",
    firstName: "Mahmudul",
    lastName: "Hasan",
    name: "Mahmudul Hasan",
    email: "mahmudul@email.com",
    phone: "01733445566",
    address: {
      street: "12, Rajshahi Road",
      city: "Rajshahi",
      state: "Rajshahi",
      zip: "6000",
      country: "Bangladesh",
    },
    totalOrders: 2,
    totalSpent: 28000,
    lastOrderDate: "2026-06-23T10:45:00",
    joinedAt: "2026-01-05T12:00:00",
    status: "blocked",
    notes: "Blocked due to multiple failed payments",
  },
  {
    id: "cus_012",
    firstName: "Salma",
    lastName: "Akhter",
    name: "Salma Akhter",
    email: "salma@email.com",
    phone: "01877665544",
    address: {
      street: "34, Barisal Road",
      city: "Barisal",
      state: "Barisal",
      zip: "8200",
      country: "Bangladesh",
    },
    totalOrders: 9,
    totalSpent: 172000,
    lastOrderDate: "2026-06-22T13:30:00",
    joinedAt: "2025-03-01T14:00:00",
    status: "active",
    notes: "Frequent buyer, loves new products",
  },
  {
    id: "cus_013",
    firstName: "Jamil",
    lastName: "Hossain",
    name: "Jamil Hossain",
    email: "jamil@email.com",
    phone: "01788776655",
    address: {
      street: "78, Rangpur Road",
      city: "Rangpur",
      state: "Rangpur",
      zip: "5400",
      country: "Bangladesh",
    },
    totalOrders: 5,
    totalSpent: 52000,
    lastOrderDate: "2026-06-21T09:15:00",
    joinedAt: "2025-06-15T16:30:00",
    status: "active",
  },
  {
    id: "cus_014",
    firstName: "Nurul",
    lastName: "Islam",
    name: "Nurul Islam",
    email: "nurul@email.com",
    phone: "01999887766",
    address: {
      street: "56, Mymensingh Road",
      city: "Mymensingh",
      state: "Mymensingh",
      zip: "2200",
      country: "Bangladesh",
    },
    totalOrders: 4,
    totalSpent: 15000,
    lastOrderDate: "2026-06-20T11:00:00",
    joinedAt: "2025-08-20T09:45:00",
    status: "inactive",
  },
  {
    id: "cus_015",
    firstName: "Sajeda",
    lastName: "Begum",
    name: "Sajeda Begum",
    email: "sajeda@email.com",
    phone: "01766554433",
    address: {
      street: "23, Comilla Road",
      city: "Comilla",
      state: "Comilla",
      zip: "3500",
      country: "Bangladesh",
    },
    totalOrders: 2,
    totalSpent: 3800,
    lastOrderDate: "2026-06-19T15:45:00",
    joinedAt: "2026-02-10T11:30:00",
    status: "active",
  },
  {
    id: "cus_016",
    firstName: "Shariful",
    lastName: "Alam",
    name: "Shariful Alam",
    email: "shariful@email.com",
    phone: "01855443322",
    address: {
      street: "67, Gazipur Road",
      city: "Gazipur",
      state: "Dhaka",
      zip: "1700",
      country: "Bangladesh",
    },
    totalOrders: 11,
    totalSpent: 235000,
    lastOrderDate: "2026-06-18T10:00:00",
    joinedAt: "2025-01-20T08:30:00",
    status: "active",
    notes: "Premium member, spends over 20k per month",
  },
  {
    id: "cus_017",
    firstName: "Mst.",
    lastName: "Shirin",
    name: "Mst. Shirin",
    email: "shirin@email.com",
    phone: "01922334455",
    address: {
      street: "89, Narayanganj Road",
      city: "Narayanganj",
      state: "Dhaka",
      zip: "1400",
      country: "Bangladesh",
    },
    totalOrders: 3,
    totalSpent: 45000,
    lastOrderDate: "2026-06-17T14:30:00",
    joinedAt: "2025-07-10T13:00:00",
    status: "active",
  },
  {
    id: "cus_018",
    firstName: "Abdul",
    lastName: "Karim",
    name: "Abdul Karim",
    email: "karim@email.com",
    phone: "01711223344",
    address: {
      street: "45, Bogura Road",
      city: "Bogura",
      state: "Rajshahi",
      zip: "5800",
      country: "Bangladesh",
    },
    totalOrders: 1,
    totalSpent: 32000,
    lastOrderDate: "2026-06-16T09:00:00",
    joinedAt: "2025-12-01T10:45:00",
    status: "active",
  },
  {
    id: "cus_019",
    firstName: "Farida",
    lastName: "Akhter",
    name: "Farida Akhter",
    email: "farida@email.com",
    phone: "01899887766",
    address: {
      street: "12, Jamalpur Road",
      city: "Jamalpur",
      state: "Mymensingh",
      zip: "2000",
      country: "Bangladesh",
    },
    totalOrders: 6,
    totalSpent: 78000,
    lastOrderDate: "2026-06-15T16:00:00",
    joinedAt: "2025-09-05T09:30:00",
    status: "inactive",
  },
  {
    id: "cus_020",
    firstName: "Mohammad",
    lastName: "Ali",
    name: "Mohammad Ali",
    email: "mohammad@email.com",
    phone: "01766554433",
    address: {
      street: "34, Jessore Road",
      city: "Jessore",
      state: "Khulna",
      zip: "7400",
      country: "Bangladesh",
    },
    totalOrders: 4,
    totalSpent: 56000,
    lastOrderDate: "2026-06-14T11:30:00",
    joinedAt: "2026-03-15T15:00:00",
    status: "blocked",
    notes: "Blocked for suspicious activity",
  },
  {
    id: "cus_021",
    firstName: "Lipi",
    lastName: "Begum",
    name: "Lipi Begum",
    email: "lipi@email.com",
    phone: "01977665544",
    address: {
      street: "56, Tangail Road",
      city: "Tangail",
      state: "Dhaka",
      zip: "1900",
      country: "Bangladesh",
    },
    totalOrders: 2,
    totalSpent: 8500,
    lastOrderDate: "2026-06-13T13:45:00",
    joinedAt: "2026-04-01T10:00:00",
    status: "active",
  },
  {
    id: "cus_022",
    firstName: "Rashid",
    lastName: "Miah",
    name: "Rashid Miah",
    email: "rashid@email.com",
    phone: "01888776655",
    address: {
      street: "78, Pabna Road",
      city: "Pabna",
      state: "Rajshahi",
      zip: "6600",
      country: "Bangladesh",
    },
    totalOrders: 7,
    totalSpent: 92000,
    lastOrderDate: "2026-06-12T09:30:00",
    joinedAt: "2025-05-25T11:15:00",
    status: "active",
  },
  {
    id: "cus_023",
    firstName: "Mst.",
    lastName: "Rokeya",
    name: "Mst. Rokeya",
    email: "rokeya@email.com",
    phone: "01733445566",
    address: {
      street: "23, Cox's Bazar Road",
      city: "Cox's Bazar",
      state: "Chittagong",
      zip: "4700",
      country: "Bangladesh",
    },
    totalOrders: 3,
    totalSpent: 35000,
    lastOrderDate: "2026-06-11T16:45:00",
    joinedAt: "2026-02-20T14:30:00",
    status: "active",
  },
  {
    id: "cus_024",
    firstName: "Shahidul",
    lastName: "Islam",
    name: "Shahidul Islam",
    email: "shahidul@email.com",
    phone: "01999887766",
    address: {
      street: "45, Faridpur Road",
      city: "Faridpur",
      state: "Dhaka",
      zip: "7800",
      country: "Bangladesh",
    },
    totalOrders: 5,
    totalSpent: 48000,
    lastOrderDate: "2026-06-10T10:00:00",
    joinedAt: "2025-10-15T08:45:00",
    status: "active",
  },
  {
    id: "cus_025",
    firstName: "Ayesha",
    lastName: "Siddika",
    name: "Ayesha Siddika",
    email: "ayesha@email.com",
    phone: "01777665544",
    address: {
      street: "67, Munshiganj Road",
      city: "Munshiganj",
      state: "Dhaka",
      zip: "1500",
      country: "Bangladesh",
    },
    totalOrders: 8,
    totalSpent: 165000,
    lastOrderDate: "2026-06-09T14:15:00",
    joinedAt: "2025-04-05T13:30:00",
    status: "active",
    notes: "Favorite customer, always leaves 5-star reviews",
  },
];

// ------------------------------------------------------------
// CUSTOMER STATISTICS
// ------------------------------------------------------------
export const customerStats = {
  totalCustomers: dummyCustomers.length,
  activeCustomers: dummyCustomers.filter((c) => c.status === "active").length,
  inactiveCustomers: dummyCustomers.filter((c) => c.status === "inactive")
    .length,
  blockedCustomers: dummyCustomers.filter((c) => c.status === "blocked").length,
  newCustomersThisMonth: 5,
  totalSpentAllCustomers: dummyCustomers.reduce(
    (sum, c) => sum + c.totalSpent,
    0,
  ),
  avgOrderValueAll:
    dummyCustomers.reduce((sum, c) => sum + c.totalSpent, 0) /
    dummyCustomers.reduce((sum, c) => sum + c.totalOrders, 0),
};

// ------------------------------------------------------------
// CUSTOMER CITIES (For filtering)
// ------------------------------------------------------------
export const customerCities = [
  "All",
  "Dhaka",
  "Chittagong",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Gazipur",
  "Narayanganj",
  "Bogura",
  "Jamalpur",
  "Jessore",
  "Tangail",
  "Pabna",
  "Cox's Bazar",
  "Faridpur",
  "Munshiganj",
];

// ------------------------------------------------------------
// CUSTOMER SEGMENTS (For filtering)
// ------------------------------------------------------------
export const customerSegments = [
  { id: "all", label: "All Customers" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "blocked", label: "Blocked" },
  { id: "vip", label: "VIP (10+ orders)" },
  { id: "new", label: "New (Joined this month)" },
  { id: "high-spender", label: "High Spender (50k+ BDT)" },
];

// ------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------
export const getCustomerById = (id: string) => {
  return dummyCustomers.find((c) => c.id === id);
};

export const getCustomersByStatus = (status: Customer["status"]) => {
  return dummyCustomers.filter((c) => c.status === status);
};

export const getCustomersByCity = (city: string) => {
  return dummyCustomers.filter((c) => c.address.city === city);
};

export const getVIPCustomers = () => {
  return dummyCustomers.filter((c) => c.totalOrders >= 10);
};

export const getHighSpenders = (threshold: number = 50000) => {
  return dummyCustomers.filter((c) => c.totalSpent >= threshold);
};

export const getNewCustomers = () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return dummyCustomers.filter((c) => new Date(c.joinedAt) >= oneMonthAgo);
};
