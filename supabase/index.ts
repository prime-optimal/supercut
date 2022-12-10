import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;

const options = {};

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);

export { client };
