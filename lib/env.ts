const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
};

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
};
