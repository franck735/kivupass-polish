const STORAGE_KEY = "kivupass_local_db";
const SESSION_KEY = "kivupass_local_session";

type Role = "participant" | "organizer" | "owner";

interface LocalUser {
  id: string;
  email: string;
  password: string;
  full_name?: string;
  created_at: string;
}

interface LocalProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
  status: "active" | "suspended";
  pay_name?: string;
  pay_phone?: string;
  pay_operator?: string;
}

interface LocalSession {
  user: LocalUser;
  expires_at: number;
}

interface LocalDbSchema {
  users: LocalUser[];
  profiles: LocalProfile[];
  events: any[];
  ticket_types: any[];
  tickets: any[];
  orders: any[];
  payouts: any[];
  notifications: any[];
  messages: any[];
  pub_requests: any[];
  settings: any[];
  user_roles: { user_id: string; role: Role }[];
}

const defaultState: LocalDbSchema = {
  users: [],
  profiles: [],
  events: [],
  ticket_types: [],
  tickets: [],
  orders: [],
  payouts: [],
  notifications: [],
  messages: [],
  pub_requests: [],
  settings: [
    { key: "commission_rate", value: "15" },
    { key: "exchange_rate", value: "2500" },
    { key: "publication_fee_usd", value: "10" },
    { key: "categories", value: JSON.stringify(["Concert", "Conférence", "Festival", "Sport", "Autre"]) },
  ],
  user_roles: [],
};

const parseStorage = <T>(value: string | null, fallback: T) => {
  try { return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
};

const getDb = (): LocalDbSchema => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const now = new Date().toISOString();
    const initial: LocalDbSchema = {
      ...defaultState,
      users: [
        { id: "owner-1", email: "admin@kivupass.local", password: "admin123", full_name: "Admin KivuPass", created_at: now },
        { id: "organizer-1", email: "org@kivupass.local", password: "org123", full_name: "Organisateur KivuPass", created_at: now },
        { id: "participant-1", email: "user@kivupass.local", password: "user123", full_name: "Utilisateur KivuPass", created_at: now },
      ],
      profiles: [
        { id: "owner-1", name: "Admin KivuPass", email: "admin@kivupass.local", role: "owner", created_at: now, status: "active" },
        { id: "organizer-1", name: "Organisateur KivuPass", email: "org@kivupass.local", role: "organizer", created_at: now, status: "active", pay_name: "Kivu Events", pay_phone: "+243970000001", pay_operator: "Airtel Money" },
        { id: "participant-1", name: "Utilisateur KivuPass", email: "user@kivupass.local", role: "participant", created_at: now, status: "active" },
      ],
      events: [
        {
          id: "event-1",
          organizer_id: "organizer-1",
          organizer_name: "Organisateur KivuPass",
          title: "Festival KivuPass",
          description: "Soirée culturelle à Kinshasa à ne pas manquer.",
          date: "2026-05-10",
          time: "20:00",
          location: "Stade des Martyrs",
          address: "Kinshasa, RDC",
          category: "Festival",
          image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
          price: 15,
          currency: "USD",
          status: "published",
          approved: true,
          pay_name: "Kivu Events",
          payment_phone: "+243970000001",
          payment_operator: "Airtel Money",
          created_at: now,
        },
      ],
      ticket_types: [],
      user_roles: [
        { user_id: "owner-1", role: "owner" },
        { user_id: "organizer-1", role: "organizer" },
        { user_id: "participant-1", role: "participant" },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return parseStorage<LocalDbSchema>(stored, defaultState);
};

const saveDb = (data: LocalDbSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getSession = (): LocalSession | null => {
  return parseStorage<LocalSession | null>(localStorage.getItem(SESSION_KEY), null);
};

const setSession = (session: LocalSession | null) => {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const emitAuthEvent = (session: LocalSession | null) => {
  authListeners.forEach((listener) => listener("SIGNED_IN", session));
};

type RealtimeFilter = { event: string; schema: string; table: string };
type RealtimeListener = { id: number; channel: string; filter: RealtimeFilter; callback: (payload: any) => void };
const realtimeListeners: RealtimeListener[] = [];
let realtimeListenerCounter = 0;

const notifyRealtime = (event: string, table: keyof LocalDbSchema, payload: any) => {
  realtimeListeners.forEach((listener) => {
    if (
      listener.filter.event === event &&
      listener.filter.schema === "public" &&
      listener.filter.table === table
    ) {
      listener.callback(payload);
    }
  });
};

const authListeners: Array<(event: string, session: LocalSession | null) => void> = [];

const createId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

const matchPredicate = (item: any, filters: Array<(item: any) => boolean>) => filters.every((fn) => fn(item));

const parseOrCondition = (condition: string) => {
  return condition.split(",").map((part) => {
    const [field, operator, rawValue] = part.split(".");
    const value = rawValue?.replace(/\"/g, "");
    if (operator === "eq") {
      return (item: any) => item[field] === value;
    }
    return () => false;
  });
};

class LocalQuery {
  table: keyof LocalDbSchema;
  filters: Array<(item: any) => boolean> = [];
  ordering: { column: string; ascending: boolean } | null = null;
  limitCount: number | null = null;
  singleMode = false;
  payload: any = null;
  options: any = undefined;
  action: "select" | "insert" | "update" | null = null;

  constructor(table: keyof LocalDbSchema) {
    this.table = table;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  or(condition: string) {
    const predicates = parseOrCondition(condition);
    this.filters.push((item) => predicates.some((fn) => fn(item)));
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.ordering = { column, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = true;
    return this;
  }

  insert(payload: any) {
    this.action = "insert";
    this.payload = payload;
    return this.execute();
  }

  update(payload: any) {
    this.action = "update";
    this.payload = payload;
    return this.execute();
  }

  upsert(payload: any, opts?: { onConflict?: string }) {
    this.action = "insert";
    const db = getDb();
    const rows = Array.isArray(payload) ? payload : [payload];
    const keys = opts?.onConflict?.split(",").map((key) => key.trim()) || [];
    const saved = rows.map((row) => {
      const conflictIndex = keys.length
        ? db[this.table].findIndex((item) => keys.every((key) => item[key] === row[key]))
        : -1;
      if (conflictIndex >= 0) {
        db[this.table][conflictIndex] = { ...db[this.table][conflictIndex], ...row };
        return db[this.table][conflictIndex];
      }
      const item = { ...row, id: row.id || createId(), created_at: new Date().toISOString() };
      db[this.table].push(item);
      return item;
    });
    saveDb(db);
    return Promise.resolve({ data: rows.length === 1 ? saved[0] : saved, error: null });
  }

  delete() {
    this.action = "delete";
    return this.execute();
  }

  select(columns?: string, opts?: any) {
    this.action = "select";
    this.options = opts;
    return this;
  }

  private async execute() {
    const db = getDb();
    const tableData = [...db[this.table]];
    let result = tableData;

    if (this.filters.length) {
      result = result.filter((item) => matchPredicate(item, this.filters));
    }

    if (this.ordering) {
      result = result.sort((a, b) => {
        const valueA = a[this.ordering!.column];
        const valueB = b[this.ordering!.column];
        if (valueA === valueB) return 0;
        if (valueA == null) return 1;
        if (valueB == null) return -1;
        if (this.ordering!.ascending) return valueA > valueB ? 1 : -1;
        return valueA < valueB ? 1 : -1;
      });
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.action === "select") {
      const response: any = { error: null };
      if (this.options?.count === "exact") {
        response.count = result.length;
      }
      if (this.singleMode) {
        response.data = result[0] ?? null;
      } else if (this.options?.head) {
        response.data = null;
      } else {
        response.data = result;
      }
      return response;
    }

    if (this.action === "insert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const saved = rows.map((row) => ({ ...row, id: row.id || createId(), created_at: new Date().toISOString() }));
      db[this.table] = [...db[this.table], ...saved];
      saveDb(db);
      saved.forEach((row) => notifyRealtime("INSERT", this.table, { new: row }));
      return { data: Array.isArray(this.payload) ? saved : saved[0], error: null };
    }

    if (this.action === "update") {
      const updated: any[] = [];
      db[this.table] = db[this.table].map((item) => {
        if (matchPredicate(item, this.filters)) {
          const next = { ...item, ...this.payload };
          updated.push(next);
          return next;
        }
        return item;
      });
      saveDb(db);
      updated.forEach((row) => notifyRealtime("UPDATE", this.table, { new: row }));
      if (this.singleMode) {
        return { data: updated[0] ?? null, error: null };
      }
      return { data: updated, error: null };
    }

    if (this.action === "delete") {
      const deleted: any[] = [];
      db[this.table] = db[this.table].filter((item) => {
        if (matchPredicate(item, this.filters)) {
          deleted.push(item);
          return false;
        }
        return true;
      });
      saveDb(db);
      deleted.forEach((row) => notifyRealtime("DELETE", this.table, { old: row }));
      if (this.singleMode) {
        return { data: deleted[0] ?? null, error: null };
      }
      return { data: deleted, error: null };
    }

    return { data: null, error: { message: "Action non supportée" } };
  }

  then(onFulfilled: (value: any) => any, onRejected?: (reason: any) => any) {
    return Promise.resolve(this.execute()).then(onFulfilled, onRejected);
  }
}

const createLocalQuery = (table: keyof LocalDbSchema) => new LocalQuery(table);

const auth = {
  onAuthStateChange: (listener: (event: string, session: LocalSession | null) => void) => {
    authListeners.push(listener);
    return { data: { subscription: { unsubscribe: () => { const index = authListeners.indexOf(listener); if (index >= 0) authListeners.splice(index, 1); } } } };
  },
  getSession: async () => ({ data: { session: getSession() } }),
  signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
    const db = getDb();
    if (db.users.some((u) => u.email === email)) {
      return { error: { message: "Email déjà utilisé" } };
    }
    const user: LocalUser = { id: createId(), email, password, full_name: options?.data?.full_name || "", created_at: new Date().toISOString() };
    db.users.push(user);
    const profile: LocalProfile = {
      id: user.id,
      name: user.full_name || email,
      email,
      role: "participant",
      created_at: new Date().toISOString(),
      status: "active",
    };
    db.profiles.push(profile);
    db.user_roles.push({ user_id: user.id, role: "participant" });
    saveDb(db);
    const session: LocalSession = { user, expires_at: Date.now() + 1000 * 60 * 60 * 24 };
    setSession(session);
    emitAuthEvent(session);
    return { data: { user }, error: null };
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const db = getDb();
    const user = db.users.find((u) => u.email === email && u.password === password) ?? null;
    if (!user) {
      return { error: { message: "Email ou mot de passe incorrect" } };
    }
    const session: LocalSession = { user, expires_at: Date.now() + 1000 * 60 * 60 * 24 };
    setSession(session);
    emitAuthEvent(session);
    return { data: { session }, error: null };
  },
  signOut: async () => {
    setSession(null);
    emitAuthEvent(null);
    return { error: null };
  },
  resetPasswordForEmail: async (email: string, opts?: any) => {
    const db = getDb();
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      return { error: { message: "Email non trouvé" } };
    }
    return { error: null };
  },
  updateUser: async ({ password }: { password?: string }) => {
    const session = getSession();
    if (!session) {
      return { error: { message: "Aucun utilisateur connecté" } };
    }
    const db = getDb();
    db.users = db.users.map((user) => user.id === session.user.id ? { ...user, password: password ?? user.password } : user);
    saveDb(db);
    return { error: null };
  },
  setSession: async (session: any) => {
    if (!session?.user) return { error: { message: "Session invalide" } };
    setSession(session);
    emitAuthEvent(session);
    return { error: null };
  },
};

const storage = {
  from: (bucket: string) => ({
    upload: async (path: string, file: File) => {
      const reader = new FileReader();
      return new Promise<{ error: null | { message: string } }>((resolve) => {
        reader.onload = () => {
          const store = parseStorage<Record<string, string>>(localStorage.getItem("kivupass_storage"), {});
          store[path] = reader.result as string;
          localStorage.setItem("kivupass_storage", JSON.stringify(store));
          resolve({ error: null });
        };
        reader.onerror = () => resolve({ error: { message: "Impossible d'uploader" } });
        reader.readAsDataURL(file);
      });
    },
    getPublicUrl: (path: string) => {
      const store = parseStorage<Record<string, string>>(localStorage.getItem("kivupass_storage"), {});
      return { data: { publicUrl: store[path] || "https://via.placeholder.com/400x240" }, error: null };
    },
  }),
};

const channel = (name: string) => {
  let listenerFilter: RealtimeFilter | null = null;
  let listenerCallback: ((payload: any) => void) | null = null;
  const channelObj = {
    on(event: string, opts: RealtimeFilter, callback?: (payload: any) => void) {
      listenerFilter = opts;
      listenerCallback = callback ?? null;
      return channelObj;
    },
    subscribe() {
      const id = ++realtimeListenerCounter;
      if (listenerFilter && listenerCallback) {
        realtimeListeners.push({ id, channel: name, filter: listenerFilter, callback: listenerCallback });
      }
      return {
        unsubscribe: () => {
          const index = realtimeListeners.findIndex((listener) => listener.id === id);
          if (index >= 0) realtimeListeners.splice(index, 1);
        },
      };
    },
  };
  return channelObj;
};

const removeChannel = (channelObj: any) => {
  if (channelObj?.unsubscribe) {
    channelObj.unsubscribe();
  }
};

const rpc = async (name: string, params: any) => {
  const db = getDb();
  if (name === "has_role") {
    const role = params._role;
    const userId = params._user_id;
    const profile = db.profiles.find((profile) => profile.id === userId);
    if (profile && profile.role === role) {
      return { data: true, error: null };
    }
    const normalizedRole = role;
    const mapping = db.user_roles.find((item) => item.user_id === userId && item.role === normalizedRole);
    return { data: !!mapping, error: null };
  }
  return { data: null, error: { message: "RPC non supportée" } };
};

export const supabase = {
  auth,
  from: createLocalQuery,
  storage,
  channel,
  removeChannel,
  rpc,
};